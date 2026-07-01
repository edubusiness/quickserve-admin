import { Router, type Request } from "express";
import type { QueryParams } from "../db/store.js";
import { getRepository, type CollectionKey } from "../db/repository.js";
import { authenticate, requireRole } from "../middleware/auth.js";
import { asyncHandler, ApiError } from "../utils/async-handler.js";

/**
 * Parses list query params. Supports plain `filterKeys` (key=value, exact) plus
 * prefixed advanced filters shared with the client DataTable:
 *   eq_<field>   exact match (select)
 *   like_<field> case-insensitive contains (text)
 *   min_/max_<field>  numeric range
 *   from_/to_<field>  ISO date range
 */
function parseQuery(req: Request, searchFields: string[], filterKeys: string[]): QueryParams {
  const filters: Record<string, string> = {};
  const contains: Record<string, string> = {};
  const ranges: Record<string, { min?: number; max?: number }> = {};
  const dateRanges: Record<string, { from?: string; to?: string }> = {};

  for (const key of filterKeys) {
    const v = req.query[key];
    if (typeof v === "string") filters[key] = v;
  }

  for (const [rawKey, rawVal] of Object.entries(req.query)) {
    if (typeof rawVal !== "string" || rawVal === "") continue;
    const m = /^(eq|like|min|max|from|to)_(.+)$/.exec(rawKey);
    if (!m) continue;
    const [, op, field] = m;
    if (op === "eq") filters[field] = rawVal;
    else if (op === "like") contains[field] = rawVal;
    else if (op === "min") ranges[field] = { ...ranges[field], min: Number(rawVal) };
    else if (op === "max") ranges[field] = { ...ranges[field], max: Number(rawVal) };
    else if (op === "from") dateRanges[field] = { ...dateRanges[field], from: rawVal };
    else if (op === "to") dateRanges[field] = { ...dateRanges[field], to: rawVal };
  }

  return {
    search: typeof req.query.search === "string" ? req.query.search : undefined,
    searchFields,
    filters,
    contains,
    ranges,
    dateRanges,
    sort: typeof req.query.sort === "string" ? req.query.sort : undefined,
    order: req.query.order === "desc" ? "desc" : "asc",
    page: req.query.page ? Number(req.query.page) : 1,
    limit: req.query.limit ? Number(req.query.limit) : 10,
  };
}

interface ResourceOptions {
  collection: CollectionKey;
  searchFields: string[];
  filterKeys?: string[];
  writeRoles?: string[];
}

/** Builds a CRUD + bulk REST router backed by the active repository. */
export function resourceRouter({
  collection,
  searchFields,
  filterKeys = [],
  writeRoles = ["admin", "manager"],
}: ResourceOptions): Router {
  const router = Router();
  const repo = getRepository<{ id: string }>(collection);

  router.use(authenticate);

  router.get(
    "/",
    asyncHandler(async (req, res) => {
      res.json(await repo.list(parseQuery(req, searchFields, filterKeys)));
    }),
  );

  router.get(
    "/:id",
    asyncHandler(async (req, res) => {
      const found = await repo.get(req.params.id);
      if (!found) throw new ApiError(404, `${collection} not found`);
      res.json(found);
    }),
  );

  router.post(
    "/",
    requireRole(...writeRoles),
    asyncHandler(async (req, res) => {
      res.status(201).json(await repo.create(req.body));
    }),
  );

  router.patch(
    "/:id",
    requireRole(...writeRoles),
    asyncHandler(async (req, res) => {
      const updated = await repo.update(req.params.id, req.body);
      if (!updated) throw new ApiError(404, `${collection} not found`);
      res.json(updated);
    }),
  );

  router.delete(
    "/:id",
    requireRole(...writeRoles),
    asyncHandler(async (req, res) => {
      const ok = await repo.remove(req.params.id);
      if (!ok) throw new ApiError(404, `${collection} not found`);
      res.json({ deleted: req.params.id });
    }),
  );

  // Bulk action: { ids: string[], action: "delete" | "update", patch?: {} }
  router.post(
    "/bulk",
    requireRole(...writeRoles),
    asyncHandler(async (req, res) => {
      const { ids, action, patch } = req.body as {
        ids: string[];
        action: "delete" | "update";
        patch?: Record<string, unknown>;
      };
      if (!Array.isArray(ids)) throw new ApiError(422, "ids must be an array");
      const count = await repo.bulk(ids, action, patch);
      res.json(action === "delete" ? { deleted: count } : { updated: count });
    }),
  );

  return router;
}
