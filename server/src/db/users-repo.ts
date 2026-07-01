import { env } from "../config/env.js";
import { store, type User } from "./store.js";
import { UserModel } from "../models/index.js";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mapUser = (doc: any): User => {
  const { _id, __v, ...rest } = doc;
  return { id: String(_id), ...rest } as User;
};

/** User persistence that switches between the in-memory store and MongoDB. */
export const usersRepo = {
  async findByEmail(email: string): Promise<User | null> {
    const e = email.toLowerCase();
    if (env.useMemoryStore) return store.users.find((u) => u.email === e) ?? null;
    const doc = await UserModel.findOne({ email: e }).lean();
    return doc ? mapUser(doc) : null;
  },

  async findById(id: string): Promise<User | null> {
    if (env.useMemoryStore) return store.users.find((u) => u.id === id) ?? null;
    try {
      const doc = await UserModel.findById(id).lean();
      return doc ? mapUser(doc) : null;
    } catch {
      return null;
    }
  },

  async create(user: Omit<User, "id">): Promise<User> {
    if (env.useMemoryStore) {
      const record: User = { ...user, id: `USR-${Date.now()}` };
      store.users.push(record);
      return record;
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const doc = await UserModel.create(user as any);
    return mapUser(doc.toObject());
  },
};
