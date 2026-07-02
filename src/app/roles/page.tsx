"use client";

import { useEffect, useState } from "react";
import { ShieldCheck, RotateCcw, Lock } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/ui/page-header";
import { useToast } from "@/components/ui/toast";
import { useModuleCollection, useModuleMutations } from "@/hooks/use-module-collection";
import { cn } from "@/lib/utils";

const KEY = "role-permissions";

type Op = "view" | "create" | "edit" | "delete";
type Perm = Record<Op, boolean>;
type ModulePerms = Record<string, Perm>; // roleKey -> perm

const ROLES = [
  { key: "super_admin", label: "Super Admin", locked: true },
  { key: "admin", label: "Admin", locked: false },
  { key: "manager", label: "Manager", locked: false },
  { key: "agent", label: "Agent", locked: false },
  { key: "support", label: "Support", locked: false },
  { key: "customer", label: "Customer", locked: false },
];

const OPS: { key: Op; short: string; label: string }[] = [
  { key: "view", short: "V", label: "View" },
  { key: "create", short: "C", label: "Create" },
  { key: "edit", short: "E", label: "Edit" },
  { key: "delete", short: "D", label: "Delete" },
];

const MODULES = [
  { key: "dashboard", label: "Dashboard", group: "Overview" },
  { key: "bookings", label: "Bookings", group: "Operations" },
  { key: "tracking", label: "Live Tracking", group: "Operations" },
  { key: "dispatch", label: "Dispatch Center", group: "Operations" },
  { key: "emergency", label: "Emergency", group: "Operations" },
  { key: "support", label: "Support & Complaints", group: "Operations" },
  { key: "customers", label: "Customers", group: "People" },
  { key: "providers", label: "Service Providers", group: "People" },
  { key: "drivers", label: "Drivers", group: "People" },
  { key: "agent-verification", label: "Agent Verification (KYC)", group: "People" },
  { key: "services", label: "Services & Catalog", group: "Marketplace" },
  { key: "subscriptions", label: "Subscriptions", group: "Marketplace" },
  { key: "payments", label: "Payments", group: "Finance" },
  { key: "refunds", label: "Refunds", group: "Finance" },
  { key: "reports", label: "Reports", group: "Finance" },
  { key: "marketing", label: "Marketing", group: "Growth" },
  { key: "analytics", label: "Analytics", group: "Growth" },
  { key: "roles", label: "Roles & Permissions", group: "Platform" },
  { key: "settings", label: "Settings", group: "Platform" },
];

const all = (v: boolean): Perm => ({ view: v, create: v, edit: v, delete: v });

/** Sensible starting permissions per role × module. */
function defaults(role: string, mod: string): Perm {
  if (role === "super_admin") return all(true);
  if (role === "admin") return { view: true, create: true, edit: true, delete: mod !== "roles" };
  if (role === "manager") return { view: true, create: mod !== "roles" && mod !== "settings", edit: mod !== "roles" && mod !== "settings", delete: false };
  if (role === "agent") {
    const own = ["bookings", "tracking", "dispatch", "support", "services"].includes(mod);
    return { view: own || mod === "dashboard", create: mod === "bookings", edit: own, delete: false };
  }
  if (role === "support") {
    const s = ["bookings", "support", "customers", "emergency", "tracking"].includes(mod);
    return { view: s || mod === "dashboard", create: false, edit: ["support", "emergency"].includes(mod), delete: false };
  }
  if (role === "customer") {
    const c = ["bookings", "payments", "support"].includes(mod);
    return { view: c, create: mod === "bookings", edit: mod === "bookings", delete: false };
  }
  return all(false);
}

const buildDefaultRow = (m: { key: string; label: string; group: string }) => ({
  id: m.key,
  module: m.label,
  group: m.group,
  perms: Object.fromEntries(ROLES.map((r) => [r.key, defaults(r.key, m.key)])) as ModulePerms,
});

const seed = MODULES.map(buildDefaultRow);

export default function RolesPage() {
  const { data: rows = [], isLoading } = useModuleCollection(KEY, seed as unknown as Record<string, unknown>[]);
  const { update } = useModuleMutations(KEY);
  const { toast } = useToast();

  // Local matrix for instant toggles; persisted in the background.
  const [matrix, setMatrix] = useState<Record<string, ModulePerms> | null>(null);
  useEffect(() => {
    if (rows.length && !matrix) {
      const m: Record<string, ModulePerms> = {};
      for (const r of rows as unknown as { id: string; perms: ModulePerms }[]) m[r.id] = r.perms;
      setMatrix(m);
    }
  }, [rows, matrix]);

  const toggle = (modKey: string, role: string, op: Op) => {
    if (role === "super_admin" || !matrix) return; // super admin locked to full access
    const cur = matrix[modKey]?.[role] ?? all(false);
    const nextPerm = { ...cur, [op]: !cur[op] };
    const nextModule = { ...matrix[modKey], [role]: nextPerm };
    setMatrix({ ...matrix, [modKey]: nextModule });
    update.mutate({ id: modKey, body: { perms: nextModule } }, { onError: () => toast({ title: "Couldn't save permission", variant: "error" }) });
  };

  const setRoleAll = (role: string, value: boolean) => {
    if (role === "super_admin" || !matrix) return;
    const next = { ...matrix };
    for (const m of MODULES) {
      next[m.key] = { ...next[m.key], [role]: all(value) };
      update.mutate({ id: m.key, body: { perms: next[m.key] } });
    }
    setMatrix(next);
    toast({ title: value ? "Full access granted" : "Access revoked", description: ROLES.find((r) => r.key === role)?.label });
  };

  const resetDefaults = () => {
    if (!matrix) return;
    const next: Record<string, ModulePerms> = {};
    for (const m of MODULES) {
      next[m.key] = Object.fromEntries(ROLES.map((r) => [r.key, defaults(r.key, m.key)])) as ModulePerms;
      update.mutate({ id: m.key, body: { perms: next[m.key] } });
    }
    setMatrix(next);
    toast({ title: "Permissions reset to defaults" });
  };

  return (
    <div className="mx-auto max-w-[1600px] space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <PageHeader
          title="Roles & Permissions"
          subtitle="Super-admin controls what each role can do on every module — grant or revoke View, Create, Edit and Delete per menu."
        />
        <button
          onClick={resetDefaults}
          title="Reset all roles to default permissions"
          className="inline-flex shrink-0 items-center gap-2 rounded-xl border border-border px-4 py-2.5 text-sm font-medium text-card-foreground transition-colors hover:bg-muted"
        >
          <RotateCcw className="h-4 w-4" /> Reset to defaults
        </button>
      </div>

      {/* Legend — what the toggle letters mean */}
      <Card className="flex flex-wrap items-center gap-x-5 gap-y-2 p-3 text-xs">
        <span className="font-semibold text-card-foreground">What the letters mean:</span>
        {OPS.map((o) => (
          <span key={o.key} className="inline-flex items-center gap-1.5 text-muted-foreground">
            <span className="grid h-5 w-5 place-items-center rounded bg-[var(--primary)] text-[10px] font-bold text-primary-foreground">{o.short}</span>
            <span><b className="text-card-foreground">{o.short}</b> = {o.label}</span>
          </span>
        ))}
        <span className="inline-flex items-center gap-1 text-muted-foreground"><Lock className="h-3.5 w-3.5" /> Super Admin = full access (locked)</span>
      </Card>

      <Card className="overflow-hidden p-0">
        {isLoading || !matrix ? (
          <div className="space-y-2 p-4">{[0, 1, 2, 3, 4].map((i) => <div key={i} className="skeleton h-12 rounded-lg" />)}</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="sticky left-0 z-10 min-w-[200px] bg-card px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Module / Menu
                  </th>
                  {ROLES.map((role) => (
                    <th key={role.key} className="min-w-[168px] px-3 py-3 text-center">
                      <div className="flex items-center justify-center gap-1.5 text-xs font-semibold text-card-foreground">
                        {role.label}
                        {role.locked && <Badge tone="success">Full</Badge>}
                      </div>
                      {!role.locked && (
                        <div className="mt-1 flex items-center justify-center gap-1 text-[10px]">
                          <button onClick={() => setRoleAll(role.key, true)} className="rounded px-1.5 py-0.5 font-medium text-emerald-400 hover:bg-emerald-500/10">All</button>
                          <span className="text-muted-foreground/40">·</span>
                          <button onClick={() => setRoleAll(role.key, false)} className="rounded px-1.5 py-0.5 font-medium text-rose-400 hover:bg-rose-500/10">None</button>
                        </div>
                      )}
                      <div className="mt-1.5 flex items-center justify-center gap-1" aria-hidden>
                        {OPS.map((o) => (
                          <span key={o.key} title={o.label} className="grid h-4 w-7 place-items-center text-[9px] font-semibold uppercase tracking-wide text-muted-foreground/70">{o.short}</span>
                        ))}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {MODULES.map((m) => (
                  <tr key={m.key} className="border-b border-border/60 hover:bg-muted/30">
                    <td className="sticky left-0 z-10 bg-card px-4 py-3">
                      <p className="font-medium text-card-foreground">{m.label}</p>
                      <p className="text-[11px] text-muted-foreground">{m.group}</p>
                    </td>
                    {ROLES.map((role) => {
                      const perm = matrix[m.key]?.[role.key] ?? all(false);
                      return (
                        <td key={role.key} className="px-3 py-3">
                          <div className="flex items-center justify-center gap-1">
                            {OPS.map((o) => {
                              const granted = role.locked ? true : perm[o.key];
                              return (
                                <button
                                  key={o.key}
                                  onClick={() => toggle(m.key, role.key, o.key)}
                                  disabled={role.locked}
                                  aria-label={`${o.label} ${m.label} for ${role.label}`}
                                  aria-pressed={granted}
                                  className={cn(
                                    "grid h-7 w-7 place-items-center rounded-md text-[11px] font-bold transition-colors",
                                    granted
                                      ? "bg-[var(--primary)] text-primary-foreground"
                                      : "border border-border text-muted-foreground/50 hover:border-[var(--primary)]/50 hover:text-card-foreground",
                                    role.locked && "cursor-not-allowed opacity-90",
                                  )}
                                >
                                  {o.short}
                                </button>
                              );
                            })}
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
        Changes are saved automatically. Super Admin retains full access to every module and cannot be restricted.
      </p>
    </div>
  );
}
