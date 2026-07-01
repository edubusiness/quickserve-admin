"use client";

import { useMemo } from "react";
import dynamic from "next/dynamic";
import { Calendar, SlidersHorizontal, TrendingUp } from "lucide-react";
import { Card, CardHeader } from "@/components/ui/card";
import { KpiCard } from "@/components/dashboard/kpi-card";
import { useDashboardStats } from "@/hooks/use-resources";
import { formatCurrency, formatNumber } from "@/lib/utils";
import { ActivityFeed } from "@/components/dashboard/activity-feed";
import { TopServices } from "@/components/dashboard/top-services";
import { BookingsByCity } from "@/components/dashboard/bookings-by-city";
import { RecentBookings } from "@/components/dashboard/recent-bookings";
import { QuickActions } from "@/components/dashboard/quick-actions";
import { AiInsights } from "@/components/dashboard/ai-insights";
import { SosPanel } from "@/components/dashboard/sos-panel";
import { TodaySummary } from "@/components/dashboard/today-summary";
import { ProfileCard } from "@/components/dashboard/profile-card";
import { kpis } from "@/data/dashboard";

// Lazy-load chart-heavy widgets to trim the initial bundle (code splitting).
const LiveMap = dynamic(
  () => import("@/components/dashboard/live-map").then((m) => m.LiveMap),
  { loading: () => <div className="skeleton h-[420px] rounded-[1.25rem]" />, ssr: false },
);
const RevenueChart = dynamic(
  () => import("@/components/charts/revenue-chart").then((m) => m.RevenueChart),
  { loading: () => <div className="skeleton h-[280px] rounded-xl" />, ssr: false },
);

/** Maps live dashboard stats onto the KPI card definitions (keeping sparklines). */
const statField: Record<string, string> = {
  revenue: "revenue",
  bookings: "activeBookings",
  providers: "providersOnline",
  drivers: "driversOnline",
  delivered: "ordersDelivered",
};

export default function DashboardPage() {
  const { data: stats } = useDashboardStats();

  const liveKpis = useMemo(
    () =>
      kpis.map((k) => {
        const value = stats?.[statField[k.id]];
        if (value == null) return k;
        return {
          ...k,
          value,
          display: k.id === "revenue" ? formatCurrency(value) : formatNumber(value),
        };
      }),
    [stats],
  );

  return (
    <div className="mx-auto max-w-[1800px] space-y-5">
      {/* Page toolbar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-card-foreground">
            Dashboard Overview
          </h1>
          <p className="text-sm text-muted-foreground">
            Welcome back — here's what's happening across QuickServe today.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-2 rounded-xl border border-border bg-card/60 px-3.5 py-2 text-sm text-card-foreground transition-colors hover:bg-[var(--primary)]/10">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            May 28, 2025
          </button>
          <button className="flex items-center gap-2 rounded-xl border border-border bg-card/60 px-3.5 py-2 text-sm text-card-foreground transition-colors hover:bg-[var(--primary)]/10">
            <SlidersHorizontal className="h-4 w-4 text-muted-foreground" />
            Filters
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-12">
        {/* Main column */}
        <div className="space-y-5 xl:col-span-9">
          {/* KPI row */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-5">
            {liveKpis.map((stat, i) => (
              <KpiCard key={stat.id} stat={stat} index={i} />
            ))}
          </div>

          {/* Live map */}
          <LiveMap />

          {/* Revenue analytics */}
          <Card className="p-5">
            <CardHeader
              title="Revenue Analytics"
              action={
                <div className="flex items-center gap-2 text-xs">
                  <span className="flex items-center gap-1.5 text-emerald-400">
                    <TrendingUp className="h-3.5 w-3.5" /> +18.6%
                  </span>
                  <div className="flex rounded-lg border border-border p-0.5">
                    {["Daily", "Weekly", "Monthly", "Yearly"].map((p, i) => (
                      <button
                        key={p}
                        className={
                          "rounded-md px-2.5 py-1 text-[11px] font-medium transition-colors " +
                          (i === 1
                            ? "bg-[var(--primary)] text-primary-foreground"
                            : "text-muted-foreground hover:text-card-foreground")
                        }
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </div>
              }
            />
            <div className="mt-4">
              <RevenueChart />
            </div>
          </Card>

          {/* Three-up insights */}
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
            <TopServices />
            <BookingsByCity />
            <RecentBookings />
          </div>

          {/* Quick actions */}
          <QuickActions />
        </div>

        {/* Right rail */}
        <div className="space-y-5 xl:col-span-3">
          <ProfileCard />
          <TodaySummary />
          <AiInsights />
          <SosPanel />
          <ActivityFeed />
        </div>
      </div>
    </div>
  );
}
