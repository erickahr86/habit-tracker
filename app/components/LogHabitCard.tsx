"use client";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Doc } from "@/convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Minus, Plus } from "lucide-react";
import { useState } from "react";

function stepFor(habit: Doc<"habits">) {
  if (habit.type === "duration") return 0.5;
  if (habit.target >= 1000) return 100;
  if (habit.target >= 10) return 1;
  return 0.5;
}

export function LogHabitCard({
  habit,
  today,
  value,
}: {
  habit: Doc<"habits">;
  today: string;
  value: number;
}) {
  const logHabit = useMutation(api.logs.logHabit);
  const [current, setCurrent] = useState(value);
  const [saved, setSaved] = useState(false);

  const save = async (next: number) => {
    setCurrent(next);
    await logHabit({ habitId: habit._id, date: today, value: next });
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  };

  const step = stepFor(habit);

  return (
    <div className="bg-surface border border-border rounded-lg p-6">
      <div className="flex items-center justify-between">
        <div className="text-lg font-medium">{habit.name}</div>
        <span
          className={`text-xs font-mono text-lime transition-opacity ${
            saved ? "opacity-100" : "opacity-0"
          }`}
        >
          Saved
        </span>
      </div>
      <div className="mt-1 font-mono text-sm text-fg-muted">
        {current} / {habit.target} {habit.unit ?? ""}
      </div>

      {habit.type === "boolean" ? (
        <Button
          className="mt-4 w-full"
          variant={current >= habit.target ? "default" : "outline"}
          onClick={() => save(current >= habit.target ? 0 : 1)}
        >
          {current >= habit.target ? "Done ✓" : "Mark done"}
        </Button>
      ) : (
        <div className="mt-4 flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => save(Math.max(0, current - step))}
          >
            <Minus className="size-4" />
          </Button>
          <Input
            type="number"
            className="text-center font-mono"
            value={current}
            onChange={(e) => setCurrent(Number(e.target.value))}
            onBlur={(e) => save(Number(e.target.value))}
          />
          <Button
            variant="outline"
            size="icon"
            onClick={() => save(current + step)}
          >
            <Plus className="size-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
