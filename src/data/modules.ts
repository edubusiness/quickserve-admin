import type { BadgeTone } from "@/components/ui/badge";
import type { Tone } from "@/lib/tones";

// ---------------- Config types ----------------
export type CellType =
  | "text"
  | "mono"
  | "badge"
  | "currency"
  | "number"
  | "date"
  | "avatar"
  | "rating"
  | "bool";

export interface ModuleColumn {
  key: string;
  header: string;
  sortable?: boolean;
  align?: "left" | "right" | "center";
  type?: CellType;
  sub?: string;
  tones?: Record<string, BadgeTone>;
  boolLabels?: [string, string];
}

export interface ModuleStat {
  label: string;
  value: number;
  display?: string;
  tone: Tone;
}

export interface TableModule {
  kind: "table";
  title: string;
  subtitle: string;
  actionLabel?: string;
  exportName: string;
  searchKeys: string[];
  columns: ModuleColumn[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  rows: Record<string, any>[];
  stats?: ModuleStat[];
  filters?: { key: string; label: string; options: string[] };
}

export interface AnalyticsModule {
  kind: "analytics";
  title: string;
  subtitle: string;
}
export interface MapModule {
  kind: "map";
  title: string;
  subtitle: string;
}
export interface SettingsModule {
  kind: "settings";
  title: string;
  subtitle: string;
  groups: { title: string; items: { label: string; desc: string; on: boolean }[] }[];
}

export type ModuleConfig = TableModule | AnalyticsModule | MapModule | SettingsModule;

// ---------------- Deterministic helpers ----------------
function rng(seed: number) {
  let s = seed;
  return () => {
    s = (s * 1103515245 + 12345) & 0x7fffffff;
    return s / 0x7fffffff;
  };
}
const pick = <T>(a: readonly T[], r: () => number) => a[Math.floor(r() * a.length)];
const money = (r: () => number, min: number, max: number) =>
  Math.round((min + r() * (max - min)) / 10) * 10;
const daysAgoISO = (n: number) => {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString();
};
const avatar = (i: number) => `https://i.pravatar.cc/80?img=${(i % 70) + 1}`;

const firsts = ["Ravi", "Sneha", "Arjun", "Priya", "Karthik", "Meera", "Suresh", "Anjali", "Rahul", "Divya", "Vikram", "Pooja", "Amit", "Neha", "Rohan", "Kavya", "Sanjay", "Isha", "Manish", "Tara"];
const lasts = ["Kumar", "Patel", "Singh", "Sharma", "Nair", "Verma", "Gupta", "Iyer", "Reddy", "Desai", "Joshi", "Kapoor", "Mehta", "Rao"];
const cities = ["Bangalore", "Mumbai", "Delhi", "Hyderabad", "Chennai", "Pune"];
const name = (i: number, r: () => number) => `${firsts[i % firsts.length]} ${pick(lasts, r)}`;

// ---------------- Generators ----------------
function people(seed: number, idPrefix: string, extra: (r: () => number, i: number) => Record<string, unknown>, n = 18) {
  return Array.from({ length: n }, (_, i) => {
    const r = rng(seed + i);
    const nm = name(i, r);
    return {
      id: `${idPrefix}-${1001 + i}`,
      name: nm,
      avatar: avatar(i),
      email: `${nm.toLowerCase().replace(/\s+/g, ".")}@quickserve.io`,
      city: pick(cities, r),
      ...extra(r, i),
    };
  });
}

function txns(seed: number, idPrefix: string, statuses: string[], typeField: string, types: string[], n = 20) {
  return Array.from({ length: n }, (_, i) => {
    const r = rng(seed + i);
    return {
      id: `${idPrefix}-${70001 + i}`,
      party: name(i, r),
      avatar: avatar(i),
      [typeField]: pick(types, r),
      amount: money(r, 200, 9000),
      status: pick(statuses, r),
      date: daysAgoISO(Math.floor(r() * 21)),
    };
  });
}

const statusTones: Record<string, BadgeTone> = {
  active: "success", inactive: "warning", blocked: "danger", pending: "info",
  paid: "success", failed: "danger", refunded: "info", processing: "warning",
  completed: "success", scheduled: "info", cancelled: "danger", ongoing: "info",
  open: "warning", resolved: "success", closed: "neutral", escalated: "danger",
  live: "success", paused: "warning", draft: "neutral", expired: "danger",
  sent: "success", delivered: "success", queued: "warning", failed_msg: "danger",
  enabled: "success", disabled: "neutral", high: "danger", medium: "warning", low: "info",
};

// ---------------- Registry ----------------
export const moduleRegistry: Record<string, ModuleConfig> = {
  // ---- Operations ----
  "tracking": { kind: "map", title: "Live Tracking", subtitle: "Real-time positions of drivers, providers and active jobs." },
  "analytics/heatmaps": { kind: "map", title: "Heat Maps", subtitle: "Demand density and hotspots across cities." },

  "dispatch": {
    kind: "table", title: "Dispatch Center", subtitle: "Assign and route incoming jobs to the nearest partner.",
    actionLabel: "New Dispatch", exportName: "dispatch", searchKeys: ["id", "service", "agent", "city"],
    filters: { key: "status", label: "Status", options: ["all", "ongoing", "pending", "completed"] },
    columns: [
      { key: "id", header: "Job", type: "mono", sortable: true },
      { key: "service", header: "Service", sortable: true },
      { key: "agent", header: "Assigned To", type: "avatar", sub: "city", sortable: true },
      { key: "eta", header: "ETA", sortable: true },
      { key: "status", header: "Status", type: "badge", tones: statusTones, sortable: true },
    ],
    rows: Array.from({ length: 16 }, (_, i) => {
      const r = rng(700 + i);
      return { id: `JOB-${5001 + i}`, service: pick(["Home Cleaning", "Electrician", "Plumbing", "Car Service"], r), agent: name(i, r), avatar: avatar(i), city: pick(cities, r), eta: `${4 + Math.floor(r() * 25)} min`, status: pick(["ongoing", "pending", "completed"], r) };
    }),
  },

  "emergency": {
    kind: "table", title: "Emergency Requests", subtitle: "High-priority SOS requests needing immediate attention.",
    actionLabel: "Log Emergency", exportName: "emergency", searchKeys: ["id", "type", "location"],
    filters: { key: "priority", label: "Priority", options: ["all", "high", "medium", "low"] },
    stats: [
      { label: "Open SOS", value: 7, tone: "danger" }, { label: "High Priority", value: 3, tone: "danger" },
      { label: "Avg Response", value: 4, display: "4 min", tone: "warning" }, { label: "Resolved Today", value: 18, tone: "success" },
    ],
    columns: [
      { key: "id", header: "SOS", type: "mono", sortable: true },
      { key: "type", header: "Type", sortable: true },
      { key: "location", header: "Location", sortable: true },
      { key: "priority", header: "Priority", type: "badge", tones: statusTones, sortable: true },
      { key: "status", header: "Status", type: "badge", tones: statusTones, sortable: true },
      { key: "time", header: "Reported", type: "date", sortable: true },
    ],
    rows: Array.from({ length: 14 }, (_, i) => {
      const r = rng(810 + i);
      return { id: `SOS-${4587 - i}`, type: pick(["Medical Emergency", "Plumbing Burst", "Electrical Issue", "Gas Leak", "Accident"], r), location: `${pick(["Koramangala", "HSR Layout", "Indiranagar", "Whitefield"], r)}, ${pick(cities, r)}`, priority: pick(["high", "medium", "low"], r), status: pick(["open", "escalated", "resolved"], r), time: daysAgoISO(Math.floor(r() * 3)) };
    }),
  },

  "support": {
    kind: "table", title: "Support & Complaints", subtitle: "Customer tickets, complaints and resolution tracking.",
    actionLabel: "New Ticket", exportName: "support", searchKeys: ["id", "subject", "name"],
    filters: { key: "status", label: "Status", options: ["all", "open", "pending", "resolved", "closed"] },
    stats: [
      { label: "Open Tickets", value: 42, tone: "warning" }, { label: "Resolved", value: 318, tone: "success" },
      { label: "Avg Resolution", value: 6, display: "6h", tone: "accent" }, { label: "Satisfaction", value: 94, display: "94%", tone: "primary" },
    ],
    columns: [
      { key: "id", header: "Ticket", type: "mono", sortable: true },
      { key: "name", header: "Customer", type: "avatar", sub: "email", sortable: true },
      { key: "subject", header: "Subject", sortable: true },
      { key: "priority", header: "Priority", type: "badge", tones: statusTones, sortable: true },
      { key: "status", header: "Status", type: "badge", tones: statusTones, sortable: true },
      { key: "date", header: "Updated", type: "date", sortable: true },
    ],
    rows: people(900, "TKT", (r) => ({ subject: pick(["Refund not received", "Provider late", "App issue", "Wrong charge", "Service quality"], r), priority: pick(["high", "medium", "low"], r), status: pick(["open", "pending", "resolved", "closed"], r), date: daysAgoISO(Math.floor(r() * 10)) })),
  },

  "bookings/scheduled": {
    kind: "table", title: "Scheduled Bookings", subtitle: "Upcoming bookings scheduled for a future date.",
    actionLabel: "Schedule Booking", exportName: "scheduled", searchKeys: ["id", "name", "service"],
    columns: [
      { key: "id", header: "Booking", type: "mono", sortable: true },
      { key: "name", header: "Customer", type: "avatar", sub: "city", sortable: true },
      { key: "service", header: "Service", sortable: true },
      { key: "amount", header: "Amount", type: "currency", align: "right", sortable: true },
      { key: "date", header: "Scheduled For", type: "date", sortable: true },
      { key: "status", header: "Status", type: "badge", tones: statusTones, sortable: true },
    ],
    rows: people(120, "BK", (r) => ({ service: pick(["Home Cleaning", "Salon at Home", "AC Service", "Pest Control"], r), amount: money(r, 350, 4500), date: daysAgoISO(-Math.floor(r() * 14) - 1), status: "scheduled" })),
  },
  "bookings/history": {
    kind: "table", title: "Booking History", subtitle: "Completed and cancelled bookings archive.",
    actionLabel: "Add Record", exportName: "history", searchKeys: ["id", "name", "service"],
    filters: { key: "status", label: "Status", options: ["all", "completed", "cancelled"] },
    columns: [
      { key: "id", header: "Booking", type: "mono", sortable: true },
      { key: "name", header: "Customer", type: "avatar", sub: "city", sortable: true },
      { key: "service", header: "Service", sortable: true },
      { key: "amount", header: "Amount", type: "currency", align: "right", sortable: true },
      { key: "date", header: "Date", type: "date", sortable: true },
      { key: "status", header: "Status", type: "badge", tones: statusTones, sortable: true },
    ],
    rows: people(130, "BK", (r) => ({ service: pick(["Home Cleaning", "Electrician", "Plumbing", "Car Service"], r), amount: money(r, 350, 4500), date: daysAgoISO(Math.floor(r() * 60) + 1), status: pick(["completed", "completed", "cancelled"], r) })),
  },

  // ---- Users & Partners ----
  "delivery-partners": {
    kind: "table", title: "Delivery Partners", subtitle: "Last-mile delivery fleet and performance.",
    actionLabel: "Add Partner", exportName: "delivery-partners", searchKeys: ["id", "name", "city", "zone"],
    filters: { key: "status", label: "Status", options: ["all", "active", "inactive", "blocked"] },
    stats: [
      { label: "Total Partners", value: 320, tone: "primary" }, { label: "On Duty", value: 184, tone: "success" },
      { label: "Avg Rating", value: 4.6, display: "4.6", tone: "warning" }, { label: "Deliveries Today", value: 2358, tone: "accent" },
    ],
    columns: [
      { key: "name", header: "Partner", type: "avatar", sub: "id", sortable: true },
      { key: "zone", header: "Zone", sortable: true },
      { key: "deliveries", header: "Deliveries", type: "number", align: "right", sortable: true },
      { key: "rating", header: "Rating", type: "rating", sortable: true },
      { key: "status", header: "Status", type: "badge", tones: statusTones, sortable: true },
    ],
    rows: people(200, "DP", (r) => ({ zone: `Zone ${pick(["A", "B", "C", "D"], r)}`, deliveries: Math.floor(r() * 2000), rating: Math.round((3.8 + r() * 1.2) * 10) / 10, status: pick(["active", "active", "inactive", "blocked"], r) })),
  },
  "employees": {
    kind: "table", title: "Employees", subtitle: "Internal staff, departments and roles.",
    actionLabel: "Add Employee", exportName: "employees", searchKeys: ["id", "name", "department", "email"],
    filters: { key: "status", label: "Status", options: ["all", "active", "inactive"] },
    stats: [
      { label: "Headcount", value: 148, tone: "primary" }, { label: "Active", value: 139, tone: "success" },
      { label: "Departments", value: 9, tone: "accent" }, { label: "On Leave", value: 9, tone: "warning" },
    ],
    columns: [
      { key: "name", header: "Employee", type: "avatar", sub: "email", sortable: true },
      { key: "department", header: "Department", sortable: true },
      { key: "designation", header: "Designation", sortable: true },
      { key: "city", header: "Location", sortable: true },
      { key: "status", header: "Status", type: "badge", tones: statusTones, sortable: true },
    ],
    rows: people(300, "EMP", (r) => ({ department: pick(["Operations", "Support", "Finance", "Marketing", "Engineering", "HR"], r), designation: pick(["Manager", "Lead", "Associate", "Executive", "Director"], r), status: pick(["active", "active", "inactive"], r) })),
  },

  // ---- Marketplace ---- (Categories is a real API-backed page at /categories)
  "pricing": {
    kind: "table", title: "Pricing", subtitle: "Per-service base pricing, surge and tax rules.",
    actionLabel: "Add Rule", exportName: "pricing", searchKeys: ["service", "city"],
    columns: [
      { key: "service", header: "Service", sortable: true },
      { key: "city", header: "City", sortable: true },
      { key: "base", header: "Base Price", type: "currency", align: "right", sortable: true },
      { key: "surge", header: "Surge", sortable: true },
      { key: "tax", header: "Tax", sortable: true },
      { key: "status", header: "Status", type: "badge", tones: statusTones, sortable: true },
    ],
    rows: Array.from({ length: 18 }, (_, i) => {
      const r = rng(450 + i);
      return { id: `PR-${i + 1}`, service: pick(["Home Cleaning", "Electrician", "Plumbing", "Car Service", "Salon at Home"], r), city: pick(cities, r), base: money(r, 199, 2499), surge: `${(1 + r()).toFixed(1)}x`, tax: "18% GST", status: r() > 0.2 ? "active" : "draft" };
    }),
  },
  "packages": {
    kind: "table", title: "Packages", subtitle: "Bundled service packages and combos.",
    actionLabel: "Add Package", exportName: "packages", searchKeys: ["name"],
    columns: [
      { key: "name", header: "Package", sortable: true },
      { key: "items", header: "Items", type: "number", align: "right", sortable: true },
      { key: "price", header: "Price", type: "currency", align: "right", sortable: true },
      { key: "sold", header: "Sold", type: "number", align: "right", sortable: true },
      { key: "status", header: "Status", type: "badge", tones: statusTones, sortable: true },
    ],
    rows: ["Home Spa Combo", "Full Home Cleaning", "Car Care Plus", "Monthly Maintenance", "Festive Glow", "Office Setup", "Move-in Bundle", "Appliance Care"].map((nm, i) => {
      const r = rng(470 + i);
      return { id: `PKG-${i + 1}`, name: nm, items: 2 + Math.floor(r() * 6), price: money(r, 999, 9999), sold: Math.floor(r() * 800), status: r() > 0.2 ? "active" : "draft" };
    }),
  },
  "locations": {
    kind: "table", title: "Locations & Zones", subtitle: "Operational cities, zones and serviceability.",
    actionLabel: "Add Location", exportName: "locations", searchKeys: ["city", "zone"],
    columns: [
      { key: "city", header: "City", sortable: true },
      { key: "zone", header: "Zone", sortable: true },
      { key: "providers", header: "Providers", type: "number", align: "right", sortable: true },
      { key: "pincode", header: "Pincode", type: "mono", sortable: true },
      { key: "status", header: "Status", type: "badge", tones: statusTones, sortable: true },
    ],
    rows: Array.from({ length: 18 }, (_, i) => {
      const r = rng(490 + i);
      return { id: `LOC-${i + 1}`, city: pick(cities, r), zone: `Zone ${pick(["A", "B", "C", "D", "E"], r)}`, providers: 10 + Math.floor(r() * 180), pincode: `5${60000 + Math.floor(r() * 9999)}`, status: r() > 0.15 ? "active" : "inactive" };
    }),
  },
  "subscriptions": {
    kind: "table", title: "Subscriptions", subtitle: "Recurring plans and member subscriptions.",
    actionLabel: "Add Subscription", exportName: "subscriptions", searchKeys: ["id", "customer", "plan"],
    filters: { key: "status", label: "Status", options: ["all", "active", "paused", "cancelled"] },
    stats: [
      { label: "Active Subs", value: 1284, tone: "primary" }, { label: "MRR", value: 642000, display: "₹6.4L", tone: "success" },
      { label: "Churn", value: 3, display: "3.2%", tone: "danger" }, { label: "Trials", value: 86, tone: "warning" },
    ],
    columns: [
      { key: "customer", header: "Member", type: "avatar", sub: "email", sortable: true },
      { key: "plan", header: "Plan", sortable: true },
      { key: "amount", header: "Amount", type: "currency", align: "right", sortable: true },
      { key: "renews", header: "Renews", type: "date", sortable: true },
      { key: "status", header: "Status", type: "badge", tones: statusTones, sortable: true },
    ],
    rows: people(510, "SUB", (r) => ({ customer: name(Math.floor(r() * 20), r), plan: pick(["Basic", "Plus", "Premium", "Elite"], r), amount: money(r, 199, 1999), renews: daysAgoISO(-Math.floor(r() * 30) - 1), status: pick(["active", "active", "paused", "cancelled"], r) })),
  },
  "coupons": {
    kind: "table", title: "Coupons", subtitle: "Discount codes, usage and limits.",
    actionLabel: "Create Coupon", exportName: "coupons", searchKeys: ["code", "title"],
    filters: { key: "status", label: "Status", options: ["all", "active", "expired", "draft"] },
    columns: [
      { key: "code", header: "Code", type: "mono", sortable: true },
      { key: "title", header: "Description", sortable: true },
      { key: "discount", header: "Discount", sortable: true },
      { key: "used", header: "Used", type: "number", align: "right", sortable: true },
      { key: "expiry", header: "Expires", type: "date", sortable: true },
      { key: "status", header: "Status", type: "badge", tones: statusTones, sortable: true },
    ],
    rows: ["WELCOME50", "FESTIVE20", "FIRST100", "WEEKEND15", "SUMMER25", "CLEAN30", "REFER200", "CARCARE10", "NEWYEAR40", "FLASH60"].map((code, i) => {
      const r = rng(530 + i);
      return { id: `CPN-${i + 1}`, code, title: pick(["Flat off first order", "Festive discount", "Weekend special", "Referral bonus", "Category deal"], r), discount: r() > 0.5 ? `${10 + Math.floor(r() * 50)}%` : `₹${money(r, 50, 300)}`, used: Math.floor(r() * 5000), expiry: daysAgoISO(-Math.floor(r() * 40)), status: pick(["active", "active", "expired", "draft"], r) };
    }),
  },
  "offers": {
    kind: "table", title: "Offers", subtitle: "Promotional offers and banners.",
    actionLabel: "Create Offer", exportName: "offers", searchKeys: ["title", "type"],
    filters: { key: "status", label: "Status", options: ["all", "live", "paused", "expired"] },
    columns: [
      { key: "title", header: "Offer", sortable: true },
      { key: "type", header: "Type", sortable: true },
      { key: "audience", header: "Audience", sortable: true },
      { key: "redeemed", header: "Redeemed", type: "number", align: "right", sortable: true },
      { key: "status", header: "Status", type: "badge", tones: statusTones, sortable: true },
    ],
    rows: ["Monsoon Mega Sale", "New User Bonanza", "Weekend Flash", "Referral Rewards", "Premium Upgrade", "City Launch Offer", "Loyalty Boost", "Combo Deal"].map((title, i) => {
      const r = rng(560 + i);
      return { id: `OFR-${i + 1}`, title, type: pick(["Percentage", "Flat", "BOGO", "Cashback"], r), audience: pick(["All Users", "New Users", "Premium", "Lapsed"], r), redeemed: Math.floor(r() * 8000), status: pick(["live", "live", "paused", "expired"], r) };
    }),
  },
  "campaigns": {
    kind: "table", title: "Campaigns", subtitle: "Multi-channel marketing campaigns.",
    actionLabel: "New Campaign", exportName: "campaigns", searchKeys: ["name", "channel"],
    filters: { key: "status", label: "Status", options: ["all", "live", "draft", "completed"] },
    columns: [
      { key: "name", header: "Campaign", sortable: true },
      { key: "channel", header: "Channel", sortable: true },
      { key: "reach", header: "Reach", type: "number", align: "right", sortable: true },
      { key: "ctr", header: "CTR", sortable: true },
      { key: "spend", header: "Spend", type: "currency", align: "right", sortable: true },
      { key: "status", header: "Status", type: "badge", tones: statusTones, sortable: true },
    ],
    rows: ["Diwali Blast", "Summer Push", "Win-back Q3", "Brand Awareness", "App Install Drive", "Premium Launch", "City Expansion", "Loyalty Drive"].map((nm, i) => {
      const r = rng(590 + i);
      return { id: `CMP-${i + 1}`, name: nm, channel: pick(["Email", "SMS", "Push", "WhatsApp", "Multi"], r), reach: 1000 + Math.floor(r() * 90000), ctr: `${(1 + r() * 8).toFixed(1)}%`, spend: money(r, 5000, 90000), status: pick(["live", "draft", "completed"], r) };
    }),
  },

  // ---- Finance ----
  "wallets": {
    kind: "table", title: "Wallets", subtitle: "Customer & partner wallet balances and ledger.",
    actionLabel: "Adjust Wallet", exportName: "wallets", searchKeys: ["id", "party"],
    stats: [
      { label: "Total Float", value: 1840000, display: "₹18.4L", tone: "primary" }, { label: "Credited Today", value: 96000, display: "₹96K", tone: "success" },
      { label: "Debited Today", value: 72000, display: "₹72K", tone: "warning" }, { label: "Active Wallets", value: 4210, tone: "accent" },
    ],
    columns: [
      { key: "party", header: "Holder", type: "avatar", sub: "id", sortable: true },
      { key: "balance", header: "Balance", type: "currency", align: "right", sortable: true },
      { key: "credited", header: "Credited", type: "currency", align: "right", sortable: true },
      { key: "debited", header: "Debited", type: "currency", align: "right", sortable: true },
      { key: "status", header: "Status", type: "badge", tones: statusTones, sortable: true },
    ],
    rows: people(610, "WAL", (r) => ({ party: name(Math.floor(r() * 20), r), balance: money(r, 0, 25000), credited: money(r, 100, 40000), debited: money(r, 100, 30000), status: r() > 0.1 ? "active" : "inactive" })),
  },
  "invoices": {
    kind: "table", title: "Invoices", subtitle: "Generated invoices and their payment status.",
    actionLabel: "Create Invoice", exportName: "invoices", searchKeys: ["id", "party", "type"],
    filters: { key: "status", label: "Status", options: ["all", "paid", "pending", "refunded"] },
    columns: [
      { key: "id", header: "Invoice", type: "mono", sortable: true },
      { key: "party", header: "Billed To", type: "avatar", sortable: true },
      { key: "type", header: "Type", sortable: true },
      { key: "amount", header: "Amount", type: "currency", align: "right", sortable: true },
      { key: "status", header: "Status", type: "badge", tones: statusTones, sortable: true },
      { key: "date", header: "Date", type: "date", sortable: true },
    ],
    rows: txns(620, "INV", ["paid", "pending", "refunded"], "type", ["Service", "Subscription", "Commission", "Penalty"]),
  },
  "settlements": {
    kind: "table", title: "Settlements", subtitle: "Provider & driver payout settlements.",
    actionLabel: "New Settlement", exportName: "settlements", searchKeys: ["id", "party"],
    filters: { key: "status", label: "Status", options: ["all", "paid", "processing", "pending"] },
    stats: [
      { label: "Settled (MTD)", value: 2940000, display: "₹29.4L", tone: "success" }, { label: "Pending", value: 184000, display: "₹1.8L", tone: "warning" },
      { label: "Partners Paid", value: 612, tone: "primary" }, { label: "Next Cycle", value: 3, display: "3 days", tone: "accent" },
    ],
    columns: [
      { key: "id", header: "Settlement", type: "mono", sortable: true },
      { key: "party", header: "Partner", type: "avatar", sortable: true },
      { key: "type", header: "Method", sortable: true },
      { key: "amount", header: "Amount", type: "currency", align: "right", sortable: true },
      { key: "status", header: "Status", type: "badge", tones: statusTones, sortable: true },
      { key: "date", header: "Date", type: "date", sortable: true },
    ],
    rows: txns(630, "STL", ["paid", "processing", "pending"], "type", ["Bank Transfer", "UPI", "IMPS"]),
  },
  "commissions": {
    kind: "table", title: "Commissions", subtitle: "Platform commission earned per booking.",
    actionLabel: "Add Commission", exportName: "commissions", searchKeys: ["id", "party"],
    columns: [
      { key: "id", header: "Ref", type: "mono", sortable: true },
      { key: "party", header: "Provider", type: "avatar", sortable: true },
      { key: "type", header: "Category", sortable: true },
      { key: "amount", header: "Commission", type: "currency", align: "right", sortable: true },
      { key: "date", header: "Date", type: "date", sortable: true },
    ],
    rows: txns(640, "COM", ["paid"], "type", ["Cleaning", "Repairs", "Beauty", "Automotive"]),
  },
  "refunds": {
    kind: "table", title: "Refunds", subtitle: "Customer refunds and their processing status.",
    actionLabel: "Issue Refund", exportName: "refunds", searchKeys: ["id", "party"],
    filters: { key: "status", label: "Status", options: ["all", "processing", "completed", "failed"] },
    columns: [
      { key: "id", header: "Refund", type: "mono", sortable: true },
      { key: "party", header: "Customer", type: "avatar", sortable: true },
      { key: "type", header: "Reason", sortable: true },
      { key: "amount", header: "Amount", type: "currency", align: "right", sortable: true },
      { key: "status", header: "Status", type: "badge", tones: statusTones, sortable: true },
      { key: "date", header: "Date", type: "date", sortable: true },
    ],
    rows: txns(650, "RFD", ["processing", "completed", "failed"], "type", ["Cancelled", "Service Issue", "Overcharge", "Duplicate"]),
  },
  "reports": {
    kind: "table", title: "Reports", subtitle: "Generated financial and operational reports.",
    actionLabel: "Generate Report", exportName: "reports", searchKeys: ["name", "type"],
    columns: [
      { key: "name", header: "Report", sortable: true },
      { key: "type", header: "Type", sortable: true },
      { key: "period", header: "Period", sortable: true },
      { key: "size", header: "Size", sortable: true },
      { key: "date", header: "Generated", type: "date", sortable: true },
    ],
    rows: ["Monthly Revenue", "GST Summary", "Provider Payouts", "Booking Trends", "Refund Log", "City Performance", "Commission Report", "Churn Analysis"].map((nm, i) => {
      const r = rng(660 + i);
      return { id: `RPT-${i + 1}`, name: nm, type: pick(["Financial", "Operational", "Tax", "Analytics"], r), period: pick(["May 2025", "Q2 2025", "April 2025", "YTD"], r), size: `${(0.2 + r() * 4).toFixed(1)} MB`, date: daysAgoISO(Math.floor(r() * 30)) };
    }),
  },

  // ---- Marketing channels ----
  ...marketingModule("marketing/notifications", "In-App Notifications", "Push in-app notifications to user segments."),
  ...marketingModule("marketing/email", "Email Campaigns", "Compose and track email campaigns."),
  ...marketingModule("marketing/sms", "SMS", "Bulk SMS broadcasts and delivery reports."),
  ...marketingModule("marketing/whatsapp", "WhatsApp", "WhatsApp Business message campaigns."),
  ...marketingModule("marketing/push", "Push Notifications", "Mobile push notification campaigns."),

  // ---- Analytics ----
  "analytics/orders": { kind: "analytics", title: "Order Analytics", subtitle: "Volume, trends and fulfilment metrics." },
  "analytics/customers": { kind: "analytics", title: "Customer Analytics", subtitle: "Acquisition, retention and growth." },
  "analytics/providers": { kind: "analytics", title: "Provider Analytics", subtitle: "Supply, utilisation and performance." },
  "analytics/ai": { kind: "analytics", title: "AI Insights", subtitle: "Predictive demand, revenue forecasts and anomalies." },

  // ---- Platform ----
  "cms": {
    kind: "table", title: "CMS & Pages", subtitle: "Manage marketing pages, blogs and content blocks.",
    actionLabel: "New Page", exportName: "cms", searchKeys: ["title", "type"],
    filters: { key: "status", label: "Status", options: ["all", "active", "draft"] },
    columns: [
      { key: "title", header: "Page", sortable: true },
      { key: "type", header: "Type", sortable: true },
      { key: "slug", header: "Slug", type: "mono", sortable: true },
      { key: "status", header: "Status", type: "badge", tones: statusTones, sortable: true },
      { key: "date", header: "Updated", type: "date", sortable: true },
    ],
    rows: ["Home", "About Us", "Terms of Service", "Privacy Policy", "FAQ", "Careers", "Blog: Cleaning Tips", "Refund Policy", "Contact", "Partner With Us"].map((t, i) => {
      const r = rng(680 + i);
      return { id: `PG-${i + 1}`, title: t, type: pick(["Page", "Legal", "Blog", "Landing"], r), slug: `/${t.toLowerCase().replace(/[^a-z]+/g, "-")}`, status: r() > 0.25 ? "active" : "draft", date: daysAgoISO(Math.floor(r() * 40)) };
    }),
  },
  "roles": {
    kind: "table", title: "Roles & Permissions", subtitle: "Access roles and their assigned permissions.",
    actionLabel: "Add Role", exportName: "roles", searchKeys: ["name"],
    columns: [
      { key: "name", header: "Role", sortable: true },
      { key: "users", header: "Users", type: "number", align: "right", sortable: true },
      { key: "permissions", header: "Permissions", type: "number", align: "right", sortable: true },
      { key: "scope", header: "Scope", sortable: true },
      { key: "status", header: "Status", type: "badge", tones: statusTones, sortable: true },
    ],
    rows: [["Super Admin", 3, 48, "Global"], ["Admin", 12, 36, "Global"], ["Ops Manager", 28, 22, "Regional"], ["Support Agent", 64, 12, "Tickets"], ["Finance", 9, 18, "Finance"], ["Marketing", 14, 14, "Campaigns"], ["Auditor", 4, 8, "Read-only"]].map((row, i) => ({ id: `ROLE-${i + 1}`, name: row[0], users: row[1], permissions: row[2], scope: row[3], status: "active" })),
  },
  "audit": {
    kind: "table", title: "Audit Logs", subtitle: "Security and admin action audit trail.",
    exportName: "audit", searchKeys: ["user", "action", "target"],
    columns: [
      { key: "user", header: "User", type: "avatar", sub: "ip", sortable: true },
      { key: "action", header: "Action", sortable: true },
      { key: "target", header: "Target", type: "mono", sortable: true },
      { key: "level", header: "Level", type: "badge", tones: statusTones, sortable: true },
      { key: "date", header: "Time", type: "date", sortable: true },
    ],
    rows: people(690, "LOG", (r) => ({ ip: `103.${Math.floor(r() * 255)}.${Math.floor(r() * 255)}.${Math.floor(r() * 255)}`, action: pick(["Logged in", "Updated booking", "Deleted coupon", "Changed role", "Issued refund", "Exported report"], r), target: pick(["BK-12458", "CPN-3", "USR-12", "RFD-700", "RPT-2"], r), level: pick(["low", "medium", "high"], r), date: daysAgoISO(Math.floor(r() * 7)) })),
  },
  "api-management": {
    kind: "table", title: "API Management", subtitle: "API keys, usage and rate limits.",
    actionLabel: "Generate Key", exportName: "api-keys", searchKeys: ["name", "key"],
    columns: [
      { key: "name", header: "Key Name", sortable: true },
      { key: "key", header: "Key", type: "mono", sortable: true },
      { key: "scope", header: "Scope", sortable: true },
      { key: "calls", header: "Calls (24h)", type: "number", align: "right", sortable: true },
      { key: "status", header: "Status", type: "badge", tones: statusTones, sortable: true },
    ],
    rows: ["Mobile App", "Partner Portal", "Web Checkout", "Analytics ETL", "Webhook Sender", "Internal Ops"].map((nm, i) => {
      const r = rng(700 + i * 3);
      return { id: `KEY-${i + 1}`, name: nm, key: `qs_live_${Math.random().toString(36).slice(2, 10)}`, scope: pick(["read", "read+write", "admin"], r), calls: Math.floor(r() * 90000), status: r() > 0.2 ? "active" : "disabled" };
    }),
  },
  "integrations": {
    kind: "table", title: "Integrations", subtitle: "Connected third-party services.",
    actionLabel: "Add Integration", exportName: "integrations", searchKeys: ["name", "category"],
    columns: [
      { key: "name", header: "Service", sortable: true },
      { key: "category", header: "Category", sortable: true },
      { key: "account", header: "Account", type: "mono", sortable: true },
      { key: "status", header: "Status", type: "badge", tones: statusTones, sortable: true },
    ],
    rows: [["Razorpay", "Payments"], ["Stripe", "Payments"], ["Twilio", "SMS"], ["SendGrid", "Email"], ["Google Maps", "Maps"], ["Cloudinary", "Media"], ["Firebase", "Push"], ["Segment", "Analytics"], ["Slack", "Alerts"]].map((row, i) => {
      const r = rng(720 + i);
      return { id: `INT-${i + 1}`, name: row[0], category: row[1], account: `acct_${Math.random().toString(36).slice(2, 8)}`, status: r() > 0.25 ? "enabled" : "disabled" };
    }),
  },

  // ---- Settings-style ----
  "security": {
    kind: "settings", title: "Security", subtitle: "Authentication, access and threat protection.",
    groups: [
      { title: "Authentication", items: [
        { label: "Two-factor authentication", desc: "Require 2FA for all admins.", on: true },
        { label: "Single sign-on (SSO)", desc: "Allow Google Workspace login.", on: false },
        { label: "Password rotation", desc: "Force password reset every 90 days.", on: true },
      ] },
      { title: "Access & Protection", items: [
        { label: "IP allowlist", desc: "Restrict console access by IP.", on: false },
        { label: "Brute-force protection", desc: "Lock after 5 failed attempts.", on: true },
        { label: "Audit logging", desc: "Record all admin actions.", on: true },
      ] },
    ],
  },
  "backup": {
    kind: "settings", title: "Backup & Restore", subtitle: "Automated backups and disaster recovery.",
    groups: [
      { title: "Automated Backups", items: [
        { label: "Daily database backup", desc: "Snapshot at 02:00 IST daily.", on: true },
        { label: "Weekly full backup", desc: "Full system backup every Sunday.", on: true },
        { label: "Offsite replication", desc: "Replicate to secondary region.", on: false },
      ] },
      { title: "Retention", items: [
        { label: "30-day retention", desc: "Keep daily backups for 30 days.", on: true },
        { label: "Encrypt backups", desc: "AES-256 encryption at rest.", on: true },
      ] },
    ],
  },
};

function marketingModule(key: string, title: string, subtitle: string): Record<string, ModuleConfig> {
  const channel = title.split(" ")[0];
  const r0 = rng(key.length * 17);
  return {
    [key]: {
      kind: "table", title, subtitle, actionLabel: "New Message", exportName: key.replace("/", "-"),
      searchKeys: ["title", "audience"],
      filters: { key: "status", label: "Status", options: ["all", "sent", "queued", "draft"] },
      stats: [
        { label: "Sent (MTD)", value: 124000, display: "124K", tone: "primary" },
        { label: "Delivery Rate", value: 97, display: "97%", tone: "success" },
        { label: "Open Rate", value: 38, display: "38%", tone: "accent" },
        { label: "Campaigns", value: 24, tone: "warning" },
      ],
      columns: [
        { key: "title", header: "Message", sortable: true },
        { key: "audience", header: "Audience", sortable: true },
        { key: "sent", header: "Sent", type: "number", align: "right", sortable: true },
        { key: "rate", header: "Delivered", sortable: true },
        { key: "status", header: "Status", type: "badge", tones: statusTones, sortable: true },
        { key: "date", header: "Date", type: "date", sortable: true },
      ],
      rows: Array.from({ length: 14 }, (_, i) => {
        const r = rng(key.length * 31 + i);
        return { id: `${channel.slice(0, 3).toUpperCase()}-${100 + i}`, title: `${channel} · ${pick(["Welcome series", "Festive promo", "Win-back", "Order update", "Feedback request", "New service"], r)}`, audience: pick(["All Users", "New Users", "Premium", "Lapsed", "City: Bangalore"], r), sent: 500 + Math.floor(r() * 60000), rate: `${(90 + r() * 9).toFixed(1)}%`, status: pick(["sent", "sent", "queued", "draft"], r), date: daysAgoISO(Math.floor(r() * 20)) };
      }),
    },
  };
}

/** Resolve a catch-all slug array to a module config (or undefined). */
export function resolveModule(slug: string[]): ModuleConfig | undefined {
  return moduleRegistry[slug.join("/")];
}
