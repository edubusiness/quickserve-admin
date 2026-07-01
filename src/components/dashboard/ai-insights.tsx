"use client";

import { Sparkles } from "lucide-react";
import { Card } from "@/components/ui/card";
import { aiInsights } from "@/data/dashboard";

export function AiInsights() {
  return (
    <Card className="relative p-4">
      <div
        className="pointer-events-none absolute inset-0 opacity-60"
        style={{
          background:
            "radial-gradient(20rem 12rem at 90% 0%, color-mix(in srgb, var(--accent) 18%, transparent), transparent 60%)",
        }}
      />
      <div className="relative flex items-center justify-between">
        <h3 className="flex items-center gap-2 text-sm font-semibold text-card-foreground">
          <Sparkles className="h-4 w-4 text-[var(--accent)]" />
          AI Insights
        </h3>
        <button className="text-xs font-medium text-[var(--accent)] hover:underline">
          View All
        </button>
      </div>
      <ul className="relative mt-4 space-y-3">
        {aiInsights.map((it) => {
          const Icon = it.icon;
          return (
            <li key={it.id} className="flex items-start gap-3">
              <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-[var(--primary)]/15 text-[var(--accent)]">
                <Icon className="h-4 w-4" />
              </div>
              <div>
                <p className="text-sm font-medium text-card-foreground">{it.title}</p>
                <p className="text-xs text-muted-foreground">{it.detail}</p>
              </div>
            </li>
          );
        })}
      </ul>
    </Card>
  );
}
