/**
 * Typed fetch client for the QuickServe API. Reads the JWT from the NextAuth
 * session and attaches it as a Bearer token. Use with TanStack Query for
 * caching, or call directly from server components / route handlers.
 */
import { getSession } from "next-auth/react";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

export interface Paginated<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  pages: number;
}

async function authHeaders(): Promise<HeadersInit> {
  const session = await getSession();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const token = (session as any)?.accessToken as string | undefined;
  return token ? { Authorization: `Bearer ${token}` } : {};
}

/**
 * A 401 means the stored JWT is missing/expired/signed with an old secret.
 * Clear the dead session and send the user to log in again (self-healing)
 * rather than surfacing a misleading "API is down" error.
 */
async function handleUnauthorized() {
  if (typeof window === "undefined") return;
  const { signOut } = await import("next-auth/react");
  await signOut({ redirect: false });
  window.location.href = "/login?expired=1";
}

export async function apiGet<T>(
  path: string,
  params?: Record<string, string | number | undefined>,
): Promise<T> {
  const url = new URL(`${API_URL}${path}`);
  if (params) {
    for (const [k, v] of Object.entries(params)) {
      if (v !== undefined && v !== "") url.searchParams.set(k, String(v));
    }
  }
  const res = await fetch(url, { headers: await authHeaders() });
  if (res.status === 401) await handleUnauthorized();
  if (!res.ok) throw new Error(`API ${res.status}: ${res.statusText}`);
  return res.json() as Promise<T>;
}

export async function apiSend<T>(
  method: "POST" | "PATCH" | "DELETE",
  path: string,
  body?: unknown,
): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    method,
    headers: { "Content-Type": "application/json", ...(await authHeaders()) },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (res.status === 401) await handleUnauthorized();
  if (!res.ok) throw new Error(`API ${res.status}: ${res.statusText}`);
  return res.json() as Promise<T>;
}

// Convenience resource helpers
export const api = {
  bookings: (params?: Record<string, string | number | undefined>) =>
    apiGet<Paginated<Record<string, unknown>>>("/api/bookings", params),
  customers: (params?: Record<string, string | number | undefined>) =>
    apiGet<Paginated<Record<string, unknown>>>("/api/customers", params),
  providers: (params?: Record<string, string | number | undefined>) =>
    apiGet<Paginated<Record<string, unknown>>>("/api/providers", params),
  drivers: (params?: Record<string, string | number | undefined>) =>
    apiGet<Paginated<Record<string, unknown>>>("/api/drivers", params),
  payments: (params?: Record<string, string | number | undefined>) =>
    apiGet<Paginated<Record<string, unknown>>>("/api/payments", params),
  dashboardStats: () => apiGet<Record<string, number>>("/api/dashboard/stats"),
};
