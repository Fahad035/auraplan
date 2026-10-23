import { z } from "zod";

export const CONTINGENCY_PERCENT = 10;

export const EventTypeSchema = z.enum(["wedding", "birthday", "community"]);

/** Field limits shared by request validation, model output and the UI. */
export const LIMITS = {
  maxLocationLength: 150,
  maxGuests: 100_000,
  maxBudget: 1_000_000_000,
  minFeedbackLength: 3,
  maxFeedbackLength: 300,
} as const;

export const EventDateSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format.")
  .refine((value) => {
    const parsed = new Date(`${value}T00:00:00.000Z`);

    return (
      !Number.isNaN(parsed.getTime()) &&
      parsed.toISOString().slice(0, 10) === value
    );
  }, "Invalid calendar date.");

// Building blocks reused by every schema below, so each field limit is
// declared exactly once.
const requiredText = (maxLength: number) =>
  z.string().trim().min(1).max(maxLength);

const listOf = <T extends z.ZodType>(item: T, min: number, max: number) =>
  z.array(item).min(min).max(max);

const IdeaSchema = requiredText(250);
const DaysBeforeSchema = z.number().int().min(0).max(365);
const UrgentSchema = z.boolean().default(false);

const BudgetAmountShape = {
  name: requiredText(80),
  amount: z.number().finite().nonnegative(),
};

const BudgetWeightShape = {
  name: requiredText(80),
  weight: z.number().finite().positive().max(1_000_000),
};

const TimelineTaskShape = {
  title: requiredText(120),
  daysBeforeEvent: DaysBeforeSchema,
};

const VendorRoleShape = {
  name: requiredText(100),
  category: requiredText(40),
};

const VendorAdviceShape = {
  ...VendorRoleShape,
  tip: z.string().trim().max(200).default(""),
  bookByDaysBefore: DaysBeforeSchema.default(30),
};

/** The current plan, sent back to the model when the user asks for changes. */
export const PreviousPlanSchema = z.strictObject({
  ideas: listOf(IdeaSchema, 0, 8),
  budgetItems: listOf(z.strictObject(BudgetAmountShape), 0, 10),
  timeline: listOf(z.strictObject(TimelineTaskShape), 0, 12),
  vendors: listOf(z.strictObject(VendorRoleShape), 0, 10),
});

export const PlanRequestSchema = z
  .strictObject({
    eventType: EventTypeSchema,
    eventDate: EventDateSchema,
    location: requiredText(LIMITS.maxLocationLength),
    guestCount: z.number().int().min(1).max(LIMITS.maxGuests),
    totalBudget: z.number().int().positive().max(LIMITS.maxBudget),
    feedback: z
      .string()
      .trim()
      .min(LIMITS.minFeedbackLength)
      .max(LIMITS.maxFeedbackLength)
      .optional(),
    previousPlan: PreviousPlanSchema.optional(),
  })
  .refine((value) => Boolean(value.feedback) === Boolean(value.previousPlan), {
    message: "feedback and previousPlan must be provided together.",
  });

/**
 * What the model returns. The model supplies judgment (relative budget
 * weights, task offsets, vendor advice); code does the arithmetic.
 */
export const ModelOutputSchema = z.strictObject({
  ideas: listOf(IdeaSchema, 3, 8),
  budgetItems: listOf(z.strictObject(BudgetWeightShape), 3, 10),
  timeline: listOf(z.strictObject(TimelineTaskShape), 3, 12),
  vendors: listOf(z.strictObject(VendorAdviceShape), 0, 10).default([]),
});

/** What the API returns to the browser after server-side enrichment. */
export const RecommendationSchema = z.strictObject({
  ideas: listOf(IdeaSchema, 3, 8),
  budgetItems: listOf(z.strictObject(BudgetAmountShape), 3, 10),
  timeline: listOf(
    z.strictObject({ ...TimelineTaskShape, urgent: UrgentSchema }),
    3,
    12,
  ),
  vendors: listOf(
    z.strictObject({ ...VendorAdviceShape, urgent: UrgentSchema }),
    0,
    10,
  ).default([]),
});

/**
 * Turns relative weights into whole-number amounts that add up to exactly
 * `total` (largest-remainder rounding).
 */
function allocateBudget(
  items: { name: string; weight: number }[],
  total: number,
): { name: string; amount: number }[] {
  const weightSum = items.reduce((sum, item) => sum + item.weight, 0);
  const exact = items.map((item) => (total * item.weight) / weightSum);
  const amounts = exact.map(Math.floor);

  let leftover = total - amounts.reduce((sum, amount) => sum + amount, 0);

  const byRemainder = exact
    .map((value, index) => ({ index, remainder: value - amounts[index] }))
    .sort((a, b) => b.remainder - a.remainder || a.index - b.index);

  for (const { index } of byRemainder) {
    if (leftover <= 0) break;
    amounts[index] += 1;
    leftover -= 1;
  }

  return items.map((item, index) => ({
    name: item.name,
    amount: amounts[index],
  }));
}

type RateLimitEntry = { timestamps: number[] };

/**
 * Sliding-window limiter. State is per serverless instance, so it is a
 * best-effort abuse guard; use a shared store (e.g. Vercel KV/Upstash)
 * for strict global limits.
 */
function createRateLimiter(windowMs: number, maxRequests: number) {
  const store = new Map<string, RateLimitEntry>();
  let lastSweep = 0;

  return function check(ip: string, now = Date.now()) {
    if (now - lastSweep >= windowMs) {
      lastSweep = now;
      for (const [key, entry] of store) {
        if (entry.timestamps.every((t) => now - t >= windowMs)) {
          store.delete(key);
        }
      }
    }

    const entry = store.get(ip) ?? { timestamps: [] };
    entry.timestamps = entry.timestamps.filter((t) => now - t < windowMs);

    if (entry.timestamps.length >= maxRequests) {
      store.set(ip, entry);
      return {
        allowed: false,
        remaining: 0,
        resetAt: entry.timestamps[0] + windowMs,
      };
    }

    entry.timestamps.push(now);
    store.set(ip, entry);

    return {
      allowed: true,
      remaining: maxRequests - entry.timestamps.length,
      resetAt: now + windowMs,
    };
  };
}

// --- exports (the API function inlines everything above this line) ---
export { allocateBudget, createRateLimiter };
export type PlanRequest = z.infer<typeof PlanRequestSchema>;
export type PreviousPlan = z.infer<typeof PreviousPlanSchema>;
export type Recommendations = z.infer<typeof RecommendationSchema>;
