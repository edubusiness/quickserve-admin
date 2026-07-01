import type { Request, Response, NextFunction } from "express";
import { verifyToken, type JwtPayload } from "../utils/jwt.js";
import { ApiError } from "../utils/async-handler.js";

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

/** Requires a valid Bearer token; attaches the decoded user to req.user. */
export function authenticate(req: Request, _res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    throw new ApiError(401, "Authentication required");
  }
  try {
    req.user = verifyToken(header.slice(7));
    next();
  } catch {
    throw new ApiError(401, "Invalid or expired token");
  }
}

/** Restricts a route to one or more roles. super_admin always passes. */
export function requireRole(...roles: string[]) {
  return (req: Request, _res: Response, next: NextFunction) => {
    const role = req.user?.role;
    if (!role) throw new ApiError(401, "Authentication required");
    if (role !== "super_admin" && !roles.includes(role)) {
      throw new ApiError(403, "Insufficient permissions");
    }
    next();
  };
}
