// Returns "2026-08-13" for a given Date, in UTC.
export function toDateString(d: Date): string {
  return d.toISOString().slice(0, 10);
}

// Returns the ISO date string for N days before the given date.
export function daysBefore(dateStr: string, n: number): string {
  const d = new Date(dateStr + "T00:00:00Z");
  d.setUTCDate(d.getUTCDate() - n);
  return toDateString(d);
}

// Given a habit and a log value, did the user hit the target that day?
export function hitTarget(target: number, value: number): boolean {
  return value >= target;
}