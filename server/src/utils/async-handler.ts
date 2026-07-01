import type { Request, Response, NextFunction } from "express";

/** Wraps async route handlers so rejected promises reach the error middleware. */
export const asyncHandler =
  (fn: (req: Request, res: Response, next: NextFunction) => Promise<unknown>) =>
  (req: Request, res: Response, next: NextFunction) =>
    Promise.resolve(fn(req, res, next)).catch(next);

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}
