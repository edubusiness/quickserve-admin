"use client";

import { Area, AreaChart, ResponsiveContainer } from "recharts";
import { useId } from "react";

const toneColor: Record<string, string> = {
  primary: "var(--primary)",
  accent: "var(--accent)",
  success: "var(--success)",
  warning: "var(--warning)",
  danger: "var(--danger)",
};

export function Sparkline({
  data,
  tone = "primary",
  height = 48,
}: {
  data: number[];
  tone?: keyof typeof toneColor;
  height?: number;
}) {
  const id = useId().replace(/:/g, "");
  const color = toneColor[tone] ?? toneColor.primary;
  const chartData = data.map((value, i) => ({ i, value }));

  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={chartData} margin={{ top: 4, right: 0, bottom: 0, left: 0 }}>
        <defs>
          <linearGradient id={`spark-${id}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity={0.45} />
            <stop offset="100%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        <Area
          type="monotone"
          dataKey="value"
          stroke={color}
          strokeWidth={2}
          fill={`url(#spark-${id})`}
          isAnimationActive
          animationDuration={900}
          dot={false}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
