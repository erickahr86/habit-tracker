import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

export default defineSchema({
  ...authTables,

  habits: defineTable({
    userId: v.id("users"),
    name: v.string(),                       // "Steps", "Sleep", "Vitamins"
    type: v.union(
      v.literal("numeric"),
      v.literal("boolean"),
      v.literal("duration"),
    ),
    target: v.number(),                     // 8000, 7, 1
    unit: v.optional(v.string()),           // "steps", "hours"
  }).index("by_user", ["userId"]),

  logs: defineTable({
    habitId: v.id("habits"),
    userId: v.id("users"),
    date: v.string(),                       // "2026-08-13" (ISO date, no time)
    value: v.number(),                      // numeric value; booleans stored as 0/1
  })
    .index("by_habit_and_date", ["habitId", "date"])
    .index("by_user_and_date", ["userId", "date"]),

  invites: defineTable({
    code: v.string(),                    // e.g. "XKJH7Q"
    createdBy: v.id("users"),
    usedBy: v.optional(v.id("users")),   // set when redeemed
  }).index("by_code", ["code"]),

  buddyPairs: defineTable({
    userA: v.id("users"),
    userB: v.id("users"),
  })
    .index("by_userA", ["userA"])
    .index("by_userB", ["userB"]),
});
