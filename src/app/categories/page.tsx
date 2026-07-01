"use client";

import { useState } from "react";
import { LayoutGrid, CheckCircle2, Wrench, Users2, Pencil, Trash2 } from "lucide-react";
import { Badge, type BadgeTone } from "@/components/ui/badge";
import { DataTable, type Column } from "@/components/ui/data-table";
import { PageHeader } from "@/components/ui/page-header";
import { StatCards } from "@/components/ui/stat-cards";
import { TableSkeleton, ErrorState } from "@/components/ui/table-skeleton";
import { useToast } from "@/components/ui/toast";
import { useCategories } from "@/hooks/use-resources";
import { useResourceMutations } from "@/hooks/use-mutations";
import { CategoryFormModal, type CategoryFormValues } from "@/components/categories/category-form-modal";
import { formatNumber } from "@/lib/utils";
import type { Category } from "@/data/categories";

const statusTone: Record<string, BadgeTone> = { active: "success", inactive: "warning" };

export default function CategoriesPage() {
  const { data: categories = [], isLoading, isError, refetch } = useCategories();
  const { create, update, remove } = useResourceMutations<Category>("categories", "/api/categories");
  const { toast } = useToast();

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const openCreate = () => { setEditing(null); setModalOpen(true); };
  const openEdit = (c: Category) => { setEditing(c); setModalOpen(true); };

  const submit = (values: CategoryFormValues) => {
    if (editing) {
      update.mutate({ id: editing.id, body: values }, {
        onSuccess: () => { setModalOpen(false); toast({ title: "Category updated", description: `${values.name} saved.` }); },
        onError: () => toast({ title: "Update failed", variant: "error" }),
      });
    } else {
      create.mutate(values, {
        onSuccess: () => { setModalOpen(false); toast({ title: "Category created", description: `${values.name} was added.` }); },
        onError: () => toast({ title: "Create failed", variant: "error" }),
      });
    }
  };

  const del = (c: Category) =>
    remove.mutate(c.id, {
      onSuccess: () => toast({ title: "Category deleted", description: `${c.name} removed.` }),
      onError: () => toast({ title: "Delete failed", variant: "error" }),
    });

  const columns: Column<Category>[] = [
    { key: "name", header: "Category", sortable: true, render: (c) => <span className="font-medium text-card-foreground">{c.name}</span> },
    { key: "services", header: "Services", sortable: true, align: "right", render: (c) => formatNumber(c.services) },
    { key: "providers", header: "Providers", sortable: true, align: "right", render: (c) => formatNumber(c.providers) },
    { key: "bookings", header: "Bookings", sortable: true, align: "right", render: (c) => formatNumber(c.bookings) },
    { key: "status", header: "Status", sortable: true, render: (c) => <Badge tone={statusTone[c.status] ?? "neutral"} className="capitalize">{c.status}</Badge> },
    {
      key: "id", header: "", render: (c) => (
        <div className="flex justify-end gap-1">
          <button onClick={() => openEdit(c)} aria-label="Edit" className="grid h-8 w-8 place-items-center rounded-lg text-muted-foreground hover:bg-muted hover:text-card-foreground"><Pencil className="h-4 w-4" /></button>
          <button onClick={() => del(c)} aria-label="Delete" className="grid h-8 w-8 place-items-center rounded-lg text-muted-foreground hover:bg-rose-500/10 hover:text-rose-400"><Trash2 className="h-4 w-4" /></button>
        </div>
      ),
    },
  ];

  const active = categories.filter((c) => c.status === "active").length;
  const totalServices = categories.reduce((a, c) => a + c.services, 0);
  const totalProviders = categories.reduce((a, c) => a + c.providers, 0);

  return (
    <div className="mx-auto max-w-[1600px] space-y-5">
      <PageHeader title="Categories" subtitle="Service categories and their coverage." actionLabel="Add Category" onAction={openCreate} />

      <StatCards
        stats={[
          { label: "Total Categories", value: categories.length, tone: "primary", icon: LayoutGrid },
          { label: "Active", value: active, tone: "success", icon: CheckCircle2 },
          { label: "Total Services", value: totalServices, tone: "accent", icon: Wrench },
          { label: "Total Providers", value: totalProviders, tone: "warning", icon: Users2 },
        ]}
      />

      {isError ? (
        <ErrorState message="Couldn't load categories." onRetry={() => refetch()} />
      ) : isLoading ? (
        <TableSkeleton />
      ) : (
        <DataTable
          data={categories}
          columns={columns}
          getRowId={(c) => c.id}
          searchKeys={["id", "name"]}
          searchPlaceholder="Search categories..."
          exportName="categories"
          filterFields={[
            { key: "status", label: "Status", type: "select", options: ["active", "inactive"] },
            { key: "services", label: "Services", type: "numberRange" },
            { key: "providers", label: "Providers", type: "numberRange" },
            { key: "bookings", label: "Bookings", type: "numberRange" },
          ]}
        />
      )}

      <CategoryFormModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        initial={editing}
        onSubmit={submit}
        pending={create.isPending || update.isPending}
      />
    </div>
  );
}
