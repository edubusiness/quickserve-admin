"use client";

import { Card } from "@/components/ui/card";
import { profileStats } from "@/data/dashboard";

export function ProfileCard() {
  const stats = [
    { label: "Cities", value: profileStats.cities },
    { label: "Providers", value: profileStats.providers },
    { label: "Customers", value: profileStats.customers },
  ];
  return (
    <Card className="relative overflow-hidden p-5 text-center">
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-28"
        style={{
          background:
            "radial-gradient(16rem 8rem at 50% 0%, color-mix(in srgb, var(--primary) 35%, transparent), transparent 70%)",
        }}
      />
      <div className="relative">
        <div className="mx-auto grid h-24 w-24 place-items-center rounded-full bg-gradient-to-br from-[var(--accent)] to-[var(--primary)] p-1">
          <img
            src="https://i.pravatar.cc/160?img=68"
            alt="Super Admin"
            className="h-full w-full rounded-full border-2 border-card object-cover"
          />
        </div>
        <h3 className="mt-3 text-lg font-bold text-card-foreground">Super Admin</h3>
        <p className="text-xs text-muted-foreground">Platform Owner</p>

        <div className="mt-5 grid grid-cols-3 divide-x divide-border rounded-2xl border border-border bg-muted/30 py-3">
          {stats.map((s) => (
            <div key={s.label}>
              <p className="text-base font-bold text-card-foreground">{s.value}</p>
              <p className="text-[11px] text-muted-foreground">{s.label}</p>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}
