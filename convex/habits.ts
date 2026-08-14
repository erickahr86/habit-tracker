import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

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
