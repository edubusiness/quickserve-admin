"use client";

import { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2 } from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { TextField, SelectField } from "@/components/ui/form-field";
import { Switch } from "@/components/ui/switch";
import type { Driver } from "@/data/people";

const cities = ["Bangalore", "Mumbai", "Delhi", "Hyderabad", "Chennai", "Pune"];
const vehicles = ["Bike", "Mini Truck", "Auto", "Sedan", "SUV", "Scooter"];
const statuses = ["active", "inactive", "blocked"];

const schema = z.object({
  name: z.string().min(2, "Name is required"),
  vehicle: z.string().min(1),
  vehicleNo: z.string().min(2, "Vehicle number is required"),
  city: z.string().min(1),
  trips: z.number().min(0),
  rating: z.number().min(0).max(5, "Rating is 0–5"),
  online: z.boolean(),
  status: z.enum(["active", "inactive", "blocked"]),
});

export type DriverFormValues = z.infer<typeof schema>;

export function DriverFormModal({
  open,
  onClose,
  initial,
  onSubmit,
  pending,
}: {
  open: boolean;
  onClose: () => void;
  initial?: Driver | null;
  onSubmit: (values: DriverFormValues) => void;
  pending?: boolean;
}) {
  const isEdit = !!initial;
  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<DriverFormValues>({
    resolver: zodResolver(schema),
    defaultValues: { status: "active", vehicle: "Bike", city: "Bangalore", trips: 0, rating: 4.5, online: true },
  });

  useEffect(() => {
    if (open)
      reset(
        initial
          ? {
              name: initial.name,
              vehicle: initial.vehicle,
              vehicleNo: initial.vehicleNo,
              city: initial.city,
              trips: initial.trips,
              rating: initial.rating,
              online: initial.online,
              status: initial.status as DriverFormValues["status"],
            }
          : { status: "active", vehicle: "Bike", city: "Bangalore", trips: 0, rating: 4.5, online: true, name: "", vehicleNo: "" },
      );
  }, [open, initial, reset]);

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEdit ? "Edit Driver" : "Add Driver"}
      description={isEdit ? `Updating ${initial?.name}` : "Register a new delivery / ride partner."}
      footer={
        <>
          <button type="button" onClick={onClose} className="rounded-xl border border-border px-4 py-2.5 text-sm text-muted-foreground transition-colors hover:text-card-foreground">
            Cancel
          </button>
          <button type="submit" form="driver-form" disabled={pending} className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[var(--accent)] to-[var(--primary)] px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-[var(--primary)]/30 transition-transform hover:-translate-y-0.5 disabled:opacity-70">
            {pending && <Loader2 className="h-4 w-4 animate-spin" />}
            {isEdit ? "Save Changes" : "Create Driver"}
          </button>
        </>
      }
    >
      <form id="driver-form" onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <TextField label="Driver Name" placeholder="Arjun Singh" error={errors.name?.message} {...register("name")} />
        <TextField label="Vehicle No." placeholder="KA 05 AB 1234" error={errors.vehicleNo?.message} {...register("vehicleNo")} />
        <SelectField label="Vehicle" options={vehicles} error={errors.vehicle?.message} {...register("vehicle")} />
        <SelectField label="City" options={cities} error={errors.city?.message} {...register("city")} />
        <TextField label="Trips" type="number" min={0} error={errors.trips?.message} {...register("trips", { valueAsNumber: true })} />
        <TextField label="Rating (0–5)" type="number" step="0.1" min={0} max={5} error={errors.rating?.message} {...register("rating", { valueAsNumber: true })} />
        <SelectField label="Status" options={statuses} error={errors.status?.message} {...register("status")} />
        <div className="flex h-10 items-center justify-between self-end rounded-xl border border-border bg-muted/40 px-3.5">
          <span className="text-xs font-medium text-muted-foreground">Online now</span>
          <Controller
            control={control}
            name="online"
            render={({ field }) => <Switch checked={field.value} onChange={field.onChange} label="Online" />}
          />
        </div>
      </form>
    </Modal>
  );
}
