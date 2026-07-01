/**
 * Zero-config in-memory datastore used when MONGODB_URI is not set.
 * Generates deterministic seed data so the API is fully functional for
 * development and demos without any external database. The same shapes map
 * 1:1 to the Mongoose models in ../models for the production path.
 */

function rng(seed: number) {
  let s = seed;
  return () => {
    s = (s * 1103515245 + 12345) & 0x7fffffff;
    return s / 0x7fffffff;
  };
}
const pick = <T>(arr: readonly T[], r: () => number) => arr[Math.floor(r() * arr.length)];

const firstNames = ["Ravi", "Sneha", "Arjun", "Priya", "Karthik", "Meera", "Suresh", "Anjali", "Rahul", "Divya", "Vikram", "Pooja", "Amit", "Neha", "Rohan", "Kavya", "Sanjay", "Isha", "Manish", "Tara"];
const lastNames = ["Kumar", "Patel", "Singh", "Sharma", "Nair", "Verma", "Gupta", "Iyer", "Reddy", "Desai", "Joshi", "Kapoor", "Mehta", "Rao"];
const cities = ["Bangalore", "Mumbai", "Delhi", "Hyderabad", "Chennai", "Pune"];
const serviceNames = ["Home Cleaning", "Electrician", "Plumbing", "Car Service", "Salon at Home", "AC Service", "Pest Control"];
const categories = ["Cleaning", "Repairs", "Beauty", "Automotive", "Appliances"];
const vehicles = ["Bike", "Mini Truck", "Auto", "Sedan", "SUV", "Scooter"];
const methods = ["UPI", "Credit Card", "Debit Card", "Net Banking", "Wallet"];

const name = (i: number, r: () => number) => `${firstNames[i % firstNames.length]} ${pick(lastNames, r)}`;
const isoDaysAgo = (days: number) => {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString();
};

export interface User {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  role: "super_admin" | "admin" | "manager" | "support";
  avatar: string;
  createdAt: string;
}

export interface Customer { id: string; name: string; avatar: string; email: string; phone: string; city: string; orders: number; spent: number; status: string; joined: string; }
export interface Provider { id: string; name: string; avatar: string; category: string; city: string; jobs: number; rating: number; earnings: number; verified: boolean; status: string; joined: string; }
export interface Driver { id: string; name: string; avatar: string; vehicle: string; vehicleNo: string; city: string; trips: number; rating: number; online: boolean; status: string; joined: string; }
export interface Booking { id: string; customer: string; avatar: string; service: string; category: string; provider: string; city: string; amount: number; payment: string; status: string; date: string; }
export interface Payment { id: string; customer: string; avatar: string; service: string; method: string; amount: number; fee: number; status: string; date: string; }
export interface Category { id: string; name: string; services: number; providers: number; bookings: number; status: string; }

function genCategories(): Category[] {
  return ["Cleaning", "Repairs", "Beauty", "Automotive", "Appliances", "Plumbing", "Painting", "Pest Control", "Delivery", "Wellness"].map((nm, i) => {
    const r = rng(400 + i);
    return { id: `CAT-${i + 1}`, name: nm, services: 3 + Math.floor(r() * 14), providers: 20 + Math.floor(r() * 200), bookings: 200 + Math.floor(r() * 2000), status: r() > 0.15 ? "active" : "inactive" };
  });
}

function genCustomers(): Customer[] {
  return Array.from({ length: 56 }, (_, i) => {
    const r = rng(i + 11);
    const n = name(i, r);
    return {
      id: `CUST-${2001 + i}`, name: n, avatar: `https://i.pravatar.cc/80?img=${(i % 70) + 1}`,
      email: `${n.toLowerCase().replace(/\s+/g, ".")}${i}@mail.com`,
      phone: `+91 ${98000 + Math.floor(r() * 1999)} ${10000 + Math.floor(r() * 89999)}`,
      city: pick(cities, r), orders: Math.floor(r() * 120), spent: Math.round((500 + r() * 80000) / 10) * 10,
      status: r() > 0.85 ? "blocked" : r() > 0.7 ? "inactive" : "active", joined: isoDaysAgo(Math.floor(r() * 500)),
    };
  });
}
function genProviders(): Provider[] {
  return Array.from({ length: 48 }, (_, i) => {
    const r = rng(i + 23); const pending = r() > 0.8;
    return {
      id: `PROV-${3001 + i}`, name: name(i + 3, r), avatar: `https://i.pravatar.cc/80?img=${((i + 10) % 70) + 1}`,
      category: pick(categories, r), city: pick(cities, r), jobs: Math.floor(r() * 900),
      rating: Math.round((3.6 + r() * 1.4) * 10) / 10, earnings: Math.round((2000 + r() * 250000) / 100) * 100,
      verified: !pending && r() > 0.2, status: pending ? "pending" : r() > 0.85 ? "inactive" : "active", joined: isoDaysAgo(Math.floor(r() * 600)),
    };
  });
}
function genDrivers(): Driver[] {
  return Array.from({ length: 44 }, (_, i) => {
    const r = rng(i + 41);
    return {
      id: `DRV-${4001 + i}`, name: name(i + 5, r), avatar: `https://i.pravatar.cc/80?img=${((i + 30) % 70) + 1}`,
      vehicle: pick(vehicles, r), vehicleNo: `KA ${1 + Math.floor(r() * 50)} ${String.fromCharCode(65 + Math.floor(r() * 26))}${String.fromCharCode(65 + Math.floor(r() * 26))} ${1000 + Math.floor(r() * 8999)}`,
      city: pick(cities, r), trips: Math.floor(r() * 3000), rating: Math.round((3.8 + r() * 1.2) * 10) / 10,
      online: r() > 0.45, status: r() > 0.9 ? "blocked" : "active", joined: isoDaysAgo(Math.floor(r() * 500)),
    };
  });
}
function genBookings(): Booking[] {
  const statuses = ["ongoing", "completed", "pending", "cancelled"];
  return Array.from({ length: 64 }, (_, i) => {
    const r = rng(i + 7); const svc = pick(serviceNames, r); const status = pick(statuses, r);
    return {
      id: `BK-${12458 - i}`, customer: name(i, r), avatar: `https://i.pravatar.cc/80?img=${(i % 70) + 1}`,
      service: svc, category: pick(categories, r), provider: pick(["Sparkle Co", "FixIt Pro", "AutoCare", "QuickEats", "GlamHouse"], r),
      city: pick(cities, r), amount: Math.round((350 + r() * 4500) / 10) * 10,
      payment: status === "cancelled" ? "refunded" : status === "completed" ? "paid" : "pending",
      status, date: isoDaysAgo(Math.floor(r() * 30)),
    };
  });
}
function genPayments(): Payment[] {
  const statuses = ["success", "success", "success", "pending", "failed", "refunded"];
  return Array.from({ length: 60 }, (_, i) => {
    const r = rng(i + 91); const amount = Math.round((250 + r() * 6000) / 10) * 10;
    return {
      id: `TXN-${78451 - i}`, customer: name(i, r), avatar: `https://i.pravatar.cc/80?img=${(i % 70) + 1}`,
      service: pick(serviceNames, r), method: pick(methods, r), amount, fee: Math.round(amount * 0.02),
      status: pick(statuses, r), date: isoDaysAgo(Math.floor(r() * 14)),
    };
  });
}

export const store = {
  users: [] as User[],
  customers: genCustomers(),
  providers: genProviders(),
  drivers: genDrivers(),
  bookings: genBookings(),
  payments: genPayments(),
  categories: genCategories(),
  // Generic per-module collections seeded on first access from the client config.
  collections: {} as Record<string, Record<string, unknown>[]>,
};

// ---------- Generic query engine (search / filter / sort / paginate) ----------
export interface QueryParams {
  search?: string;
  searchFields?: string[];
  /** Exact-match filters (select controls). */
  filters?: Record<string, string>;
  /** Case-insensitive "contains" filters (text controls). */
  contains?: Record<string, string>;
  /** Numeric min/max filters. */
  ranges?: Record<string, { min?: number; max?: number }>;
  /** ISO date from/to filters (inclusive of the whole `to` day). */
  dateRanges?: Record<string, { from?: string; to?: string }>;
  sort?: string;
  order?: "asc" | "desc";
  page?: number;
  limit?: number;
}

export function query<T extends Record<string, any>>(data: T[], params: QueryParams) {
  let rows = [...data];

  if (params.search && params.searchFields?.length) {
    const q = params.search.toLowerCase();
    rows = rows.filter((row) =>
      params.searchFields!.some((f) => String(row[f] ?? "").toLowerCase().includes(q)),
    );
  }
  if (params.filters) {
    for (const [key, value] of Object.entries(params.filters)) {
      if (value && value !== "all") rows = rows.filter((row) => String(row[key]) === value);
    }
  }
  if (params.contains) {
    for (const [key, value] of Object.entries(params.contains)) {
      if (value) {
        const q = value.toLowerCase();
        rows = rows.filter((row) => String(row[key] ?? "").toLowerCase().includes(q));
      }
    }
  }
  if (params.ranges) {
    for (const [key, { min, max }] of Object.entries(params.ranges)) {
      if (min != null) rows = rows.filter((row) => Number(row[key]) >= min);
      if (max != null) rows = rows.filter((row) => Number(row[key]) <= max);
    }
  }
  if (params.dateRanges) {
    for (const [key, { from, to }] of Object.entries(params.dateRanges)) {
      if (from) {
        const t = new Date(from).getTime();
        rows = rows.filter((row) => new Date(row[key]).getTime() >= t);
      }
      if (to) {
        const t = new Date(to).getTime() + 86_400_000; // include the whole `to` day
        rows = rows.filter((row) => new Date(row[key]).getTime() <= t);
      }
    }
  }
  if (params.sort) {
    const dir = params.order === "desc" ? -1 : 1;
    rows.sort((a, b) => {
      const av = a[params.sort!]; const bv = b[params.sort!];
      if (av === bv) return 0;
      return av > bv ? dir : -dir;
    });
  }

  const total = rows.length;
  const page = Math.max(1, params.page ?? 1);
  const limit = Math.max(1, Math.min(100, params.limit ?? 10));
  const start = (page - 1) * limit;
  const items = rows.slice(start, start + limit);

  return { items, total, page, limit, pages: Math.ceil(total / limit) };
}
