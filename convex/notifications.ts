import { internalAction } from "./_generated/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";

export const sendDiscordNudge = internalAction({
  args: { message: v.string() },
  handler: async (_ctx, { message }) => {
    const url = process.env.DISCORD_WEBHOOK_URL;
    if (!url) {
      console.error("DISCORD_WEBHOOK_URL not set");
      return;
    }

    await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: message }),
    });
  },
});

export const checkAndNudge = internalAction({
  args: {},
  handler: async (ctx) => {
    const hourUTC = new Date().getUTCHours();
    // Nudge at 9pm UTC. Later you'd store each user's timezone.
    if (hourUTC !== 21) return;

    const missing = await ctx.runQuery(
      internal.habits.usersWithoutLogsToday,
      {},
    );

    for (const name of missing) {
      await ctx.runAction(internal.notifications.sendDiscordNudge, {
        message: `Hey ${name}, you haven't logged your habits today. 🔥`,
      });
    }
  },
});