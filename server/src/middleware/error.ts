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

  // Translate Mongoose/Mongo errors to proper 4xx instead of a generic 500.
  const e = err as { name?: string; code?: number; message?: string; errors?: Record<string, { message: string }> };
  if (e?.name === "ValidationError") {
    const details: Record<string, string> = {};
    for (const [k, v] of Object.entries(e.errors ?? {})) details[k] = v.message;
    return res.status(422).json({ error: "Validation failed", details });
  }
  if (e?.name === "CastError") {
    return res.status(400).json({ error: "Invalid value for a field" });
  }
  if (e?.code === 11000) {
    return res.status(409).json({ error: "Duplicate value — a record with this key already exists" });
  }
  // Malformed JSON body (express.json throws a SyntaxError with a `body` prop).
  if (e?.name === "SyntaxError" && "body" in (err as object)) {
    return res.status(400).json({ error: "Malformed JSON body" });
  }

  console.error(err);
  res.status(500).json({ error: "Internal server error" });
}
