"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { Card, CardHeader } from "@/components/ui/card";
import { quickActions } from "@/data/dashboard";
import { cn } from "@/lib/utils";

export function QuickActions() {
  const router = useRouter();
  return (
    <Card className="p-4">
      <CardHeader title="Quick Actions" />
      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4 xl:grid-cols-8">
        {quickActions.map((a, i) => {
          const Icon = a.icon;
          return (
            <motion.button
              key={a.label}
              onClick={() => router.push(a.href)}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.05 }}
              whileHover={{ y: -4 }}
              className="group flex flex-col items-center gap-2.5 rounded-2xl border border-border p-3 transition-colors hover:border-[var(--primary)]/40"
            >
              <span
                className={cn(
                  "grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br text-white shadow-lg transition-transform group-hover:scale-110",
                  a.gradient,
                )}
              >
                <Icon className="h-5 w-5" />
              </span>
              <span className="text-center text-[11px] font-medium leading-tight text-muted-foreground group-hover:text-card-foreground">
                {a.label}
              </span>
            </motion.button>
          );
        })}
      </div>
    </Card>
  );
}
