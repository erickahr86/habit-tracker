"use client";
import { useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import { HabitRow } from "./components/HabitRow";
import { WeeklySummary } from "./components/WeeklySummary";
import { StatCard } from "./components/StatCard";
import { Skeleton } from "@/components/ui/skeleton";
import { getISOWeek } from "@/lib/date";

export default function Home() {
  return <Dashboard />;
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-5 w-28" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Skeleton className="h-20" />
        <Skeleton className="h-20" />
        <Skeleton className="h-20" />
      </div>
      <Skeleton className="h-20" />
      <div className="space-y-3">
        <Skeleton className="h-16" />
        <Skeleton className="h-16" />
      </div>
    </div>
  );
}

function Dashboard() {
  const today = new Date().toISOString().slice(0, 10);
  const habits = useQuery(api.habits.listHabits);
  const logs = useQuery(api.logs.todayLogs, { date: today });
  const stats = useQuery(api.habits.dashboardStats);

  if (!habits || !logs) return <DashboardSkeleton />;

  const week = getISOWeek(new Date());

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <div className="font-mono text-sm text-fg-muted">
          {today} · W{String(week).padStart(2, "0")}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          label="Longest streak"
          value={stats ? String(stats.longestStreak) : "…"}
          unit="days"
        />
        <StatCard
          label="Habits today"
          value={stats ? `${stats.hitToday}/${stats.totalHabits}` : "…"}
        />
        <StatCard
          label="Week completion"
          value={stats ? `${stats.weekCompletion}%` : "…"}
        />
      </div>

      <WeeklySummary />

      <div>
        <div className="text-xs font-mono uppercase text-fg-muted mb-2">Today</div>
        <div className="space-y-3">
          {habits.map((h) => (
            <HabitRow key={h._id} habit={h} today={today} logs={logs} />
          ))}
        </div>
      </div>
    </div>
  );
}
