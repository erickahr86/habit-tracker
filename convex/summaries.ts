import { internalAction, internalMutation, query, internalQuery } from "./_generated/server";
import { internal } from "./_generated/api";
import { v } from "convex/values";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { requireCurrentUserId } from "./model/users";

export const saveSummary = internalMutation({
  args: {
    userId: v.id("users"),
    weekStart: v.string(),
    text: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("summaries", args);
  },
});

export const generateWeeklyForUser = internalAction({
  args: { userId: v.id("users") },
  handler: async (ctx, { userId }) => {
    // Compute the Monday of the current week
    const now = new Date();
    const day = now.getUTCDay();
    const diff = day === 0 ? 6 : day - 1;
    const monday = new Date(now);
    monday.setUTCDate(now.getUTCDate() - diff);
    const weekStart = monday.toISOString().slice(0, 10);

    // Fetch this user's habits + last 7 days of logs via a query
    const data = await ctx.runQuery(internal.summaries.weekDataForUser, {
      userId,
      weekStart,
    });

    const prompt = `You are a supportive habit coach. Given this user's habits and last 7 days of logs, write ONE short paragraph (max 4 sentences) with a specific, encouraging insight. Focus on patterns (which days they struggle, which habits are improving). Do not use bullet points.

Data:
${JSON.stringify(data, null, 2)}`;

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
    const model = genAI.getGenerativeModel({ model: "gemini-3.5-flash" });
    const result = await model.generateContent(prompt);
    const text = result.response.text();

    await ctx.runMutation(internal.summaries.saveSummary, {
      userId,
      weekStart,
      text,
    });
  },
});

export const weekDataForUser = internalQuery({
  args: { userId: v.id("users"), weekStart: v.string() },
  handler: async (ctx, { userId, weekStart }) => {
    const habits = await ctx.db
      .query("habits")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    // Compute the 7 dates of the week
    const dates: string[] = [];
    const start = new Date(weekStart + "T00:00:00Z");
    for (let i = 0; i < 7; i++) {
      const d = new Date(start);
      d.setUTCDate(start.getUTCDate() + i);
      dates.push(d.toISOString().slice(0, 10));
    }

    const logsByHabit: Record<string, { date: string; value: number }[]> = {};
    for (const h of habits) {
      const logs = await ctx.db
        .query("logs")
        .withIndex("by_habit_and_date", (q) => q.eq("habitId", h._id))
        .filter((q) =>
          q.and(
            q.gte(q.field("date"), dates[0]),
            q.lte(q.field("date"), dates[6]),
          ),
        )
        .collect();
      logsByHabit[h.name] = logs.map((l) => ({ date: l.date, value: l.value }));
    }

    return { habits: habits.map(h => ({ name: h.name, target: h.target, unit: h.unit })), logsByHabit };
  },
});

export const latestSummary = query({
  args: {},
  handler: async (ctx) => {
    const userId = await requireCurrentUserId(ctx);
    return await ctx.db
      .query("summaries")
      .withIndex("by_user_and_week", (q) => q.eq("userId", userId))
      .order("desc")
      .first();
  },
});

export const generateWeeklyForAllUsers = internalAction({
  args: {},
  handler: async (ctx) => {
    const users = await ctx.runQuery(internal.summaries.allUserIds, {});
    for (const userId of users) {
      await ctx.runAction(internal.summaries.generateWeeklyForUser, { userId });
    }
  },
});

export const allUserIds = internalQuery({
  args: {},
  handler: async (ctx) => {
    const users = await ctx.db.query("users").collect();
    return users.map((u) => u._id);
  },
});