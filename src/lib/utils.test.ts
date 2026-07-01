import { describe, it, expect } from "vitest";
import { cn, formatCurrency, formatNumber, timeAgo } from "./utils";

describe("cn", () => {
  it("merges and dedupes conflicting tailwind classes", () => {
    expect(cn("px-2", "px-4")).toBe("px-4");
    expect(cn("text-sm", false && "hidden", "font-bold")).toBe("text-sm font-bold");
  });
});

describe("formatCurrency", () => {
  it("formats INR without fraction digits", () => {
    expect(formatCurrency(485230)).toBe("₹4,85,230");
  });
  it("formats compactly (lakh)", () => {
    expect(formatCurrency(485230, true)).toMatch(/^₹4(\.\d)?L$/);
  });
});

describe("formatNumber", () => {
  it("formats with Indian grouping", () => {
    expect(formatNumber(1248)).toBe("1,248");
  });
  it("formats compactly using Indian notation (lakh)", () => {
    expect(formatNumber(2400000, true)).toBe("24L");
  });
});

describe("timeAgo", () => {
  it("returns a relative string for a recent time", () => {
    const tenMinAgo = new Date(Date.now() - 10 * 60 * 1000);
    expect(timeAgo(tenMinAgo)).toMatch(/minute/);
  });
  it("handles hours", () => {
    const threeHoursAgo = new Date(Date.now() - 3 * 60 * 60 * 1000);
    expect(timeAgo(threeHoursAgo)).toMatch(/hour/);
  });
});
