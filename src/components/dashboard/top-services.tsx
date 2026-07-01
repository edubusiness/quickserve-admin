"use client";

import { ArrowUpRight } from "lucide-react";
import { Card, CardHeader } from "@/components/ui/card";
import { topServices } from "@/data/dashboard";
import { formatNumber } from "@/lib/utils";

export function TopServices() {
  return (
    <Card className="p-4">
      <CardHeader
        title="Top Services"
        action={
          <button className="text-xs font-medium text-[var(--accent)] hover:underline">
            View All
          </button>
        }
      />
      <ul className="mt-4 space-y-1.5">
        {topServices.map((s) => {
          const Icon = s.icon;
          return (
            <li
              key={s.name}
              className="flex items-center gap-3 rounded-xl p-2 transition-colors hover:bg-muted/50"
            >
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-[var(--accent)] to-[var(--primary)] text-white">
                <Icon className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-card-foreground">{s.name}</p>
                <p className="text-xs text-muted-foreground">
                  {formatNumber(s.bookings)} Bookings
                </p>
              </div>
              <span className="inline-flex items-center gap-0.5 text-xs font-semibold text-emerald-400">
                <ArrowUpRight className="h-3.5 w-3.5" />
                {s.delta}%
              </span>
            </li>
          );
        })}
      </ul>
    </Card>
  );
}
