import { describe, it, expect, beforeAll } from "vitest";
import request from "supertest";
import { createApp } from "../app.js";
import { seedUsers } from "../seed/seed.js";

const app = createApp();

beforeAll(async () => {
  await seedUsers();
});

describe("auth", () => {
  it("logs in the super admin and returns a token", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: "admin@quickserve.io", password: "admin123" });
    expect(res.status).toBe(200);
    expect(res.body.token).toBeTruthy();
    expect(res.body.user.role).toBe("super_admin");
    expect(res.body.user).not.toHaveProperty("passwordHash");
  });

  it("rejects an invalid password with 401", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: "admin@quickserve.io", password: "wrongpassword" });
    expect(res.status).toBe(401);
  });

  it("validates malformed input with 422", async () => {
    const res = await request(app).post("/api/auth/login").send({ email: "not-an-email" });
    expect(res.status).toBe(422);
  });

  it("returns the current user for a valid token", async () => {
    const login = await request(app)
      .post("/api/auth/login")
      .send({ email: "manager@quickserve.io", password: "manager123" });
    const res = await request(app)
      .get("/api/auth/me")
      .set("Authorization", `Bearer ${login.body.token}`);
    expect(res.status).toBe(200);
    expect(res.body.user.email).toBe("manager@quickserve.io");
  });

  it("blocks /me without a token", async () => {
    const res = await request(app).get("/api/auth/me");
    expect(res.status).toBe(401);
  });

  it("registers a new user", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send({ name: "New Admin", email: `new${Date.now()}@mail.com`, password: "secret1" });
    expect(res.status).toBe(201);
    expect(res.body.token).toBeTruthy();
    expect(res.body.user.role).toBe("admin");
  });
});
