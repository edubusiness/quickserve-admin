"use client";

import dynamic from "next/dynamic";
import { ArrowUpRight, ArrowDownRight, Download } from "lucide-react";
import { Card, CardHeader } from "@/components/ui/card";
import { AnimatedCounter } from "@/components/ui/animated-counter";
import { analyticsKpis } from "@/data/analytics";
import { toneChip } from "@/lib/tones";
import { cn } from "@/lib/utils";

const skeleton = (h: number) => () =>
  <div className="skeleton rounded-xl" style={{ height: h }} />;

const RevenueBarChart = dynamic(() => import("@/components/charts/analytics-charts").then((m) => m.RevenueBarChart), { ssr: false, loading: skeleton(300) });
const OrdersAreaChart = dynamic(() => import("@/components/charts/analytics-charts").then((m) => m.OrdersAreaChart), { ssr: false, loading: skeleton(260) });
const GrowthLineChart = dynamic(() => import("@/components/charts/analytics-charts").then((m) => m.GrowthLineChart), { ssr: false, loading: skeleton(260) });
const CancellationChart = dynamic(() => import("@/components/charts/analytics-charts").then((m) => m.CancellationChart), { ssr: false, loading: skeleton(260) });
const CategoryDonut = dynamic(() => import("@/components/charts/analytics-charts").then((m) => m.CategoryDonut), { ssr: false, loading: skeleton(260) });

const ranges = ["Daily", "Weekly", "Monthly", "Yearly"];

export default function AnalyticsPage() {
  return (
    <div className="mx-auto max-w-[1600px] space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-card-foreground">
            Analytics
          </h1>
          <p className="text-sm text-muted-foreground">
            Revenue, orders, growth and performance across the platform.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex rounded-xl border border-border p-0.5">
            {ranges.map((r, i) => (
              <button
                key={r}
                className={cn(
                  "rounded-lg px-3 py-1.5 text-xs font-medium transition-colors",
                  i === 2
                    ? "bg-[var(--primary)] text-primary-foreground"
                    : "text-muted-foreground hover:text-card-foreground",
                )}
              >
                {r}
              </button>
            ))}
          </div>
          <button className="inline-flex items-center gap-2 rounded-xl border border-border bg-card/60 px-3.5 py-2 text-sm text-card-foreground transition-colors hover:bg-[var(--primary)]/10">
            <Download className="h-4 w-4 text-muted-foreground" />
            Export
          </button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {analyticsKpis.map((k) => {
          const up = k.delta >= 0;
          return (
            <Card key={k.label} className="p-4" hover>
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">{k.label}</p>
                <span
                  className={cn(
                    "inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-xs font-semibold",
                    up ? "bg-emerald-500/15 text-emerald-400" : "bg-rose-500/15 text-rose-400",
                  )}
                >
                  {up ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                  {Math.abs(k.delta)}%
                </span>
              </div>
              <p className="mt-2 text-2xl font-bold text-card-foreground">
                <AnimatedCounter value={k.value} display={k.display} />
              </p>
              <div className={cn("mt-2 h-1 w-12 rounded-full", toneChip[k.tone])} />
            </Card>
          );
        })}
      </div>

      {/* Revenue + category */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <Card className="p-5 lg:col-span-2">
          <CardHeader title="Revenue Overview" />
          <div className="mt-4">
            <RevenueBarChart />
          </div>
        </Card>
        <Card className="p-5">
          <CardHeader title="Revenue by Category" />
          <div className="mt-4">
            <CategoryDonut />
          </div>
        </Card>
      </div>

      {/* Orders + growth */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <Card className="p-5">
          <CardHeader title="Orders Trend" />
          <div className="mt-4">
            <OrdersAreaChart />
          </div>
        </Card>
        <Card className="p-5">
          <CardHeader title="Customer & Provider Growth" />
          <div className="mt-4">
            <GrowthLineChart />
          </div>
        </Card>
      </div>

      {/* Cancellation */}
      <Card className="p-5">
        <CardHeader title="Cancellation Rate" />
        <div className="mt-4">
          <CancellationChart />
        </div>
      </Card>
    </div>
  );
}
