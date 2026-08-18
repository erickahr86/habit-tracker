"use client";
import { useAuthActions } from "@convex-dev/auth/react";

export function SignIn() {
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
