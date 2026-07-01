"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiSend, type Paginated } from "@/lib/api";

interface BulkPayload {
  ids: string[];
  action: "delete" | "update";
  patch?: Record<string, unknown>;
}

interface Ctx<T> {
  prev?: Paginated<T>;
}

/**
 * CRUD + bulk mutations for a resource with optimistic cache updates:
 * the table reflects the change instantly, rolls back on error, and
 * re-syncs with the server on settle.
 */
export function useResourceMutations<T extends { id: string }>(
  resourceKey: string,
  path: string,
) {
  const qc = useQueryClient();
  const key = [resourceKey];

  const snapshot = async (): Promise<Ctx<T>> => {
    await qc.cancelQueries({ queryKey: key });
    return { prev: qc.getQueryData<Paginated<T>>(key) };
  };
  const patchCache = (fn: (p: Paginated<T>) => Paginated<T>) =>
    qc.setQueryData<Paginated<T>>(key, (prev) => (prev ? fn(prev) : prev));
  const rollback = (ctx?: Ctx<T>) => {
    if (ctx?.prev) qc.setQueryData(key, ctx.prev);
  };
  const settle = () => qc.invalidateQueries({ queryKey: key });

  const create = useMutation({
    mutationFn: (body: Partial<T>) => apiSend<T>("POST", path, body),
    onMutate: async (body) => {
      const ctx = await snapshot();
      const optimistic = { id: `temp-${Date.now()}`, ...body } as unknown as T;
      patchCache((p) => ({ ...p, items: [optimistic, ...p.items], total: p.total + 1 }));
      return ctx;
    },
    onError: (_e, _v, ctx) => rollback(ctx as Ctx<T>),
    onSettled: settle,
  });

  const update = useMutation({
    mutationFn: ({ id, body }: { id: string; body: Partial<T> }) =>
      apiSend<T>("PATCH", `${path}/${id}`, body),
    onMutate: async ({ id, body }) => {
      const ctx = await snapshot();
      patchCache((p) => ({
        ...p,
        items: p.items.map((it) => (it.id === id ? { ...it, ...body } : it)),
      }));
      return ctx;
    },
    onError: (_e, _v, ctx) => rollback(ctx as Ctx<T>),
    onSettled: settle,
  });

  const remove = useMutation({
    mutationFn: (id: string) => apiSend<{ deleted: string }>("DELETE", `${path}/${id}`),
    onMutate: async (id) => {
      const ctx = await snapshot();
      patchCache((p) => ({
        ...p,
        items: p.items.filter((it) => it.id !== id),
        total: Math.max(0, p.total - 1),
      }));
      return ctx;
    },
    onError: (_e, _v, ctx) => rollback(ctx as Ctx<T>),
    onSettled: settle,
  });

  const bulk = useMutation({
    mutationFn: (payload: BulkPayload) => apiSend<unknown>("POST", `${path}/bulk`, payload),
    onMutate: async ({ ids, action, patch }) => {
      const ctx = await snapshot();
      const set = new Set(ids);
      patchCache((p) =>
        action === "delete"
          ? {
              ...p,
              items: p.items.filter((it) => !set.has(it.id)),
              total: Math.max(0, p.total - ids.length),
            }
          : {
              ...p,
              items: p.items.map((it) => (set.has(it.id) ? { ...it, ...patch } : it)),
            },
      );
      return ctx;
    },
    onError: (_e, _v, ctx) => rollback(ctx as Ctx<T>),
    onSettled: settle,
  });

  return { create, update, remove, bulk };
}
