"use client";

import { useState } from "react";
import {
  Settings,
  Bell,
  ShieldCheck,
  Globe,
  CreditCard,
  Palette,
  ChevronRight,
} from "lucide-react";
import Link from "next/link";
import { Card, CardHeader } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { PageHeader } from "@/components/ui/page-header";
import { ApiKeysSection } from "@/components/settings/api-keys-section";
import { PaymentGatewaysSection } from "@/components/settings/payment-gateways-section";
import { MapsSection } from "@/components/settings/maps-section";

interface ToggleSetting {
  key: string;
  label: string;
  desc: string;
  value: boolean;
}

const initialSettings: ToggleSetting[] = [
  { key: "newBooking", label: "New booking alerts", desc: "Notify admins when a booking is created.", value: true },
  { key: "sos", label: "Emergency / SOS alerts", desc: "Instant push for high-priority requests.", value: true },
  { key: "payouts", label: "Payout notifications", desc: "Alert on provider settlements & refunds.", value: true },
  { key: "marketing", label: "Marketing digests", desc: "Weekly campaign performance summaries.", value: false },
  { key: "twoFa", label: "Two-factor authentication", desc: "Require 2FA for all admin logins.", value: true },
  { key: "sessionLock", label: "Auto session lock", desc: "Lock the console after 15 min idle.", value: false },
];

const links = [
  { label: "Appearance & Theme", desc: "Colors, dark/light mode", icon: Palette, href: "/settings/appearance" },
  { label: "Roles & Permissions", desc: "Team access control", icon: ShieldCheck, href: "/roles" },
  { label: "Localization", desc: "Language, currency, timezone", icon: Globe, href: "/locations" },
  { label: "Billing & Plans", desc: "Subscription & invoices", icon: CreditCard, href: "/invoices" },
];

export default function SettingsPage() {
  const [settings, setSettings] = useState(initialSettings);
  const [form, setForm] = useState({
    platform: "QuickServe",
    email: "admin@quickserve.io",
    currency: "INR (₹)",
    timezone: "Asia/Kolkata (GMT+5:30)",
  });

  const toggle = (key: string) =>
    setSettings((s) => s.map((x) => (x.key === key ? { ...x, value: !x.value } : x)));

  const notifications = settings.slice(0, 4);
  const security = settings.slice(4);

  return (
    <div className="mx-auto max-w-5xl space-y-5">
      <PageHeader
        title="System Settings"
        subtitle="Configure platform preferences, notifications and security."
      />

      {/* General */}
      <Card className="p-5">
        <CardHeader title="General" />
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
          {(
            [
              { key: "platform", label: "Platform Name" },
              { key: "email", label: "Admin Email" },
              { key: "currency", label: "Default Currency" },
              { key: "timezone", label: "Timezone" },
            ] as const
          ).map((f) => (
            <div key={f.key}>
              <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                {f.label}
              </label>
              <input
                value={form[f.key]}
                onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
                className="h-10 w-full rounded-xl border border-border bg-muted/40 px-3.5 text-sm text-card-foreground focus:border-[var(--primary)]/40 focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/20"
              />
            </div>
          ))}
        </div>
      </Card>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        {/* Notifications */}
        <Card className="p-5">
          <CardHeader
            title="Notifications"
            action={<Bell className="h-4 w-4 text-muted-foreground" />}
          />
          <ul className="mt-4 divide-y divide-border">
            {notifications.map((s) => (
              <li key={s.key} className="flex items-center justify-between gap-4 py-3">
                <div>
                  <p className="text-sm font-medium text-card-foreground">{s.label}</p>
                  <p className="text-xs text-muted-foreground">{s.desc}</p>
                </div>
                <Switch checked={s.value} onChange={() => toggle(s.key)} label={s.label} />
              </li>
            ))}
          </ul>
        </Card>

        {/* Security */}
        <Card className="p-5">
          <CardHeader
            title="Security"
            action={<ShieldCheck className="h-4 w-4 text-muted-foreground" />}
          />
          <ul className="mt-4 divide-y divide-border">
            {security.map((s) => (
              <li key={s.key} className="flex items-center justify-between gap-4 py-3">
                <div>
                  <p className="text-sm font-medium text-card-foreground">{s.label}</p>
                  <p className="text-xs text-muted-foreground">{s.desc}</p>
                </div>
                <Switch checked={s.value} onChange={() => toggle(s.key)} label={s.label} />
              </li>
            ))}
          </ul>
        </Card>
      </div>

      {/* API Keys (CRUD) */}
      <ApiKeysSection />

      {/* Payment Gateways (CRUD) */}
      <PaymentGatewaysSection />

      {/* Maps & Location providers */}
      <MapsSection />

      {/* Quick links */}
      <Card className="p-5">
        <CardHeader title="More Settings" />
        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
          {links.map((l) => {
            const Icon = l.icon;
            return (
              <Link
                key={l.label}
                href={l.href}
                className="group flex items-center gap-3 rounded-xl border border-border p-3 transition-colors hover:border-[var(--primary)]/40 hover:bg-[var(--primary)]/5"
              >
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-[var(--primary)]/15 text-[var(--accent)]">
                  <Icon className="h-5 w-5" />
                </span>
                <div className="flex-1">
                  <p className="text-sm font-medium text-card-foreground">{l.label}</p>
                  <p className="text-xs text-muted-foreground">{l.desc}</p>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
              </Link>
            );
          })}
        </div>
      </Card>

      {/* Save bar */}
      <div className="flex items-center justify-end gap-3">
        <button className="rounded-xl border border-border px-4 py-2.5 text-sm text-muted-foreground transition-colors hover:text-card-foreground">
          Cancel
        </button>
        <button className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[var(--accent)] to-[var(--primary)] px-5 py-2.5 text-sm font-medium text-white shadow-lg shadow-[var(--primary)]/30 transition-transform hover:-translate-y-0.5">
          <Settings className="h-4 w-4" />
          Save Changes
        </button>
      </div>
    </div>
  );
}
