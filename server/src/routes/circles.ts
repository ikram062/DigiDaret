import { Router } from "express";
import { z } from "zod";
import { prisma } from "../config/prisma.ts";
import { isoDate, parseDateOnly, todayUtc } from "../lib/dates.ts";
import { badRequest, conflict, HttpError } from "../lib/http.ts";
import { requireAuth } from "../middleware/requireAuth.ts";
import {
  assertEligible,
  assertForming,
  assertOrganizer,
  buildCircleDetail,
  loadCircleForMember,
  lockCircle,
  newInviteToken,
  resetOrder,
  startCircle,
} from "../services/circleService.ts";

export const circlesRouter = Router();
circlesRouter.use(requireAuth);

const idParam = z.uuid();
const paramId = (v: unknown) => {
  const r = idParam.safeParse(v);
  if (!r.success) throw new HttpError(404, "Not found.");
  return r.data;
};

const rulesSchema = z.object({
  name: z.string().trim().min(2, "Give the circle a name.").max(60, "Use at most 60 characters."),
  monthlyAmount: z
    .number("Enter the monthly amount.")
    .int("Use a whole number of MAD.")
    .min(100, "The minimum is 100 MAD.")
    .max(10_000, "The maximum is 10,000 MAD."),
  memberCount: z
    .number("Enter the number of members.")
    .int("Use a whole number.")
    .min(3, "A circle needs at least 3 members.")
    .max(12, "A circle can have at most 12 members."),
  startDate: z.string().refine((s) => parseDateOnly(s) !== null, "Pick a valid date."),
  graceDays: z.number().int().min(0, "Use 0 to 7 days.").max(7, "Use 0 to 7 days.").default(3),
  orderMode: z.enum(["AUTOMATIC", "MANUAL"]).default("AUTOMATIC"),
});

function parseRules(body: unknown) {
  const r = rulesSchema.safeParse(body);
  if (!r.success) {
    throw badRequest("Please fix the highlighted fields.", z.flattenError(r.error).fieldErrors as Record<string, string[]>);
  }
  const startDate = parseDateOnly(r.data.startDate)!;
  if (startDate < todayUtc()) {
    throw badRequest("Please fix the highlighted fields.", { startDate: ["The first payment cannot be in the past."] });
  }
  return { ...r.data, startDate };
}

// ---- list and create -------------------------------------------------------------------

circlesRouter.get("/", async (_req, res) => {
  const user = res.locals.user;
  const memberships = await prisma.circleMember.findMany({
    where: { userId: user.id, status: "JOINED" },
    include: {
      circle: { include: { _count: { select: { members: { where: { status: "JOINED" } } } } } },
      contributions: { where: { status: "PENDING" }, orderBy: { dueDate: "asc" }, take: 1 },
    },
    orderBy: { joinedAt: "desc" },
  });
  res.json({
    circles: memberships.map((m) => ({
      id: m.circle.id,
      name: m.circle.name,
      status: m.circle.status,
      monthlyAmount: m.circle.monthlyAmount,
      memberCount: m.circle.memberCount,
      joinedCount: m.circle._count.members,
      startDate: isoDate(m.circle.startDate),
      isOrganizer: m.circle.organizerId === user.id,
      nextDue: m.contributions[0]
        ? { dueDate: isoDate(m.contributions[0].dueDate), amount: m.contributions[0].amount }
        : null,
    })),
  });
});

circlesRouter.post("/", async (req, res) => {
  const user = res.locals.user;
  await assertEligible(user);
  const rules = parseRules(req.body);

  const circle = await prisma.circle.create({
    data: {
      ...rules,
      organizerId: user.id,
      inviteToken: newInviteToken(),
      // the organizer wrote the rules, so they have accepted them
      members: { create: { userId: user.id, acceptedRulesVersion: 1, acceptedAt: new Date() } },
    },
  });
  res.status(201).json({ id: circle.id });
});

circlesRouter.get("/:id", async (req, res) => {
  res.json(await buildCircleDetail(paramId(req.params.id), res.locals.user.id));
});

// ---- rules ---------------------------------------------------------------------------------

circlesRouter.patch("/:id", async (req, res) => {
  const user = res.locals.user;
  const id = paramId(req.params.id);
  const rules = parseRules(req.body);

  await prisma.$transaction(async (tx) => {
    await lockCircle(tx, id);
    const { circle } = await loadCircleForMember(tx, id, user.id);
    assertOrganizer(circle, user.id);
    assertForming(circle);
    if (rules.memberCount < circle.members.length) {
      throw badRequest("Please fix the highlighted fields.", {
        memberCount: [`${circle.members.length} people have already joined. Remove someone first.`],
      });
    }
    const version = circle.rulesVersion + 1;
    await tx.circle.update({ where: { id }, data: { ...rules, rulesVersion: version } });
    await resetOrder(tx, id);
    // The editor accepts their own change. Everyone else has to accept the new version.
    await tx.circleMember.updateMany({
      where: { circleId: id, userId: user.id },
      data: { acceptedRulesVersion: version, acceptedAt: new Date() },
    });
  });
  res.json(await buildCircleDetail(id, user.id));
});

circlesRouter.post("/:id/accept", async (req, res) => {
  const user = res.locals.user;
  const id = paramId(req.params.id);
  const body = z.object({ rulesVersion: z.number().int() }).safeParse(req.body);
  if (!body.success) throw badRequest("Missing rules version.");

  await prisma.$transaction(async (tx) => {
    await lockCircle(tx, id);
    const { circle, me } = await loadCircleForMember(tx, id, user.id);
    assertForming(circle);
    if (body.data.rulesVersion !== circle.rulesVersion) {
      throw conflict("The organizer just changed the rules. Please review them again.");
    }
    await tx.circleMember.update({
      where: { id: me.id },
      data: { acceptedRulesVersion: circle.rulesVersion, acceptedAt: new Date() },
    });
  });
  res.json(await buildCircleDetail(id, user.id));
});

// ---- invite link -----------------------------------------------------------------------

circlesRouter.post("/:id/invite/regenerate", async (req, res) => {
  const user = res.locals.user;
  const id = paramId(req.params.id);
  const { circle } = await loadCircleForMember(prisma, id, user.id);
  assertOrganizer(circle, user.id);
  assertForming(circle);
  await prisma.circle.update({ where: { id }, data: { inviteToken: newInviteToken(), inviteActive: true } });
  res.json(await buildCircleDetail(id, user.id));
});

// ---- membership ------------------------------------------------------------------------

circlesRouter.post("/:id/leave", async (req, res) => {
  const user = res.locals.user;
  const id = paramId(req.params.id);
  await prisma.$transaction(async (tx) => {
    await lockCircle(tx, id);
    const { circle, me } = await loadCircleForMember(tx, id, user.id);
    assertForming(circle);
    if (circle.organizerId === user.id) {
      throw conflict("The organizer cannot leave. Cancel the circle instead.");
    }
    await tx.circleMember.update({
      where: { id: me.id },
      data: { status: "LEFT", acceptedRulesVersion: null, acceptedAt: null, orderApproved: false, payoutPosition: null },
    });
    await resetOrder(tx, id);
  });
  res.status(204).end();
});

circlesRouter.delete("/:id/members/:memberId", async (req, res) => {
  const user = res.locals.user;
  const id = paramId(req.params.id);
  const memberId = paramId(req.params.memberId);
  await prisma.$transaction(async (tx) => {
    await lockCircle(tx, id);
    const { circle } = await loadCircleForMember(tx, id, user.id);
    assertOrganizer(circle, user.id);
    assertForming(circle);
    const target = circle.members.find((m) => m.id === memberId);
    if (!target) throw new HttpError(404, "Member not found.");
    if (target.userId === circle.organizerId) throw conflict("You cannot remove yourself. Cancel the circle instead.");
    await tx.circleMember.update({
      where: { id: memberId },
      data: { status: "REMOVED", acceptedRulesVersion: null, acceptedAt: null, orderApproved: false, payoutPosition: null },
    });
    await resetOrder(tx, id);
  });
  res.json(await buildCircleDetail(id, user.id));
});

// ---- payout order (manual mode) ------------------------------------------------------

circlesRouter.put("/:id/order", async (req, res) => {
  const user = res.locals.user;
  const id = paramId(req.params.id);
  const body = z.object({ memberIds: z.array(z.uuid()) }).safeParse(req.body);
  if (!body.success) throw badRequest("Send the full list of members in the order you propose.");

  await prisma.$transaction(async (tx) => {
    await lockCircle(tx, id);
    const { circle } = await loadCircleForMember(tx, id, user.id);
    assertOrganizer(circle, user.id);
    assertForming(circle);
    if (circle.orderMode !== "MANUAL") throw conflict("This circle orders payouts automatically.");
    if (circle.members.length !== circle.memberCount) {
      throw conflict("Wait until the circle is full before proposing an order.");
    }
    const ids = body.data.memberIds;
    const sameSet = ids.length === circle.members.length && new Set(ids).size === ids.length && ids.every((m) => circle.members.some((x) => x.id === m));
    if (!sameSet) throw badRequest("The order must list every member exactly once.");

    await resetOrder(tx, id);
    for (let i = 0; i < ids.length; i++) {
      await tx.circleMember.update({ where: { id: ids[i]! }, data: { payoutPosition: i + 1 } });
    }
    // the proposer approves their own proposal
    await tx.circleMember.updateMany({ where: { circleId: id, userId: user.id }, data: { orderApproved: true } });
  });
  res.json(await buildCircleDetail(id, user.id));
});

circlesRouter.post("/:id/order/approve", async (req, res) => {
  const user = res.locals.user;
  const id = paramId(req.params.id);
  await prisma.$transaction(async (tx) => {
    await lockCircle(tx, id);
    const { circle, me } = await loadCircleForMember(tx, id, user.id);
    assertForming(circle);
    if (circle.orderMode !== "MANUAL") throw conflict("This circle orders payouts automatically.");
    if (me.payoutPosition === null) throw conflict("The organizer has not proposed an order yet.");
    await tx.circleMember.update({ where: { id: me.id }, data: { orderApproved: true } });
  });
  res.json(await buildCircleDetail(id, user.id));
});

// ---- start and cancel ----------------------------------------------------------------

circlesRouter.post("/:id/start", async (req, res) => {
  const user = res.locals.user;
  const id = paramId(req.params.id);
  await prisma.$transaction(
    async (tx) => {
      await lockCircle(tx, id);
      const { circle } = await loadCircleForMember(tx, id, user.id);
      assertOrganizer(circle, user.id);
      assertForming(circle);
      await startCircle(tx, id);
    },
    { timeout: 20_000 },
  );
  res.json(await buildCircleDetail(id, user.id));
});

circlesRouter.post("/:id/cancel", async (req, res) => {
  const user = res.locals.user;
  const id = paramId(req.params.id);
  await prisma.$transaction(async (tx) => {
    await lockCircle(tx, id);
    const { circle } = await loadCircleForMember(tx, id, user.id);
    assertOrganizer(circle, user.id);
    assertForming(circle);
    await tx.circle.update({ where: { id }, data: { status: "CANCELLED", inviteActive: false } });
  });
  res.json(await buildCircleDetail(id, user.id));
});

