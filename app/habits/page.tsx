"use client";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { HabitListItem } from "../components/HabitListItem";
import { NewHabitForm } from "../components/NewHabitForm";
import { EmptyState } from "../components/EmptyState";
import { Skeleton } from "@/components/ui/skeleton";
import { ListChecks } from "lucide-react";

export default function HabitsPage() {
  const habits = useQuery(api.habits.listHabits);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Habits</h1>
        <p className="mt-1 text-sm text-fg-muted">
          Define the habits you&apos;re tracking.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-[1fr_320px]">
        <div className="space-y-3">
          {habits === undefined ? (
            <>
              <Skeleton className="h-16" />
              <Skeleton className="h-16" />
            </>
          ) : habits.length === 0 ? (
            <EmptyState
              icon={ListChecks}
              title="No habits yet"
              description="Add your first habit to start tracking."
            />
          ) : (
            habits.map((h) => <HabitListItem key={h._id} habit={h} />)
          )}
        </div>
        <NewHabitForm />
      </div>
    </div>
  );
}
