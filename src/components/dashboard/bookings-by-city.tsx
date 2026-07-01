"use client";

import { motion } from "framer-motion";
import { Card, CardHeader } from "@/components/ui/card";
import { cityStats } from "@/data/dashboard";
import { formatNumber } from "@/lib/utils";

export function BookingsByCity() {
  return (
    <Card className="p-4">
      <CardHeader
        title="Bookings by City"
        action={
          <button className="text-xs font-medium text-[var(--accent)] hover:underline">
            View All
          </button>
        }
      />
      <ul className="mt-4 space-y-3.5">
        {cityStats.map((c, i) => (
          <li key={c.city}>
            <div className="mb-1.5 flex items-center justify-between text-sm">
              <span className="font-medium text-card-foreground">{c.city}</span>
              <span className="flex items-center gap-2">
                <span className="text-muted-foreground">{formatNumber(c.bookings)}</span>
                <span className="text-xs font-semibold text-emerald-400">+{c.delta}%</span>
              </span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-muted">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-[var(--accent)] to-[var(--primary)]"
                initial={{ width: 0 }}
                animate={{ width: `${c.share * 100}%` }}
                transition={{ duration: 0.9, delay: i * 0.1, ease: "easeOut" }}
              />
            </div>
          </li>
        ))}
      </ul>
    </Card>
  );
}
