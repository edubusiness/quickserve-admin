import {
  IndianRupee,
  CalendarCheck,
  Briefcase,
  Car,
  PackageCheck,
  ShoppingCart,
  UserPlus,
  CreditCard,
  CheckCircle2,
  Clock,
  Wrench,
  Home,
  Zap,
  Droplets,
  UtensilsCrossed,
  Flame,
  TrendingUp,
  AlarmClock,
  Plus,
  UserPlus2,
  CarFront,
  CalendarPlus,
  Send,
  Gift,
  FileBarChart,
  Settings2,
  Sparkles,
} from "lucide-react";
import type {
  KpiStat,
  Booking,
  ActivityItem,
  TopService,
  CityStat,
  SosRequest,
  InsightItem,
  QuickAction,
  MapMarker,
} from "@/types";

const spark = (seed: number) =>
  Array.from({ length: 16 }, (_, i) =>
    Math.round(40 + Math.sin(i / 2 + seed) * 18 + (i * seed) % 11),
  );

export const kpis: KpiStat[] = [
  {
    id: "revenue",
    label: "Total Revenue",
    value: 485230,
    display: "₹4,85,230",
    delta: 18.6,
    trend: "up",
    caption: "vs last month",
    icon: IndianRupee,
    tone: "primary",
    spark: spark(1),
  },
  {
    id: "bookings",
    label: "Active Bookings",
    value: 1248,
    display: "1,248",
    delta: 12.7,
    trend: "up",
    caption: "vs yesterday",
    icon: CalendarCheck,
    tone: "accent",
    spark: spark(3),
  },
  {
    id: "providers",
    label: "Providers Online",
    value: 658,
    display: "658",
    delta: 8.3,
    trend: "up",
    caption: "vs yesterday",
    icon: Briefcase,
    tone: "success",
    spark: spark(5),
  },
  {
    id: "drivers",
    label: "Drivers Online",
    value: 412,
    display: "412",
    delta: 5.1,
    trend: "up",
    caption: "vs yesterday",
    icon: Car,
    tone: "warning",
    spark: spark(7),
  },
  {
    id: "delivered",
    label: "Orders Delivered",
    value: 2358,
    display: "2,358",
    delta: 14.2,
    trend: "up",
    caption: "vs yesterday",
    icon: PackageCheck,
    tone: "accent",
    spark: spark(9),
  },
];

export const secondaryKpis: KpiStat[] = [
  {
    id: "customers",
    label: "Customers",
    value: 2400000,
    display: "2.4M",
    delta: 4.8,
    trend: "up",
    caption: "total",
    icon: ShoppingCart,
    tone: "primary",
    spark: spark(2),
  },
  {
    id: "pending",
    label: "Pending Requests",
    value: 114,
    display: "114",
    delta: 2.1,
    trend: "down",
    caption: "needs review",
    icon: Clock,
    tone: "warning",
    spark: spark(4),
  },
  {
    id: "rating",
    label: "Average Rating",
    value: 4.8,
    display: "4.8",
    delta: 0.3,
    trend: "up",
    caption: "across services",
    icon: UserPlus,
    tone: "success",
    spark: spark(6),
  },
];

export const revenueSeries = [
  { name: "Mon", revenue: 42000, bookings: 320, prev: 38000 },
  { name: "Tue", revenue: 52000, bookings: 410, prev: 41000 },
  { name: "Wed", revenue: 48000, bookings: 380, prev: 44000 },
  { name: "Thu", revenue: 61000, bookings: 470, prev: 49000 },
  { name: "Fri", revenue: 72000, bookings: 540, prev: 58000 },
  { name: "Sat", revenue: 88000, bookings: 690, prev: 70000 },
  { name: "Sun", revenue: 79000, bookings: 610, prev: 66000 },
];

export const recentBookings: Booking[] = [
  { id: "BK-12458", customer: "Ravi Kumar", service: "Home Cleaning", avatar: "https://i.pravatar.cc/80?img=12", time: "10:30 AM", status: "ongoing" },
  { id: "BK-12457", customer: "Sneha Patel", service: "Electrician", avatar: "https://i.pravatar.cc/80?img=45", time: "10:20 AM", status: "completed" },
  { id: "BK-12456", customer: "Arjun Singh", service: "Car Service", avatar: "https://i.pravatar.cc/80?img=33", time: "10:15 AM", status: "pending" },
  { id: "BK-12455", customer: "Priya Sharma", service: "Food Delivery", avatar: "https://i.pravatar.cc/80?img=20", time: "10:10 AM", status: "ongoing" },
  { id: "BK-12454", customer: "Karthik R", service: "Plumbing", avatar: "https://i.pravatar.cc/80?img=8", time: "10:05 AM", status: "pending" },
  { id: "BK-12453", customer: "Meera Nair", service: "Salon at Home", avatar: "https://i.pravatar.cc/80?img=24", time: "09:58 AM", status: "completed" },
];

export const activityFeed: ActivityItem[] = [
  { id: "a1", title: "New booking received", detail: "#BK-12459 for Plumbing", time: "2 min ago", icon: ShoppingCart, tone: "primary" },
  { id: "a2", title: "Provider accepted", detail: "Ravi Kumar accepted the booking", time: "3 min ago", icon: CheckCircle2, tone: "success" },
  { id: "a3", title: "Driver on the way", detail: "Arjun Singh is on the way", time: "5 min ago", icon: Car, tone: "accent" },
  { id: "a4", title: "Service in progress", detail: "Home Cleaning in progress", time: "15 min ago", icon: Wrench, tone: "warning" },
  { id: "a5", title: "Payment received", detail: "₹850 received from Suresh Kumar", time: "20 min ago", icon: CreditCard, tone: "success" },
];

export const topServices: TopService[] = [
  { name: "Home Cleaning", bookings: 1248, delta: 24.5, icon: Home },
  { name: "Electrician", bookings: 1128, delta: 18.3, icon: Zap },
  { name: "Plumbing", bookings: 985, delta: 15.6, icon: Droplets },
  { name: "Car Service", bookings: 873, delta: 12.7, icon: Car },
  { name: "Food Delivery", bookings: 765, delta: 11.2, icon: UtensilsCrossed },
];

export const cityStats: CityStat[] = [
  { city: "Bangalore", bookings: 2586, delta: 18.6, share: 1 },
  { city: "Mumbai", bookings: 1245, delta: 14.2, share: 0.78 },
  { city: "Delhi", bookings: 1102, delta: 11.5, share: 0.7 },
  { city: "Hyderabad", bookings: 985, delta: 10.3, share: 0.6 },
  { city: "Chennai", bookings: 875, delta: 9.8, share: 0.52 },
];

export const sosRequests: SosRequest[] = [
  { id: "SOS-4587", title: "Medical Emergency", location: "Koramangala, Bangalore", priority: "high", time: "2 min ago" },
  { id: "SOS-4586", title: "Plumbing Burst", location: "HSR Layout, Bangalore", priority: "medium", time: "7 min ago" },
  { id: "SOS-4585", title: "Electrical Issue", location: "Indiranagar, Bangalore", priority: "medium", time: "15 min ago" },
];

export const aiInsights: InsightItem[] = [
  { id: "i1", title: "High demand for Home Cleaning", detail: "In Bangalore — increase providers", icon: Flame },
  { id: "i2", title: "Peak hours today", detail: "10 AM – 1 PM and 6 PM – 9 PM", icon: AlarmClock },
  { id: "i3", title: "Potential revenue", detail: "₹6,25,000 expected tomorrow", icon: TrendingUp },
];

export const quickActions: QuickAction[] = [
  { label: "Add Service", icon: Plus, gradient: "from-violet-500 to-purple-600", href: "/services?new=1" },
  { label: "Add Provider", icon: UserPlus2, gradient: "from-sky-500 to-blue-600", href: "/providers?new=1" },
  { label: "Add Driver", icon: CarFront, gradient: "from-rose-500 to-pink-600", href: "/drivers?new=1" },
  { label: "Create Booking", icon: CalendarPlus, gradient: "from-amber-500 to-orange-600", href: "/bookings?new=1" },
  { label: "Send Notification", icon: Send, gradient: "from-emerald-500 to-teal-600", href: "/marketing/notifications?new=1" },
  { label: "Create Offer", icon: Gift, gradient: "from-fuchsia-500 to-pink-600", href: "/offers?new=1" },
  { label: "Generate Report", icon: FileBarChart, gradient: "from-cyan-500 to-sky-600", href: "/reports?new=1" },
  { label: "System Settings", icon: Settings2, gradient: "from-slate-500 to-slate-700", href: "/settings" },
];

export const todaySummary = [
  { label: "Bookings", value: "1,248", pct: 65, tone: "accent" as const },
  { label: "Completed", value: "1,002", pct: 80, tone: "success" as const },
  { label: "Cancelled", value: "132", pct: 10, tone: "danger" as const },
  { label: "Pending", value: "114", pct: 9, tone: "warning" as const },
  { label: "Revenue", value: "₹4,85,230", pct: 72, tone: "primary" as const },
];

export const mapMarkers: MapMarker[] = [
  { id: "m1", type: "driver", x: 42, y: 18, tone: "success", avatar: "https://i.pravatar.cc/80?img=12" },
  { id: "m2", type: "provider", x: 70, y: 22, tone: "accent" },
  { id: "m3", type: "customer", x: 22, y: 35, tone: "primary", avatar: "https://i.pravatar.cc/80?img=45" },
  { id: "m4", type: "driver", x: 58, y: 40, tone: "warning" },
  { id: "m5", type: "provider", x: 80, y: 48, tone: "danger", avatar: "https://i.pravatar.cc/80?img=33" },
  { id: "m6", type: "customer", x: 35, y: 58, tone: "primary", avatar: "https://i.pravatar.cc/80?img=20" },
  { id: "m7", type: "driver", x: 64, y: 62, tone: "accent" },
  { id: "m8", type: "provider", x: 48, y: 72, tone: "success", avatar: "https://i.pravatar.cc/80?img=8" },
];

export const profileStats = { cities: "125", providers: "15,785", customers: "2.4M" };

export const aiBadge = Sparkles;
