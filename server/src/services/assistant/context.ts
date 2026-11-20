import type { Language } from "../../../generated/prisma/client";
import { prisma } from "../../config/prisma.ts";
import { buildCircleDetail } from "../circleService.ts";

export type RoundCtx = {
  index: number;
  dueDate: string;
  status: "UPCOMING" | "COLLECTING" | "PAID_OUT";
  recipientName: string;
  youReceive: boolean;
  myStatus: string | null;
  myAmount: number | null;
};

export type CircleCtx = {
  name: string;
  status: "FORMING" | "ACTIVE" | "COMPLETED" | "CANCELLED";
  monthlyAmount: number;
  memberCount: number;
  joined: number;
  potAmount: number;
  startDate: string;
  graceDays: number;
  orderMode: "AUTOMATIC" | "MANUAL";
  myPosition: number | null;
  rounds: RoundCtx[];
};

export type AssistantCtx = {
  language: Language;
  firstName: string;
  circles: CircleCtx[];
  /** total the member still owes after the Safety Fund covered a payment */
  owedAmount: number;
};

/**
 * Everything the assistant may know about one member: their OWN circles, rules, schedule and
 * payment statuses. Never anyone's reliability points or Level, including the member's own.
 */
export async function buildContext(user: { id: string; fullName: string; preferredLanguage: Language }): Promise<AssistantCtx> {
  const memberships = await prisma.circleMember.findMany({
    where: { userId: user.id, status: "JOINED", circle: { status: { in: ["FORMING", "ACTIVE"] } } },
    select: { circleId: true },
    orderBy: { joinedAt: "desc" },
    take: 10,
  });
  const details = await Promise.all(memberships.map((m) => buildCircleDetail(m.circleId, user.id)));

  const circles: CircleCtx[] = details.map((d) => ({
    name: d.circle.name,
    status: d.circle.status,
    monthlyAmount: d.circle.monthlyAmount,
    memberCount: d.circle.memberCount,
    joined: d.members.length,
    potAmount: d.circle.potAmount,
    startDate: d.circle.startDate,
    graceDays: d.circle.graceDays,
    orderMode: d.circle.orderMode,
    myPosition: d.you.payoutPosition,
    rounds: d.rounds.map((r) => ({
      index: r.index,
      dueDate: r.dueDate,
      status: r.status,
      recipientName: r.recipientName,
      youReceive: r.youReceive,
      myStatus: r.yourContribution?.status ?? null,
      myAmount: r.yourContribution?.amount ?? null,
    })),
  }));

  const owed = await prisma.contribution.aggregate({
    where: { userId: user.id, status: "COVERED_UNPAID" },
    _sum: { amount: true },
  });

  return {
    language: user.preferredLanguage,
    firstName: user.fullName.split(" ")[0] ?? "",
    circles,
    owedAmount: owed._sum.amount ?? 0,
  };
}

/**
 * The version sent to an outside AI service: no names at all. Other people become
 * "Member 1", "Member 2"..., and the member is just "you".
 */
export function anonymizeForAi(ctx: AssistantCtx) {
  const aliases = new Map<string, string>();
  const alias = (name: string) => {
    if (!aliases.has(name)) aliases.set(name, `Member ${aliases.size + 1}`);
    return aliases.get(name)!;
  };
  return {
    amountOwedAfterSafetyFundCover: ctx.owedAmount,
    circles: ctx.circles.map((c) => ({
      name: c.name,
      status: c.status,
      monthlyAmountMAD: c.monthlyAmount,
      members: `${c.joined} of ${c.memberCount} joined`,
      potMAD: c.potAmount,
      firstPaymentDate: c.startDate,
      graceDays: c.graceDays,
      payoutOrderMode: c.orderMode === "AUTOMATIC" ? "automatic (by payment record, newcomers last)" : "proposed by organizer, approved by all",
      yourPayoutMonth: c.myPosition,
      rounds: c.rounds.map((r) => ({
        month: r.index,
        dueDate: r.dueDate,
        recipient: r.youReceive ? "you" : alias(r.recipientName),
        yourPaymentStatus: r.myStatus,
      })),
    })),
  };
}
