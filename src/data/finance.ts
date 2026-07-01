const names = [
  "Ravi Kumar", "Sneha Patel", "Arjun Singh", "Priya Sharma", "Karthik R",
  "Meera Nair", "Suresh Kumar", "Anjali Verma", "Rahul Gupta", "Divya Iyer",
  "Vikram Reddy", "Pooja Desai", "Amit Joshi", "Neha Kapoor", "Rohan Mehta",
];
const methods = ["UPI", "Credit Card", "Debit Card", "Net Banking", "Wallet"] as const;
const services = ["Home Cleaning", "Electrician", "Plumbing", "Car Service", "Salon at Home", "AC Service"];

function rng(seed: number) {
  let s = seed;
  return () => {
    s = (s * 1103515245 + 12345) & 0x7fffffff;
    return s / 0x7fffffff;
  };
}
const pick = <T,>(a: T[] | readonly T[], r: () => number) => a[Math.floor(r() * a.length)];

export type PaymentStatus = "success" | "pending" | "failed" | "refunded";

export interface Payment {
  id: string;
  customer: string;
  avatar: string;
  service: string;
  method: (typeof methods)[number];
  amount: number;
  fee: number;
  status: PaymentStatus;
  date: string;
}

const statuses: PaymentStatus[] = ["success", "success", "success", "pending", "failed", "refunded"];

export const payments: Payment[] = Array.from({ length: 60 }, (_, i) => {
  const r = rng(i + 91);
  const amount = Math.round((250 + r() * 6000) / 10) * 10;
  const d = new Date(2025, 4, 28, 9 + Math.floor(r() * 12), Math.floor(r() * 60));
  d.setDate(d.getDate() - Math.floor(r() * 14));
  return {
    id: `TXN-${78451 - i}`,
    customer: names[i % names.length],
    avatar: `https://i.pravatar.cc/80?img=${(i % 70) + 1}`,
    service: pick(services, r),
    method: pick(methods, r),
    amount,
    fee: Math.round(amount * 0.02),
    status: pick(statuses, r),
    date: d.toISOString(),
  };
});

export const paymentSummary = (() => {
  const success = payments.filter((p) => p.status === "success");
  const gross = success.reduce((a, p) => a + p.amount, 0);
  const fees = success.reduce((a, p) => a + p.fee, 0);
  return {
    gross,
    net: gross - fees,
    fees,
    pending: payments.filter((p) => p.status === "pending").length,
    failed: payments.filter((p) => p.status === "failed").length,
    refunded: payments.filter((p) => p.status === "refunded").length,
  };
})();
