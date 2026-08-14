"use client";
import { useQuery, useMutation } from "convex/react";
import { api } from "../convex/_generated/api";

export default function Home() {
  const now = new Date();
  const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(
    now.getDate(),
  ).padStart(2, "0")}`; // local "2026-08-13", not UTC
  const habits = useQuery(api.habits.listHabits);
  const logs = useQuery(api.logs.todayLogs, { date: today });
  const logHabit = useMutation(api.logs.logHabit);

  if (!habits || !logs) return <div className="p-8">Loading...</div>;

  const valueFor = (habitId: string) =>
    logs.find((l) => l.habitId === habitId)?.value ?? 0;

  return (
    <main className="p-8 max-w-xl mx-auto space-y-4">
      <h1 className="text-2xl font-bold">Today — {today}</h1>
      {habits.map((h) => {
        const current = valueFor(h._id);
        const hit = current >= h.target;
        return (
          <div key={h._id} className="border p-4 rounded flex items-center justify-between">
            <div>
              <div className="font-semibold">{h.name} {hit && "✅"}</div>
              <div className="text-sm text-gray-500">
                {current} / {h.target} {h.unit ?? ""}
              </div>
            </div>
            <input
              type="number"
              className="border px-2 py-1 w-24"
              defaultValue={current}
              onBlur={(e) =>
                logHabit({
                  habitId: h._id,
                  date: today,
                  value: Number(e.target.value),
                })
              }
            />
          </div>
        );
      })}
    </main>
  );
}
