"use client";

import { useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { Star, TrendingUp, Users, ShoppingCart, IndianRupee, Pencil, Trash2, Clock, Phone, Mail, MessageCircle } from "lucide-react";
import { Card, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { DataTable, type Column, type FilterField } from "@/components/ui/data-table";
import { PageHeader } from "@/components/ui/page-header";
import { StatCards } from "@/components/ui/stat-cards";
import { AnimatedCounter } from "@/components/ui/animated-counter";
import { TableSkeleton, ErrorState } from "@/components/ui/table-skeleton";
import { formatCurrency, formatNumber, cn } from "@/lib/utils";
import { toneChip } from "@/lib/tones";
import { GenericFormModal } from "@/components/modules/generic-form-modal";
import { useToast } from "@/components/ui/toast";
import { useModuleCollection, useModuleMutations } from "@/hooks/use-module-collection";
import type { ModuleConfig, ModuleColumn, TableModule, SettingsModule } from "@/data/modules";

const skel = (h: number) => {
  const Skeleton = () => <div className="skeleton rounded-xl" style={{ height: h }} />;
  Skeleton.displayName = "Skeleton";
  return Skeleton;
};
const OrdersAreaChart = dynamic(() => import("@/components/charts/analytics-charts").then((m) => m.OrdersAreaChart), { ssr: false, loading: skel(260) });
const GrowthLineChart = dynamic(() => import("@/components/charts/analytics-charts").then((m) => m.GrowthLineChart), { ssr: false, loading: skel(260) });
const CategoryDonut = dynamic(() => import("@/components/charts/analytics-charts").then((m) => m.CategoryDonut), { ssr: false, loading: skel(260) });
const RevenueBarChart = dynamic(() => import("@/components/charts/analytics-charts").then((m) => m.RevenueBarChart), { ssr: false, loading: skel(300) });
const LiveMap = dynamic(() => import("@/components/dashboard/live-map").then((m) => m.LiveMap), { ssr: false, loading: skel(420) });

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function cell(col: ModuleColumn, row: Record<string, any>) {
  const v = row[col.key];
  switch (col.type) {
    case "mono":
      return <span className="font-mono text-xs font-medium text-[var(--accent)]">{v}</span>;
    case "currency":
      return <span className="font-medium text-card-foreground">{formatCurrency(v)}</span>;
    case "number":
      return <span className="text-card-foreground">{formatNumber(v)}</span>;
    case "date":
      return (
        <span className="whitespace-nowrap text-muted-foreground">
          {new Date(v).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
        </span>
      );
    case "time":
      return (
        <span className="inline-flex items-center gap-1 whitespace-nowrap text-card-foreground">
          <Clock className="h-3.5 w-3.5 text-muted-foreground" />
          {v ? String(v) : "—"}
        </span>
      );
    case "phone":
      return v ? (
        <a
          href={`tel:${String(v).replace(/[^\d+]/g, "")}`}
          className="inline-flex items-center gap-1 whitespace-nowrap font-medium text-[var(--accent)] hover:underline"
        >
          <Phone className="h-3.5 w-3.5" />
          {String(v)}
        </a>
      ) : (
        <span className="text-muted-foreground">—</span>
      );
    case "contact":
      return <ContactActions row={row} />;
    case "badge":
      return (
        <Badge tone={col.tones?.[v] ?? "neutral"} className="capitalize">
          {String(v)}
        </Badge>
      );
    case "rating":
      return (
        <span className="inline-flex items-center gap-1 font-medium text-card-foreground">
          <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
          {Number(v).toFixed(1)}
        </span>
      );
    case "bool":
      return v ? (col.boolLabels?.[0] ?? "Yes") : (col.boolLabels?.[1] ?? "No");
    case "avatar":
      return (
        <div className="flex items-center gap-2.5">
          <img src={row.avatar} alt="" className="h-9 w-9 rounded-full object-cover" />
          <div>
            <p className="font-medium text-card-foreground">{v}</p>
            {col.sub && <p className="text-xs text-muted-foreground">{row[col.sub]}</p>}
          </div>
        </div>
      );
    default:
      return <span className="text-card-foreground">{String(v)}</span>;
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Row = Record<string, any>;

/** Quick contact actions for a ticket/record — call, email, WhatsApp the customer. */
function ContactActions({ row }: { row: Row }) {
  const rawPhone = row.phone ? String(row.phone).replace(/[^\d+]/g, "") : "";
  const waNumber = rawPhone.replace(/^\+/, "");
  const email = row.email ? String(row.email) : "";
  const subject = row.subject ? `Re: ${row.subject}` : "Your support ticket";
  const actions = [
    rawPhone && { key: "call", label: `Call ${row.name ?? "customer"}`, href: `tel:${rawPhone}`, Icon: Phone, hover: "hover:bg-sky-500/10 hover:text-sky-400" },
    email && { key: "email", label: `Email ${row.name ?? "customer"}`, href: `mailto:${email}?subject=${encodeURIComponent(subject)}`, Icon: Mail, hover: "hover:bg-violet-500/10 hover:text-violet-400" },
    waNumber && { key: "whatsapp", label: `WhatsApp ${row.name ?? "customer"}`, href: `https://wa.me/${waNumber}`, Icon: MessageCircle, hover: "hover:bg-emerald-500/10 hover:text-emerald-400" },
  ].filter(Boolean) as { key: string; label: string; href: string; Icon: typeof Phone; hover: string }[];

  if (actions.length === 0) return <span className="text-muted-foreground">—</span>;

  return (
    <div className="flex items-center justify-end gap-1">
      {actions.map(({ key, label, href, Icon, hover }) => (
        <a
          key={key}
          href={href}
          target={key === "whatsapp" ? "_blank" : undefined}
          rel={key === "whatsapp" ? "noopener noreferrer" : undefined}
          onClick={(e) => e.stopPropagation()}
          aria-label={label}
          title={label}
          className={cn(
            "grid h-8 w-8 place-items-center rounded-lg text-muted-foreground transition-colors",
            hover,
          )}
        >
          <Icon className="h-4 w-4" />
        </a>
      ))}
    </div>
  );
}

function FilterChips({ config, filter, setFilter }: { config: TableModule; filter: string; setFilter: (f: string) => void }) {
  if (!config.filters) return null;
  return (
    <div className="flex flex-wrap gap-1.5">
      {config.filters.options.map((opt) => (
        <button
          key={opt}
          onClick={() => setFilter(opt)}
          className={cn(
            "rounded-lg px-3 py-1.5 text-xs font-medium capitalize transition-colors",
            filter === opt
              ? "bg-[var(--primary)] text-primary-foreground"
              : "border border-border text-muted-foreground hover:text-card-foreground",
          )}
        >
          {opt}
        </button>
      ))}
    </div>
  );
}

function baseColumns(config: TableModule): Column<Row>[] {
  return config.columns.map((c) => ({
    key: c.key,
    header: c.header,
    sortable: c.sortable,
    align: c.align,
    value: (row) => row[c.key] as string | number,
    render: (row) => cell(c, row),
  }));
}

const distinctVals = (rows: Row[], key: string) =>
  Array.from(new Set(rows.map((r) => String(r[key])).filter(Boolean)));

/** Auto-derives field-specific filters from the module's columns. */
function moduleFilterFields(config: TableModule): FilterField<Row>[] {
  const fields: FilterField<Row>[] = [];
  const chipKey = config.filters?.key; // shown as quick chips, skip here
  for (const c of config.columns) {
    if (!c.header || c.key === "id" || c.key === chipKey) continue;
    switch (c.type) {
      case "badge":
        fields.push({ key: c.key, label: c.header, type: "select", options: distinctVals(config.rows, c.key) });
        break;
      case "currency":
      case "number":
      case "rating":
        fields.push({ key: c.key, label: c.header, type: "numberRange" });
        break;
      case "date":
        fields.push({ key: c.key, label: c.header, type: "dateRange" });
        break;
      case "bool":
        fields.push({ key: c.key, label: c.header, type: "select", options: ["true", "false"] });
        break;
      case "avatar":
      case "text":
      case "mono":
        fields.push({ key: c.key, label: c.header, type: "text" });
        break;
    }
  }
  return fields;
}

const getId = (r: Row) => String(r.id ?? r.code ?? r.key ?? JSON.stringify(r));
const applyFilter = (config: TableModule, rows: Row[], filter: string) =>
  !config.filters || filter === "all" ? rows : rows.filter((r) => String(r[config.filters!.key]) === filter);

/** Read-only modules (no actionLabel): render straight from the static config. */
function StaticTableView({ config }: { config: TableModule }) {
  const [filter, setFilter] = useState("all");
  const data = useMemo(() => applyFilter(config, config.rows, filter), [config, filter]);
  return (
    <div className="mx-auto max-w-[1600px] space-y-5">
      <PageHeader title={config.title} subtitle={config.subtitle} />
      {config.stats && <StatCards stats={config.stats.map((s) => ({ ...s }))} />}
      <DataTable
        data={data}
        columns={baseColumns(config)}
        getRowId={getId}
        searchKeys={config.searchKeys}
        searchPlaceholder={`Search ${config.title.toLowerCase()}...`}
        exportName={config.exportName}
        filterFields={moduleFilterFields(config)}
        toolbarExtra={<FilterChips config={config} filter={filter} setFilter={setFilter} />}
      />
    </div>
  );
}

/** Writable modules (has actionLabel): persist add/edit/delete via the API. */
function ApiTableView({ config, moduleKey }: { config: TableModule; moduleKey: string }) {
  const [filter, setFilter] = useState("all");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Row | null>(null);
  const { toast } = useToast();

  const { data: rows = [], isLoading, isError, refetch } = useModuleCollection(moduleKey, config.rows);
  const { create, update, remove } = useModuleMutations(moduleKey);

  const singular = (config.actionLabel ?? "Record").replace(/^(Add|Create|New)\s+/i, "").trim() || "Record";
  const data = useMemo(() => applyFilter(config, rows, filter), [config, rows, filter]);

  const openCreate = () => { setEditing(null); setModalOpen(true); };
  const openEdit = (r: Row) => { setEditing(r); setModalOpen(true); };

  // Auto-open the create form when arriving via a Quick Action (?new=1).
  // useSearchParams is reactive, so this also fires when soft-navigating
  // between two config-module routes (which don't remount this component).
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  useEffect(() => {
    if (searchParams.get("new") === "1") {
      setEditing(null);
      setModalOpen(true);
      router.replace(pathname, { scroll: false }); // strip ?new=1
    }
  }, [searchParams, pathname, router]);

  const submit = (values: Row) => {
    if (editing) {
      update.mutate({ id: getId(editing), body: values }, {
        onSuccess: () => { setModalOpen(false); toast({ title: `${singular} updated` }); },
        onError: () => toast({ title: "Update failed", variant: "error" }),
      });
    } else {
      create.mutate(values, {
        onSuccess: () => { setModalOpen(false); toast({ title: `${singular} added`, description: "Saved to the backend." }); },
        onError: () => toast({ title: "Create failed", variant: "error" }),
      });
    }
  };

  const del = (r: Row) =>
    remove.mutate(getId(r), {
      onSuccess: () => toast({ title: `${singular} deleted` }),
      onError: () => toast({ title: "Delete failed", variant: "error" }),
    });

  const columns: Column<Row>[] = [
    ...baseColumns(config),
    {
      key: "__actions",
      header: "",
      render: (r) => (
        <div className="flex justify-end gap-1">
          <button onClick={() => openEdit(r)} aria-label="Edit" className="grid h-8 w-8 place-items-center rounded-lg text-muted-foreground hover:bg-muted hover:text-card-foreground"><Pencil className="h-4 w-4" /></button>
          <button onClick={() => del(r)} aria-label="Delete" className="grid h-8 w-8 place-items-center rounded-lg text-muted-foreground hover:bg-rose-500/10 hover:text-rose-400"><Trash2 className="h-4 w-4" /></button>
        </div>
      ),
    },
  ];

  return (
    <div className="mx-auto max-w-[1600px] space-y-5">
      <PageHeader title={config.title} subtitle={config.subtitle} actionLabel={config.actionLabel} onAction={openCreate} />
      {config.stats && <StatCards stats={config.stats.map((s) => ({ ...s }))} />}
      {isError ? (
        <ErrorState message={`Couldn't load ${config.title.toLowerCase()}.`} onRetry={() => refetch()} />
      ) : isLoading ? (
        <TableSkeleton />
      ) : (
        <DataTable
          data={data}
          columns={columns}
          getRowId={getId}
          searchKeys={config.searchKeys}
          searchPlaceholder={`Search ${config.title.toLowerCase()}...`}
          exportName={config.exportName}
          filterFields={moduleFilterFields(config)}
          toolbarExtra={<FilterChips config={config} filter={filter} setFilter={setFilter} />}
        />
      )}
      <GenericFormModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? `Edit ${singular}` : (config.actionLabel ?? "Add")}
        columns={config.columns}
        rows={config.rows}
        initial={editing}
        pending={create.isPending || update.isPending}
        onSubmit={submit}
      />
    </div>
  );
}

function TableModuleView({ config, moduleKey }: { config: TableModule; moduleKey: string }) {
  return config.actionLabel ? (
    <ApiTableView config={config} moduleKey={moduleKey} />
  ) : (
    <StaticTableView config={config} />
  );
}

function AnalyticsModuleView({ title, subtitle }: { title: string; subtitle: string }) {
  const kpis = [
    { label: "Revenue", value: 5294000, display: "₹52.9L", tone: "primary" as const, icon: IndianRupee },
    { label: "Orders", value: 79100, display: "79.1K", tone: "accent" as const, icon: ShoppingCart },
    { label: "Customers", value: 41000, display: "41.0K", tone: "success" as const, icon: Users },
    { label: "Growth", value: 18.6, display: "+18.6%", tone: "warning" as const, icon: TrendingUp },
  ];
  return (
    <div className="mx-auto max-w-[1600px] space-y-5">
      <PageHeader title={title} subtitle={subtitle} />
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {kpis.map((k) => {
          const Icon = k.icon;
          return (
            <Card key={k.label} className="p-4" hover>
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">{k.label}</p>
                <span className={cn("grid h-8 w-8 place-items-center rounded-lg", toneChip[k.tone])}>
                  <Icon className="h-4 w-4" />
                </span>
              </div>
              <p className="mt-2 text-2xl font-bold text-card-foreground">
                <AnimatedCounter value={k.value} display={k.display} />
              </p>
            </Card>
          );
        })}
      </div>
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <Card className="p-5 lg:col-span-2">
          <CardHeader title="Trend Overview" />
          <div className="mt-4"><RevenueBarChart /></div>
        </Card>
        <Card className="p-5">
          <CardHeader title="Distribution" />
          <div className="mt-4"><CategoryDonut /></div>
        </Card>
      </div>
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <Card className="p-5">
          <CardHeader title="Volume" />
          <div className="mt-4"><OrdersAreaChart /></div>
        </Card>
        <Card className="p-5">
          <CardHeader title="Growth" />
          <div className="mt-4"><GrowthLineChart /></div>
        </Card>
      </div>
    </div>
  );
}

function SettingsModuleView({ config }: { config: SettingsModule }) {
  const [state, setState] = useState(() =>
    config.groups.flatMap((g) => g.items).reduce<Record<string, boolean>>((acc, it) => {
      acc[it.label] = it.on;
      return acc;
    }, {}),
  );
  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <PageHeader title={config.title} subtitle={config.subtitle} />
      {config.groups.map((g) => (
        <Card key={g.title} className="p-5">
          <CardHeader title={g.title} />
          <ul className="mt-3 divide-y divide-border">
            {g.items.map((it) => (
              <li key={it.label} className="flex items-center justify-between gap-4 py-3">
                <div>
                  <p className="text-sm font-medium text-card-foreground">{it.label}</p>
                  <p className="text-xs text-muted-foreground">{it.desc}</p>
                </div>
                <Switch
                  checked={state[it.label]}
                  onChange={(v) => setState((s) => ({ ...s, [it.label]: v }))}
                  label={it.label}
                />
              </li>
            ))}
          </ul>
        </Card>
      ))}
    </div>
  );
}

export function ModuleRenderer({ config, moduleKey }: { config: ModuleConfig; moduleKey: string }) {
  switch (config.kind) {
    case "table":
      return <TableModuleView config={config} moduleKey={moduleKey} />;
    case "analytics":
      return <AnalyticsModuleView title={config.title} subtitle={config.subtitle} />;
    case "settings":
      return <SettingsModuleView config={config} />;
    case "map":
      return (
        <div className="mx-auto max-w-[1600px] space-y-5">
          <PageHeader title={config.title} subtitle={config.subtitle} />
          <LiveMap />
        </div>
      );
  }
}
