"use client";
import { useAuthActions } from "@convex-dev/auth/react";
import { Authenticated, Unauthenticated, useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import { HabitRow } from "./HabitRow";

export default function Home() {
  return (
    <>
      <Unauthenticated>
        <SignIn />
      </Unauthenticated>
      <Authenticated>
        <Dashboard />
      </Authenticated>
    </>
  );
}

function SignIn() {
  const { signIn } = useAuthActions();
  return (
    <main className="p-8">
      <h1 className="text-2xl mb-4">Streaks</h1>
      <button
        className="border px-4 py-2 rounded"
        onClick={() => signIn("github")}
      >
        Sign in with GitHub
      </button>
    </main>
  );
}

function Dashboard() {
  const { signOut } = useAuthActions();
  const today = new Date().toISOString().slice(0, 10);
  const habits = useQuery(api.habits.listHabits);
  const logs = useQuery(api.logs.todayLogs, { date: today });

  if (!habits || !logs) return <div className="p-8">Loading...</div>;

  return (
    <main className="p-8 max-w-xl mx-auto space-y-4">
      <h1 className="text-2xl font-bold">Today — {today}</h1>
      {habits.map((h) => (
        <HabitRow key={h._id} habit={h} today={today} logs={logs} />
      ))}

      <button onClick={() => signOut()} className="text-sm text-gray-500">
        Sign out
      </button>
    </main>
  );
}
