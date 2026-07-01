export const monthlyRevenue = [
  { name: "Jan", revenue: 320000, orders: 4200, target: 300000 },
  { name: "Feb", revenue: 358000, orders: 4600, target: 330000 },
  { name: "Mar", revenue: 412000, orders: 5100, target: 380000 },
  { name: "Apr", revenue: 388000, orders: 4900, target: 400000 },
  { name: "May", revenue: 485000, orders: 6200, target: 430000 },
  { name: "Jun", revenue: 524000, orders: 6800, target: 470000 },
  { name: "Jul", revenue: 498000, orders: 6400, target: 500000 },
  { name: "Aug", revenue: 562000, orders: 7100, target: 520000 },
  { name: "Sep", revenue: 611000, orders: 7600, target: 560000 },
  { name: "Oct", revenue: 648000, orders: 8000, target: 600000 },
  { name: "Nov", revenue: 702000, orders: 8700, target: 650000 },
  { name: "Dec", revenue: 786000, orders: 9500, target: 700000 },
];

export const growthSeries = [
  { name: "Jan", customers: 12000, providers: 820 },
  { name: "Feb", customers: 14500, providers: 910 },
  { name: "Mar", customers: 18200, providers: 1040 },
  { name: "Apr", customers: 21000, providers: 1160 },
  { name: "May", customers: 26800, providers: 1320 },
  { name: "Jun", customers: 31500, providers: 1480 },
  { name: "Jul", customers: 35200, providers: 1610 },
  { name: "Aug", customers: 41000, providers: 1790 },
];

export const cancellationSeries = [
  { name: "Mon", rate: 6.2 },
  { name: "Tue", rate: 5.1 },
  { name: "Wed", rate: 7.4 },
  { name: "Thu", rate: 4.8 },
  { name: "Fri", rate: 5.6 },
  { name: "Sat", rate: 8.1 },
  { name: "Sun", rate: 6.9 },
];

export const categorySplit = [
  { name: "Cleaning", value: 32, color: "var(--primary)" },
  { name: "Repairs", value: 24, color: "var(--accent)" },
  { name: "Beauty", value: 16, color: "#f59e0b" },
  { name: "Automotive", value: 14, color: "#10b981" },
  { name: "Delivery", value: 14, color: "#f43f5e" },
];

export const analyticsKpis = [
  { label: "Total Revenue", value: 5294000, display: "₹52.9L", delta: 18.6, tone: "primary" as const },
  { label: "Total Orders", value: 79100, display: "79.1K", delta: 12.4, tone: "accent" as const },
  { label: "New Customers", value: 41000, display: "41.0K", delta: 22.1, tone: "success" as const },
  { label: "Cancellation Rate", value: 6.3, display: "6.3%", delta: -1.2, tone: "warning" as const },
];
