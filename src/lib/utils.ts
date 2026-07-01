import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/** Merge Tailwind classes with conflict resolution. */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Compact currency formatter (INR). */
export function formatCurrency(value: number, compact = false): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: compact ? 1 : 0,
    notation: compact ? "compact" : "standard",
  }).format(value);
}

/** Compact number formatter (1.2K, 2.4M). */
export function formatNumber(value: number, compact = false): string {
  return new Intl.NumberFormat("en-IN", {
    notation: compact ? "compact" : "standard",
    maximumFractionDigits: 1,
  }).format(value);
}

/** Relative time label from an ISO date or "N min ago" passthrough. */
export function timeAgo(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  const seconds = Math.floor((Date.now() - d.getTime()) / 1000);
  const ranges: [number, Intl.RelativeTimeFormatUnit][] = [
    [60, "second"],
    [3600, "minute"],
    [86400, "hour"],
    [604800, "day"],
  ];
  const rtf = new Intl.RelativeTimeFormat("en", { numeric: "auto" });
  let divisor = 1;
  for (const [limit, unit] of ranges) {
    if (seconds < limit) {
      return rtf.format(-Math.floor(seconds / divisor), unit);
    }
    divisor = limit;
  }
  return rtf.format(-Math.floor(seconds / 604800), "week");
}
