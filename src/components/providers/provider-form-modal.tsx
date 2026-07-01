"use client";

import { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2 } from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { TextField, SelectField } from "@/components/ui/form-field";
import { Switch } from "@/components/ui/switch";
import type { Provider } from "@/data/people";

const cities = ["Bangalore", "Mumbai", "Delhi", "Hyderabad", "Chennai", "Pune"];
const categories = ["Cleaning", "Repairs", "Beauty", "Automotive", "Appliances"];
const statuses = ["active", "inactive", "blocked", "pending"];

const schema = z.object({
  name: z.string().min(2, "Name is required"),
  category: z.string().min(1),
  city: z.string().min(1),
  jobs: z.number().min(0),
  rating: z.number().min(0).max(5, "Rating is 0–5"),
  earnings: z.number().min(0),
  verified: z.boolean(),
  status: z.enum(["active", "inactive", "blocked", "pending"]),
});

export type ProviderFormValues = z.infer<typeof schema>;

export function ProviderFormModal({
  open,
  onClose,
  initial,
  onSubmit,
  pending,
}: {
  open: boolean;
  onClose: () => void;
  initial?: Provider | null;
  onSubmit: (values: ProviderFormValues) => void;
  pending?: boolean;
}) {
  const isEdit = !!initial;
  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<ProviderFormValues>({
    resolver: zodResolver(schema),
    defaultValues: { status: "pending", category: "Cleaning", city: "Bangalore", jobs: 0, rating: 4.5, earnings: 0, verified: false },
  });

  useEffect(() => {
    if (open)
      reset(
        initial
          ? {
              name: initial.name,
              category: initial.category,
              city: initial.city,
              jobs: initial.jobs,
              rating: initial.rating,
              earnings: initial.earnings,
              verified: initial.verified,
              status: initial.status as ProviderFormValues["status"],
            }
          : { status: "pending", category: "Cleaning", city: "Bangalore", jobs: 0, rating: 4.5, earnings: 0, verified: false, name: "" },
      );
  }, [open, initial, reset]);

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEdit ? "Edit Provider" : "Add Provider"}
      description={isEdit ? `Updating ${initial?.name}` : "Onboard a new service provider."}
      footer={
        <>
          <button type="button" onClick={onClose} className="rounded-xl border border-border px-4 py-2.5 text-sm text-muted-foreground transition-colors hover:text-card-foreground">
            Cancel
          </button>
          <button type="submit" form="provider-form" disabled={pending} className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[var(--accent)] to-[var(--primary)] px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-[var(--primary)]/30 transition-transform hover:-translate-y-0.5 disabled:opacity-70">
            {pending && <Loader2 className="h-4 w-4 animate-spin" />}
            {isEdit ? "Save Changes" : "Create Provider"}
          </button>
        </>
      }
    >
      <form id="provider-form" onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <TextField label="Provider Name" placeholder="Sparkle Co" error={errors.name?.message} {...register("name")} />
        </div>
        <SelectField label="Category" options={categories} error={errors.category?.message} {...register("category")} />
        <SelectField label="City" options={cities} error={errors.city?.message} {...register("city")} />
        <TextField label="Jobs" type="number" min={0} error={errors.jobs?.message} {...register("jobs", { valueAsNumber: true })} />
        <TextField label="Rating (0–5)" type="number" step="0.1" min={0} max={5} error={errors.rating?.message} {...register("rating", { valueAsNumber: true })} />
        <TextField label="Earnings (₹)" type="number" min={0} error={errors.earnings?.message} {...register("earnings", { valueAsNumber: true })} />
        <SelectField label="Status" options={statuses} error={errors.status?.message} {...register("status")} />
        <div className="flex h-10 items-center justify-between self-end rounded-xl border border-border bg-muted/40 px-3.5 sm:col-span-2">
          <span className="text-xs font-medium text-muted-foreground">Verified provider</span>
          <Controller
            control={control}
            name="verified"
            render={({ field }) => <Switch checked={field.value} onChange={field.onChange} label="Verified" />}
          />
        </div>
      </form>
    </Modal>
  );
}
