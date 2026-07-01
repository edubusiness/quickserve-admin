import { env } from "../config/env.js";
import { store } from "../db/store.js";
import { usersRepo } from "../db/users-repo.js";
import { hashPassword } from "../utils/password.js";
import {
  CustomerModel,
  ProviderModel,
  DriverModel,
  BookingModel,
  PaymentModel,
  CategoryModel,
} from "../models/index.js";

const defaultUsers = [
  { name: "Super Admin", email: "admin@quickserve.io", password: "admin123", role: "super_admin" as const, avatar: "https://i.pravatar.cc/80?img=68" },
  { name: "Ops Manager", email: "manager@quickserve.io", password: "manager123", role: "manager" as const, avatar: "https://i.pravatar.cc/80?img=12" },
  { name: "Support Agent", email: "support@quickserve.io", password: "support123", role: "support" as const, avatar: "https://i.pravatar.cc/80?img=45" },
];

/** Seeds the three default accounts (idempotent) into the active store. */
export async function seedUsers() {
  if (await usersRepo.findByEmail("admin@quickserve.io")) return;
  for (const { password, ...rest } of defaultUsers) {
    await usersRepo.create({
      ...rest,
      passwordHash: await hashPassword(password),
      createdAt: new Date().toISOString(),
    });
  }
}

const stripId = <T extends { id: string }>(rows: T[]) => rows.map(({ id, ...rest }) => rest);

/** Populates MongoDB collections from the generated seed data (first run only). */
export async function seedDatabase() {
  if (env.useMemoryStore) return; // the in-memory store self-seeds via generators
  if ((await CustomerModel.countDocuments()) > 0) return;
  await Promise.all([
    CustomerModel.insertMany(stripId(store.customers)),
    ProviderModel.insertMany(stripId(store.providers)),
    DriverModel.insertMany(stripId(store.drivers)),
    BookingModel.insertMany(stripId(store.bookings)),
    PaymentModel.insertMany(stripId(store.payments)),
    CategoryModel.insertMany(stripId(store.categories)),
  ]);
  console.log("🌱 Seeded MongoDB collections from generated data.");
}

// Allow `npm run seed` to run this directly.
if (import.meta.url === `file://${process.argv[1]}`) {
  seedUsers().then(() => {
    console.log("✅ Seeded default users:");
    console.log("   super_admin → admin@quickserve.io / admin123");
    console.log("   manager     → manager@quickserve.io / manager123");
    console.log("   support     → support@quickserve.io / support123");
    process.exit(0);
  });
}
