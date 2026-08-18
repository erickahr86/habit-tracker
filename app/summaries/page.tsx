"use client";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { EmptyState } from "../components/EmptyState";
import { Skeleton } from "@/components/ui/skeleton";
import { Sparkles } from "lucide-react";

export default function SummariesPage() {
  const summaries = useQuery(api.summaries.listAllSummaries);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Weekly summaries</h1>
        <p className="mt-1 text-sm text-fg-muted">
          Your AI coach&apos;s reflections.
        </p>
      </div>

      {summaries === undefined ? (
        <div className="space-y-4">
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
        </div>
      ) : summaries.length === 0 ? (
        <EmptyState
          icon={Sparkles}
          title="No summaries yet"
          description="Your first weekly summary will appear here after Sunday."
        />
      ) : (
        <div className="space-y-4">
          {summaries.map((s, i) => (
            <div
              key={s._id}
              className={`bg-surface border border-border rounded-lg p-6 ${
                i === 0 ? "border-l-4 border-l-buddy" : ""
              }`}
            >
              <div className="text-xs font-mono uppercase text-fg-muted">
                Week of {s.weekStart}
              </div>
              <p className="mt-2 text-sm leading-relaxed">{s.text}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
