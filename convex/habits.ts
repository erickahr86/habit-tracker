import { mutation, query, internalQuery } from "./_generated/server";
import { v } from "convex/values";
import { Id } from "./_generated/dataModel";
import { requireCurrentUserId } from "./model/users";
import { assertOwnsHabit } from "./model/permissions";
import { toDateString, daysBefore, hitTarget } from "./model/habits";
import strict from "node:assert/strict";

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
    const userId = await requireCurrentUserId(ctx);
    return await ctx.db.insert("habits", { ...args, userId });
  },
});

export const listHabits = query({
  args: {},
  handler: async (ctx) => {
    const userId = await requireCurrentUserId(ctx);
    return await ctx.db
      .query("habits")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();
  },
});

export const currentStreak = query({
  args: { habitId: v.id("habits") },
  handler: async (ctx, { habitId }) => {
    await assertOwnsHabit(ctx, habitId);
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

export const usersWithoutLogsToday = internalQuery({
  args: {},
  handler: async (ctx) => {
    const today = toDateString(new Date());
    const users = await ctx.db.query("users").collect();
    const missing: string[] = [];
    for (const u of users) {
      const log = await ctx.db
        .query("logs")
        .withIndex("by_user_and_date", (q) =>
          q.eq("userId", u._id).eq("date", today),
        )
        .first();
      if (!log) missing.push(u.name?.toString() ?? "Unknown user");
    }
    return missing;
  },
});