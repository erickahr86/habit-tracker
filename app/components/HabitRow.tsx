"use client";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { CheckCircle2, Flame } from "lucide-react";

export function HabitRow({
  habit,
  today,
  logs,
}: {
  habit: any; // proper type: Doc<"habits"> from convex/_generated/dataModel
  today: string;
  logs: any[];
}) {
  const logHabit = useMutation(api.logs.logHabit);
  const streak = useQuery(api.habits.currentStreak, { habitId: habit._id });
  const current = logs.find((l) => l.habitId === habit._id)?.value ?? 0;
  const hit = current >= habit.target;
  const progress = Math.min(current / habit.target, 1) * 100;

  return (
    <div className="bg-surface border border-border rounded-lg p-4 flex items-center gap-4">
      <div className="min-w-0">
        <div className="flex items-center gap-1.5 font-medium">
          {habit.name}
          {hit && <CheckCircle2 className="size-4 text-lime" />}
        </div>
        <div className="mt-1 flex items-center gap-1 font-mono text-sm text-lime">
          <Flame className="size-4" />
          {streak ?? "..."}
        </div>
      </div>
      <div className="flex-1">
        <div className="h-1 rounded-full bg-border overflow-hidden">
          <div
            className="h-full bg-lime rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="mt-1 text-xs text-fg-muted font-mono">
          {current} / {habit.target} {habit.unit ?? ""}
        </div>
      </div>
      <input
        type="number"
        className="bg-transparent border border-border rounded-md px-2 py-1 w-20 text-right font-mono focus:border-lime focus:outline-none"
        defaultValue={current}
        onBlur={(e) =>
          logHabit({
            habitId: habit._id,
            date: today,
            value: Number(e.target.value),
          })
        }
      />
    </div>
  );
}
