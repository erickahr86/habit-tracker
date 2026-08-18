import type { QueryCtx } from "../_generated/server";
import type { Doc } from "../_generated/dataModel";

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

// Walks backwards day by day from today until an unhit day is found.
export async function computeStreak(
  ctx: QueryCtx,
  habit: Doc<"habits">,
): Promise<number> {
  const today = toDateString(new Date());
  let streak = 0;
  let cursorDate = today;

  for (let i = 0; i < 365; i++) {
    const log = await ctx.db
      .query("logs")
      .withIndex("by_habit_and_date", (q) =>
        q.eq("habitId", habit._id).eq("date", cursorDate),
      )
      .unique();

    const hit = log ? hitTarget(habit.target, log.value) : false;

    if (!hit) {
      // Special case: today not yet logged shouldn't break the streak.
      if (cursorDate !== today) break;
    } else {
      streak++;
    }

    cursorDate = daysBefore(cursorDate, 1);
  }

  return streak;
}
