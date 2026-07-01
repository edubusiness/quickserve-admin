"use client";

import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Star, ArrowUpRight, ArrowDownRight, Users2, MoreVertical, Pencil, Trash2, Search,
  Wrench, CheckCircle2, IndianRupee, Layers,
  Home, Zap, Droplets, Car, Scissors, Wind, Bug, Paintbrush, Sparkles, type LucideIcon,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/ui/page-header";
import { StatCards } from "@/components/ui/stat-cards";
import { ErrorState } from "@/components/ui/table-skeleton";
import { useToast } from "@/components/ui/toast";
import { useModuleCollection, useModuleMutations } from "@/hooks/use-module-collection";
import { ServiceFormModal, type ServiceFormValues } from "@/components/services/service-form-modal";
import { services as seedServices, serviceCategories, type Service } from "@/data/services";
import { formatCurrency, formatNumber, cn } from "@/lib/utils";

// Icons can't be persisted, so derive them from the service name / category.
const iconByName: Record<string, LucideIcon> = Object.fromEntries(
  seedServices.map((s) => [s.name, s.icon]),
);
const iconByCategory: Record<string, LucideIcon> = {
  Cleaning: Home, Repairs: Wrench, Automotive: Car, Beauty: Scissors,
  Appliances: Wind, Home: Paintbrush, Electrician: Zap, Plumbing: Droplets,
  Pest: Bug, Deep: Sparkles,
};
const iconFor = (s: { name: string; category: string }): LucideIcon =>
  iconByName[s.name] ?? iconByCategory[s.category] ?? Wrench;

// Seed payload = static services without the (non-serializable) icon.
const seedRows = seedServices.map(({ icon, ...rest }) => rest);

type Row = Omit<Service, "icon">;

export default function ServicesPage() {
  const [category, setCategory] = useState("All");
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<"all" | "active" | "inactive">("all");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Service | null>(null);
  const [menuId, setMenuId] = useState<string | null>(null);
  const { toast } = useToast();

  const { data: items = [], isLoading, isError, refetch } = useModuleCollection("services", seedRows);
  const { create, update, remove } = useModuleMutations("services");

  // Auto-open the form when arriving via the "Add Service" Quick Action (?new=1).
  useEffect(() => {
    if (new URLSearchParams(window.location.search).get("new") === "1") {
      setEditing(null);
      setModalOpen(true);
      window.history.replaceState({}, "", window.location.pathname);
    }
  }, []);

  const list = items as Row[];
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return list.filter((s) => {
      if (category !== "All" && s.category !== category) return false;
      if (status !== "all" && (status === "active") !== !!s.active) return false;
      if (q && !`${s.name} ${s.category}`.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [list, category, status, query]);

  const activeCount = list.filter((s) => s.active).length;
  const totalBookings = list.reduce((a, s) => a + (s.bookings ?? 0), 0);
  const avgPrice = list.length ? Math.round(list.reduce((a, s) => a + s.price, 0) / list.length) : 0;

  const openCreate = () => { setEditing(null); setModalOpen(true); };
  const openEdit = (s: Row) => { setEditing({ ...s, icon: iconFor(s) }); setMenuId(null); setModalOpen(true); };

  const toggleActive = (s: Row) =>
    update.mutate(
      { id: s.id, body: { active: !s.active } },
      { onError: () => toast({ title: "Update failed", variant: "error" }) },
    );

  const del = (s: Row) => {
    setMenuId(null);
    remove.mutate(s.id, {
      onSuccess: () => toast({ title: "Service deleted", description: `${s.name} removed.` }),
      onError: () => toast({ title: "Delete failed", variant: "error" }),
    });
  };

  const submit = (values: ServiceFormValues) => {
    if (editing) {
      update.mutate(
        { id: editing.id, body: values },
        {
          onSuccess: () => { setModalOpen(false); toast({ title: "Service updated", description: `${values.name} saved.` }); },
          onError: () => toast({ title: "Update failed", variant: "error" }),
        },
      );
    } else {
      create.mutate(
        { ...values, bookings: 0, rating: values.rating || 4.5, trend: 0 },
        {
          onSuccess: () => { setModalOpen(false); toast({ title: "Service added", description: `${values.name} is now in the catalog.` }); },
          onError: () => toast({ title: "Create failed", variant: "error" }),
        },
      );
    }
  };

  return (
    <div className="mx-auto max-w-[1600px] space-y-5">
      <PageHeader
        title="Services"
        subtitle="Manage the service catalog, pricing and provider coverage."
        actionLabel="Add Service"
        onAction={openCreate}
      />

      <StatCards
        stats={[
          { label: "Total Services", value: list.length, tone: "primary", icon: Layers },
          { label: "Active", value: activeCount, tone: "success", icon: CheckCircle2 },
          { label: "Total Bookings", value: totalBookings, tone: "accent", icon: Wrench },
          { label: "Avg. Price", value: avgPrice, display: formatCurrency(avgPrice), tone: "warning", icon: IndianRupee },
        ]}
      />

      {/* Search + status filter */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-xs">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search services by name or category..."
            className="h-9 w-full rounded-lg border border-border bg-muted/40 pl-9 pr-3 text-sm text-card-foreground placeholder:text-muted-foreground/70 focus:border-[var(--primary)]/40 focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/20"
          />
        </div>
        <div className="flex gap-1.5">
          {(["all", "active", "inactive"] as const).map((s) => (
            <button
              key={s}
              onClick={() => setStatus(s)}
              className={cn(
                "rounded-lg px-3 py-1.5 text-xs font-medium capitalize transition-colors",
                status === s
                  ? "bg-[var(--primary)] text-primary-foreground"
                  : "border border-border text-muted-foreground hover:text-card-foreground",
              )}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Category filter */}
      <div className="no-scrollbar flex gap-1.5 overflow-x-auto pb-1">
        {serviceCategories.map((c) => (
          <button
            key={c}
            onClick={() => setCategory(c)}
            className={cn(
              "whitespace-nowrap rounded-lg px-3.5 py-1.5 text-sm font-medium transition-colors",
              category === c
                ? "bg-[var(--primary)] text-primary-foreground"
                : "border border-border text-muted-foreground hover:text-card-foreground",
            )}
          >
            {c}
          </button>
        ))}
      </div>

      {isError ? (
        <ErrorState message="Couldn't load services." onRetry={() => refetch()} />
      ) : isLoading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => <div key={i} className="skeleton h-44 rounded-2xl" />)}
        </div>
      ) : filtered.length === 0 ? (
        <Card className="grid place-items-center gap-1 p-12 text-center">
          <p className="text-sm font-medium text-card-foreground">No services found</p>
          <p className="text-xs text-muted-foreground">Try a different search, category or status filter.</p>
        </Card>
      ) : (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filtered.map((s, i) => {
          const Icon = iconFor(s);
          const up = (s.trend ?? 0) >= 0;
          return (
            <motion.div
              key={s.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: (i % 8) * 0.05 }}
            >
              <Card className="flex h-full flex-col p-4" hover>
                <div className="flex items-start justify-between">
                  <div className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-[var(--accent)] to-[var(--primary)] text-white shadow-lg">
                    <Icon className="h-6 w-6" />
                  </div>
                  <div className="relative">
                    <button
                      onClick={() => setMenuId((m) => (m === s.id ? null : s.id))}
                      className="grid h-8 w-8 place-items-center rounded-lg text-muted-foreground hover:bg-muted"
                      aria-label="Service actions"
                    >
                      <MoreVertical className="h-4 w-4" />
                    </button>
                    <AnimatePresence>
                      {menuId === s.id && (
                        <>
                          <div className="fixed inset-0 z-40" onClick={() => setMenuId(null)} />
                          <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: -4 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: -4 }}
                            className="absolute right-0 top-9 z-50 w-36 overflow-hidden rounded-xl border border-border bg-card p-1 shadow-2xl"
                          >
                            <button
                              onClick={() => openEdit(s)}
                              className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-sm text-card-foreground hover:bg-muted"
                            >
                              <Pencil className="h-4 w-4" /> Edit
                            </button>
                            <button
                              onClick={() => del(s)}
                              className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-sm text-rose-400 hover:bg-rose-500/10"
                            >
                              <Trash2 className="h-4 w-4" /> Delete
                            </button>
                          </motion.div>
                        </>
                      )}
                    </AnimatePresence>
                  </div>
                </div>

                <div className="mt-3 flex items-center gap-2">
                  <h3 className="text-sm font-semibold text-card-foreground">{s.name}</h3>
                  <Badge tone="neutral">{s.category}</Badge>
                </div>

                <div className="mt-2 flex items-center gap-3 text-xs text-muted-foreground">
                  <span className="inline-flex items-center gap-1">
                    <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                    {Number(s.rating).toFixed(1)}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <Users2 className="h-3.5 w-3.5" /> {s.providers}
                  </span>
                  <span
                    className={cn(
                      "inline-flex items-center gap-0.5 font-medium",
                      up ? "text-emerald-400" : "text-rose-400",
                    )}
                  >
                    {up ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                    {Math.abs(s.trend ?? 0)}%
                  </span>
                </div>

                <div className="mt-auto flex items-center justify-between border-t border-border pt-3">
                  <div>
                    <p className="text-lg font-bold text-card-foreground">{formatCurrency(s.price)}</p>
                    <p className="text-[11px] text-muted-foreground">
                      {formatNumber(s.bookings ?? 0)} bookings
                    </p>
                  </div>
                  {/* Toggle switch (persisted) */}
                  <button
                    onClick={() => toggleActive(s)}
                    aria-label="Toggle active"
                    className={cn(
                      "relative h-6 w-11 rounded-full transition-colors",
                      s.active ? "bg-[var(--primary)]" : "bg-muted",
                    )}
                  >
                    <motion.span
                      layout
                      transition={{ type: "spring", stiffness: 500, damping: 30 }}
                      className={cn(
                        "absolute top-0.5 h-5 w-5 rounded-full bg-white shadow",
                        s.active ? "right-0.5" : "left-0.5",
                      )}
                    />
                  </button>
                </div>
              </Card>
            </motion.div>
          );
        })}
      </div>
      )}

      <ServiceFormModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        initial={editing}
        pending={create.isPending || update.isPending}
        onSubmit={submit}
      />
    </div>
  );
}
