"use client";

import { useEffect, useState } from "react";
import { Car, Wifi, Star, Radio, MessageSquare, Ban, Pencil, Trash2 } from "lucide-react";
import { Badge, type BadgeTone } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { DataTable, type Column } from "@/components/ui/data-table";
import { PageHeader } from "@/components/ui/page-header";
import { StatCards } from "@/components/ui/stat-cards";
import { type Driver, type AccountStatus } from "@/data/people";
import { useDrivers, usePaginatedResource } from "@/hooks/use-resources";
import { useResourceMutations } from "@/hooks/use-mutations";
import {
  DriverFormModal,
  type DriverFormValues,
} from "@/components/drivers/driver-form-modal";
import { TableSkeleton, ErrorState } from "@/components/ui/table-skeleton";
import { useToast } from "@/components/ui/toast";

const statusTone: Record<AccountStatus, BadgeTone> = {
  active: "success",
  inactive: "warning",
  blocked: "danger",
};

function OnlineDot({ online }: { online: boolean }) {
  return (
    <span
      className={
        "inline-flex items-center gap-1.5 text-xs font-medium " +
        (online ? "text-emerald-400" : "text-muted-foreground")
      }
    >
      <span
        className={
          "h-2 w-2 rounded-full " + (online ? "bg-emerald-400" : "bg-muted-foreground/50")
        }
      />
      {online ? "Online" : "Offline"}
    </span>
  );
}

export default function DriversPage() {
  const [params, setParams] = useState<Record<string, string>>({});
  const { data: drivers = [] } = useDrivers();
  const paged = usePaginatedResource<Driver>("drivers", "/api/drivers", params);
  const rows = paged.data?.items ?? [];
  const { create, update, remove, bulk } = useResourceMutations<Driver>("drivers", "/api/drivers");
  const { toast } = useToast();

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Driver | null>(null);
  const openCreate = () => { setEditing(null); setModalOpen(true); };
  const openEdit = (d: Driver) => { setEditing(d); setModalOpen(true); };

  // Auto-open the add form when arriving from a Quick Action (?new=1).
  useEffect(() => {
    if (new URLSearchParams(window.location.search).get("new") === "1") {
      openCreate();
      window.history.replaceState({}, "", window.location.pathname);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const submitForm = (values: DriverFormValues) => {
    if (editing) {
      update.mutate(
        { id: editing.id, body: values },
        {
          onSuccess: () => { setModalOpen(false); toast({ title: "Driver updated", description: `${values.name} saved.` }); },
          onError: () => toast({ title: "Update failed", variant: "error" }),
        },
      );
    } else {
      create.mutate(
        { ...values, avatar: `https://i.pravatar.cc/80?img=${Math.floor(Math.random() * 70) + 1}`, joined: new Date().toISOString() },
        {
          onSuccess: () => { setModalOpen(false); toast({ title: "Driver created", description: `${values.name} registered.` }); },
          onError: () => toast({ title: "Create failed", variant: "error" }),
        },
      );
    }
  };

  const removeDriver = (d: Driver) =>
    remove.mutate(d.id, {
      onSuccess: () => toast({ title: "Driver deleted", description: `${d.name} removed.` }),
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
        onSuccess: () => toast({ title: label, description: `${ids.length} driver(s) updated.` }),
        onError: () => toast({ title: "Action failed", variant: "error" }),
      },
    );

  const columns: Column<Driver>[] = [
    {
      key: "name",
      header: "Driver",
      sortable: true,
      render: (d) => (
        <div className="flex items-center gap-2.5">
          <img src={d.avatar} alt="" className="h-9 w-9 rounded-full object-cover" />
          <div>
            <p className="font-medium text-card-foreground">{d.name}</p>
            <p className="font-mono text-[11px] text-[var(--accent)]">#{d.id}</p>
          </div>
        </div>
      ),
    },
    {
      key: "vehicle",
      header: "Vehicle",
      sortable: true,
      render: (d) => (
        <div>
          <p className="text-card-foreground">{d.vehicle}</p>
          <p className="font-mono text-xs text-muted-foreground">{d.vehicleNo}</p>
        </div>
      ),
    },
    { key: "city", header: "City", sortable: true },
    { key: "trips", header: "Trips", sortable: true, align: "right" },
    {
      key: "rating",
      header: "Rating",
      sortable: true,
      render: (d) => (
        <span className="inline-flex items-center gap-1 font-medium text-card-foreground">
          <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
          {d.rating.toFixed(1)}
        </span>
      ),
    },
    {
      key: "online",
      header: "Availability",
      sortable: true,
      value: (d) => (d.online ? 1 : 0),
      render: (d) => <OnlineDot online={d.online} />,
    },
    {
      key: "status",
      header: "Status",
      sortable: true,
      render: (d) => (
        <Badge tone={statusTone[d.status]} className="capitalize">
          {d.status}
        </Badge>
      ),
    },
    {
      key: "__actions",
      header: "",
      exportable: false,
      render: (d) => (
        <div className="flex justify-end gap-1">
          <button
            onClick={() => openEdit(d)}
            aria-label={`Edit ${d.name}`}
            className="grid h-8 w-8 place-items-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-card-foreground"
          >
            <Pencil className="h-4 w-4" />
          </button>
          <button
            onClick={() => removeDriver(d)}
            aria-label={`Delete ${d.name}`}
            className="grid h-8 w-8 place-items-center rounded-lg text-muted-foreground transition-colors hover:bg-rose-500/10 hover:text-rose-400"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      ),
    },
  ];

  const online = drivers.filter((d) => d.online).length;
  const avgRating =
    drivers.reduce((a, d) => a + d.rating, 0) / drivers.length;

  return (
    <div className="mx-auto max-w-[1600px] space-y-5">
      <PageHeader
        title="Drivers"
        subtitle="Track availability, performance and assignments for delivery & ride partners."
        actionLabel="Add Driver"
        onAction={openCreate}
      />

      <StatCards
        stats={[
          { label: "Total Drivers", value: drivers.length, tone: "primary", icon: Car },
          { label: "Online Now", value: online, tone: "success", icon: Wifi },
          {
            label: "Avg. Rating",
            value: avgRating,
            display: avgRating.toFixed(1),
            tone: "warning",
            icon: Star,
          },
          {
            label: "Total Trips",
            value: drivers.reduce((a, d) => a + d.trips, 0),
            tone: "accent",
            icon: Radio,
          },
        ]}
      />

      {paged.isError ? (
        <ErrorState message="Couldn't load drivers." onRetry={() => paged.refetch()} />
      ) : paged.isLoading ? (
        <TableSkeleton />
      ) : (
      <DataTable
        data={rows}
        columns={columns}
        getRowId={(d) => d.id}
        serverMode
        totalCount={paged.data?.total ?? 0}
        loading={paged.isFetching}
        onServerQueryChange={setParams}
        pageSize={10}
        searchKeys={["id", "name", "vehicle", "vehicleNo", "city"]}
        filterFields={[
          { key: "status", label: "Status", type: "select", options: ["active", "inactive", "blocked"] },
          { key: "city", label: "City", type: "select", options: ["Bangalore", "Mumbai", "Delhi", "Hyderabad", "Chennai", "Pune"] },
          { key: "vehicle", label: "Vehicle", type: "select", options: ["Bike", "Mini Truck", "Auto", "Sedan", "SUV", "Scooter"] },
          { key: "online", label: "Availability", type: "select", options: ["true", "false"] },
          { key: "rating", label: "Rating", type: "numberRange" },
          { key: "trips", label: "Trips", type: "numberRange" },
        ]}
        searchPlaceholder="Search drivers, vehicles..."
        exportName="drivers"
        bulkActions={[
          { label: "Set Online", icon: Radio, onClick: (ids) => runBulk(ids, { action: "update", patch: { online: true } }, "Drivers set online") },
          { label: "Message", icon: MessageSquare, onClick: () => toast({ title: "Message sent", description: "Drivers notified.", variant: "info" }) },
          { label: "Block", icon: Ban, tone: "danger", onClick: (ids) => runBulk(ids, { action: "update", patch: { status: "blocked" } }, "Drivers blocked") },
        ]}
        renderCard={(d) => (
          <Card className="p-3.5">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2.5">
                <img src={d.avatar} alt="" className="h-9 w-9 rounded-full object-cover" />
                <div>
                  <p className="text-sm font-medium text-card-foreground">{d.name}</p>
                  <p className="font-mono text-xs text-muted-foreground">{d.vehicleNo}</p>
                </div>
              </div>
              <OnlineDot online={d.online} />
            </div>
            <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
              <span>
                {d.vehicle} · {d.city}
              </span>
              <span className="inline-flex items-center gap-1 font-medium text-card-foreground">
                <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                {d.rating.toFixed(1)} · {d.trips} trips
              </span>
            </div>
          </Card>
        )}
      />
      )}

      <DriverFormModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        initial={editing}
        onSubmit={submitForm}
        pending={create.isPending || update.isPending}
      />
    </div>
  );
}
