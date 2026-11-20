import crypto from "node:crypto";
import type { Prisma } from "../../generated/prisma/client";
import { prisma } from "../config/prisma.ts";
import { addMonthsClamped, isoDate, todayUtc } from "../lib/dates.ts";
import { forbidden, HttpError, notFound } from "../lib/http.ts";
import { orderByScore } from "../lib/ordering.ts";
import { getUserScore, hasOpenDebt } from "./scoreService.ts";

export type Tx = Prisma.TransactionClient;

export const newInviteToken = () => crypto.randomBytes(24).toString("base64url");

/** Serialises concurrent changes to one circle (two people joining the last spot, etc.). */
export async function lockCircle(tx: Tx, circleId: string) {
  await tx.$queryRaw`SELECT id FROM circles WHERE id = ${circleId} FOR UPDATE`;
}

/** Creating or joining a circle needs a verified identity and no unpaid debt. */
export async function assertEligible(user: { id: string; kycStatus: string }) {
  if (user.kycStatus !== "VERIFIED") {
    throw forbidden("Your identity must be verified before you can create or join a circle.");
  }
  if (await hasOpenDebt(user.id)) {
    throw forbidden("You still owe a payment that the Safety Fund covered. Settle it before joining a new circle.");
  }
}

export async function loadCircleForMember(tx: Tx | typeof prisma, circleId: string, userId: string) {
  const circle = await tx.circle.findUnique({
    where: { id: circleId },
    include: { members: { where: { status: "JOINED" }, orderBy: { joinedAt: "asc" } } },
  });
  const me = circle?.members.find((m) => m.userId === userId);
  if (!circle || !me) throw notFound("Circle not found.");
  return { circle, me };
}

export function assertOrganizer(circle: { organizerId: string }, userId: string) {
  if (circle.organizerId !== userId) throw forbidden("Only the organizer can do this.");
}

export function assertForming(circle: { status: string }) {
  if (circle.status !== "FORMING") {
    throw new HttpError(409, "The rules are frozen once a circle has started.");
  }
}

/** Clears a manual order proposal and its approvals (any rules or membership change does this). */
export async function resetOrder(tx: Tx, circleId: string) {
  await tx.circleMember.updateMany({
    where: { circleId },
    data: { payoutPosition: null, orderApproved: false },
  });
}

export type Readiness = {
  full: boolean;
  allAccepted: boolean;
  orderReady: boolean;
  dateOk: boolean;
  canStart: boolean;
  missing: string[];
};

export function computeReadiness(circle: {
  memberCount: number;
  rulesVersion: number;
  orderMode: string;
  startDate: Date;
  members: { acceptedRulesVersion: number | null; orderApproved: boolean; payoutPosition: number | null }[];
}): Readiness {
  const joined = circle.members.length;
  const full = joined === circle.memberCount;
  const allAccepted = circle.members.every((m) => m.acceptedRulesVersion === circle.rulesVersion);
  const orderReady =
    circle.orderMode === "AUTOMATIC" ||
    (full && circle.members.every((m) => m.payoutPosition !== null && m.orderApproved));
  const dateOk = circle.startDate >= todayUtc();

  const missing: string[] = [];
  if (!full) missing.push(`${circle.memberCount - joined} more member(s) need to join`);
  if (!allAccepted) missing.push("everyone must accept the current rules");
  if (!orderReady) missing.push("everyone must approve the payout order");
  if (!dateOk) missing.push("the start date has passed, so pick a new one");
  return { full, allAccepted, orderReady, dateOk, canStart: missing.length === 0, missing };
}

/**
 * Starts a circle: fixes the payout order, then creates one round per member and one
 * contribution per member per round. Must run inside a transaction that holds the circle lock.
 */
export async function startCircle(tx: Tx, circleId: string) {
  const circle = await tx.circle.findUniqueOrThrow({
    where: { id: circleId },
    include: { members: { where: { status: "JOINED" } } },
  });
  const readiness = computeReadiness(circle);
  if (!readiness.canStart) throw new HttpError(409, `Not ready to start: ${readiness.missing.join("; ")}.`);

  let orderSeed: string | null = null;
  let ordered: string[]; // member ids, first = round 1 recipient

  if (circle.orderMode === "MANUAL") {
    ordered = [...circle.members].sort((a, b) => a.payoutPosition! - b.payoutPosition!).map((m) => m.id);
  } else {
    // Automatic: rank by reliability points. Newcomers last, random if everyone is new.
    orderSeed = crypto.randomBytes(16).toString("hex");
    const now = new Date();
    const scored = await Promise.all(
      circle.members.map(async (m) => {
        const { score } = await getUserScore(m.userId, now);
        return { member: m, score };
      }),
    );
    ordered = orderByScore(
      scored.map(({ member, score }) => ({
        memberId: member.id,
        orderingPoints: score.orderingPoints,
        monthsOfHistory: score.monthsOfHistory,
        level: score.level,
      })),
      orderSeed,
    );
    for (const { member, score } of scored) {
      await tx.circleMember.update({ where: { id: member.id }, data: { orderScore: score.points } });
    }
  }

  for (let i = 0; i < ordered.length; i++) {
    await tx.circleMember.update({ where: { id: ordered[i]! }, data: { payoutPosition: i + 1 } });
  }

  for (let i = 0; i < ordered.length; i++) {
    const dueDate = addMonthsClamped(circle.startDate, i);
    const round = await tx.round.create({
      data: {
        circleId,
        index: i + 1,
        dueDate,
        recipientMemberId: ordered[i]!,
        status: i === 0 ? "COLLECTING" : "UPCOMING",
      },
    });
    await tx.contribution.createMany({
      data: circle.members.map((m) => ({
        roundId: round.id,
        memberId: m.id,
        userId: m.userId,
        amount: circle.monthlyAmount,
        dueDate,
      })),
    });
  }

  await tx.circle.update({
    where: { id: circleId },
    data: { status: "ACTIVE", startedAt: new Date(), inviteActive: false, orderSeed },
  });
}

/** Everything the circle page needs. Never includes another member's points or Level. */
export async function buildCircleDetail(circleId: string, viewerId: string) {
  const circle = await prisma.circle.findUnique({
    where: { id: circleId },
    include: {
      organizer: { select: { fullName: true } },
      members: { where: { status: "JOINED" }, include: { user: { select: { fullName: true } } }, orderBy: { joinedAt: "asc" } },
      rounds: {
        orderBy: { index: "asc" },
        include: { recipient: { include: { user: { select: { fullName: true } } } }, contributions: true },
      },
    },
  });
  const me = circle?.members.find((m) => m.userId === viewerId);
  if (!circle || !me) throw notFound("Circle not found.");

  const isOrganizer = circle.organizerId === viewerId;
  const readiness = computeReadiness(circle);
  const showOrder = circle.status !== "FORMING" || circle.orderMode === "MANUAL";

  return {
    circle: {
      id: circle.id,
      name: circle.name,
      status: circle.status,
      monthlyAmount: circle.monthlyAmount,
      memberCount: circle.memberCount,
      potAmount: circle.monthlyAmount * circle.memberCount,
      startDate: isoDate(circle.startDate),
      graceDays: circle.graceDays,
      orderMode: circle.orderMode,
      rulesVersion: circle.rulesVersion,
      organizerName: circle.organizer.fullName,
      startedAt: circle.startedAt,
    },
    you: {
      memberId: me.id,
      isOrganizer,
      acceptedCurrentRules: me.acceptedRulesVersion === circle.rulesVersion,
      orderApproved: me.orderApproved,
      payoutPosition: showOrder ? me.payoutPosition : null,
    },
    members: circle.members.map((m) => ({
      id: m.id,
      fullName: m.user.fullName,
      isOrganizer: m.userId === circle.organizerId,
      isYou: m.userId === viewerId,
      acceptedCurrentRules: m.acceptedRulesVersion === circle.rulesVersion,
      orderApproved: m.orderApproved,
      payoutPosition: showOrder ? m.payoutPosition : null,
    })),
    readiness,
    invite: isOrganizer && circle.status === "FORMING" ? { token: circle.inviteToken, active: circle.inviteActive } : null,
    rounds: circle.rounds.map((r) => {
      const mine = r.contributions.find((c) => c.memberId === me.id);
      return {
        index: r.index,
        dueDate: isoDate(r.dueDate),
        status: r.status,
        recipientName: r.recipient.user.fullName,
        youReceive: r.recipientMemberId === me.id,
        yourContribution: mine ? { status: mine.status, amount: mine.amount } : null,
        paidCount: r.contributions.filter((c) => c.status !== "PENDING").length,
        memberTotal: r.contributions.length,
      };
    }),
  };
}
