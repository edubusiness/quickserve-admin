"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2 } from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { TextField, SelectField } from "@/components/ui/form-field";
import type { Category } from "@/data/categories";

const schema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  status: z.enum(["active", "inactive"]),
  services: z.number().min(0),
  providers: z.number().min(0),
  bookings: z.number().min(0),
});

export type CategoryFormValues = z.infer<typeof schema>;

export function CategoryFormModal({
  open,
  onClose,
  initial,
  onSubmit,
  pending,
}: {
  open: boolean;
  onClose: () => void;
  initial?: Category | null;
  onSubmit: (values: CategoryFormValues) => void;
  pending?: boolean;
}) {
  const isEdit = !!initial;
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CategoryFormValues>({
    resolver: zodResolver(schema),
    defaultValues: { status: "active", services: 0, providers: 0, bookings: 0 },
  });

  useEffect(() => {
    if (open) {
      reset(
        initial
          ? { name: initial.name, status: initial.status, services: initial.services, providers: initial.providers, bookings: initial.bookings }
          : { name: "", status: "active", services: 0, providers: 0, bookings: 0 },
      );
    }
  }, [open, initial, reset]);

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEdit ? "Edit Category" : "Add Category"}
      description={isEdit ? `Updating ${initial?.name}` : "Create a new service category."}
      footer={
        <>
          <button type="button" onClick={onClose} className="rounded-xl border border-border px-4 py-2.5 text-sm text-muted-foreground transition-colors hover:text-card-foreground">
            Cancel
          </button>
          <button type="submit" form="category-form" disabled={pending} className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[var(--accent)] to-[var(--primary)] px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-[var(--primary)]/30 transition-transform hover:-translate-y-0.5 disabled:opacity-70">
            {pending && <Loader2 className="h-4 w-4 animate-spin" />}
            {isEdit ? "Save Changes" : "Create Category"}
          </button>
        </>
      }
    >
      <form id="category-form" onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <TextField label="Category Name" placeholder="e.g. Cleaning" error={errors.name?.message} {...register("name")} />
        </div>
        <SelectField label="Status" options={["active", "inactive"]} error={errors.status?.message} {...register("status")} />
        <TextField label="Services" type="number" min={0} error={errors.services?.message} {...register("services", { valueAsNumber: true })} />
        <TextField label="Providers" type="number" min={0} error={errors.providers?.message} {...register("providers", { valueAsNumber: true })} />
        <TextField label="Bookings" type="number" min={0} error={errors.bookings?.message} {...register("bookings", { valueAsNumber: true })} />
      </form>
    </Modal>
  );
}
