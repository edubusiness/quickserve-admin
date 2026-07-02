import express from "express";
import cors from "cors";
import morgan from "morgan";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { env } from "./config/env.js";
import { authRouter } from "./routes/auth.routes.js";
import { dashboardRouter } from "./routes/dashboard.routes.js";
import { resourceRouter } from "./routes/resource.js";
import { collectionsRouter } from "./routes/collections.routes.js";
import { notFound, errorHandler } from "./middleware/error.js";

export function createApp() {
  const app = express();

  // Behind a proxy (Render/Vercel/Nginx) so rate-limit sees the real client IP.
  app.set("trust proxy", 1);
  app.use(helmet());
  app.use(cors({ origin: env.clientOrigin.split(","), credentials: true }));
  app.use(express.json({ limit: "1mb" }));
  if (env.nodeEnv !== "test") app.use(morgan("dev"));

  app.get("/health", (_req, res) =>
    res.json({ status: "ok", mode: env.useMemoryStore ? "memory" : "mongodb", time: new Date().toISOString() }),
  );

  // Throttle credential endpoints to blunt brute-force / credential-stuffing.
  const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 20,
    standardHeaders: "draft-7",
    legacyHeaders: false,
    message: { error: "Too many attempts. Please try again later." },
    skip: () => env.nodeEnv === "test",
  });

  app.use("/api/auth/login", authLimiter);
  app.use("/api/auth/register", authLimiter);
  app.use("/api/auth", authRouter);
  app.use("/api/dashboard", dashboardRouter);

  app.use(
    "/api/bookings",
    resourceRouter({
      collection: "bookings",
      searchFields: ["id", "customer", "service", "provider", "city"],
      filterKeys: ["status", "city", "category"],
    }),
  );
  app.use(
    "/api/customers",
    resourceRouter({
      collection: "customers",
      searchFields: ["id", "name", "email", "phone", "city"],
      filterKeys: ["status", "city"],
    }),
  );
  app.use(
    "/api/providers",
    resourceRouter({
      collection: "providers",
      searchFields: ["id", "name", "category", "city"],
      filterKeys: ["status", "category", "city"],
    }),
  );
  app.use(
    "/api/drivers",
    resourceRouter({
      collection: "drivers",
      searchFields: ["id", "name", "vehicle", "vehicleNo", "city"],
      filterKeys: ["status", "city"],
    }),
  );
  app.use(
    "/api/payments",
    resourceRouter({
      collection: "payments",
      searchFields: ["id", "customer", "service", "method"],
      filterKeys: ["status", "method"],
    }),
  );
  app.use(
    "/api/categories",
    resourceRouter({
      collection: "categories",
      searchFields: ["id", "name"],
      filterKeys: ["status"],
    }),
  );
  app.use("/api/collections", collectionsRouter);

  app.use(notFound);
  app.use(errorHandler);

  return app;
}
