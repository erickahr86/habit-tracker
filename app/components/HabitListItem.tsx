"use client";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Doc } from "@/convex/_generated/dataModel";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export function HabitListItem({ habit }: { habit: Doc<"habits"> }) {
  const deleteHabit = useMutation(api.habits.deleteHabit);
  const [open, setOpen] = useState(false);

  return (
    <div className="bg-surface border border-border rounded-lg p-4 flex items-center justify-between gap-4">
      <div className="min-w-0">
        <div className="font-medium">{habit.name}</div>
        <div className="mt-1 flex items-center gap-2 text-sm text-fg-muted">
          <Badge variant="outline" className="capitalize">
            {habit.type}
          </Badge>
          <span className="font-mono">
            {habit.target} {habit.unit ?? ""}
          </span>
        </div>
      </div>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button variant="ghost" size="icon-sm">
            <Trash2 className="size-4" />
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete &ldquo;{habit.name}&rdquo;?</DialogTitle>
            <DialogDescription>
              This permanently deletes the habit and all of its logged
              history. This can&apos;t be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button
              variant="destructive"
              onClick={async () => {
                await deleteHabit({ habitId: habit._id });
                toast.success(`Deleted "${habit.name}"`);
                setOpen(false);
              }}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
