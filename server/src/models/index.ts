/**
 * Mongoose models for the production (MongoDB) path. These mirror the shapes in
 * ../db/store.ts. When MONGODB_URI is set, swap the in-memory `store`/`query`
 * calls in the route handlers for these models (`Model.find().lean()` etc.).
 */
import { Schema, model } from "mongoose";

const userSchema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true, index: true },
    passwordHash: { type: String, required: true },
    role: {
      type: String,
      enum: ["super_admin", "admin", "manager", "support"],
      default: "admin",
    },
    avatar: String,
  },
  { timestamps: true },
);

const customerSchema = new Schema(
  {
    name: String, avatar: String, email: { type: String, index: true }, phone: String,
    city: { type: String, index: true }, orders: Number, spent: Number,
    status: { type: String, enum: ["active", "inactive", "blocked"], default: "active" },
    joined: Date,
  },
  { timestamps: true },
);

const providerSchema = new Schema(
  {
    name: String, avatar: String, category: { type: String, index: true }, city: String,
    jobs: Number, rating: Number, earnings: Number, verified: Boolean,
    status: { type: String, enum: ["active", "inactive", "blocked", "pending"], default: "pending" },
    joined: Date,
  },
  { timestamps: true },
);

const driverSchema = new Schema(
  {
    name: String, avatar: String, vehicle: String, vehicleNo: String, city: String,
    trips: Number, rating: Number, online: Boolean,
    status: { type: String, enum: ["active", "inactive", "blocked"], default: "active" },
    joined: Date,
  },
  { timestamps: true },
);

const bookingSchema = new Schema(
  {
    customer: String, avatar: String, service: String, category: String, provider: String,
    city: { type: String, index: true }, amount: Number,
    payment: { type: String, enum: ["paid", "pending", "refunded"] },
    status: { type: String, enum: ["ongoing", "completed", "pending", "cancelled"], index: true },
    date: Date,
  },
  { timestamps: true },
);

const paymentSchema = new Schema(
  {
    customer: String, avatar: String, service: String, method: String,
    amount: Number, fee: Number,
    status: { type: String, enum: ["success", "pending", "failed", "refunded"], index: true },
    date: Date,
  },
  { timestamps: true },
);

const categorySchema = new Schema(
  {
    name: { type: String, index: true },
    services: Number,
    providers: Number,
    bookings: Number,
    status: { type: String, enum: ["active", "inactive"], default: "active" },
  },
  { timestamps: true },
);

// Generic, schema-less store for config-driven modules (coupons, offers, etc.).
const genericSchema = new Schema(
  { moduleKey: { type: String, index: true }, id: { type: String, index: true } },
  { strict: false, timestamps: true },
);

export const UserModel = model("User", userSchema);
export const CategoryModel = model("Category", categorySchema);
export const GenericModel = model("Collection", genericSchema);
export const CustomerModel = model("Customer", customerSchema);
export const ProviderModel = model("Provider", providerSchema);
export const DriverModel = model("Driver", driverSchema);
export const BookingModel = model("Booking", bookingSchema);
export const PaymentModel = model("Payment", paymentSchema);
