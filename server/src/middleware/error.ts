import type { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";
import { ApiError } from "../utils/async-handler.js";

export function notFound(_req: Request, res: Response) {
  res.status(404).json({ error: "Route not found" });
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction) {
  if (err instanceof ApiError) {
    return res.status(err.status).json({ error: err.message });
  }
  if (err instanceof ZodError) {
    return res.status(422).json({ error: "Validation failed", details: err.flatten().fieldErrors });
  }
  console.error(err);
  res.status(500).json({ error: "Internal server error" });
}
