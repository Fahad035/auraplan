import { describe, expect, it } from "vitest";
import {
  ModelOutputSchema,
  PlanRequestSchema,
  RecommendationSchema,
  allocateBudget,
  createRateLimiter,
} from "../../src/domain/recommendation";
import { buildVendorChecklist } from "../../src/domain/checklist";

const sum = (items: { amount: number }[]) =>
  items.reduce((total, item) => total + item.amount, 0);

describe("allocateBudget", () => {
  it("always adds up to exactly the total (largest remainder)", () => {
    const items = [
      { name: "A", weight: 33 },
      { name: "B", weight: 33 },
      { name: "C", weight: 34 },
    ];

    for (const total of [0, 1, 7, 100, 999, 90_001, 1_234_567]) {
      const result = allocateBudget(items, total);

      expect(sum(result)).toBe(total);
      expect(result.every((item) => Number.isInteger(item.amount))).toBe(true);
    }
  });

  it("splits in proportion to weights", () => {
    expect(
      allocateBudget(
        [
          { name: "Venue", weight: 50 },
          { name: "Food", weight: 30 },
          { name: "Decor", weight: 20 },
        ],
        1000,
      ),
    ).toEqual([
      { name: "Venue", amount: 500 },
      { name: "Food", amount: 300 },
      { name: "Decor", amount: 200 },
    ]);
  });

  it("gives the leftover rupee to the largest remainder", () => {
    const result = allocateBudget(
      [
        { name: "A", weight: 1 },
        { name: "B", weight: 1 },
        { name: "C", weight: 1 },
      ],
      100,
    );

    expect(result.map((item) => item.amount)).toEqual([34, 33, 33]);
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

  const previousPlan = {
    ideas: ["a"],
    budgetItems: [{ name: "Venue", amount: 100 }],
    timeline: [{ title: "Book venue", daysBeforeEvent: 30 }],
    vendors: [{ name: "Caterer", category: "Catering" }],
  };

  it("accepts a valid request", () => {
    expect(PlanRequestSchema.safeParse(valid).success).toBe(true);
  });

  it("accepts a refinement with feedback and a previous plan", () => {
    expect(
      PlanRequestSchema.safeParse({
        ...valid,
        feedback: "make it cheaper",
        previousPlan,
      }).success,
    ).toBe(true);
  });

  it("requires feedback and previousPlan together", () => {
    expect(
      PlanRequestSchema.safeParse({ ...valid, feedback: "make it cheaper" })
        .success,
    ).toBe(false);
    expect(PlanRequestSchema.safeParse({ ...valid, previousPlan }).success).toBe(
      false,
    );
  });

  it.each([
    { eventType: "party" },
    { eventDate: "2030-02-31" },
    { guestCount: 0 },
    { totalBudget: 10.5 },
    { location: "   " },
    { feedback: "x".repeat(301), previousPlan: undefined },
    { extra: "field" },
  ])("rejects invalid input %o", (override) => {
    expect(PlanRequestSchema.safeParse({ ...valid, ...override }).success).toBe(
      false,
    );
  });
});

describe("ModelOutputSchema", () => {
  const base = {
    ideas: ["a", "b", "c"],
    budgetItems: [
      { name: "Venue", weight: 40 },
      { name: "Food", weight: 35 },
      { name: "Decor", weight: 25 },
    ],
    timeline: [
      { title: "a", daysBeforeEvent: 1 },
      { title: "b", daysBeforeEvent: 2 },
      { title: "c", daysBeforeEvent: 3 },
    ],
  };

  it("defaults vendors and vendor details", () => {
    expect(ModelOutputSchema.parse(base).vendors).toEqual([]);

    const withVendor = ModelOutputSchema.parse({
      ...base,
      vendors: [{ name: "Caterer", category: "Catering" }],
    });

    expect(withVendor.vendors[0]).toMatchObject({ tip: "", bookByDaysBefore: 30 });
  });

  it("rejects currency amounts and non-positive weights", () => {
    expect(
      ModelOutputSchema.safeParse({
        ...base,
        budgetItems: [{ name: "Venue", amount: 5 }, ...base.budgetItems.slice(1)],
      }).success,
    ).toBe(false);
    expect(
      ModelOutputSchema.safeParse({
        ...base,
        budgetItems: [{ name: "Venue", weight: 0 }, ...base.budgetItems.slice(1)],
      }).success,
    ).toBe(false);
  });
});

describe("RecommendationSchema", () => {
  const base = {
    ideas: ["a", "b", "c"],
    budgetItems: [
      { name: "Venue", amount: 60000 },
      { name: "Food", amount: 50000 },
      { name: "Decor", amount: 40000 },
    ],
    timeline: [
      { title: "a", daysBeforeEvent: 1 },
      { title: "b", daysBeforeEvent: 2 },
      { title: "c", daysBeforeEvent: 3 },
    ],
  };

  it("fills defaults for vendors and urgency", () => {
    const result = RecommendationSchema.parse(base);

    expect(result.vendors).toEqual([]);
    expect(result.timeline.every((item) => item.urgent === false)).toBe(true);
  });

  it("rejects too few ideas", () => {
    expect(RecommendationSchema.safeParse({ ...base, ideas: ["a"] }).success).toBe(
      false,
    );
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