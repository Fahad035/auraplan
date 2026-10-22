import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

/**
 * api/plan.ts inlines the shared schema because Vercel does not bundle
 * relative imports for the ESM function. This test fails if the inlined
 * copy drifts from src/domain/recommendation.ts.
 */
function extract(file: string, start: string, end: string): string {
  const source = readFileSync(file, "utf8").replace(/^export /gm, "");
  const from = source.indexOf(start);
  const to = source.indexOf(end, from);

  expect(from).toBeGreaterThanOrEqual(0);
  expect(to).toBeGreaterThan(from);

  return source.slice(from, to).replace(/\s+/g, " ").trim();
}

describe("inlined API schema parity", () => {
  it.each([
    ["const EventTypeSchema", "const PlanRequestSchema", "const PlanRequestSchema"],
    ["const PlanRequestSchema", "const RecommendationSchema", "const RecommendationSchema"],
    ["const RecommendationSchema", "type BudgetItem", "type PlanRequest ="],
    ["function enforceBudgetLimit", "type RateLimitEntry", "type RateLimitEntry"],
  ])("keeps %s identical", (start, apiEnd, sharedEnd) => {
    expect(extract("api/plan.ts", start, apiEnd)).toBe(
      extract("src/domain/recommendation.ts", start, sharedEnd),
    );
  });
});