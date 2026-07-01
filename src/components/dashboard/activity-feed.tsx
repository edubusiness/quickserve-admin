"use client";

import { useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShoppingCart,
  CheckCircle2,
  Car,
  Wrench,
  Siren,
  type LucideIcon,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { activityFeed } from "@/data/dashboard";
import { useLiveActivity } from "@/hooks/use-live-activity";
import { toneChip, type Tone } from "@/lib/tones";
import { timeAgo, cn } from "@/lib/utils";

const toneIcon: Record<Tone, LucideIcon> = {
  primary: ShoppingCart,
  success: CheckCircle2,
  accent: Car,
  warning: Wrench,
  danger: Siren,
};

interface FeedRow {
  id: string;
  title: string;
  detail: string;
  time: string;
  icon: LucideIcon;
  tone: Tone;
  live?: boolean;
}

export function ActivityFeed() {
  const { events, connected } = useLiveActivity();

  const rows: FeedRow[] = useMemo(() => {
    const liveRows: FeedRow[] = events.map((e) => ({
      id: e.id,
      title: e.title,
      detail: e.detail,
      time: timeAgo(e.time),
      icon: toneIcon[e.tone] ?? ShoppingCart,
      tone: e.tone,
      live: true,
    }));
    const seedRows: FeedRow[] = activityFeed.map((a) => ({
      id: a.id,
      title: a.title,
      detail: a.detail,
      time: a.time,
      icon: a.icon,
      tone: a.tone,
    }));
    return [...liveRows, ...seedRows].slice(0, 8);
  }, [events]);

  return (
    <Card className="flex flex-col p-4">
      <div className="flex items-center justify-between gap-3">
        <h3 className="flex items-center gap-2 text-sm font-semibold tracking-tight text-card-foreground">
          Live Activity Feed
          <span
            className={cn(
              "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium",
              connected
                ? "bg-emerald-500/15 text-emerald-400"
                : "bg-muted-foreground/10 text-muted-foreground",
            )}
          >
            <span
              className={cn(
                "h-1.5 w-1.5 rounded-full",
                connected ? "animate-pulse bg-emerald-400" : "bg-muted-foreground/50",
              )}
            />
            {connected ? "Live" : "Offline"}
          </span>
        </h3>
        <button className="text-xs font-medium text-[var(--accent)] hover:underline">
          View All
        </button>
      </div>

      <ul className="mt-4 space-y-1">
        <AnimatePresence initial={false}>
          {rows.map((item) => {
            const Icon = item.icon;
            return (
              <motion.li
                key={item.id}
                layout
                initial={{ opacity: 0, x: -12, height: 0 }}
                animate={{ opacity: 1, x: 0, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="flex items-start gap-3 rounded-xl p-2.5 transition-colors hover:bg-muted/50"
              >
                <div className={cn("grid h-9 w-9 shrink-0 place-items-center rounded-lg", toneChip[item.tone])}>
                  <Icon className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="flex items-center gap-1.5 text-sm font-medium text-card-foreground">
                    {item.title}
                    {item.live && (
                      <span className="rounded bg-emerald-500/15 px-1 text-[9px] font-bold uppercase text-emerald-400">
                        new
                      </span>
                    )}
                  </p>
                  <p className="truncate text-xs text-muted-foreground">{item.detail}</p>
                </div>
                <span className="shrink-0 text-[11px] text-muted-foreground">{item.time}</span>
              </motion.li>
            );
          })}
        </AnimatePresence>
      </ul>
    </Card>
  );
}
