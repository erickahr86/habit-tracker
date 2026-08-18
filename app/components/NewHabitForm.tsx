"use client";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export function NewHabitForm() {
  const createHabit = useMutation(api.habits.createHabit);
  const [name, setName] = useState("");
  const [type, setType] = useState<"numeric" | "boolean" | "duration">("numeric");
  const [target, setTarget] = useState(1);
  const [unit, setUnit] = useState("");

  return (
    <Card>
      <CardHeader>
        <CardTitle>New habit</CardTitle>
      </CardHeader>
      <CardContent>
        <form
          className="space-y-3"
          onSubmit={async (e) => {
            e.preventDefault();
            if (!name) return;
            await createHabit({
              name,
              type,
              target,
              unit: unit || undefined,
            });
            toast.success(`Added "${name}"`);
            setName("");
            setUnit("");
            setTarget(1);
          }}
        >
          <div className="space-y-1.5">
            <Label htmlFor="habit-name">Name</Label>
            <Input
              id="habit-name"
              placeholder="e.g. Steps"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="habit-type">Type</Label>
            <Select value={type} onValueChange={(v) => setType(v as typeof type)}>
              <SelectTrigger id="habit-type" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="numeric">Numeric</SelectItem>
                <SelectItem value="duration">Duration</SelectItem>
                <SelectItem value="boolean">Boolean</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex gap-2">
            <div className="flex-1 space-y-1.5">
              <Label htmlFor="habit-target">Target</Label>
              <Input
                id="habit-target"
                type="number"
                value={target}
                onChange={(e) => setTarget(Number(e.target.value))}
              />
            </div>
            <div className="flex-1 space-y-1.5">
              <Label htmlFor="habit-unit">Unit</Label>
              <Input
                id="habit-unit"
                placeholder="optional"
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
              />
            </div>
          </div>
          <Button type="submit" className="w-full">
            Add habit
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
