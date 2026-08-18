"use client";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Copy, Check, CheckCircle2, Circle } from "lucide-react";
import { toast } from "sonner";

export function BuddySection() {
  const buddy = useQuery(api.buddies.myBuddy);
  const buddyHabits = useQuery(api.buddies.buddyHabitsWithStreaks);
  const createInvite = useMutation(api.buddies.createInvite);
  const redeemInvite = useMutation(api.buddies.redeemInvite);
  const [code, setCode] = useState("");
  const [myCode, setMyCode] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [redeemError, setRedeemError] = useState<string | null>(null);

  const prevBuddy = useRef<typeof buddy>(undefined);
  useEffect(() => {
    if (prevBuddy.current === null && buddy) {
      toast.success(`Paired with ${buddy.name ?? buddy.email}!`);
    }
    prevBuddy.current = buddy;
  }, [buddy]);

  if (buddy === undefined) {
    return (
      <div className="grid gap-4 sm:grid-cols-2">
        <Skeleton className="h-32" />
        <Skeleton className="h-32" />
      </div>
    );
  }

  if (!buddy) {
    return (
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="bg-surface border border-border rounded-lg p-6 space-y-3">
          <div className="font-medium">Generate an invite</div>
          {myCode ? (
            <div className="flex items-center gap-2">
              <div className="font-mono text-2xl text-lime">{myCode}</div>
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={async () => {
                  await navigator.clipboard.writeText(myCode);
                  setCopied(true);
                  toast.success("Code copied");
                  setTimeout(() => setCopied(false), 1500);
                }}
              >
                {copied ? (
                  <Check className="size-4 text-lime" />
                ) : (
                  <Copy className="size-4" />
                )}
              </Button>
            </div>
          ) : (
            <Button onClick={async () => setMyCode(await createInvite())}>
              Generate invite code
            </Button>
          )}
        </div>

        <div className="bg-surface border border-border rounded-lg p-6 space-y-3">
          <div className="font-medium">Redeem a code</div>
          <div className="flex gap-2">
            <Input
              placeholder="Enter code"
              value={code}
              onChange={(e) => setCode(e.target.value)}
            />
            <Button
              onClick={async () => {
                setRedeemError(null);
                try {
                  await redeemInvite({ code });
                  setCode("");
                } catch (err) {
                  setRedeemError(
                    err instanceof Error ? err.message : "Failed to redeem code",
                  );
                }
              }}
            >
              Redeem
            </Button>
          </div>
          {redeemError && (
            <div className="text-sm text-flame">{redeemError}</div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-surface border border-border rounded-lg p-6">
      <div className="font-medium">Paired with {buddy.name ?? buddy.email}</div>
      <div className="mt-4 space-y-2">
        {buddyHabits?.map((h: { hitToday: boolean; name: string }, i: number) => (
          <div
            key={i}
            className="flex items-center justify-between border border-border rounded-md px-3 py-2"
          >
            <span>{h.name}</span>
            {h.hitToday ? (
              <CheckCircle2 className="size-4 text-lime" />
            ) : (
              <Circle className="size-4 text-fg-muted" />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
