/**
 * Generic persistence for config-driven modules (coupons, offers, employees…).
 * Each module's rows live under a `moduleKey`. Seed data is pushed once from the
 * client's module config, after which create/update/delete/bulk persist here.
 * Datasets are small, so list applies the shared query engine in memory over the
 * fetched rows in both storage modes.
 */
import { Router } from "express";
import { env } from "../config/env.js";
import { store, query, type QueryParams } from "../db/store.js";
import { GenericModel } from "../models/index.js";
import { authenticate, requireRole } from "../middleware/auth.js";
import { asyncHandler, ApiError } from "../utils/async-handler.js";

const writeRoles = ["admin", "manager"];

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const clean = (doc: any) => {
  const { _id, __v, moduleKey, createdAt, updatedAt, ...rest } = doc;
  return rest as Record<string, unknown>;
};

async function fetchRows(key: string): Promise<Record<string, unknown>[]> {
  if (env.useMemoryStore) return store.collections[key] ?? [];
  const docs = await GenericModel.find({ moduleKey: key }).lean();
  return docs.map(clean);
}

function parseQuery(req: import("express").Request, searchFields: string[]): QueryParams {
  const reserved = new Set(["search", "searchFields", "sort", "order", "page", "limit"]);
  const filters: Record<string, string> = {};
  for (const [k, v] of Object.entries(req.query)) {
    if (!reserved.has(k) && typeof v === "string") filters[k] = v;
  }
  return {
    search: typeof req.query.search === "string" ? req.query.search : undefined,
    searchFields,
    filters,
    sort: typeof req.query.sort === "string" ? req.query.sort : undefined,
    order: req.query.order === "desc" ? "desc" : "asc",
    page: req.query.page ? Number(req.query.page) : 1,
    limit: req.query.limit ? Number(req.query.limit) : 10,
  };
}

export const collectionsRouter = Router();
collectionsRouter.use(authenticate);

// List
collectionsRouter.get(
  "/:key",
  asyncHandler(async (req, res) => {
    const searchFields =
      typeof req.query.searchFields === "string" ? req.query.searchFields.split(",") : [];
    const rows = await fetchRows(req.params.key);
    res.json(query(rows, parseQuery(req, searchFields)));
  }),
);

// Idempotent seed
collectionsRouter.post(
  "/:key/seed",
  requireRole(...writeRoles),
  asyncHandler(async (req, res) => {
    const key = req.params.key;
    const rows = (req.body?.rows ?? []) as Record<string, unknown>[];
    const existing = await fetchRows(key);
    if (existing.length > 0) return res.json({ seeded: 0, existing: existing.length });

    if (env.useMemoryStore) {
      store.collections[key] = rows.map((r, i) => ({ id: r.id ?? `${key}-${i}`, ...r }));
    } else {
      await GenericModel.insertMany(rows.map((r) => ({ moduleKey: key, ...r })));
    }
    res.status(201).json({ seeded: rows.length });
  }),
);

// Create
collectionsRouter.post(
  "/:key",
  requireRole(...writeRoles),
  asyncHandler(async (req, res) => {
    const key = req.params.key;
    const id = `${key.replace(/\W+/g, "-")}-${Date.now()}`;
    const record = { id, ...req.body };
    if (env.useMemoryStore) {
      (store.collections[key] ??= []).unshift(record);
    } else {
      await GenericModel.create({ moduleKey: key, ...record });
    }
    res.status(201).json(record);
  }),
);

// Update
collectionsRouter.patch(
  "/:key/:id",
  requireRole(...writeRoles),
  asyncHandler(async (req, res) => {
    const { key, id } = req.params;
    if (env.useMemoryStore) {
      const list = store.collections[key] ?? [];
      const idx = list.findIndex((r) => r.id === id);
      if (idx === -1) throw new ApiError(404, "Record not found");
      list[idx] = { ...list[idx], ...req.body, id };
      return res.json(list[idx]);
    }
    const doc = await GenericModel.findOneAndUpdate(
      { moduleKey: key, id },
      { $set: req.body },
      { new: true },
    ).lean();
    if (!doc) throw new ApiError(404, "Record not found");
    res.json(clean(doc));
  }),
);

// Delete
collectionsRouter.delete(
  "/:key/:id",
  requireRole(...writeRoles),
  asyncHandler(async (req, res) => {
    const { key, id } = req.params;
    if (env.useMemoryStore) {
      const list = store.collections[key] ?? [];
      const idx = list.findIndex((r) => r.id === id);
      if (idx === -1) throw new ApiError(404, "Record not found");
      list.splice(idx, 1);
    } else {
      const r = await GenericModel.findOneAndDelete({ moduleKey: key, id });
      if (!r) throw new ApiError(404, "Record not found");
    }
    res.json({ deleted: id });
  }),
);

// Bulk
collectionsRouter.post(
  "/:key/bulk",
  requireRole(...writeRoles),
  asyncHandler(async (req, res) => {
    const { key } = req.params;
    const { ids, action, patch } = req.body as {
      ids: string[];
      action: "delete" | "update";
      patch?: Record<string, unknown>;
    };
    if (!Array.isArray(ids)) throw new ApiError(422, "ids must be an array");
    const set = new Set(ids);

    if (env.useMemoryStore) {
      const list = store.collections[key] ?? [];
      if (action === "delete") {
        store.collections[key] = list.filter((r) => !set.has(r.id as string));
        return res.json({ deleted: ids.length });
      }
      let updated = 0;
      list.forEach((r, i) => {
        if (set.has(r.id as string)) {
          list[i] = { ...r, ...patch };
          updated++;
        }
      });
      return res.json({ updated });
    }

    if (action === "delete") {
      const r = await GenericModel.deleteMany({ moduleKey: key, id: { $in: ids } });
      return res.json({ deleted: r.deletedCount ?? 0 });
    }
    const r = await GenericModel.updateMany({ moduleKey: key, id: { $in: ids } }, { $set: patch ?? {} });
    res.json({ updated: r.modifiedCount ?? 0 });
  }),
);
