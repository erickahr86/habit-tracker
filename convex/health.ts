import { v } from "convex/values";
import { query } from "./_generated/server";

export const ping = query({
  args: {},
  returns: v.object({ status: v.literal("ok"), time: v.number() }),
  handler: async () => {
    return { status: "ok" as const, time: Date.now() };
  },
});
