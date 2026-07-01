import mongoose from "mongoose";
import { env } from "../config/env.js";

/**
 * Connects to MongoDB when MONGODB_URI is provided. Returns false when running
 * in the zero-config in-memory mode so the caller can seed the memory store.
 */
export async function connectDb(): Promise<boolean> {
  if (env.useMemoryStore) {
    console.log("⚙️  No MONGODB_URI set — using in-memory store (data resets on restart).");
    return false;
  }
  mongoose.set("strictQuery", true);
  await mongoose.connect(env.mongoUri);
  console.log("✅ Connected to MongoDB");
  return true;
}
