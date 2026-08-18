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

      <NewHabitForm />
      
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

function NewHabitForm() {
  const createHabit = useMutation(api.habits.createHabit);
  const [name, setName] = useState("");
  const [type, setType] = useState<"numeric" | "boolean" | "duration">("numeric");
  const [target, setTarget] = useState(1);
  const [unit, setUnit] = useState("");

  return (
    <form
      className="border p-4 rounded space-y-2"
      onSubmit={async (e) => {
        e.preventDefault();
        if (!name) return;
        await createHabit({
          name,
          type,
          target,
          unit: unit || undefined,
        });
        setName("");
        setUnit("");
        setTarget(1);
      }}
    >
      <div className="font-semibold">New habit</div>
      <input
        className="border px-2 py-1 w-full"
        placeholder="Name (e.g. Steps)"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <div className="flex gap-2">
        <select
          className="border px-2 py-1"
          value={type}
          onChange={(e) => setType(e.target.value as any)}
        >
          <option value="numeric">Numeric</option>
          <option value="duration">Duration</option>
          <option value="boolean">Boolean</option>
        </select>
        <input
          type="number"
          className="border px-2 py-1 w-24"
          placeholder="Target"
          value={target}
          onChange={(e) => setTarget(Number(e.target.value))}
        />
        <input
          className="border px-2 py-1 flex-1"
          placeholder="Unit (optional)"
          value={unit}
          onChange={(e) => setUnit(e.target.value)}
        />
      </div>
      <button className="border px-3 py-1 rounded" type="submit">
        Add habit
      </button>
    </form>
  );
}