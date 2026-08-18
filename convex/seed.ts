import { internalMutation } from "./_generated/server";
import { v } from "convex/values";
import { Id } from "./_generated/dataModel";

// ============================================================
// CLEAR — wipes only app data (habits, logs, summaries) for a
// given user. Leaves auth tables (users, sessions, accounts)
// and social tables (buddyPairs, invites) untouched, so you
// stay signed in and keep your buddy pairing.
// ============================================================
export const clearMyData = internalMutation({
  args: { userId: v.id("users") },
  handler: async (ctx, { userId }) => {
    // Delete logs for this user
    const logs = await ctx.db
      .query("logs")
      .withIndex("by_user_and_date", (q) => q.eq("userId", userId))
      .collect();
    for (const l of logs) await ctx.db.delete(l._id);

    // Delete habits for this user
    const habits = await ctx.db
      .query("habits")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();
    for (const h of habits) await ctx.db.delete(h._id);

    // Delete summaries for this user
    const summaries = await ctx.db
      .query("summaries")
      .withIndex("by_user_and_week", (q) => q.eq("userId", userId))
      .collect();
    for (const s of summaries) await ctx.db.delete(s._id);

    return {
      deletedLogs: logs.length,
      deletedHabits: habits.length,
      deletedSummaries: summaries.length,
    };
  },
});

// ============================================================
// SEED — 10 realistic habits + ~21 days of human-like logs.
// Adherence varies per habit, weekends behave differently,
// and days 11–14 simulate a "rough patch" so streaks look
// realistic instead of monotonic.
// ============================================================

type HabitTemplate = {
  name: string;
  type: "numeric" | "duration" | "boolean";
  target: number;
  unit?: string;
  // Base probability a log is created on a given day (0-1).
  baseAdherence: number;
  // For numeric/duration: multiplier on the target when logged.
  // 1.0 = exactly target, >1 = overshoots, <1 = undershoots.
  performanceMean: number;
  performanceStdDev: number;
  // Weekend adherence multiplier (Sat/Sun).
  weekendFactor: number;
};

const HABIT_TEMPLATES: HabitTemplate[] = [
  {
    name: "Steps",
    type: "numeric",
    target: 8000,
    unit: "steps",
    baseAdherence: 0.95,
    performanceMean: 1.05,
    performanceStdDev: 0.25,
    weekendFactor: 0.7,
  },
  {
    name: "Sleep",
    type: "duration",
    target: 7,
    unit: "hours",
    baseAdherence: 0.98,
    performanceMean: 0.95,
    performanceStdDev: 0.15,
    weekendFactor: 1.1,
  },
  {
    name: "Water",
    type: "numeric",
    target: 8,
    unit: "glasses",
    baseAdherence: 0.85,
    performanceMean: 0.9,
    performanceStdDev: 0.3,
    weekendFactor: 0.8,
  },
  {
    name: "Vitamins",
    type: "boolean",
    target: 1,
    baseAdherence: 0.75,
    performanceMean: 1,
    performanceStdDev: 0,
    weekendFactor: 0.6,
  },
  {
    name: "Meditation",
    type: "duration",
    target: 10,
    unit: "minutes",
    baseAdherence: 0.7,
    performanceMean: 1,
    performanceStdDev: 0.3,
    weekendFactor: 0.9,
  },
  {
    name: "Reading",
    type: "duration",
    target: 30,
    unit: "minutes",
    baseAdherence: 0.65,
    performanceMean: 1.1,
    performanceStdDev: 0.4,
    weekendFactor: 1.4,
  },
  {
    name: "Exercise",
    type: "duration",
    target: 30,
    unit: "minutes",
    baseAdherence: 0.6,
    performanceMean: 1.15,
    performanceStdDev: 0.35,
    weekendFactor: 0.8,
  },
  {
    name: "No alcohol",
    type: "boolean",
    target: 1,
    baseAdherence: 0.8,
    performanceMean: 1,
    performanceStdDev: 0,
    weekendFactor: 0.4,
  },
  {
    name: "Journaled",
    type: "boolean",
    target: 1,
    baseAdherence: 0.55,
    performanceMean: 1,
    performanceStdDev: 0,
    weekendFactor: 1.2,
  },
  {
    name: "Screen time under limit",
    type: "boolean",
    target: 1,
    baseAdherence: 0.5,
    performanceMean: 1,
    performanceStdDev: 0,
    weekendFactor: 0.7,
  },
];

// Box-Muller transform for Gaussian noise around the target.
function gaussianNoise(mean: number, stdDev: number): number {
  const u1 = Math.max(Math.random(), 1e-9);
  const u2 = Math.random();
  const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
  return mean + z * stdDev;
}

function isoDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

export const seedDemo = internalMutation({
  args: {
    userId: v.id("users"),
    days: v.optional(v.number()),
  },
  handler: async (ctx, { userId, days = 21 }) => {
    // Step 1: create the habits
    const habitIds: Record<string, Id<"habits">> = {};
    for (const t of HABIT_TEMPLATES) {
      const id = await ctx.db.insert("habits", {
        userId,
        name: t.name,
        type: t.type,
        target: t.target,
        unit: t.unit,
      });
      habitIds[t.name] = id;
    }

    // Step 2: generate logs day by day, habit by habit
    let logsCreated = 0;
    const today = new Date();

    for (let dayOffset = days - 1; dayOffset >= 0; dayOffset--) {
      const d = new Date(today);
      d.setUTCDate(today.getUTCDate() - dayOffset);
      const dateStr = isoDate(d);
      const isWeekend = d.getUTCDay() === 0 || d.getUTCDay() === 6;

      for (const t of HABIT_TEMPLATES) {
        // Adjust adherence for weekends
        let adherence = t.baseAdherence;
        if (isWeekend) adherence *= t.weekendFactor;

        // Simulate a "rough patch" days 11–14 ago (adherence drops to 40%)
        if (dayOffset >= 11 && dayOffset <= 14) adherence *= 0.4;

        // Roll the dice: did they log this habit today?
        if (Math.random() > adherence) continue;

        // Generate the value
        let value: number;
        if (t.type === "boolean") {
          value = 1;
        } else {
          const multiplier = Math.max(
            0.1,
            gaussianNoise(t.performanceMean, t.performanceStdDev),
          );
          value = Math.round(t.target * multiplier);
          // For hours, allow half-hour precision
          if (t.type === "duration" && t.unit === "hours") {
            value = Math.round(t.target * multiplier * 2) / 2;
          }
        }

        await ctx.db.insert("logs", {
          userId,
          habitId: habitIds[t.name],
          date: dateStr,
          value,
        });
        logsCreated++;
      }
    }

    return {
      habitsCreated: HABIT_TEMPLATES.length,
      logsCreated,
      daysSimulated: days,
    };
  },
});