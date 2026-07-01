"use client";

import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { apiGet, type Paginated } from "@/lib/api";
import type { BookingRow } from "@/data/bookings";
import type { Customer, Provider, Driver } from "@/data/people";
import type { Payment } from "@/data/finance";
import type { Category } from "@/data/categories";

/**
 * Fetches a full collection from the API (capped at the server's max page size)
 * so the existing DataTable can keep its rich client-side search / sort /
 * pagination / export UX while the source of truth is the live backend.
 */
function useCollection<T>(key: string, path: string) {
  return useQuery({
    queryKey: [key],
    queryFn: () => apiGet<Paginated<T>>(path, { limit: 100 }),
    select: (data) => data.items,
  });
}

export const useBookings = () => useCollection<BookingRow>("bookings", "/api/bookings");
export const useCustomers = () => useCollection<Customer>("customers", "/api/customers");
export const useProviders = () => useCollection<Provider>("providers", "/api/providers");
export const useDrivers = () => useCollection<Driver>("drivers", "/api/drivers");
export const usePayments = () => useCollection<Payment>("payments", "/api/payments");
export const useCategories = () => useCollection<Category>("categories", "/api/categories");

/**
 * Server-driven list: search / filter / sort / pagination all happen on the API.
 * `params` come from the DataTable's server mode. Keeps the previous page visible
 * while the next one loads for a flicker-free experience.
 */
export function usePaginatedResource<T>(
  key: string,
  path: string,
  params: Record<string, string>,
) {
  return useQuery({
    queryKey: [key, "paged", params],
    queryFn: () => apiGet<Paginated<T>>(path, params),
    placeholderData: keepPreviousData,
  });
}

export const useDashboardStats = () =>
  useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: () => apiGet<Record<string, number>>("/api/dashboard/stats"),
  });
