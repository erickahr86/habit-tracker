import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  habits: defineTable({
    userId: v.string(),                    // hardcoded "demo-user" for now
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
    userId: v.string(),
    date: v.string(),                       // "2026-08-13" (ISO date, no time)
    value: v.number(),                      // numeric value; booleans stored as 0/1
  })
    .index("by_habit_and_date", ["habitId", "date"])
    .index("by_user_and_date", ["userId", "date"]),
});
