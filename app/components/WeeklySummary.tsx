"use client";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { getISOWeek } from "@/lib/date";

export function WeeklySummary() {
  const summary = useQuery(api.summaries.latestSummary);
  if (!summary) return null;

  const week = getISOWeek(new Date(summary.weekStart + "T00:00:00Z"));

  return (
    <div className="bg-surface border border-border border-l-4 border-l-buddy rounded-lg p-4">
      <div className="text-xs font-mono uppercase text-fg-muted">
        Weekly coach · Week {week}
      </div>
      <p className="mt-2 text-sm leading-relaxed">{summary.text}</p>
    </div>
  );
}
