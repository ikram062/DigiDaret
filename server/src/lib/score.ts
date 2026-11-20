/**
 * Reliability points and Level.
 *
 * Plain, published arithmetic on payment facts only. No AI model, no hidden inputs, and nothing
 * about the person (age, gender, address, contacts...) ever enters the calculation.
 *
 * Two outputs from the same facts:
 *  - Level (A, B, C, D, N): the report's lender-facing rules, over the last 12 months.
 *  - Points (0-100): a finer number used ONLY to order payouts inside a circle. Members only
 *    ever see their own.
 *
 * Every number below is a proposal. No repayment data supports them yet, and they are meant to
 * be calibrated later.
 */
import { addMonthsClamped, daysBetween } from "./dates.ts";

export type Outcome =
  | "PENDING"
  | "PAID_ON_TIME"
  | "PAID_IN_GRACE"
  | "COVERED_UNPAID" // the Safety Fund covered it and the member has not repaid yet
  | "COVERED_REPAID";

export type Level = "A" | "B" | "C" | "D" | "N";

export type ScoreFact = {
  status: Outcome;
  dueDate: Date;
  /** when the Safety Fund covered it (only for COVERED_*) */
  coveredAt?: Date | null;
};

export const WEIGHTS = {
  windowMonths: 12,
  /** credit given to each kind of payment outcome */
  credit: { PAID_ON_TIME: 1, PAID_IN_GRACE: 0.6, COVERED_REPAID: 0.2, COVERED_UNPAID: 0 },
  /** most of the score comes from the payment record */
  recordMax: 70,
  /** "virtual" neutral payments, so one early payment cannot make anyone look perfect */
  priorCount: 3,
  priorCredit: 0.7,
  streakPerMonth: 1.25,
  streakMax: 15,
  completionPerCircle: 7.5,
  completionMax: 15,
  /** an unrepaid Safety Fund draw caps the points here */
  shortfallCap: 40,
  /** after this many days unrepaid, the member is ranked last and shown as Level D */
  shortfallBlockDays: 30,
  /** a circle counts as "completed" for the bonus if they paid on time in at least this share */
  completionMinOnTime: 0.5,
  minMonthsForLevel: 3,
} as const;

export type ScoreResult = {
  points: number;
  /** points used for ordering: 0 when a shortfall has stayed unrepaid past the block period */
  orderingPoints: number;
  level: Level;
  levelName: string;
  monthsOfHistory: number;
  paymentsCounted: number;
  /** share paid by the due date (grace-period payments count as late); null with no history */
  onTimeRate: number | null;
  streak: number;
  completedCircles: number;
  hasUnrepaidShortfall: boolean;
  shortfallBlocked: boolean;
  breakdown: { record: number; streak: number; completion: number; capped: boolean };
  tips: string[];
};

const LEVEL_NAMES: Record<Level, string> = {
  A: "Established",
  B: "Reliable",
  C: "Building",
  D: "Review",
  N: "Too early",
};

/** How many finished circles earn the completion bonus. Input: each circle's outcomes for ONE member. */
export function countCleanCompletions(circles: { outcomes: Outcome[] }[]): number {
  return circles.filter(({ outcomes }) => {
    if (outcomes.length === 0 || outcomes.includes("PENDING")) return false;
    if (outcomes.some((o) => o === "COVERED_UNPAID" || o === "COVERED_REPAID")) return false;
    const onTime = outcomes.filter((o) => o === "PAID_ON_TIME").length;
    return onTime / outcomes.length >= WEIGHTS.completionMinOnTime;
  }).length;
}

export function computeScore(facts: ScoreFact[], completedCircles: number, now: Date): ScoreResult {
  const windowStart = addMonthsClamped(now, -WEIGHTS.windowMonths);
  // only settled payments that fell due inside the window
  const inWindow = facts
    .filter((f) => f.status !== "PENDING" && f.dueDate > windowStart && f.dueDate <= now)
    .sort((a, b) => b.dueDate.getTime() - a.dueDate.getTime()); // newest first

  const n = inWindow.length;
  const creditSum = inWindow.reduce((s, f) => s + WEIGHTS.credit[f.status as Exclude<Outcome, "PENDING">], 0);
  const onTime = inWindow.filter((f) => f.status === "PAID_ON_TIME").length;
  const months = new Set(inWindow.map((f) => f.dueDate.toISOString().slice(0, 7))).size;

  let streak = 0;
  for (const f of inWindow) {
    if (f.status !== "PAID_ON_TIME") break;
    streak++;
  }

  const record =
    (WEIGHTS.recordMax * (creditSum + WEIGHTS.priorCount * WEIGHTS.priorCredit)) / (n + WEIGHTS.priorCount);
  const streakPts = Math.min(streak * WEIGHTS.streakPerMonth, WEIGHTS.streakMax);
  const completedPts = Math.min(completedCircles * WEIGHTS.completionPerCircle, WEIGHTS.completionMax);

  const unpaid = inWindow.filter((f) => f.status === "COVERED_UNPAID");
  const hasUnrepaidShortfall = unpaid.length > 0;
  const shortfallBlocked = unpaid.some(
    (f) => daysBetween(f.coveredAt ?? f.dueDate, now) > WEIGHTS.shortfallBlockDays,
  );

  const raw = record + streakPts + completedPts;
  const capped = hasUnrepaidShortfall && raw > WEIGHTS.shortfallCap;
  const points = Math.max(0, Math.min(100, Math.round(capped ? WEIGHTS.shortfallCap : raw)));
  const onTimeRate = n === 0 ? null : onTime / n;

  const level = pickLevel({ months, n, onTimeRate, completedCircles, hasUnrepaidShortfall, shortfallBlocked });

  const tips: string[] = [];
  if (hasUnrepaidShortfall) tips.push("Repay what the Safety Fund covered. Your points are capped until you do.");
  if (months < WEIGHTS.minMonthsForLevel)
    tips.push(`Keep paying on time. A Level needs at least ${WEIGHTS.minMonthsForLevel} months of history.`);
  if (onTimeRate !== null && onTimeRate < 1)
    tips.push("Pay by the due date. A payment in the grace period counts as late.");
  if (completedCircles === 0) tips.push("Finish a whole circle to earn the completion bonus.");
  if (tips.length === 0) tips.push("You are doing everything right. Keep it up.");

  return {
    points,
    orderingPoints: shortfallBlocked ? 0 : points,
    level,
    levelName: LEVEL_NAMES[level],
    monthsOfHistory: months,
    paymentsCounted: n,
    onTimeRate,
    streak,
    completedCircles,
    hasUnrepaidShortfall,
    shortfallBlocked,
    breakdown: {
      record: Math.round(record),
      streak: Math.round(streakPts),
      completion: Math.round(completedPts),
      capped,
    },
    tips,
  };
}

/** The report's Level rules (section 5). */
function pickLevel(x: {
  months: number;
  n: number;
  onTimeRate: number | null;
  completedCircles: number;
  hasUnrepaidShortfall: boolean;
  shortfallBlocked: boolean;
}): Level {
  if (x.shortfallBlocked) return "D"; // unrepaid after 30 days
  if (x.months < WEIGHTS.minMonthsForLevel || x.onTimeRate === null) return "N";
  if (x.onTimeRate < 0.8) return "D";
  // A, B and C all require "no unrepaid shortfall". A recent one (under 30 days) is not
  // enough for D yet, but it blocks the better Levels, so the member is shown as D for review.
  if (x.hasUnrepaidShortfall) return "D";
  if (x.months >= 12 && x.completedCircles >= 1 && x.onTimeRate >= 0.95) return "A";
  if (x.months >= 6 && x.onTimeRate >= 0.9) return "B";
  return "C";
}
