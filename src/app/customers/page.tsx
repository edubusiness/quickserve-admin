"use client";

import { useState } from "react";
import { Users, UserCheck, UserX, Mail, Ban, Trash2, Pencil } from "lucide-react";
import { Badge, type BadgeTone } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { DataTable, type Column } from "@/components/ui/data-table";
import { PageHeader } from "@/components/ui/page-header";
import { StatCards } from "@/components/ui/stat-cards";
import { type Customer, type AccountStatus } from "@/data/people";
import { useCustomers, usePaginatedResource } from "@/hooks/use-resources";
import { useResourceMutations } from "@/hooks/use-mutations";
import {
  CustomerFormModal,
  type CustomerFormValues,
} from "@/components/customers/customer-form-modal";
import { TableSkeleton, ErrorState } from "@/components/ui/table-skeleton";
import { useToast } from "@/components/ui/toast";
import { formatCurrency } from "@/lib/utils";

const statusTone: Record<AccountStatus, BadgeTone> = {
  active: "success",
  inactive: "warning",
  blocked: "danger",
};

export default function CustomersPage() {
  const [params, setParams] = useState<Record<string, string>>({});
  const { data: customers = [] } = useCustomers();
  const paged = usePaginatedResource<Customer>("customers", "/api/customers", params);
  const rows = paged.data?.items ?? [];
  const { create, update, bulk } = useResourceMutations<Customer>("customers", "/api/customers");
  const { toast } = useToast();

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Customer | null>(null);

  const openCreate = () => {
    setEditing(null);
    setModalOpen(true);
  };
  const openEdit = (c: Customer) => {
    setEditing(c);
    setModalOpen(true);
  };

  const submitForm = (values: CustomerFormValues) => {
    if (editing) {
      update.mutate(
        { id: editing.id, body: values },
        {
          onSuccess: () => {
            setModalOpen(false);
            toast({ title: "Customer updated", description: `${values.name}'s details were saved.` });
          },
          onError: () => toast({ title: "Update failed", description: "Could not save changes.", variant: "error" }),
        },
      );
    } else {
      create.mutate(
        {
          ...values,
          avatar: `https://i.pravatar.cc/80?img=${Math.floor(Math.random() * 70) + 1}`,
          joined: new Date().toISOString(),
        },
        {
          onSuccess: () => {
            setModalOpen(false);
            toast({ title: "Customer created", description: `${values.name} was added.` });
          },
          onError: () => toast({ title: "Create failed", description: "Could not add the customer.", variant: "error" }),
        },
      );
    }
  };

  const runBulk = (
    ids: string[],
    payload: { action: "delete" | "update"; patch?: Record<string, unknown> },
    label: string,
  ) =>
    bulk.mutate(
      { ids, ...payload },
      {
        onSuccess: () => toast({ title: label, description: `${ids.length} customer(s) updated.` }),
        onError: () => toast({ title: "Action failed", variant: "error" }),
      },
    );

  const columns: Column<Customer>[] = [
    {
      key: "name",
      header: "Customer",
      sortable: true,
      render: (c) => (
        <div className="flex items-center gap-2.5">
          <img src={c.avatar} alt="" className="h-9 w-9 rounded-full object-cover" />
          <div>
            <p className="font-medium text-card-foreground">{c.name}</p>
            <p className="font-mono text-[11px] text-[var(--accent)]">#{c.id}</p>
          </div>
        </div>
      ),
    },
    {
      key: "email",
      header: "Contact",
      render: (c) => (
        <div>
          <p className="text-card-foreground">{c.email}</p>
          <p className="text-xs text-muted-foreground">{c.phone}</p>
        </div>
      ),
    },
    { key: "city", header: "City", sortable: true },
    { key: "orders", header: "Orders", sortable: true, align: "right" },
    {
      key: "spent",
      header: "Total Spent",
      sortable: true,
      align: "right",
      render: (c) => (
        <span className="font-medium text-card-foreground">{formatCurrency(c.spent)}</span>
      ),
    },
    {
      key: "status",
      header: "Status",
      sortable: true,
      render: (c) => (
        <Badge tone={statusTone[c.status]} className="capitalize">
          {c.status}
        </Badge>
      ),
    },
    {
      key: "id",
      header: "",
      render: (c) => (
        <button
          onClick={() => openEdit(c)}
          aria-label={`Edit ${c.name}`}
          className="grid h-8 w-8 place-items-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-card-foreground"
        >
          <Pencil className="h-4 w-4" />
        </button>
      ),
    },
  ];

  const active = customers.filter((c) => c.status === "active").length;
  const blocked = customers.filter((c) => c.status === "blocked").length;
  const totalSpend = customers.reduce((a, c) => a + c.spent, 0);

  return (
    <div className="mx-auto max-w-[1600px] space-y-5">
      <PageHeader
        title="Customers"
        subtitle="View, segment and manage every customer on the platform."
        actionLabel="Add Customer"
        onAction={openCreate}
      />

      <StatCards
        stats={[
          { label: "Total Customers", value: customers.length, tone: "primary", icon: Users },
          { label: "Active", value: active, tone: "success", icon: UserCheck },
          { label: "Blocked", value: blocked, tone: "danger", icon: UserX },
          {
            label: "Lifetime Value",
            value: totalSpend,
            display: formatCurrency(totalSpend, true),
            tone: "accent",
          },
        ]}
      />

      {paged.isError ? (
        <ErrorState message="Couldn't load customers." onRetry={() => paged.refetch()} />
      ) : paged.isLoading ? (
        <TableSkeleton />
      ) : (
      <DataTable
        data={rows}
        columns={columns}
        getRowId={(c) => c.id}
        serverMode
        totalCount={paged.data?.total ?? 0}
        loading={paged.isFetching}
        onServerQueryChange={setParams}
        pageSize={10}
        searchKeys={["id", "name", "email", "phone", "city"]}
        searchPlaceholder="Search customers..."
        exportName="customers"
        filterFields={[
          { key: "status", label: "Status", type: "select", options: ["active", "inactive", "blocked"] },
          { key: "city", label: "City", type: "select", options: ["Bangalore", "Mumbai", "Delhi", "Hyderabad", "Chennai", "Pune"] },
          { key: "orders", label: "Orders", type: "numberRange" },
          { key: "spent", label: "Total Spent (₹)", type: "numberRange" },
          { key: "joined", label: "Joined", type: "dateRange" },
        ]}
        bulkActions={[
          { label: "Email", icon: Mail, onClick: () => {} },
          {
            label: "Block",
            icon: Ban,
            onClick: (ids) => runBulk(ids, { action: "update", patch: { status: "blocked" } }, "Customers blocked"),
          },
          {
            label: "Delete",
            icon: Trash2,
            tone: "danger",
            onClick: (ids) => runBulk(ids, { action: "delete" }, "Customers deleted"),
          },
        ]}
        renderCard={(c) => (
          <Card className="p-3.5">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2.5">
                <img src={c.avatar} alt="" className="h-9 w-9 rounded-full object-cover" />
                <div>
                  <p className="text-sm font-medium text-card-foreground">{c.name}</p>
                  <p className="text-xs text-muted-foreground">{c.city}</p>
                </div>
              </div>
              <Badge tone={statusTone[c.status]} className="capitalize">
                {c.status}
              </Badge>
            </div>
            <div className="mt-3 flex justify-between text-xs">
              <span className="text-muted-foreground">
                {c.orders} orders · {c.email}
              </span>
              <span className="font-medium text-card-foreground">
                {formatCurrency(c.spent)}
              </span>
            </div>
          </Card>
        )}
      />
      )}

      <CustomerFormModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        initial={editing}
        onSubmit={submitForm}
        pending={create.isPending || update.isPending}
      />
    </div>
  );
}
