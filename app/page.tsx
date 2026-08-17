"use client";
import { useAuthActions } from "@convex-dev/auth/react";
import { Authenticated, Unauthenticated, useQuery, useMutation } from "convex/react";
import { api } from "../convex/_generated/api";
import { HabitRow } from "./HabitRow";
import { useState } from "react";


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
      <WeeklySummary />

      <h1 className="text-2xl font-bold">Today — {today}</h1>
      {habits.map((h) => (
        <HabitRow key={h._id} habit={h} today={today} logs={logs} />
      ))}

      <BuddySection />

      <button onClick={() => signOut()} className="text-sm text-gray-500">
        Sign out
      </button>
    </main>
  );
}

function BuddySection() {
  const buddy = useQuery(api.buddies.myBuddy);
  const buddyHabits = useQuery(api.buddies.buddyHabitsWithStreaks);
  const createInvite = useMutation(api.buddies.createInvite);
  const redeemInvite = useMutation(api.buddies.redeemInvite);
  const [code, setCode] = useState("");
  const [myCode, setMyCode] = useState<string | null>(null);

  if (buddy === undefined) return null;

  if (!buddy) {
    return (
      <div className="border p-4 rounded space-y-2">
        <div className="font-semibold">No buddy yet</div>
        <button
          className="border px-3 py-1 rounded"
          onClick={async () => setMyCode(await createInvite())}
        >
          Generate invite code
        </button>
        {myCode && <div>Share this code: <code>{myCode}</code></div>}
        <div className="pt-2 border-t">
          <input
            className="border px-2 py-1"
            placeholder="Enter code"
            value={code}
            onChange={(e) => setCode(e.target.value)}
          />
          <button
            className="border px-3 py-1 rounded ml-2"
            onClick={() => redeemInvite({ code })}
          >
            Redeem
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="border p-4 rounded">
      <div className="font-semibold">Buddy: {buddy.name ?? buddy.email}</div>
      <ul className="mt-2 text-sm">
        {buddyHabits?.map((h: { hitToday: boolean; name: string }, i: number) => (
          <li key={i}>
            {h.hitToday ? "✅" : "⬜"} {h.name}
          </li>
        ))}
      </ul>
    </div>
  );
}

function WeeklySummary() {
  const summary = useQuery(api.summaries.latestSummary);
  if (!summary) return null;

  return (
    <div className="border border-blue-200 bg-blue-50 p-4 rounded">
      <div className="text-sm font-semibold text-blue-900">
        Weekly coach — week of {summary.weekStart}
      </div>
      <p className="text-sm text-blue-900 mt-1">{summary.text}</p>
    </div>
  );
}