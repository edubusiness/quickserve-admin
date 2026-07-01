"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2 } from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { TextField, SelectField } from "@/components/ui/form-field";
import type { Customer } from "@/data/people";

const cities = ["Bangalore", "Mumbai", "Delhi", "Hyderabad", "Chennai", "Pune"];
const statuses = ["active", "inactive", "blocked"];

const schema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Enter a valid email"),
  phone: z.string().min(8, "Enter a valid phone number"),
  city: z.string().min(1),
  status: z.enum(["active", "inactive", "blocked"]),
  orders: z.number().min(0),
  spent: z.number().min(0),
});

export type CustomerFormValues = z.infer<typeof schema>;

export function CustomerFormModal({
  open,
  onClose,
  initial,
  onSubmit,
  pending,
}: {
  open: boolean;
  onClose: () => void;
  initial?: Customer | null;
  onSubmit: (values: CustomerFormValues) => void;
  pending?: boolean;
}) {
  const isEdit = !!initial;
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CustomerFormValues>({
    resolver: zodResolver(schema),
    defaultValues: { status: "active", city: "Bangalore", orders: 0, spent: 0 },
  });

  // Sync form when opening / switching record.
  useEffect(() => {
    if (open) {
      reset(
        initial
          ? {
              name: initial.name,
              email: initial.email,
              phone: initial.phone,
              city: initial.city,
              status: initial.status as CustomerFormValues["status"],
              orders: initial.orders,
              spent: initial.spent,
            }
          : { status: "active", city: "Bangalore", orders: 0, spent: 0, name: "", email: "", phone: "" },
      );
    }
  }, [open, initial, reset]);

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEdit ? "Edit Customer" : "Add Customer"}
      description={isEdit ? `Updating ${initial?.name}` : "Create a new customer record."}
      footer={
        <>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-border px-4 py-2.5 text-sm text-muted-foreground transition-colors hover:text-card-foreground"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="customer-form"
            disabled={pending}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[var(--accent)] to-[var(--primary)] px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-[var(--primary)]/30 transition-transform hover:-translate-y-0.5 disabled:opacity-70"
          >
            {pending && <Loader2 className="h-4 w-4 animate-spin" />}
            {isEdit ? "Save Changes" : "Create Customer"}
          </button>
        </>
      }
    >
      <form id="customer-form" onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <TextField label="Full Name" placeholder="Jane Doe" error={errors.name?.message} {...register("name")} />
        </div>
        <TextField label="Email" type="email" placeholder="jane@mail.com" error={errors.email?.message} {...register("email")} />
        <TextField label="Phone" placeholder="+91 98000 12345" error={errors.phone?.message} {...register("phone")} />
        <SelectField label="City" options={cities} error={errors.city?.message} {...register("city")} />
        <SelectField label="Status" options={statuses} error={errors.status?.message} {...register("status")} />
        <TextField label="Orders" type="number" min={0} error={errors.orders?.message} {...register("orders", { valueAsNumber: true })} />
        <TextField label="Total Spent (₹)" type="number" min={0} error={errors.spent?.message} {...register("spent", { valueAsNumber: true })} />
      </form>
    </Modal>
  );
}
