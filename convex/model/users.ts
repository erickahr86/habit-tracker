import { QueryCtx, MutationCtx } from "../_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

export async function requireCurrentUserId(
  ctx: QueryCtx | MutationCtx,
) {
  const userId = await getAuthUserId(ctx);
  if (!userId) throw new Error("Not authenticated");
  return userId;
}