import { describe, expect, it } from "vitest";
import {
  PlanRequestSchema,
  RecommendationSchema,
  createRateLimiter,
  enforceBudgetLimit,
} from "../../api/_shared/recommendation";
import { buildVendorChecklist } from "../../src/domain/checklist";

const items = [
  { name: "Venue", amount: 60000 },
  { name: "Food", amount: 50000 },
  { name: "Decor", amount: 40000 },
];

describe("enforceBudgetLimit", () => {
  it("keeps items unchanged when already within the available budget", () => {
    expect(enforceBudgetLimit(items, 200000)).toEqual(items);
  });

  it("scales items so the total never exceeds budget minus contingency", () => {
    const result = enforceBudgetLimit(items, 100000);
    const total = result.reduce((sum, item) => sum + item.amount, 0);

    expect(total).toBe(90000);
    expect(result.every((item) => Number.isInteger(item.amount))).toBe(true);
  });

  it("handles zero amounts and empty lists", () => {
    expect(enforceBudgetLimit([], 1000)).toEqual([]);
    expect(enforceBudgetLimit([{ name: "A", amount: 0 }], 1000)).toEqual([
      { name: "A", amount: 0 },
    ]);
  });

  it("rounds fractional amounts", () => {
    expect(enforceBudgetLimit([{ name: "A", amount: 10.6 }], 1000)[0].amount).toBe(11);
  });
});

describe("PlanRequestSchema", () => {
  const valid = {
    eventType: "wedding",
    eventDate: "2030-01-15",
    location: "Hyderabad",
    guestCount: 100,
    totalBudget: 500000,
  };

  it("accepts a valid request", () => {
    expect(PlanRequestSchema.safeParse(valid).success).toBe(true);
  });

  it.each([
    { eventType: "party" },
    { eventDate: "2030-02-31" },
    { guestCount: 0 },
    { totalBudget: 10.5 },
    { location: "   " },
    { extra: "field" },
  ])("rejects invalid input %o", (override) => {
    expect(PlanRequestSchema.safeParse({ ...valid, ...override }).success).toBe(false);
  });
});

describe("RecommendationSchema", () => {
  const base = {
    ideas: ["a", "b", "c"],
    budgetItems: items,
    timeline: [
      { title: "a", daysBeforeEvent: 1 },
      { title: "b", daysBeforeEvent: 2 },
      { title: "c", daysBeforeEvent: 3 },
    ],
  };

  it("defaults vendors to an empty list", () => {
    const result = RecommendationSchema.parse(base);
    expect(result.vendors).toEqual([]);
  });

  it("rejects too few ideas", () => {
    expect(RecommendationSchema.safeParse({ ...base, ideas: ["a"] }).success).toBe(false);
  });
});

describe("createRateLimiter", () => {
  it("blocks after the limit and recovers after the window", () => {
    const check = createRateLimiter(1000, 2);

    expect(check("ip", 0).allowed).toBe(true);
    expect(check("ip", 1).allowed).toBe(true);
    expect(check("ip", 2).allowed).toBe(false);
    expect(check("other", 2).allowed).toBe(true);
    expect(check("ip", 1500).allowed).toBe(true);
  });
});

describe("buildVendorChecklist", () => {
  it("uses AI suggestions when present", () => {
    const vendors = buildVendorChecklist(
      "wedding",
      [{ name: "Caterer", category: "Catering" }],
      () => "id",
    );
    expect(vendors).toEqual([
      { id: "id", name: "Caterer", category: "Catering", booked: false },
    ]);
  });

  it("falls back to a template so the checklist is never empty", () => {
    expect(buildVendorChecklist("birthday").length).toBeGreaterThan(0);
    expect(buildVendorChecklist("community").every((v) => !v.booked)).toBe(true);
  });
});