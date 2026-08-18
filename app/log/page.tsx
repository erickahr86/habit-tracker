"use client";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { LogHabitCard } from "../components/LogHabitCard";
import { EmptyState } from "../components/EmptyState";
import { Skeleton } from "@/components/ui/skeleton";
import { ClipboardList } from "lucide-react";

export default function LogPage() {
  const today = new Date().toISOString().slice(0, 10);
  const habits = useQuery(api.habits.listHabits);
  const logs = useQuery(api.logs.todayLogs, { date: today });

  if (!habits || !logs) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-40" />
          <Skeleton className="h-5 w-24" />
        </div>
        <div className="space-y-4">
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Log today</h1>
        <div className="font-mono text-sm text-fg-muted">{today}</div>
      </div>

      {habits.length === 0 ? (
        <EmptyState
          icon={ClipboardList}
          title="No habits to log"
          description="Add a habit on the Habits page to start logging."
        />
      ) : (
        <div className="space-y-4">
          {habits.map((h) => (
            <LogHabitCard
              key={h._id}
              habit={h}
              today={today}
              value={logs.find((l) => l.habitId === h._id)?.value ?? 0}
            />
          ))}
        </div>
      )}
    </div>
  );
}
