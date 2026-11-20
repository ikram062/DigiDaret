import { test } from "node:test";
import assert from "node:assert/strict";
import { addMonthsClamped, parseDateOnly } from "./dates.ts";
import { computeScore, countCleanCompletions, type Outcome, type ScoreFact } from "./score.ts";
import { orderByScore, seededShuffle } from "./ordering.ts";

const d = (s: string) => new Date(`${s}T00:00:00.000Z`);
const NOW = d("2026-11-20");

/** one monthly payment per outcome, the last one due 2026-11-05 (15 days before NOW) */
function history(outcomes: Outcome[]): ScoreFact[] {
  return outcomes.map((status, i) => ({
    status,
    dueDate: addMonthsClamped(d("2026-11-05"), -(outcomes.length - 1 - i)),
  }));
}
const ok = (n: number) => Array<Outcome>(n).fill("PAID_ON_TIME");

test("dates: month arithmetic clamps to the last day and never drifts", () => {
  assert.equal(addMonthsClamped(d("2026-01-31"), 1).toISOString().slice(0, 10), "2026-02-28");
  assert.equal(addMonthsClamped(d("2028-01-31"), 1).toISOString().slice(0, 10), "2028-02-29");
  assert.equal(addMonthsClamped(d("2026-01-31"), 2).toISOString().slice(0, 10), "2026-03-31");
  assert.equal(addMonthsClamped(d("2026-11-20"), -12).toISOString().slice(0, 10), "2025-11-20");
  assert.equal(parseDateOnly("2026-02-30"), null);
  assert.equal(parseDateOnly("nope"), null);
});

test("score: a newcomer is Level N and starts mid-range", () => {
  const s = computeScore([], 0, NOW);
  assert.equal(s.level, "N");
  assert.equal(s.onTimeRate, null);
  assert.equal(s.points, 49); // 70 * 0.7
});

test("score: fewer than 3 months of history stays N even when perfect", () => {
  assert.equal(computeScore(history(ok(2)), 0, NOW).level, "N");
  assert.equal(computeScore(history(ok(3)), 0, NOW).level, "C");
});

test("score: Level rules from the report", () => {
  assert.equal(computeScore(history(ok(6)), 0, NOW).level, "B");
  assert.equal(computeScore(history(ok(12)), 0, NOW).level, "B", "A needs a completed circle");
  assert.equal(computeScore(history(ok(12)), 1, NOW).level, "A");
  // 11 of 12 on time = 91.7%: not enough for A (95%), enough for B
  assert.equal(computeScore(history([...ok(11), "PAID_IN_GRACE"]), 1, NOW).level, "B");
  // 3 of 4 on time = 75%: under 80% is D
  assert.equal(computeScore(history([...ok(3), "PAID_IN_GRACE"]), 0, NOW).level, "D");
});

test("score: grace-period payments count as late", () => {
  const s = computeScore(history([...ok(9), "PAID_IN_GRACE"]), 0, NOW);
  assert.equal(s.onTimeRate, 0.9);
});

test("score: more on-time history means more points", () => {
  const few = computeScore(history(ok(3)), 0, NOW).points;
  const many = computeScore(history(ok(10)), 0, NOW).points;
  assert.ok(many > few);
});

test("score: an unrepaid shortfall caps points and blocks Levels A, B, C", () => {
  const facts = history([...ok(9), "COVERED_UNPAID"]);
  facts[facts.length - 1]!.coveredAt = d("2026-11-15"); // covered 5 days ago
  const s = computeScore(facts, 1, NOW);
  assert.ok(s.points <= 40);
  assert.equal(s.hasUnrepaidShortfall, true);
  assert.equal(s.level, "D");
  assert.equal(s.shortfallBlocked, false); // covered only recently
  assert.equal(s.orderingPoints, s.points);
});

test("score: shortfall unrepaid past 30 days ranks the member last", () => {
  const facts = history(ok(9)).map((f) => ({ ...f, dueDate: addMonthsClamped(f.dueDate, -1) }));
  facts.push({ status: "COVERED_UNPAID", dueDate: d("2026-10-05"), coveredAt: d("2026-10-10") });
  const s = computeScore(facts, 1, NOW);
  assert.equal(s.shortfallBlocked, true);
  assert.equal(s.orderingPoints, 0);
  assert.equal(s.level, "D");
});

test("score: payments older than 12 months and pending ones are ignored", () => {
  const facts: ScoreFact[] = [
    { status: "PAID_ON_TIME", dueDate: d("2024-01-05") },
    { status: "PENDING", dueDate: d("2026-11-05") },
    { status: "PAID_ON_TIME", dueDate: d("2027-01-05") }, // not due yet
  ];
  assert.equal(computeScore(facts, 0, NOW).paymentsCounted, 0);
});

test("score: the streak stops at the first non-on-time payment", () => {
  const s = computeScore(history(["PAID_IN_GRACE", ...ok(4)]), 0, NOW);
  assert.equal(s.streak, 4);
});

test("score: completion bonus only for circles finished cleanly", () => {
  assert.equal(countCleanCompletions([{ outcomes: ok(4) }]), 1);
  assert.equal(countCleanCompletions([{ outcomes: [...ok(3), "COVERED_REPAID"] }]), 0);
  assert.equal(countCleanCompletions([{ outcomes: ["PAID_IN_GRACE", "PAID_IN_GRACE", "PAID_IN_GRACE", "PAID_ON_TIME"] }]), 0);
  assert.equal(countCleanCompletions([{ outcomes: ["PAID_IN_GRACE", "PAID_ON_TIME", "PAID_IN_GRACE", "PAID_ON_TIME"] }]), 1);
  assert.equal(countCleanCompletions([{ outcomes: [] }]), 0);
});

const m = (memberId: string, points: number, months: number) => {
  const s = computeScore(history(ok(months)), 0, NOW);
  return { memberId, orderingPoints: points, monthsOfHistory: months, level: s.level };
};

test("ordering: highest points first, newcomers last", () => {
  const order = orderByScore([m("new1", 49, 0), m("low", 60, 5), m("high", 90, 8), m("mid", 75, 6), m("new2", 49, 1)], "seed-1");
  assert.deepEqual(order.slice(0, 3), ["high", "mid", "low"]);
  assert.deepEqual(order.slice(3).sort(), ["new1", "new2"]);
});

test("ordering: all newcomers get a random shuffle that is reproducible from the seed", () => {
  const all = ["a", "b", "c", "d", "e", "f"].map((id) => m(id, 49, 0));
  const one = orderByScore(all, "seed-A");
  assert.deepEqual(one, orderByScore(all, "seed-A"));
  assert.equal(new Set(one).size, 6);
  const others = ["seed-B", "seed-C", "seed-D", "seed-E"].map((s) => orderByScore(all, s).join());
  assert.ok(others.some((o) => o !== one.join()), "different seeds should be able to give different orders");
});

test("ordering: ties are broken by longer history", () => {
  const order = orderByScore([m("short", 70, 4), m("long", 70, 9)], "x");
  assert.deepEqual(order, ["long", "short"]);
});

test("ordering: shuffle keeps every item exactly once", () => {
  const items = Array.from({ length: 12 }, (_, i) => i);
  assert.deepEqual([...seededShuffle(items, "s")].sort((a, b) => a - b), items);
});
