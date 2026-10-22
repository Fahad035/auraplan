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
    ["const EventTypeSchema", "const PreviousPlanSchema"],
    ["const PreviousPlanSchema", "const PlanRequestSchema"],
    ["const PlanRequestSchema", "const ModelOutputSchema"],
    ["const ModelOutputSchema", "const RecommendationSchema"],
    ["const RecommendationSchema", "type RateLimitEntry"],
  ])("keeps %s identical", (start, end) => {
    expect(extract("api/plan.ts", start, end)).toBe(
      extract("src/domain/recommendation.ts", start, end),
    );
  });

  it("keeps the rate limiter identical", () => {
    expect(
      extract("api/plan.ts", "function createRateLimiter", "const MAX_REQUEST_BYTES"),
    ).toBe(
      extract("src/domain/recommendation.ts", "function createRateLimiter", "// --- exports"),
    );
  });
});