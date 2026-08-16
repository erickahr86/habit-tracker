import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { requireCurrentUserId } from "./model/users";
import { Id } from "./_generated/dataModel";

function randomCode() {
    return Math.random().toString(36).slice(2, 8).toUpperCase();
}

export const createInvite = mutation({
    args: {},
    handler: async (ctx) => {
        const userId = await requireCurrentUserId(ctx);
        const code = randomCode();
        await ctx.db.insert("invites", { code, createdBy: userId });
        return code;
    },
});

export const redeemInvite = mutation({
    args: { code: v.string() },
    handler: async (ctx, { code }) => {
        const userId = await requireCurrentUserId(ctx);
        const invite = await ctx.db
            .query("invites")
            .withIndex("by_code", (q) => q.eq("code", code))
            .unique();
        if (!invite) throw new Error("Invalid code");
        if (invite.usedBy) throw new Error("Code already used");
        if (invite.createdBy === userId) throw new Error("Can't pair with yourself");

        await ctx.db.patch(invite._id, { usedBy: userId });
        await ctx.db.insert("buddyPairs", {
            userA: invite.createdBy,
            userB: userId,
        });
    },
});

export const myBuddy = query({
    args: {},
    handler: async (ctx) => {
        const userId = await requireCurrentUserId(ctx);
        const asA = await ctx.db
            .query("buddyPairs")
            .withIndex("by_userA", (q) => q.eq("userA", userId))
            .first();
        if (asA) return await ctx.db.get(asA.userB);

        const asB = await ctx.db
            .query("buddyPairs")
            .withIndex("by_userB", (q) => q.eq("userB", userId))
            .first();
        if (asB) return await ctx.db.get(asB.userA);

        return null;
    },
});

export const buddyHabitsWithStreaks = query({
    args: {},
    handler: async (ctx) => {
        const userId = await requireCurrentUserId(ctx);
        // reuse myBuddy logic inline (or extract into a helper)
        const pair =
            (await ctx.db
                .query("buddyPairs")
                .withIndex("by_userA", (q) => q.eq("userA", userId))
                .first()) ??
            (await ctx.db
                .query("buddyPairs")
                .withIndex("by_userB", (q) => q.eq("userB", userId))
                .first());
        if (!pair) return [];
        const buddyId = pair.userA === userId ? pair.userB : pair.userA;

        const habits = await ctx.db
            .query("habits")
            .withIndex("by_user", (q) => q.eq("userId", buddyId))
            .collect();

        // For each habit, whether today is hit — buddy sees status, not raw values.
        const today = new Date().toISOString().slice(0, 10);
        return await Promise.all(
            habits.map(async (h) => {
                const log = await ctx.db
                    .query("logs")
                    .withIndex("by_habit_and_date", (q) =>
                        q.eq("habitId", h._id).eq("date", today),
                    )
                    .unique();
                return {
                    name: h.name,
                    hitToday: log ? log.value >= h.target : false,
                };
            }),
        );
    },
});