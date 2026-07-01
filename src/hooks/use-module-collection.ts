"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiGet, apiSend, type Paginated } from "@/lib/api";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Row = Record<string, any>;

/**
 * Fetches a config module's rows from the generic collections API, seeding the
 * backend from the provided config rows on first access. Returns the full set
 * so the DataTable keeps its client-side search / sort / paginate / filter UX.
 */
export function useModuleCollection(key: string, seedRows: Row[]) {
  const enc = encodeURIComponent(key);
  return useQuery({
    queryKey: ["collection", key],
    queryFn: async () => {
      let res = await apiGet<Paginated<Row>>(`/api/collections/${enc}`, { limit: 500 });
      if (res.total === 0 && seedRows.length) {
        await apiSend("POST", `/api/collections/${enc}/seed`, { rows: seedRows });
        res = await apiGet<Paginated<Row>>(`/api/collections/${enc}`, { limit: 500 });
      }
      return res.items;
    },
  });
}

/** Create / update / delete mutations for a config module collection. */
export function useModuleMutations(key: string) {
  const qc = useQueryClient();
  const enc = encodeURIComponent(key);
  const invalidate = () => qc.invalidateQueries({ queryKey: ["collection", key] });

  const create = useMutation({
    mutationFn: (body: Row) => apiSend<Row>("POST", `/api/collections/${enc}`, body),
    onSuccess: invalidate,
  });
  const update = useMutation({
    mutationFn: ({ id, body }: { id: string; body: Row }) =>
      apiSend<Row>("PATCH", `/api/collections/${enc}/${id}`, body),
    onSuccess: invalidate,
  });
  const remove = useMutation({
    mutationFn: (id: string) => apiSend("DELETE", `/api/collections/${enc}/${id}`),
    onSuccess: invalidate,
  });
  return { create, update, remove };
}
