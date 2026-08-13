"use client";

import { Component, ReactNode } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

function HealthCheck() {
  const health = useQuery(api.health.ping);

  if (health === undefined) {
    return <p className="text-2xl text-zinc-400 font-mono">Checking...</p>;
  }

  return <p className="text-2xl text-green-500 font-mono">200 OK</p>;
}

class HealthErrorBoundary extends Component<
  { children: ReactNode },
  { hasError: boolean }
> {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return <p className="text-2xl text-red-500 font-mono">500 Error</p>;
    }
    return this.props.children;
  }
}

export default function HealthStatus() {
  return (
    <HealthErrorBoundary>
      <HealthCheck />
    </HealthErrorBoundary>
  );
}
