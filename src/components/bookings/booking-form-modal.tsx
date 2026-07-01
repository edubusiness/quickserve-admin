"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2 } from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { TextField, SelectField } from "@/components/ui/form-field";

const cities = ["Bangalore", "Mumbai", "Delhi", "Hyderabad", "Chennai", "Pune"];
const servicesList = ["Home Cleaning", "Electrician", "Plumbing", "Car Service", "Salon at Home", "AC Service"];
const categories = ["Cleaning", "Repairs", "Beauty", "Automotive", "Appliances"];
const statuses = ["ongoing", "completed", "pending", "cancelled"];
const payments = ["paid", "pending", "refunded"];

const schema = z.object({
  customer: z.string().min(2, "Customer name is required"),
  service: z.string().min(1),
  category: z.string().min(1),
  provider: z.string().min(2, "Provider is required"),
  city: z.string().min(1),
  amount: z.number().min(1, "Amount must be greater than 0"),
  status: z.enum(["ongoing", "completed", "pending", "cancelled"]),
  payment: z.enum(["paid", "pending", "refunded"]),
});

export type BookingFormValues = z.infer<typeof schema>;

export function BookingFormModal({
  open,
  onClose,
  onSubmit,
  pending,
}: {
  open: boolean;
  onClose: () => void;
  onSubmit: (values: BookingFormValues) => void;
  pending?: boolean;
}) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<BookingFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      service: "Home Cleaning",
      category: "Cleaning",
      city: "Bangalore",
      status: "pending",
      payment: "pending",
      amount: 499,
    },
  });

  useEffect(() => {
    if (open)
      reset({
        customer: "",
        provider: "",
        service: "Home Cleaning",
        category: "Cleaning",
        city: "Bangalore",
        status: "pending",
        payment: "pending",
        amount: 499,
      });
  }, [open, reset]);

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="New Booking"
      description="Create a booking and assign it to a provider."
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
            form="booking-form"
            disabled={pending}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[var(--accent)] to-[var(--primary)] px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-[var(--primary)]/30 transition-transform hover:-translate-y-0.5 disabled:opacity-70"
          >
            {pending && <Loader2 className="h-4 w-4 animate-spin" />}
            Create Booking
          </button>
        </>
      }
    >
      <form id="booking-form" onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <TextField label="Customer" placeholder="Jane Doe" error={errors.customer?.message} {...register("customer")} />
        <TextField label="Provider" placeholder="Sparkle Co" error={errors.provider?.message} {...register("provider")} />
        <SelectField label="Service" options={servicesList} error={errors.service?.message} {...register("service")} />
        <SelectField label="Category" options={categories} error={errors.category?.message} {...register("category")} />
        <SelectField label="City" options={cities} error={errors.city?.message} {...register("city")} />
        <TextField label="Amount (₹)" type="number" min={1} error={errors.amount?.message} {...register("amount", { valueAsNumber: true })} />
        <SelectField label="Status" options={statuses} error={errors.status?.message} {...register("status")} />
        <SelectField label="Payment" options={payments} error={errors.payment?.message} {...register("payment")} />
      </form>
    </Modal>
  );
}
