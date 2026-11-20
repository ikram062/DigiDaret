// All circle dates are calendar dates (no time of day), handled as UTC midnight.

export function todayUtc(now: Date = new Date()): Date {
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
}

export const isoDate = (d: Date) => d.toISOString().slice(0, 10);

/** "2026-12-05" -> Date at UTC midnight, or null when it is not a real calendar date. */
export function parseDateOnly(s: string): Date | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(s)) return null;
  const d = new Date(`${s}T00:00:00.000Z`);
  return Number.isNaN(d.getTime()) || isoDate(d) !== s ? null : d;
}

/**
 * Adds whole months, keeping the day of the month and clamping to the month's last day.
 * Jan 31 + 1 month = Feb 28 (or 29). Always counted from the original date, never chained,
 * so a circle that starts on the 31st still returns to the 31st in months that have one.
 */
export function addMonthsClamped(d: Date, months: number): Date {
  const y = d.getUTCFullYear();
  const m = d.getUTCMonth() + months;
  const lastDay = new Date(Date.UTC(y, m + 1, 0)).getUTCDate();
  return new Date(Date.UTC(y, m, Math.min(d.getUTCDate(), lastDay)));
}

export const daysBetween = (a: Date, b: Date) => Math.floor((b.getTime() - a.getTime()) / 86_400_000);
