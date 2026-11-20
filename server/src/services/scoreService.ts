import { prisma } from "../config/prisma.ts";
import { addMonthsClamped, isoDate } from "../lib/dates.ts";
import {
  computeScore,
  countCleanCompletions,
  WEIGHTS,
  type Outcome,
  type ScoreFact,
  type ScoreResult,
} from "../lib/score.ts";

export type HistoryRow = {
  circleName: string;
  dueDate: string;
  amount: number;
  status: Outcome;
  paidAt: Date | null;
};

/** Reads a user's payment facts from the ledger and computes their score. */
export async function getUserScore(userId: string, now: Date = new Date()) {
  const rows = await prisma.contribution.findMany({
    where: { userId },
    include: { round: { include: { circle: { select: { id: true, name: true, status: true } } } } },
    orderBy: { dueDate: "desc" },
  });

  const facts: ScoreFact[] = rows.map((r) => ({
    status: r.status,
    dueDate: r.dueDate,
    coveredAt: r.coveredAt,
  }));

  // outcomes per finished circle, for the completion bonus
  const perCircle = new Map<string, Outcome[]>();
  for (const r of rows) {
    if (r.round.circle.status !== "COMPLETED") continue;
    perCircle.set(r.round.circle.id, [...(perCircle.get(r.round.circle.id) ?? []), r.status]);
  }
  const completed = countCleanCompletions([...perCircle.values()].map((outcomes) => ({ outcomes })));

  const score: ScoreResult = computeScore(facts, completed, now);

  const windowStart = addMonthsClamped(now, -WEIGHTS.windowMonths);
  const history: HistoryRow[] = rows
    .filter((r) => r.dueDate > windowStart && r.dueDate <= now && r.status !== "PENDING")
    .map((r) => ({
      circleName: r.round.circle.name,
      dueDate: isoDate(r.dueDate),
      amount: r.amount,
      status: r.status,
      paidAt: r.paidAt,
    }));

  return { score, history };
}

/** True when the Safety Fund covered a payment for this user and they have not repaid it. */
export async function hasOpenDebt(userId: string): Promise<boolean> {
  const n = await prisma.contribution.count({ where: { userId, status: "COVERED_UNPAID" } });
  return n > 0;
}
