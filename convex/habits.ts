import { mutation, query, internalQuery } from "./_generated/server";
import { v } from "convex/values";
import { Id } from "./_generated/dataModel";
import { requireCurrentUserId } from "./model/users";
import { assertOwnsHabit } from "./model/permissions";
import { toDateString, daysBefore, hitTarget, computeStreak } from "./model/habits";
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
    return computeStreak(ctx, habit);
  },
});

export const dashboardStats = query({
  args: {},
  handler: async (ctx) => {
    const userId = await requireCurrentUserId(ctx);
    const habits = await ctx.db
      .query("habits")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    const today = toDateString(new Date());
    const logsToday = await ctx.db
      .query("logs")
      .withIndex("by_user_and_date", (q) =>
        q.eq("userId", userId).eq("date", today),
      )
      .collect();

    const totalHabits = habits.length;
    const hitToday = habits.filter((h) => {
      const log = logsToday.find((l) => l.habitId === h._id);
      return log ? hitTarget(h.target, log.value) : false;
    }).length;

    let longestStreak = 0;
    for (const habit of habits) {
      const streak = await computeStreak(ctx, habit);
      if (streak > longestStreak) longestStreak = streak;
    }

    // Week completion: Monday of this week through today, inclusive.
    const dayOfWeek = new Date(today + "T00:00:00Z").getUTCDay(); // 0=Sun,1=Mon,...
    const daysSinceMonday = (dayOfWeek + 6) % 7;
    const weekDates: string[] = [];
    for (let i = daysSinceMonday; i >= 0; i--) {
      weekDates.push(daysBefore(today, i));
    }

    const totalCells = habits.length * weekDates.length;
    let hitCells = 0;
    for (const habit of habits) {
      for (const date of weekDates) {
        const log = await ctx.db
          .query("logs")
          .withIndex("by_habit_and_date", (q) =>
            q.eq("habitId", habit._id).eq("date", date),
          )
          .unique();
        if (log && hitTarget(habit.target, log.value)) hitCells++;
      }
    }
    const weekCompletion =
      totalCells > 0 ? Math.round((hitCells / totalCells) * 100) : 0;

    return { longestStreak, hitToday, totalHabits, weekCompletion };
  },
});

export const deleteHabit = mutation({
  args: { habitId: v.id("habits") },
  handler: async (ctx, { habitId }) => {
    await assertOwnsHabit(ctx, habitId);

    const logs = await ctx.db
      .query("logs")
      .withIndex("by_habit_and_date", (q) => q.eq("habitId", habitId))
      .collect();
    for (const log of logs) {
      await ctx.db.delete(log._id);
    }

    await ctx.db.delete(habitId);
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