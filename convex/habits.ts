import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { toDateString, daysBefore, hitTarget } from "./model/habits";

const DEMO_USER = "demo-user"; // temporary until auth

export const createHabit = mutation({
  args: {
    name: v.string(),
    type: v.union(
      v.literal("numeric"),
      v.literal("boolean"),
      v.literal("duration"),
    ),
    target: v.number(),
    unit: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("habits", { ...args, userId: DEMO_USER });
  },
});

export const listHabits = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("habits")
      .withIndex("by_user", (q) => q.eq("userId", DEMO_USER))
      .collect();
  },
});

export const currentStreak = query({
  args: { habitId: v.id("habits") },
  handler: async (ctx, { habitId }) => {
    const habit = await ctx.db.get(habitId);
    if (!habit) return 0;

    const today = toDateString(new Date());
    let streak = 0;
    let cursorDate = today;

    // Walk backwards day by day until we find a day that wasn't hit.
    // Cap at 365 for safety.
    for (let i = 0; i < 365; i++) {
      const log = await ctx.db
        .query("logs")
        .withIndex("by_habit_and_date", (q) =>
          q.eq("habitId", habitId).eq("date", cursorDate),
        )
        .unique();

      const hit = log ? hitTarget(habit.target, log.value) : false;

      if (!hit) {
        // Special case: today not yet logged shouldn't break the streak.
        // Only break if the missing day is *before* today.
        if (cursorDate !== today) break;
      } else {
        streak++;
      }

      cursorDate = daysBefore(cursorDate, 1);
    }

    return streak;
  },
});
