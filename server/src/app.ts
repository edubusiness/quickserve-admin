import express from "express";
import cors from "cors";
import morgan from "morgan";
import { env } from "./config/env.js";
import { authRouter } from "./routes/auth.routes.js";
import { dashboardRouter } from "./routes/dashboard.routes.js";
import { resourceRouter } from "./routes/resource.js";
import { collectionsRouter } from "./routes/collections.routes.js";
import { notFound, errorHandler } from "./middleware/error.js";

export function createApp() {
  const app = express();

  app.use(cors({ origin: env.clientOrigin.split(","), credentials: true }));
  app.use(express.json());
  if (env.nodeEnv !== "test") app.use(morgan("dev"));

  app.get("/health", (_req, res) =>
    res.json({ status: "ok", mode: env.useMemoryStore ? "memory" : "mongodb", time: new Date().toISOString() }),
  );

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
