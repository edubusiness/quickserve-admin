"use client";

import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, XCircle, Trash2, Eye, Plus } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge, type BadgeTone } from "@/components/ui/badge";
import { AnimatedCounter } from "@/components/ui/animated-counter";
import { DataTable, type Column } from "@/components/ui/data-table";
import { type BookingRow } from "@/data/bookings";
import { useBookings, usePaginatedResource } from "@/hooks/use-resources";
import { useResourceMutations } from "@/hooks/use-mutations";
import {
  BookingFormModal,
  type BookingFormValues,
} from "@/components/bookings/booking-form-modal";
import { TableSkeleton, ErrorState } from "@/components/ui/table-skeleton";
import { useToast } from "@/components/ui/toast";
import { toneChip } from "@/lib/tones";
import { formatCurrency, cn } from "@/lib/utils";
import type { BookingStatus } from "@/types";

const statusTone: Record<BookingStatus, BadgeTone> = {
  ongoing: "info",
  completed: "success",
  pending: "warning",
  cancelled: "danger",
};
const paymentTone: Record<BookingRow["payment"], BadgeTone> = {
  paid: "success",
  pending: "warning",
  refunded: "danger",
};

export default function BookingsPage() {
  const [modalOpen, setModalOpen] = useState(false);
  const [params, setParams] = useState<Record<string, string>>({});
  // Full set (for stat cards) + server-driven page (for the table).
  const { data: bookings = [] } = useBookings();
  const paged = usePaginatedResource<BookingRow>("bookings", "/api/bookings", params);
  const rows = paged.data?.items ?? [];
  const { create, bulk } = useResourceMutations<BookingRow>("bookings", "/api/bookings");
  const { toast } = useToast();

  // Auto-open the New Booking form when arriving from a Quick Action (?new=1).
  useEffect(() => {
    if (new URLSearchParams(window.location.search).get("new") === "1") {
      setModalOpen(true);
      window.history.replaceState({}, "", window.location.pathname);
    }
  }, []);

  const submitBooking = (values: BookingFormValues) => {
    create.mutate(
      {
        ...values,
        avatar: `https://i.pravatar.cc/80?img=${Math.floor(Math.random() * 70) + 1}`,
        date: new Date().toISOString(),
      },
      {
        onSuccess: () => {
          setModalOpen(false);
          toast({ title: "Booking created", description: `${values.service} for ${values.customer}.` });
        },
        onError: () => toast({ title: "Create failed", description: "Could not create the booking.", variant: "error" }),
      },
    );
  };

  const runBulk = (
    ids: string[],
    payload: { action: "delete" | "update"; patch?: Record<string, unknown> },
    label: string,
  ) =>
    bulk.mutate(
      { ids, ...payload },
      {
        onSuccess: () => toast({ title: label, description: `${ids.length} booking(s) updated.` }),
        onError: () => toast({ title: "Action failed", variant: "error" }),
      },
    );

  const bookingStats = useMemo(
    () => [
      { label: "Total Bookings", value: bookings.length, tone: "primary" as const },
      { label: "Completed", value: bookings.filter((b) => b.status === "completed").length, tone: "success" as const },
      { label: "Ongoing", value: bookings.filter((b) => b.status === "ongoing").length, tone: "accent" as const },
      { label: "Cancelled", value: bookings.filter((b) => b.status === "cancelled").length, tone: "danger" as const },
    ],
    [bookings],
  );

  const columns: Column<BookingRow>[] = [
    {
      key: "id",
      header: "Booking",
      sortable: true,
      render: (r) => (
        <span className="font-mono text-xs font-medium text-[var(--accent)]">
          #{r.id}
        </span>
      ),
    },
    {
      key: "customer",
      header: "Customer",
      sortable: true,
      render: (r) => (
        <div className="flex items-center gap-2.5">
          <img src={r.avatar} alt="" className="h-8 w-8 rounded-full object-cover" />
          <div>
            <p className="font-medium text-card-foreground">{r.customer}</p>
            <p className="text-xs text-muted-foreground">{r.city}</p>
          </div>
        </div>
      ),
    },
    {
      key: "service",
      header: "Service",
      sortable: true,
      render: (r) => (
        <div>
          <p className="text-card-foreground">{r.service}</p>
          <p className="text-xs text-muted-foreground">{r.category}</p>
        </div>
      ),
    },
    { key: "provider", header: "Provider", sortable: true },
    {
      key: "amount",
      header: "Amount",
      sortable: true,
      align: "right",
      render: (r) => (
        <span className="font-medium text-card-foreground">
          {formatCurrency(r.amount)}
        </span>
      ),
    },
    {
      key: "payment",
      header: "Payment",
      sortable: true,
      render: (r) => (
        <Badge tone={paymentTone[r.payment]} className="capitalize">
          {r.payment}
        </Badge>
      ),
    },
    {
      key: "status",
      header: "Status",
      sortable: true,
      render: (r) => (
        <Badge tone={statusTone[r.status]} className="capitalize">
          {r.status}
        </Badge>
      ),
    },
    {
      key: "date",
      header: "Date",
      sortable: true,
      value: (r) => r.date,
      render: (r) => (
        <span className="whitespace-nowrap text-muted-foreground">
          {new Date(r.date).toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
          })}
        </span>
      ),
    },
    {
      key: "__actions",
      header: "",
      exportable: false,
      render: () => (
        <button className="grid h-8 w-8 place-items-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-card-foreground">
          <Eye className="h-4 w-4" />
        </button>
      ),
    },
  ];

  return (
    <div className="mx-auto max-w-[1600px] space-y-5">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-card-foreground">
            Bookings
          </h1>
          <p className="text-sm text-muted-foreground">
            Manage, track and export every booking across the platform.
          </p>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="inline-flex items-center gap-2 self-start rounded-xl bg-gradient-to-r from-[var(--accent)] to-[var(--primary)] px-4 py-2.5 text-sm font-medium text-white shadow-lg shadow-[var(--primary)]/30 transition-transform hover:-translate-y-0.5"
        >
          <Plus className="h-4 w-4" />
          New Booking
        </button>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {bookingStats.map((s) => (
          <Card key={s.label} className="p-4" hover>
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">{s.label}</p>
              <span className={cn("h-2.5 w-2.5 rounded-full", toneChip[s.tone])} />
            </div>
            <p className="mt-2 text-2xl font-bold text-card-foreground">
              <AnimatedCounter value={s.value} display={String(s.value)} />
            </p>
          </Card>
        ))}
      </div>

      {/* Table (server-driven: search / filter / sort / paginate on the API) */}
      {paged.isError ? (
        <ErrorState message="Couldn't load bookings." onRetry={() => paged.refetch()} />
      ) : paged.isLoading ? (
        <TableSkeleton />
      ) : (
      <DataTable
        data={rows}
        columns={columns}
        getRowId={(r) => r.id}
        serverMode
        totalCount={paged.data?.total ?? 0}
        loading={paged.isFetching}
        onServerQueryChange={setParams}
        pageSize={10}
        searchKeys={["id", "customer", "service", "provider", "city"]}
        searchPlaceholder="Search bookings, customers, providers..."
        exportName="bookings"
        filterFields={[
          { key: "status", label: "Status", type: "select", options: ["ongoing", "completed", "pending", "cancelled"] },
          { key: "city", label: "City", type: "select", options: ["Bangalore", "Mumbai", "Delhi", "Hyderabad", "Chennai", "Pune"] },
          { key: "category", label: "Category", type: "select", options: ["Cleaning", "Repairs", "Beauty", "Automotive", "Appliances", "Delivery"] },
          { key: "payment", label: "Payment", type: "select", options: ["paid", "pending", "refunded"] },
          { key: "provider", label: "Provider", type: "text" },
          { key: "amount", label: "Amount (₹)", type: "numberRange" },
          { key: "date", label: "Date", type: "dateRange" },
        ]}
        bulkActions={[
          {
            label: "Mark Completed",
            icon: CheckCircle2,
            onClick: (ids) => runBulk(ids, { action: "update", patch: { status: "completed" } }, "Marked completed"),
          },
          {
            label: "Cancel",
            icon: XCircle,
            onClick: (ids) => runBulk(ids, { action: "update", patch: { status: "cancelled" } }, "Bookings cancelled"),
          },
          {
            label: "Delete",
            icon: Trash2,
            tone: "danger",
            onClick: (ids) => runBulk(ids, { action: "delete" }, "Bookings deleted"),
          },
        ]}
        renderCard={(r) => (
          <Card className="p-3.5">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2.5">
                <img src={r.avatar} alt="" className="h-9 w-9 rounded-full object-cover" />
                <div>
                  <p className="text-sm font-medium text-card-foreground">{r.customer}</p>
                  <p className="font-mono text-[11px] text-[var(--accent)]">#{r.id}</p>
                </div>
              </div>
              <Badge tone={statusTone[r.status]} className="capitalize">
                {r.status}
              </Badge>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
              <div>
                <p className="text-muted-foreground">Service</p>
                <p className="text-card-foreground">{r.service}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Amount</p>
                <p className="font-medium text-card-foreground">{formatCurrency(r.amount)}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Provider</p>
                <p className="text-card-foreground">{r.provider}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Payment</p>
                <Badge tone={paymentTone[r.payment]} className="capitalize">
                  {r.payment}
                </Badge>
              </div>
            </div>
          </Card>
        )}
      />
      )}

      <BookingFormModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={submitBooking}
        pending={create.isPending}
      />
    </div>
  );
}
