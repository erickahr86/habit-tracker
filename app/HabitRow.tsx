"use client";
import { useQuery, useMutation } from "convex/react";
import { api } from "../convex/_generated/api";

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

  return (
    <div className="border p-4 rounded flex items-center justify-between">
      <div>
        <div className="font-semibold">
          {habit.name} {hit && "✅"}
        </div>
        <div className="text-sm text-gray-500">
          {current} / {habit.target} {habit.unit ?? ""}
        </div>
        <div className="text-xs text-orange-600 mt-1">
          🔥 {streak ?? "..."} day streak
        </div>
      </div>
      <input
        type="number"
        className="border px-2 py-1 w-24"
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