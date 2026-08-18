"use client";
import { Authenticated, Unauthenticated } from "convex/react";
import { AppShell } from "./AppShell";
import { SignIn } from "./SignIn";

export function AuthGate({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Unauthenticated>
        <SignIn />
      </Unauthenticated>
      <Authenticated>
        <AppShell>{children}</AppShell>
      </Authenticated>
    </>
  );
}
