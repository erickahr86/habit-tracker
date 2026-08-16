"use client";
import { useQuery, useMutation } from "convex/react";
import { api } from "../convex/_generated/api";
import { HabitRow } from "./HabitRow";

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
      {habits.map((h) => (
        <HabitRow key={h._id} habit={h} today={today} logs={logs} />
      ))}
    </main>
  );
}
