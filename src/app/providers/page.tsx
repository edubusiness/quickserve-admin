"use client";

import { useEffect, useState } from "react";
import {
  Briefcase,
  CheckCircle2,
  Clock,
  Star,
  BadgeCheck,
  ShieldCheck,
  Ban,
  Pencil,
  Trash2,
} from "lucide-react";
import { Badge, type BadgeTone } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { DataTable, type Column } from "@/components/ui/data-table";
import { PageHeader } from "@/components/ui/page-header";
import { StatCards } from "@/components/ui/stat-cards";
import { type Provider } from "@/data/people";
import { useProviders, usePaginatedResource } from "@/hooks/use-resources";
import { useResourceMutations } from "@/hooks/use-mutations";
import {
  ProviderFormModal,
  type ProviderFormValues,
} from "@/components/providers/provider-form-modal";
import { TableSkeleton, ErrorState } from "@/components/ui/table-skeleton";
import { useToast } from "@/components/ui/toast";
import { formatCurrency } from "@/lib/utils";

const statusTone: Record<Provider["status"], BadgeTone> = {
  active: "success",
  inactive: "warning",
  blocked: "danger",
  pending: "info",
};

function Rating({ value }: { value: number }) {
  return (
    <span className="inline-flex items-center gap-1 font-medium text-card-foreground">
      <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
      {value.toFixed(1)}
    </span>
  );
}

export default function ProvidersPage() {
  const [params, setParams] = useState<Record<string, string>>({});
  const { data: providers = [] } = useProviders();
  const paged = usePaginatedResource<Provider>("providers", "/api/providers", params);
  const rows = paged.data?.items ?? [];
  const { create, update, remove, bulk } = useResourceMutations<Provider>("providers", "/api/providers");
  const { toast } = useToast();

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Provider | null>(null);
  const openCreate = () => { setEditing(null); setModalOpen(true); };
  const openEdit = (p: Provider) => { setEditing(p); setModalOpen(true); };

  // Auto-open the add form when arriving from a Quick Action (?new=1).
  useEffect(() => {
    if (new URLSearchParams(window.location.search).get("new") === "1") {
      openCreate();
      window.history.replaceState({}, "", window.location.pathname);
    }
     
  }, []);

  const submitForm = (values: ProviderFormValues) => {
    if (editing) {
      update.mutate(
        { id: editing.id, body: values },
        {
          onSuccess: () => { setModalOpen(false); toast({ title: "Provider updated", description: `${values.name} saved.` }); },
          onError: () => toast({ title: "Update failed", variant: "error" }),
        },
      );
    } else {
      create.mutate(
        { ...values, avatar: `https://i.pravatar.cc/80?img=${Math.floor(Math.random() * 70) + 1}`, joined: new Date().toISOString() },
        {
          onSuccess: () => { setModalOpen(false); toast({ title: "Provider created", description: `${values.name} onboarded.` }); },
          onError: () => toast({ title: "Create failed", variant: "error" }),
        },
      );
    }
  };

  const removeProvider = (p: Provider) =>
    remove.mutate(p.id, {
      onSuccess: () => toast({ title: "Provider deleted", description: `${p.name} removed.` }),
      onError: () => toast({ title: "Delete failed", variant: "error" }),
    });

  const runBulk = (
    ids: string[],
    payload: { action: "delete" | "update"; patch?: Record<string, unknown> },
    label: string,
  ) =>
    bulk.mutate(
      { ids, ...payload },
      {
        onSuccess: () => toast({ title: label, description: `${ids.length} provider(s) updated.` }),
        onError: () => toast({ title: "Action failed", variant: "error" }),
      },
    );

  const columns: Column<Provider>[] = [
    {
      key: "name",
      header: "Provider",
      sortable: true,
      render: (p) => (
        <div className="flex items-center gap-2.5">
          <img src={p.avatar} alt="" className="h-9 w-9 rounded-full object-cover" />
          <div>
            <p className="flex items-center gap-1 font-medium text-card-foreground">
              {p.name}
              {p.verified && <BadgeCheck className="h-4 w-4 text-[var(--accent)]" />}
            </p>
            <p className="text-xs text-muted-foreground">{p.category}</p>
          </div>
        </div>
      ),
    },
    { key: "city", header: "City", sortable: true },
    { key: "jobs", header: "Jobs", sortable: true, align: "right" },
    {
      key: "rating",
      header: "Rating",
      sortable: true,
      render: (p) => <Rating value={p.rating} />,
    },
    {
      key: "earnings",
      header: "Earnings",
      sortable: true,
      align: "right",
      render: (p) => (
        <span className="font-medium text-card-foreground">{formatCurrency(p.earnings)}</span>
      ),
    },
    {
      key: "status",
      header: "Status",
      sortable: true,
      render: (p) => (
        <Badge tone={statusTone[p.status]} className="capitalize">
          {p.status}
        </Badge>
      ),
    },
    {
      key: "__actions",
      header: "",
      exportable: false,
      render: (p) => (
        <div className="flex justify-end gap-1">
          <button
            onClick={() => openEdit(p)}
            aria-label={`Edit ${p.name}`}
            className="grid h-8 w-8 place-items-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-card-foreground"
          >
            <Pencil className="h-4 w-4" />
          </button>
          <button
            onClick={() => removeProvider(p)}
            aria-label={`Delete ${p.name}`}
            className="grid h-8 w-8 place-items-center rounded-lg text-muted-foreground transition-colors hover:bg-rose-500/10 hover:text-rose-400"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      ),
    },
  ];

  const verified = providers.filter((p) => p.verified).length;
  const pending = providers.filter((p) => p.status === "pending").length;
  const earnings = providers.reduce((a, p) => a + p.earnings, 0);

  return (
    <div className="mx-auto max-w-[1600px] space-y-5">
      <PageHeader
        title="Service Providers"
        subtitle="Onboard, verify and monitor service partners across all categories."
        actionLabel="Add Provider"
        onAction={openCreate}
      />

      <StatCards
        stats={[
          { label: "Total Providers", value: providers.length, tone: "primary", icon: Briefcase },
          { label: "Verified", value: verified, tone: "success", icon: BadgeCheck },
          { label: "Pending Approval", value: pending, tone: "warning", icon: Clock },
          {
            label: "Total Earnings",
            value: earnings,
            display: formatCurrency(earnings, true),
            tone: "accent",
          },
        ]}
      />

      {paged.isError ? (
        <ErrorState message="Couldn't load providers." onRetry={() => paged.refetch()} />
      ) : paged.isLoading ? (
        <TableSkeleton />
      ) : (
      <DataTable
        data={rows}
        columns={columns}
        getRowId={(p) => p.id}
        serverMode
        totalCount={paged.data?.total ?? 0}
        loading={paged.isFetching}
        onServerQueryChange={setParams}
        pageSize={10}
        searchKeys={["id", "name", "category", "city"]}
        filterFields={[
          { key: "status", label: "Status", type: "select", options: ["active", "inactive", "blocked", "pending"] },
          { key: "category", label: "Category", type: "select", options: ["Cleaning", "Repairs", "Beauty", "Automotive", "Appliances", "Plumbing"] },
          { key: "city", label: "City", type: "select", options: ["Bangalore", "Mumbai", "Delhi", "Hyderabad", "Chennai", "Pune"] },
          { key: "verified", label: "Verified", type: "select", options: ["true", "false"] },
          { key: "rating", label: "Rating", type: "numberRange" },
          { key: "earnings", label: "Earnings (₹)", type: "numberRange" },
          { key: "jobs", label: "Jobs", type: "numberRange" },
        ]}
        searchPlaceholder="Search providers, categories..."
        exportName="providers"
        bulkActions={[
          { label: "Approve", icon: CheckCircle2, onClick: (ids) => runBulk(ids, { action: "update", patch: { status: "active" } }, "Providers approved") },
          { label: "Verify", icon: ShieldCheck, onClick: (ids) => runBulk(ids, { action: "update", patch: { verified: true } }, "Providers verified") },
          { label: "Suspend", icon: Ban, tone: "danger", onClick: (ids) => runBulk(ids, { action: "update", patch: { status: "blocked" } }, "Providers suspended") },
        ]}
        renderCard={(p) => (
          <Card className="p-3.5">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2.5">
                <img src={p.avatar} alt="" className="h-9 w-9 rounded-full object-cover" />
                <div>
                  <p className="flex items-center gap-1 text-sm font-medium text-card-foreground">
                    {p.name}
                    {p.verified && <BadgeCheck className="h-4 w-4 text-[var(--accent)]" />}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {p.category} · {p.city}
                  </p>
                </div>
              </div>
              <Badge tone={statusTone[p.status]} className="capitalize">
                {p.status}
              </Badge>
            </div>
            <div className="mt-3 flex items-center justify-between text-xs">
              <span className="flex items-center gap-3 text-muted-foreground">
                <Rating value={p.rating} />
                <span>{p.jobs} jobs</span>
              </span>
              <span className="font-medium text-card-foreground">
                {formatCurrency(p.earnings)}
              </span>
            </div>
          </Card>
        )}
      />
      )}

      <ProviderFormModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        initial={editing}
        onSubmit={submitForm}
        pending={create.isPending || update.isPending}
      />
    </div>
  );
}
