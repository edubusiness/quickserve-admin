const firstNames = [
  "Ravi", "Sneha", "Arjun", "Priya", "Karthik", "Meera", "Suresh", "Anjali",
  "Rahul", "Divya", "Vikram", "Pooja", "Amit", "Neha", "Rohan", "Kavya",
  "Sanjay", "Isha", "Manish", "Tara", "Deepak", "Riya", "Nikhil", "Aisha",
];
const lastNames = [
  "Kumar", "Patel", "Singh", "Sharma", "Nair", "Verma", "Gupta", "Iyer",
  "Reddy", "Desai", "Joshi", "Kapoor", "Mehta", "Rao", "Pillai", "Bhat",
];
const cities = ["Bangalore", "Mumbai", "Delhi", "Hyderabad", "Chennai", "Pune"];

function rng(seed: number) {
  let s = seed;
  return () => {
    s = (s * 1103515245 + 12345) & 0x7fffffff;
    return s / 0x7fffffff;
  };
}
const pick = <T,>(arr: T[], r: () => number) => arr[Math.floor(r() * arr.length)];
const name = (i: number, r: () => number) =>
  `${firstNames[i % firstNames.length]} ${pick(lastNames, r)}`;
const phone = (r: () => number) =>
  `+91 ${98000 + Math.floor(r() * 1999)} ${10000 + Math.floor(r() * 89999)}`;
const email = (n: string, i: number) =>
  `${n.toLowerCase().replace(/\s+/g, ".")}${i}@mail.com`;

export type AccountStatus = "active" | "inactive" | "blocked";

// ---------------- Customers ----------------
export interface Customer {
  id: string;
  name: string;
  avatar: string;
  email: string;
  phone: string;
  city: string;
  orders: number;
  spent: number;
  status: AccountStatus;
  joined: string;
}

export const customers: Customer[] = Array.from({ length: 56 }, (_, i) => {
  const r = rng(i + 11);
  const n = name(i, r);
  const status: AccountStatus =
    r() > 0.85 ? "blocked" : r() > 0.7 ? "inactive" : "active";
  const d = new Date(2024, 0, 1);
  d.setDate(d.getDate() + Math.floor(r() * 500));
  return {
    id: `CUST-${2001 + i}`,
    name: n,
    avatar: `https://i.pravatar.cc/80?img=${(i % 70) + 1}`,
    email: email(n, i),
    phone: phone(r),
    city: pick(cities, r),
    orders: Math.floor(r() * 120),
    spent: Math.round((500 + r() * 80000) / 10) * 10,
    status,
    joined: d.toISOString(),
  };
});

// ---------------- Service Providers ----------------
const categories = [
  "Cleaning", "Repairs", "Beauty", "Automotive", "Appliances", "Plumbing",
];
export interface Provider {
  id: string;
  name: string;
  avatar: string;
  category: string;
  city: string;
  jobs: number;
  rating: number;
  earnings: number;
  verified: boolean;
  status: AccountStatus | "pending";
  joined: string;
}

export const providers: Provider[] = Array.from({ length: 48 }, (_, i) => {
  const r = rng(i + 23);
  const n = name(i + 3, r);
  const pending = r() > 0.8;
  const d = new Date(2023, 6, 1);
  d.setDate(d.getDate() + Math.floor(r() * 600));
  return {
    id: `PROV-${3001 + i}`,
    name: n,
    avatar: `https://i.pravatar.cc/80?img=${((i + 10) % 70) + 1}`,
    category: pick(categories, r),
    city: pick(cities, r),
    jobs: Math.floor(r() * 900),
    rating: Math.round((3.6 + r() * 1.4) * 10) / 10,
    earnings: Math.round((2000 + r() * 250000) / 100) * 100,
    verified: !pending && r() > 0.2,
    status: pending ? "pending" : r() > 0.85 ? "inactive" : "active",
    joined: d.toISOString(),
  };
});

export const pendingProviders = providers.filter((p) => p.status === "pending");

// ---------------- Drivers ----------------
const vehicles = ["Bike", "Mini Truck", "Auto", "Sedan", "SUV", "Scooter"];
export interface Driver {
  id: string;
  name: string;
  avatar: string;
  vehicle: string;
  vehicleNo: string;
  city: string;
  trips: number;
  rating: number;
  online: boolean;
  status: AccountStatus;
  joined: string;
}

export const drivers: Driver[] = Array.from({ length: 44 }, (_, i) => {
  const r = rng(i + 41);
  const n = name(i + 5, r);
  const d = new Date(2023, 9, 1);
  d.setDate(d.getDate() + Math.floor(r() * 500));
  return {
    id: `DRV-${4001 + i}`,
    name: n,
    avatar: `https://i.pravatar.cc/80?img=${((i + 30) % 70) + 1}`,
    vehicle: pick(vehicles, r),
    vehicleNo: `KA ${1 + Math.floor(r() * 50)} ${String.fromCharCode(65 + Math.floor(r() * 26))}${String.fromCharCode(65 + Math.floor(r() * 26))} ${1000 + Math.floor(r() * 8999)}`,
    city: pick(cities, r),
    trips: Math.floor(r() * 3000),
    rating: Math.round((3.8 + r() * 1.2) * 10) / 10,
    online: r() > 0.45,
    status: r() > 0.9 ? "blocked" : "active",
    joined: d.toISOString(),
  };
});
