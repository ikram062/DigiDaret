/**
 * Automatic payout order.
 *
 *  - Members with history are ranked by points, highest first. The people most likely to keep
 *    paying after they have received the pot take the early slots. That is where a default
 *    hurts the group most, and it rewards good payment behaviour.
 *  - Newcomers (no Level yet) go last, in a random order among themselves.
 *  - If everyone is a newcomer, the whole order is a random shuffle.
 *
 * The shuffle is seeded and the seed is stored, so the draw can be reproduced and audited.
 */
import type { Level } from "./score.ts";

export type Orderable = {
  memberId: string;
  orderingPoints: number;
  monthsOfHistory: number;
  level: Level;
};

function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function hashSeed(seed: string): number {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export function seededShuffle<T>(items: T[], seed: string): T[] {
  const rand = mulberry32(hashSeed(seed));
  const out = [...items];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [out[i], out[j]] = [out[j]!, out[i]!];
  }
  return out;
}

/** Returns member ids in payout order (first = receives the pot in round 1). */
export function orderByScore(members: Orderable[], seed: string): string[] {
  const shuffled = seededShuffle(members, seed);
  const scored = shuffled.filter((m) => m.level !== "N");
  const newcomers = shuffled.filter((m) => m.level === "N");
  // Array.prototype.sort is stable, so ties keep their (random) shuffled order
  scored.sort((a, b) => b.orderingPoints - a.orderingPoints || b.monthsOfHistory - a.monthsOfHistory);
  return [...scored, ...newcomers].map((m) => m.memberId);
}
