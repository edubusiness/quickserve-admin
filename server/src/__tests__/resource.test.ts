import { describe, it, expect, beforeAll } from "vitest";
import request from "supertest";
import { createApp } from "../app.js";
import { seedUsers } from "../seed/seed.js";

const app = createApp();
let adminToken = "";
let supportToken = "";
const auth = (t: string) => ({ Authorization: `Bearer ${t}` });

beforeAll(async () => {
  await seedUsers();
  adminToken = (
    await request(app).post("/api/auth/login").send({ email: "admin@quickserve.io", password: "admin123" })
  ).body.token;
  supportToken = (
    await request(app).post("/api/auth/login").send({ email: "support@quickserve.io", password: "support123" })
  ).body.token;
});

describe("customers resource", () => {
  it("requires authentication", async () => {
    expect((await request(app).get("/api/customers")).status).toBe(401);
  });

  it("lists with pagination", async () => {
    const res = await request(app).get("/api/customers?limit=5").set(auth(adminToken));
    expect(res.status).toBe(200);
    expect(res.body.items).toHaveLength(5);
    expect(res.body.total).toBeGreaterThan(0);
    expect(res.body.pages).toBeGreaterThan(1);
  });

  it("filters by status", async () => {
    const res = await request(app).get("/api/customers?status=active&limit=100").set(auth(adminToken));
    expect(res.body.items.every((c: { status: string }) => c.status === "active")).toBe(true);
  });

  it("sorts by a column", async () => {
    const res = await request(app).get("/api/customers?sort=spent&order=desc&limit=5").set(auth(adminToken));
    const spents = res.body.items.map((c: { spent: number }) => c.spent);
    expect([...spents]).toEqual([...spents].sort((a, b) => b - a));
  });

  it("creates a record as admin", async () => {
    const res = await request(app)
      .post("/api/customers")
      .set(auth(adminToken))
      .send({ name: "Test", email: "t@t.com", phone: "123", city: "Pune", status: "active" });
    expect(res.status).toBe(201);
    expect(res.body.id).toBeTruthy();
  });

  it("forbids create for the support role (RBAC)", async () => {
    const res = await request(app).post("/api/customers").set(auth(supportToken)).send({ name: "X" });
    expect(res.status).toBe(403);
  });

  it("updates and deletes a record", async () => {
    const created = await request(app)
      .post("/api/customers")
      .set(auth(adminToken))
      .send({ name: "ToEdit", email: "e@e.com", phone: "1", city: "Pune", status: "active" });
    const id = created.body.id;

    const upd = await request(app).patch(`/api/customers/${id}`).set(auth(adminToken)).send({ name: "Edited" });
    expect(upd.status).toBe(200);
    expect(upd.body.name).toBe("Edited");

    const del = await request(app).delete(`/api/customers/${id}`).set(auth(adminToken));
    expect(del.body.deleted).toBe(id);

    expect((await request(app).get(`/api/customers/${id}`).set(auth(adminToken))).status).toBe(404);
  });

  it("performs a bulk update", async () => {
    const list = await request(app).get("/api/customers?limit=2").set(auth(adminToken));
    const ids = list.body.items.map((c: { id: string }) => c.id);
    const res = await request(app)
      .post("/api/customers/bulk")
      .set(auth(adminToken))
      .send({ ids, action: "update", patch: { status: "inactive" } });
    expect(res.body.updated).toBe(ids.length);
  });

  it("rejects bulk with a non-array ids (422)", async () => {
    const res = await request(app)
      .post("/api/customers/bulk")
      .set(auth(adminToken))
      .send({ ids: "nope", action: "delete" });
    expect(res.status).toBe(422);
  });
});
