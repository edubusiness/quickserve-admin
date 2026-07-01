"use client";

import { Card } from "@/components/ui/card";
import { AnimatedCounter } from "@/components/ui/animated-counter";
import { toneChip, type Tone } from "@/lib/tones";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

export interface StatCard {
  label: string;
  value: number;
  display?: string;
  tone: Tone;
  icon?: LucideIcon;
}

export function StatCards({ stats }: { stats: StatCard[] }) {
  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {stats.map((s) => {
        const Icon = s.icon;
        return (
          <Card key={s.label} className="p-4" hover>
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">{s.label}</p>
              {Icon ? (
                <span className={cn("grid h-8 w-8 place-items-center rounded-lg", toneChip[s.tone])}>
                  <Icon className="h-4 w-4" />
                </span>
              ) : (
                <span className={cn("h-2.5 w-2.5 rounded-full", toneChip[s.tone])} />
              )}
            </div>
            <p className="mt-2 text-2xl font-bold text-card-foreground">
              <AnimatedCounter value={s.value} display={s.display ?? String(s.value)} />
            </p>
          </Card>
        );
      })}
    </div>
  );
}
