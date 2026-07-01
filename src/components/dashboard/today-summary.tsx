"use client";

import { motion } from "framer-motion";
import { Card, CardHeader } from "@/components/ui/card";
import { todaySummary } from "@/data/dashboard";
import { toneVar, type Tone } from "@/lib/tones";

export function TodaySummary() {
  return (
    <Card className="p-4">
      <CardHeader title="Today's Summary" />
      <ul className="mt-4 space-y-3.5">
        {todaySummary.map((row, i) => (
          <li key={row.label}>
            <div className="mb-1.5 flex items-center justify-between text-sm">
              <span className="text-muted-foreground">{row.label}</span>
              <span className="font-semibold text-card-foreground">{row.value}</span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-muted">
              <motion.div
                className="h-full rounded-full"
                style={{ background: toneVar[row.tone as Tone] }}
                initial={{ width: 0 }}
                animate={{ width: `${row.pct}%` }}
                transition={{ duration: 0.8, delay: i * 0.1 }}
              />
            </div>
          </li>
        ))}
      </ul>
    </Card>
  );
}
