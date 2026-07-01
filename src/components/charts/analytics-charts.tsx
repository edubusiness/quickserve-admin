"use client";

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Legend,
} from "recharts";
import {
  monthlyRevenue,
  growthSeries,
  cancellationSeries,
  categorySplit,
} from "@/data/analytics";
import { formatCurrency, formatNumber } from "@/lib/utils";

const axis = { tickLine: false, axisLine: false, tick: { fill: "var(--muted-foreground)", fontSize: 12 } };
const grid = <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />;

function Box({ children, label }: { children: React.ReactNode; label?: string }) {
  return (
    <div className="glass rounded-xl px-3 py-2 text-xs shadow-xl">
      {label && <p className="mb-1 font-semibold text-card-foreground">{label}</p>}
      {children}
    </div>
  );
}

export function RevenueBarChart({ height = 300 }: { height?: number }) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={monthlyRevenue} margin={{ top: 10, right: 8, bottom: 0, left: -8 }}>
        <defs>
          <linearGradient id="bar-rev" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--primary)" />
            <stop offset="100%" stopColor="var(--accent)" stopOpacity={0.5} />
          </linearGradient>
        </defs>
        {grid}
        <XAxis dataKey="name" {...axis} />
        <YAxis {...axis} width={48} tickFormatter={(v) => formatCurrency(v, true)} />
        <Tooltip
          cursor={{ fill: "color-mix(in srgb, var(--primary) 8%, transparent)" }}
          content={({ active, payload, label }: any) =>
            active && payload?.length ? (
              <Box label={label}>
                <p className="text-muted-foreground">
                  Revenue:{" "}
                  <span className="font-medium text-card-foreground">
                    {formatCurrency(payload[0].value, true)}
                  </span>
                </p>
              </Box>
            ) : null
          }
        />
        <Bar dataKey="revenue" fill="url(#bar-rev)" radius={[6, 6, 0, 0]} animationDuration={900} />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function OrdersAreaChart({ height = 260 }: { height?: number }) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={monthlyRevenue} margin={{ top: 10, right: 8, bottom: 0, left: -8 }}>
        <defs>
          <linearGradient id="orders" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--accent)" stopOpacity={0.5} />
            <stop offset="100%" stopColor="var(--accent)" stopOpacity={0} />
          </linearGradient>
        </defs>
        {grid}
        <XAxis dataKey="name" {...axis} />
        <YAxis {...axis} width={40} tickFormatter={(v) => formatNumber(v, true)} />
        <Tooltip
          content={({ active, payload, label }: any) =>
            active && payload?.length ? (
              <Box label={label}>
                <p className="text-muted-foreground">
                  Orders:{" "}
                  <span className="font-medium text-card-foreground">
                    {formatNumber(payload[0].value)}
                  </span>
                </p>
              </Box>
            ) : null
          }
        />
        <Area type="monotone" dataKey="orders" stroke="var(--accent)" strokeWidth={2.5} fill="url(#orders)" animationDuration={1000} />
      </AreaChart>
    </ResponsiveContainer>
  );
}

export function GrowthLineChart({ height = 260 }: { height?: number }) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={growthSeries} margin={{ top: 10, right: 8, bottom: 0, left: -8 }}>
        {grid}
        <XAxis dataKey="name" {...axis} />
        <YAxis {...axis} width={44} tickFormatter={(v) => formatNumber(v, true)} />
        <Tooltip
          content={({ active, payload, label }: any) =>
            active && payload?.length ? (
              <Box label={label}>
                {payload.map((p: any) => (
                  <p key={p.dataKey} className="flex items-center gap-2 capitalize text-muted-foreground">
                    <span className="h-2 w-2 rounded-full" style={{ background: p.color }} />
                    {p.dataKey}:{" "}
                    <span className="font-medium text-card-foreground">{formatNumber(p.value)}</span>
                  </p>
                ))}
              </Box>
            ) : null
          }
        />
        <Legend wrapperStyle={{ fontSize: 12, textTransform: "capitalize" }} />
        <Line type="monotone" dataKey="customers" stroke="var(--primary)" strokeWidth={2.5} dot={false} animationDuration={1000} />
        <Line type="monotone" dataKey="providers" stroke="#f59e0b" strokeWidth={2.5} dot={false} animationDuration={1100} />
      </LineChart>
    </ResponsiveContainer>
  );
}

export function CancellationChart({ height = 260 }: { height?: number }) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={cancellationSeries} margin={{ top: 10, right: 8, bottom: 0, left: -8 }}>
        <defs>
          <linearGradient id="cancel" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--danger)" stopOpacity={0.45} />
            <stop offset="100%" stopColor="var(--danger)" stopOpacity={0} />
          </linearGradient>
        </defs>
        {grid}
        <XAxis dataKey="name" {...axis} />
        <YAxis {...axis} width={36} tickFormatter={(v) => `${v}%`} />
        <Tooltip
          content={({ active, payload, label }: any) =>
            active && payload?.length ? (
              <Box label={label}>
                <p className="text-muted-foreground">
                  Cancellation:{" "}
                  <span className="font-medium text-card-foreground">{payload[0].value}%</span>
                </p>
              </Box>
            ) : null
          }
        />
        <Area type="monotone" dataKey="rate" stroke="var(--danger)" strokeWidth={2.5} fill="url(#cancel)" animationDuration={1000} />
      </AreaChart>
    </ResponsiveContainer>
  );
}

export function CategoryDonut({ height = 260 }: { height?: number }) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <PieChart>
        <Tooltip
          content={({ active, payload }: any) =>
            active && payload?.length ? (
              <Box>
                <p className="text-muted-foreground">
                  {payload[0].name}:{" "}
                  <span className="font-medium text-card-foreground">{payload[0].value}%</span>
                </p>
              </Box>
            ) : null
          }
        />
        <Pie
          data={categorySplit}
          dataKey="value"
          nameKey="name"
          innerRadius={60}
          outerRadius={95}
          paddingAngle={3}
          stroke="none"
          animationDuration={900}
        >
          {categorySplit.map((c) => (
            <Cell key={c.name} fill={c.color} />
          ))}
        </Pie>
        <Legend wrapperStyle={{ fontSize: 12 }} />
      </PieChart>
    </ResponsiveContainer>
  );
}
