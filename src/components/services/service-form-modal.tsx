"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { TextField, SelectField } from "@/components/ui/form-field";
import type { Service } from "@/data/services";

const categories = ["Cleaning", "Repairs", "Automotive", "Beauty", "Appliances", "Home"];

export interface ServiceFormValues {
  name: string;
  category: string;
  price: number;
  providers: number;
  rating: number;
  active: boolean;
}

const empty: ServiceFormValues = {
  name: "",
  category: categories[0],
  price: 499,
  providers: 0,
  rating: 4.5,
  active: true,
};

export function ServiceFormModal({
  open,
  onClose,
  initial,
  pending,
  onSubmit,
}: {
  open: boolean;
  onClose: () => void;
  initial?: Service | null;
  pending?: boolean;
  onSubmit: (values: ServiceFormValues) => void;
}) {
  const [v, setV] = useState<ServiceFormValues>(empty);

  useEffect(() => {
    if (!open) return;
    setV(
      initial
        ? {
            name: initial.name,
            category: initial.category,
            price: initial.price,
            providers: initial.providers,
            rating: initial.rating,
            active: initial.active,
          }
        : empty,
    );
  }, [open, initial]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ ...v, price: Number(v.price) || 0, providers: Number(v.providers) || 0, rating: Number(v.rating) || 0 });
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={initial ? "Edit Service" : "Add Service"}
      description="Configure the service catalog entry, pricing and coverage."
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
            form="service-form"
            disabled={pending}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[var(--accent)] to-[var(--primary)] px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-[var(--primary)]/30 transition-transform hover:-translate-y-0.5 disabled:opacity-70"
          >
            {pending && <Loader2 className="h-4 w-4 animate-spin" />}
            {initial ? "Save Changes" : "Add Service"}
          </button>
        </>
      }
    >
      <form id="service-form" onSubmit={submit} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <TextField
          label="Service Name"
          required
          value={v.name}
          onChange={(e) => setV((s) => ({ ...s, name: e.target.value }))}
          className="sm:col-span-2"
        />
        <SelectField
          label="Category"
          options={categories}
          value={v.category}
          onChange={(e) => setV((s) => ({ ...s, category: e.target.value }))}
        />
        <TextField
          label="Base Price (₹)"
          type="number"
          value={String(v.price)}
          onChange={(e) => setV((s) => ({ ...s, price: Number(e.target.value) }))}
        />
        <TextField
          label="Providers"
          type="number"
          value={String(v.providers)}
          onChange={(e) => setV((s) => ({ ...s, providers: Number(e.target.value) }))}
        />
        <TextField
          label="Rating"
          type="number"
          value={String(v.rating)}
          onChange={(e) => setV((s) => ({ ...s, rating: Number(e.target.value) }))}
        />
        <SelectField
          label="Status"
          options={["active", "inactive"]}
          value={v.active ? "active" : "inactive"}
          onChange={(e) => setV((s) => ({ ...s, active: e.target.value === "active" }))}
        />
      </form>
    </Modal>
  );
}
