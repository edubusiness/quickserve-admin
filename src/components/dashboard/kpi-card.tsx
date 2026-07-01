"use client";

import { motion } from "framer-motion";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Sparkline } from "@/components/charts/sparkline";
import { AnimatedCounter } from "@/components/ui/animated-counter";
import { toneChip } from "@/lib/tones";
import { cn } from "@/lib/utils";
import type { KpiStat } from "@/types";

export function KpiCard({ stat, index = 0 }: { stat: KpiStat; index?: number }) {
  const Icon = stat.icon;
  const up = stat.trend === "up";

  return (
    <Card
      hover
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.06 }}
      className="group p-5"
    >
      <div className="flex items-start justify-between">
        <div className={cn("grid h-11 w-11 place-items-center rounded-xl", toneChip[stat.tone])}>
          <Icon className="h-5 w-5" />
        </div>
        <span
          className={cn(
            "inline-flex items-center gap-0.5 rounded-full px-2 py-1 text-xs font-semibold",
            up ? "bg-emerald-500/15 text-emerald-400" : "bg-rose-500/15 text-rose-400",
          )}
        >
          {up ? <ArrowUpRight className="h-3.5 w-3.5" /> : <ArrowDownRight className="h-3.5 w-3.5" />}
          {stat.delta}%
        </span>
      </div>

      <p className="mt-4 text-sm text-muted-foreground">{stat.label}</p>
      <p className="mt-1 text-2xl font-bold tracking-tight text-card-foreground">
        <AnimatedCounter value={stat.value} display={stat.display} />
      </p>
      <p className="mt-1 text-[11px] text-muted-foreground">{stat.caption}</p>

      <div className="mt-3 -mx-1">
        <Sparkline data={stat.spark} tone={stat.tone} />
      </div>
    </Card>
  );
}
