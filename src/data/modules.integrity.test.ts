import { describe, it, expect } from "vitest";
import { moduleRegistry, type TableModule } from "@/data/modules";

/**
 * Data-integrity guard: for every config-driven table module, every column key,
 * sub-key, filter key and searchKey must actually exist on the generated rows.
 * A mismatch here means a blank column in the table AND a blank field in the
 * create/edit form (the class of bug that hid the Customer field).
 */
const tableModules = Object.entries(moduleRegistry).filter(
  ([, m]) => m.kind === "table",
) as [string, TableModule][];

describe("module data integrity", () => {
  it("has table modules to check", () => {
    expect(tableModules.length).toBeGreaterThan(0);
  });

  for (const [key, mod] of tableModules) {
    describe(key, () => {
      const sample = mod.rows[0] ?? {};

      it("has at least one row", () => {
        expect(mod.rows.length).toBeGreaterThan(0);
      });

      it("every column key + sub exists on rows", () => {
        const missing: string[] = [];
        for (const col of mod.columns) {
          if (!col.header) continue; // action/utility columns
          if (col.key === "id" || col.key.startsWith("__")) continue;
          if (!(col.key in sample)) missing.push(`col:${col.key}`);
          if (col.sub && !(col.sub in sample)) missing.push(`sub:${col.sub}`);
        }
        expect(missing, `${key} references fields not in its rows`).toEqual([]);
      });

      it("filter key exists on rows", () => {
        if (mod.filters) expect(sample).toHaveProperty(mod.filters.key);
      });

      it("searchKeys exist on rows", () => {
        const missing = mod.searchKeys.filter((k) => k !== "id" && !(k in sample));
        expect(missing, `${key} searchKeys not in rows`).toEqual([]);
      });
    });
  }
});
