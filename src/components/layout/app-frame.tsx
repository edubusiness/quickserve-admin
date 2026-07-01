"use client";

import { usePathname } from "next/navigation";
import { DashboardShell } from "@/components/layout/dashboard-shell";

/** Renders the full dashboard chrome for app routes, but bare for /login. */
export function AppFrame({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  if (pathname === "/login") return <>{children}</>;
  return <DashboardShell>{children}</DashboardShell>;
}
