import type { BookingStatus } from "@/types";

export interface BookingRow {
  id: string;
  customer: string;
  avatar: string;
  service: string;
  category: string;
  provider: string;
  city: string;
  amount: number;
  payment: "paid" | "pending" | "refunded";
  status: BookingStatus;
  date: string; // ISO
}

const customers = [
  "Ravi Kumar", "Sneha Patel", "Arjun Singh", "Priya Sharma", "Karthik R",
  "Meera Nair", "Suresh Kumar", "Anjali Verma", "Rahul Gupta", "Divya Iyer",
  "Vikram Reddy", "Pooja Desai", "Amit Joshi", "Neha Kapoor", "Rohan Mehta",
  "Kavya Rao", "Sanjay Pillai", "Isha Bhat", "Manish Yadav", "Tara Menon",
];

const services = [
  { name: "Home Cleaning", category: "Cleaning" },
  { name: "Electrician", category: "Repairs" },
  { name: "Plumbing", category: "Repairs" },
  { name: "Car Service", category: "Automotive" },
  { name: "Food Delivery", category: "Delivery" },
  { name: "Salon at Home", category: "Beauty" },
  { name: "AC Service", category: "Appliances" },
  { name: "Pest Control", category: "Cleaning" },
];

const providers = [
  "Ravi Kumar", "Sparkle Co", "FixIt Pro", "AutoCare", "QuickEats",
  "GlamHouse", "CoolTech", "SafeHome",
];

const cities = ["Bangalore", "Mumbai", "Delhi", "Hyderabad", "Chennai", "Pune"];
const statuses: BookingStatus[] = ["ongoing", "completed", "pending", "cancelled"];
const payments: BookingRow["payment"][] = ["paid", "pending", "refunded"];

// Deterministic pseudo-random so SSR and client agree.
function rng(seed: number) {
  let s = seed;
  return () => {
    s = (s * 1103515245 + 12345) & 0x7fffffff;
    return s / 0x7fffffff;
  };
}

export const bookings: BookingRow[] = Array.from({ length: 64 }, (_, i) => {
  const r = rng(i + 7);
  const svc = services[Math.floor(r() * services.length)];
  const status = statuses[Math.floor(r() * statuses.length)];
  const payment =
    status === "cancelled"
      ? "refunded"
      : status === "completed"
        ? "paid"
        : payments[Math.floor(r() * 2)];
  const daysAgo = Math.floor(r() * 30);
  const d = new Date(2025, 4, 28);
  d.setDate(d.getDate() - daysAgo);
  return {
    id: `BK-${12458 - i}`,
    customer: customers[i % customers.length],
    avatar: `https://i.pravatar.cc/80?img=${(i % 70) + 1}`,
    service: svc.name,
    category: svc.category,
    provider: providers[Math.floor(r() * providers.length)],
    city: cities[Math.floor(r() * cities.length)],
    amount: Math.round((350 + r() * 4500) / 10) * 10,
    payment,
    status,
    date: d.toISOString(),
  };
});

export const bookingStats = [
  { label: "Total Bookings", value: bookings.length, tone: "primary" as const },
  {
    label: "Completed",
    value: bookings.filter((b) => b.status === "completed").length,
    tone: "success" as const,
  },
  {
    label: "Ongoing",
    value: bookings.filter((b) => b.status === "ongoing").length,
    tone: "accent" as const,
  },
  {
    label: "Cancelled",
    value: bookings.filter((b) => b.status === "cancelled").length,
    tone: "danger" as const,
  },
];
