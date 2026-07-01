import { Router } from "express";
import { z } from "zod";
import { type User } from "../db/store.js";
import { usersRepo } from "../db/users-repo.js";
import { hashPassword, verifyPassword } from "../utils/password.js";
import { signToken } from "../utils/jwt.js";
import { asyncHandler, ApiError } from "../utils/async-handler.js";
import { authenticate } from "../middleware/auth.js";

export const authRouter = Router();

const credentials = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

const registerSchema = credentials.extend({
  name: z.string().min(2),
  role: z.enum(["admin", "manager", "support"]).optional(),
});

const publicUser = (u: User) => ({
  id: u.id,
  name: u.name,
  email: u.email,
  role: u.role,
  avatar: u.avatar,
});

authRouter.post(
  "/register",
  asyncHandler(async (req, res) => {
    const { name, email, password, role } = registerSchema.parse(req.body);
    if (await usersRepo.findByEmail(email)) {
      throw new ApiError(409, "Email already registered");
    }
    const user = await usersRepo.create({
      name,
      email: email.toLowerCase(),
      passwordHash: await hashPassword(password),
      role: role ?? "admin",
      avatar: "https://i.pravatar.cc/80?img=15",
      createdAt: new Date().toISOString(),
    });
    const token = signToken({ sub: user.id, email: user.email, role: user.role, name: user.name });
    res.status(201).json({ token, user: publicUser(user) });
  }),
);

authRouter.post(
  "/login",
  asyncHandler(async (req, res) => {
    const { email, password } = credentials.parse(req.body);
    const user = await usersRepo.findByEmail(email);
    if (!user || !(await verifyPassword(password, user.passwordHash))) {
      throw new ApiError(401, "Invalid email or password");
    }
    const token = signToken({ sub: user.id, email: user.email, role: user.role, name: user.name });
    res.json({ token, user: publicUser(user) });
  }),
);

authRouter.get(
  "/me",
  authenticate,
  asyncHandler(async (req, res) => {
    const user = await usersRepo.findById(req.user!.sub);
    if (!user) throw new ApiError(404, "User not found");
    res.json({ user: publicUser(user) });
  }),
);
