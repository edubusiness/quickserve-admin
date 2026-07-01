"use client";

import { Siren } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge, type BadgeTone } from "@/components/ui/badge";
import { sosRequests } from "@/data/dashboard";
import type { SosPriority } from "@/types";

const priorityTone: Record<SosPriority, BadgeTone> = {
  high: "danger",
  medium: "warning",
  low: "info",
};

export function SosPanel() {
  return (
    <Card className="border-rose-500/30 p-4">
      <div className="flex items-center justify-between">
        <h3 className="flex items-center gap-2 text-sm font-semibold text-card-foreground">
          <span className="relative grid h-6 w-6 place-items-center">
            <span className="absolute inset-0 animate-ping rounded-full bg-rose-500/40" />
            <Siren className="relative h-4 w-4 text-rose-400" />
          </span>
          Emergency / SOS
        </h3>
        <button className="text-xs font-medium text-rose-400 hover:underline">
          View All
        </button>
      </div>
      <ul className="mt-4 space-y-2.5">
        {sosRequests.map((s) => (
          <li
            key={s.id}
            className="flex items-center gap-3 rounded-xl border border-rose-500/15 bg-rose-500/5 p-2.5"
          >
            <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-rose-500/15 text-rose-400">
              <Siren className="h-4 w-4" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="flex items-center gap-2 text-sm font-medium text-card-foreground">
                <span className="font-mono text-[11px] text-rose-400">#{s.id}</span>
                {s.title}
              </p>
              <p className="truncate text-xs text-muted-foreground">{s.location}</p>
            </div>
            <div className="flex flex-col items-end gap-1">
              <Badge tone={priorityTone[s.priority]} className="capitalize">
                {s.priority}
              </Badge>
              <span className="text-[10px] text-muted-foreground">{s.time}</span>
            </div>
          </li>
        ))}
      </ul>
    </Card>
  );
}
