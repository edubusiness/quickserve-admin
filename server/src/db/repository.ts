/**
 * Repository abstraction. Routes call these methods without caring whether the
 * data lives in the in-memory store (no MONGODB_URI) or MongoDB via Mongoose
 * (MONGODB_URI set). Both implementations share the same interface and the same
 * `QueryParams` contract used for search / filter / sort / pagination.
 */
import type { Model } from "mongoose";
import { env } from "../config/env.js";
import { store, query as memQuery, type QueryParams } from "./store.js";
import {
  CustomerModel,
  ProviderModel,
  DriverModel,
  BookingModel,
  PaymentModel,
  CategoryModel,
} from "../models/index.js";

export type CollectionKey =
  | "customers"
  | "providers"
  | "drivers"
  | "bookings"
  | "payments"
  | "categories";

export interface ListResult<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  pages: number;
}

export interface Repository<T extends { id: string }> {
  list(params: QueryParams): Promise<ListResult<T>>;
  get(id: string): Promise<T | null>;
  create(body: Partial<T>): Promise<T>;
  update(id: string, body: Partial<T>): Promise<T | null>;
  remove(id: string): Promise<boolean>;
  bulk(ids: string[], action: "delete" | "update", patch?: Record<string, unknown>): Promise<number>;
}

const escapeRegex = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// ---------------- In-memory implementation ----------------
function memoryRepository<T extends { id: string }>(collection: CollectionKey): Repository<T> {
  const data = () => store[collection] as unknown as T[];
  const prefix = collection.slice(0, 3).toUpperCase();

  return {
    async list(params) {
      return memQuery(data() as Record<string, unknown>[], params) as ListResult<T>;
    },
    async get(id) {
      return data().find((r) => r.id === id) ?? null;
    },
    async create(body) {
      const record = { id: `${prefix}-${Date.now()}`, ...body } as T;
      data().unshift(record);
      return record;
    },
    async update(id, body) {
      const idx = data().findIndex((r) => r.id === id);
      if (idx === -1) return null;
      data()[idx] = { ...data()[idx], ...body, id } as T;
      return data()[idx];
    },
    async remove(id) {
      const idx = data().findIndex((r) => r.id === id);
      if (idx === -1) return false;
      data().splice(idx, 1);
      return true;
    },
    async bulk(ids, action, patch) {
      const set = new Set(ids);
      if (action === "delete") {
        const before = data().length;
        store[collection] = data().filter((r) => !set.has(r.id)) as never;
        return before - data().length;
      }
      let updated = 0;
      data().forEach((r, i) => {
        if (set.has(r.id)) {
          data()[i] = { ...r, ...patch } as T;
          updated++;
        }
      });
      return updated;
    },
  };
}

// ---------------- Mongoose implementation ----------------
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapDoc<T>(doc: any): T {
  const { _id, __v, ...rest } = doc;
  return { id: String(_id), ...rest } as T;
}

function mongoRepository<T extends { id: string }>(model: Model<unknown>): Repository<T> {
  return {
    async list(params) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const filter: any = {};
      if (params.filters) {
        for (const [k, v] of Object.entries(params.filters)) {
          if (v && v !== "all") filter[k] = v === "true" ? true : v === "false" ? false : v;
        }
      }
      if (params.contains) {
        for (const [k, v] of Object.entries(params.contains)) {
          if (v) filter[k] = new RegExp(escapeRegex(v), "i");
        }
      }
      if (params.ranges) {
        for (const [k, { min, max }] of Object.entries(params.ranges)) {
          const r: Record<string, number> = {};
          if (min != null) r.$gte = min;
          if (max != null) r.$lte = max;
          if (Object.keys(r).length) filter[k] = r;
        }
      }
      if (params.dateRanges) {
        for (const [k, { from, to }] of Object.entries(params.dateRanges)) {
          const r: Record<string, Date> = {};
          if (from) r.$gte = new Date(from);
          if (to) r.$lte = new Date(new Date(to).getTime() + 86_400_000);
          if (Object.keys(r).length) filter[k] = r;
        }
      }
      if (params.search && params.searchFields?.length) {
        const rx = new RegExp(escapeRegex(params.search), "i");
        filter.$or = params.searchFields.filter((f) => f !== "id").map((f) => ({ [f]: rx }));
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const sort: any = {};
      if (params.sort) sort[params.sort] = params.order === "desc" ? -1 : 1;

      const page = Math.max(1, params.page ?? 1);
      const limit = Math.max(1, Math.min(100, params.limit ?? 10));
      const [docs, total] = await Promise.all([
        model.find(filter).sort(sort).skip((page - 1) * limit).limit(limit).lean(),
        model.countDocuments(filter),
      ]);
      return { items: docs.map(mapDoc<T>), total, page, limit, pages: Math.ceil(total / limit) };
    },
    async get(id) {
      try {
        const doc = await model.findById(id).lean();
        return doc ? mapDoc<T>(doc) : null;
      } catch {
        return null;
      }
    },
    async create(body) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const doc = await model.create(body as any);
      return mapDoc<T>(doc.toObject());
    },
    async update(id, body) {
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const doc = await model.findByIdAndUpdate(id, body as any, { new: true }).lean();
        return doc ? mapDoc<T>(doc) : null;
      } catch {
        return null;
      }
    },
    async remove(id) {
      try {
        const res = await model.findByIdAndDelete(id);
        return !!res;
      } catch {
        return false;
      }
    },
    async bulk(ids, action, patch) {
      if (action === "delete") {
        const res = await model.deleteMany({ _id: { $in: ids } });
        return res.deletedCount ?? 0;
      }
      const res = await model.updateMany({ _id: { $in: ids } }, { $set: patch ?? {} });
      return res.modifiedCount ?? 0;
    },
  };
}

const models: Record<CollectionKey, Model<unknown>> = {
  customers: CustomerModel as unknown as Model<unknown>,
  providers: ProviderModel as unknown as Model<unknown>,
  drivers: DriverModel as unknown as Model<unknown>,
  bookings: BookingModel as unknown as Model<unknown>,
  payments: PaymentModel as unknown as Model<unknown>,
  categories: CategoryModel as unknown as Model<unknown>,
};

/** Returns the active repository for a collection based on the runtime mode. */
export function getRepository<T extends { id: string }>(collection: CollectionKey): Repository<T> {
  return env.useMemoryStore
    ? memoryRepository<T>(collection)
    : mongoRepository<T>(models[collection]);
}
