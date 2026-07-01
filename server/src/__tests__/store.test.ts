import { describe, it, expect } from "vitest";
import { query } from "../db/store.js";

const data = [
  { id: "1", name: "Alpha", city: "Pune", amount: 30 },
  { id: "2", name: "Beta", city: "Delhi", amount: 10 },
  { id: "3", name: "Gamma", city: "Pune", amount: 20 },
];

describe("query engine", () => {
  it("paginates", () => {
    const r = query(data, { page: 1, limit: 2 });
    expect(r.total).toBe(3);
    expect(r.items).toHaveLength(2);
    expect(r.pages).toBe(2);
  });

  it("returns the requested page", () => {
    const r = query(data, { page: 2, limit: 2 });
    expect(r.items).toHaveLength(1);
    expect(r.page).toBe(2);
  });

  it("searches across the given fields (case-insensitive)", () => {
    const r = query(data, { search: "amm", searchFields: ["name"] });
    expect(r.items.map((i) => i.id)).toEqual(["3"]);
  });

  it("filters by exact field match", () => {
    const r = query(data, { filters: { city: "Pune" } });
    expect(r.total).toBe(2);
  });

  it("ignores filters set to 'all'", () => {
    const r = query(data, { filters: { city: "all" } });
    expect(r.total).toBe(3);
  });

  it("sorts ascending and descending", () => {
    expect(query(data, { sort: "amount", order: "asc" }).items.map((i) => i.amount)).toEqual([10, 20, 30]);
    expect(query(data, { sort: "amount", order: "desc" }).items.map((i) => i.amount)).toEqual([30, 20, 10]);
  });

  it("caps limit at 100", () => {
    const r = query(data, { limit: 999 });
    expect(r.limit).toBe(100);
  });
});
