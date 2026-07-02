import type { LucideIcon } from "lucide-react";

export type ThemeName = "blue" | "purple" | "emerald";
export type ThemeMode = "dark" | "light";

export type Trend = "up" | "down";

export interface KpiStat {
  id: string;
  label: string;
  value: number;
  display: string;
  delta: number; // percentage
  trend: Trend;
  caption: string;
  icon: LucideIcon;
  /** token name for the accent color: primary | accent | success | warning | danger */
  tone: "primary" | "accent" | "success" | "warning" | "danger";
  spark: number[];
}

export type BookingStatus = "ongoing" | "completed" | "pending" | "cancelled";

export interface Booking {
  id: string;
  customer: string;
  service: string;
  avatar: string;
  time: string;
  status: BookingStatus;
}

export interface ActivityItem {
  id: string;
  title: string;
  detail: string;
  time: string;
  icon: LucideIcon;
  tone: "primary" | "accent" | "success" | "warning" | "danger";
}

export interface TopService {
  name: string;
  bookings: number;
  delta: number;
  icon: LucideIcon;
}

export interface CityStat {
  city: string;
  bookings: number;
  delta: number;
  share: number; // 0..1 relative bar width
}

export type SosPriority = "high" | "medium" | "low";

export interface SosRequest {
  id: string;
  title: string;
  location: string;
  priority: SosPriority;
  time: string;
}

export interface InsightItem {
  id: string;
  title: string;
  detail: string;
  icon: LucideIcon;
}

export interface QuickAction {
  label: string;
  icon: LucideIcon;
  gradient: string; // tailwind gradient classes
  href: string; // destination route (with ?new=1 to auto-open a create form)
}

export interface MapMarker {
  id: string;
  type: "driver" | "provider" | "customer";
  x: number; // % position
  y: number; // % position
  tone: "primary" | "accent" | "success" | "warning" | "danger";
  avatar?: string;
}

export interface NavItem {
  label: string;
  icon: LucideIcon;
  href?: string;
  badge?: number;
  children?: { label: string; href: string; badge?: number }[];
}

export interface NavSection {
  title?: string;
  /** Icon shown when the section is rendered as a collapsible root item. */
  icon?: LucideIcon;
  items: NavItem[];
}
