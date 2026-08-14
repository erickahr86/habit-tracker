import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

const DEMO_USER = "demo-user"; // temporary until auth

export const logHabit = mutation({
  args: {
    habitId: v.id("habits"),
    date: v.string(),
    value: v.number(),
  },
  handler: async (ctx, { habitId, date, value }) => {
    // If a log already exists for today, overwrite it (upsert)
    const existing = await ctx.db
      .query("logs")
      .withIndex("by_habit_and_date", (q) =>
        q.eq("habitId", habitId).eq("date", date),
      )
      .unique();

    if (existing) {
      await ctx.db.patch(existing._id, { value });
    } else {
      await ctx.db.insert("logs", {
        habitId,
        userId: DEMO_USER,
        date,
        value,
      });
    }
  },
});

export const todayLogs = query({
  args: { date: v.string() },
  handler: async (ctx, { date }) => {
    return await ctx.db
      .query("logs")
      .withIndex("by_user_and_date", (q) =>
        q.eq("userId", DEMO_USER).eq("date", date),
      )
      .collect();
  },
});
