"use client";

import { Card, CardHeader } from "@/components/ui/card";
import { Badge, type BadgeTone } from "@/components/ui/badge";
import { recentBookings } from "@/data/dashboard";
import type { BookingStatus } from "@/types";

const statusTone: Record<BookingStatus, BadgeTone> = {
  ongoing: "info",
  completed: "success",
  pending: "warning",
  cancelled: "danger",
};

export function RecentBookings() {
  return (
    <Card className="p-4">
      <CardHeader
        title="Recent Bookings"
        action={
          <button className="text-xs font-medium text-[var(--accent)] hover:underline">
            View All
          </button>
        }
      />
      <ul className="mt-3 divide-y divide-border">
        {recentBookings.map((b) => (
          <li key={b.id} className="flex items-center gap-3 py-2.5">
            <img
              src={b.avatar}
              alt={b.customer}
              className="h-9 w-9 rounded-full object-cover"
            />
            <div className="min-w-0 flex-1">
              <p className="flex items-center gap-2 text-sm">
                <span className="font-mono text-[11px] text-[var(--accent)]">#{b.id}</span>
                <span className="font-medium text-card-foreground">{b.customer}</span>
              </p>
              <p className="truncate text-xs text-muted-foreground">
                {b.service} · {b.time}
              </p>
            </div>
            <Badge tone={statusTone[b.status]} className="capitalize">
              {b.status}
            </Badge>
          </li>
        ))}
      </ul>
    </Card>
  );
}
