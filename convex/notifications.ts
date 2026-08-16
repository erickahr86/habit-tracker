import { internalAction } from "./_generated/server";
import { v } from "convex/values";

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