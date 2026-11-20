import { Router } from "express";
import rateLimit from "express-rate-limit";
import { z } from "zod";
import { prisma } from "../config/prisma.ts";
import { isoDate } from "../lib/dates.ts";
import { conflict, HttpError } from "../lib/http.ts";
import { SESSION_COOKIE, readSession } from "../lib/auth.ts";
import { requireAuth } from "../middleware/requireAuth.ts";
import { assertEligible, lockCircle, resetOrder } from "../services/circleService.ts";

export const invitesRouter = Router();

// Stops anyone from guessing invite tokens
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 120,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: { message: "Too many requests. Please try again in a few minutes." },
});
invitesRouter.use(limiter);

const tokenSchema = z.string().min(20).max(64).regex(/^[A-Za-z0-9_-]+$/);
function readToken(v: unknown) {
  const r = tokenSchema.safeParse(v);
  if (!r.success) throw new HttpError(404, "This invite link is not valid.");
  return r.data;
}

/**
 * What someone sees before joining: the rules and the number of free spots.
 * It never lists who is in the circle.
 */
invitesRouter.get("/:token", async (req, res) => {
  const token = readToken(req.params.token);
  const circle = await prisma.circle.findUnique({
    where: { inviteToken: token },
    include: {
      organizer: { select: { fullName: true } },
      members: { where: { status: "JOINED" }, select: { userId: true } },
    },
  });
  if (!circle) throw new HttpError(404, "This invite link is not valid.");

  const viewerId = readSession(req.cookies?.[SESSION_COOKIE]);
  const joined = circle.members.length;
  const spotsLeft = Math.max(0, circle.memberCount - joined);
  const isMember = !!viewerId && circle.members.some((m) => m.userId === viewerId);

  let closedReason: string | null = null;
  if (circle.status !== "FORMING") closedReason = "This circle has already started or was cancelled.";
  else if (!circle.inviteActive) closedReason = "This invite link is no longer active.";
  else if (spotsLeft === 0 && !isMember) closedReason = "This circle is full.";

  res.json({
    circle: {
      id: circle.id,
      name: circle.name,
      organizerName: circle.organizer.fullName.split(" ")[0], // first name only
      monthlyAmount: circle.monthlyAmount,
      memberCount: circle.memberCount,
      potAmount: circle.monthlyAmount * circle.memberCount,
      spotsLeft,
      startDate: isoDate(circle.startDate),
      graceDays: circle.graceDays,
      orderMode: circle.orderMode,
    },
    isMember,
    closedReason,
  });
});

invitesRouter.post("/:token/join", requireAuth, async (req, res) => {
  const user = res.locals.user;
  const token = readToken(req.params.token);
  await assertEligible(user);

  const found = await prisma.circle.findUnique({ where: { inviteToken: token }, select: { id: true } });
  if (!found) throw new HttpError(404, "This invite link is not valid.");

  const circleId = await prisma.$transaction(async (tx) => {
    await lockCircle(tx, found.id);
    const circle = await tx.circle.findUniqueOrThrow({
      where: { id: found.id },
      include: { members: true },
    });
    if (circle.inviteToken !== token || !circle.inviteActive || circle.status !== "FORMING") {
      throw conflict("This invite link is no longer active.");
    }
    const existing = circle.members.find((m) => m.userId === user.id);
    if (existing?.status === "JOINED") return circle.id; // already in: just go to the circle
    if (existing?.status === "REMOVED") throw conflict("The organizer removed you from this circle.");
    if (circle.members.filter((m) => m.status === "JOINED").length >= circle.memberCount) {
      throw conflict("This circle is full.");
    }

    if (existing) {
      await tx.circleMember.update({
        where: { id: existing.id },
        data: { status: "JOINED", acceptedRulesVersion: null, acceptedAt: null, orderApproved: false, payoutPosition: null, joinedAt: new Date() },
      });
    } else {
      await tx.circleMember.create({ data: { circleId: circle.id, userId: user.id } });
    }
    await resetOrder(tx, circle.id);
    return circle.id;
  });

  res.json({ circleId });
});
