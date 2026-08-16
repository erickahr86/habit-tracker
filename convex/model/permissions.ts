import { MutationCtx, QueryCtx } from "../_generated/server";
import { Id } from "../_generated/dataModel";
import { requireCurrentUserId } from "./users";

export async function assertOwnsHabit(
  ctx: QueryCtx | MutationCtx,
  habitId: Id<"habits">,
) {
  const userId = await requireCurrentUserId(ctx);
  const habit = await ctx.db.get(habitId);
  if (!habit) throw new Error("Habit not found");
  if (habit.userId !== userId) throw new Error("Not your habit");
  return habit;
}