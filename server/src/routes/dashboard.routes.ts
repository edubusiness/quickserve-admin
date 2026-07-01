import { Router } from "express";
import { env } from "../config/env.js";
import { store } from "../db/store.js";
import {
  BookingModel,
  ProviderModel,
  DriverModel,
  CustomerModel,
  PaymentModel,
} from "../models/index.js";
import { authenticate } from "../middleware/auth.js";
import { asyncHandler } from "../utils/async-handler.js";

export const dashboardRouter = Router();
dashboardRouter.use(authenticate);

dashboardRouter.get(
  "/stats",
  asyncHandler(async (_req, res) => {
    if (env.useMemoryStore) {
      const { bookings, providers, drivers, customers, payments } = store;
      const revenue = payments
        .filter((p) => p.status === "success")
        .reduce((a, p) => a + p.amount, 0);
      return res.json({
        revenue,
        activeBookings: bookings.filter((b) => b.status === "ongoing").length,
        providersOnline: providers.filter((p) => p.status === "active").length,
        driversOnline: drivers.filter((d) => d.online).length,
        ordersDelivered: bookings.filter((b) => b.status === "completed").length,
        customers: customers.length,
        pendingRequests: bookings.filter((b) => b.status === "pending").length,
        avgRating:
          Math.round((providers.reduce((a, p) => a + p.rating, 0) / providers.length) * 10) / 10,
      });
    }

    const [revenueAgg, activeBookings, providersOnline, driversOnline, ordersDelivered, customers, pendingRequests, ratingAgg] =
      await Promise.all([
        PaymentModel.aggregate([{ $match: { status: "success" } }, { $group: { _id: null, sum: { $sum: "$amount" } } }]),
        BookingModel.countDocuments({ status: "ongoing" }),
        ProviderModel.countDocuments({ status: "active" }),
        DriverModel.countDocuments({ online: true }),
        BookingModel.countDocuments({ status: "completed" }),
        CustomerModel.countDocuments(),
        BookingModel.countDocuments({ status: "pending" }),
        ProviderModel.aggregate([{ $group: { _id: null, avg: { $avg: "$rating" } } }]),
      ]);

    res.json({
      revenue: revenueAgg[0]?.sum ?? 0,
      activeBookings,
      providersOnline,
      driversOnline,
      ordersDelivered,
      customers,
      pendingRequests,
      avgRating: Math.round((ratingAgg[0]?.avg ?? 0) * 10) / 10,
    });
  }),
);

dashboardRouter.get(
  "/activity",
  asyncHandler(async (_req, res) => {
    const bookings = env.useMemoryStore
      ? store.bookings.slice(0, 6)
      : await BookingModel.find().sort({ createdAt: -1 }).limit(6).lean();
    res.json(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      bookings.map((b: any) => ({
        id: String(b.id ?? b._id),
        title: `Booking ${b.status}`,
        detail: `${b.service} · ${b.customer}`,
        time: b.date,
      })),
    );
  }),
);
