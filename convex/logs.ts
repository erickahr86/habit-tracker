import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { requireCurrentUserId } from "./model/users";
import { assertOwnsHabit } from "./model/permissions";

export const logHabit = mutation({
  args: {
    habitId: v.id("habits"),
    date: v.string(),
    value: v.number(),
  },
  handler: async (ctx, { habitId, date, value }) => {
    await assertOwnsHabit(ctx, habitId);
    const userId = await requireCurrentUserId(ctx);

    const existing = await ctx.db
      .query("logs")
      .withIndex("by_habit_and_date", (q) =>
        q.eq("habitId", habitId).eq("date", date),
      )
      .unique();

    if (existing) {
      await ctx.db.patch(existing._id, { value });
    } else {
      await ctx.db.insert("logs", { habitId, userId, date, value });
    }
  },
});

export const todayLogs = query({
  args: { date: v.string() },
  handler: async (ctx, { date }) => {
    const userId = await requireCurrentUserId(ctx);
    return await ctx.db
      .query("logs")
      .withIndex("by_user_and_date", (q) =>
        q.eq("userId", userId).eq("date", date),
      )
      .collect();
  },
});
