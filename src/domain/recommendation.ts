import { z } from "zod";

export const CONTINGENCY_PERCENT = 10;

export const EventTypeSchema = z.enum(["wedding", "birthday", "community"]);

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

// Shared primitive schemas
const IdeaSchema = z.string().trim().min(1).max(250);
const ItemNameSchema = z.string().trim().min(1).max(80);
const TimelineTitleSchema = z.string().trim().min(1).max(120);
const VendorNameSchema = z.string().trim().min(1).max(100);
const VendorCategorySchema = z.string().trim().min(1).max(40);
const VendorTipSchema = z.string().trim().max(200);
const DaysBeforeEventSchema = z.number().int().min(0).max(365);

// Shared object schemas
const BudgetAmountSchema = z
  .object({
    name: ItemNameSchema,
    amount: z.number().finite().nonnegative(),
  })
  .strict();

const TimelineItemSchema = z
  .object({
    title: TimelineTitleSchema,
    daysBeforeEvent: DaysBeforeEventSchema,
  })
  .strict();

const VendorBaseSchema = z.object({
  name: VendorNameSchema,
  category: VendorCategorySchema,
});

const VendorRecommendationSchema = VendorBaseSchema.extend({
  tip: VendorTipSchema.default(""),
  bookByDaysBefore: z.number().int().min(0).max(365).default(30),
}).strict();

const PreviousVendorSchema = VendorBaseSchema.strict();

const ModelBudgetItemSchema = z
  .object({
    name: ItemNameSchema,
    weight: z.number().finite().positive().max(1_000_000),
  })
  .strict();

const RecommendedTimelineItemSchema = TimelineItemSchema.extend({
  urgent: z.boolean().default(false),
}).strict();

const RecommendedVendorSchema = VendorRecommendationSchema.extend({
  urgent: z.boolean().default(false),
}).strict();

/** The current plan, sent back to the model when the user asks for changes. */
export const PreviousPlanSchema = z
  .object({
    ideas: z.array(IdeaSchema).max(8),
    budgetItems: z.array(BudgetAmountSchema).max(10),
    timeline: z.array(TimelineItemSchema).max(12),
    vendors: z.array(PreviousVendorSchema).max(10),
  })
  .strict();

export const PlanRequestSchema = z
  .object({
    eventType: EventTypeSchema,
    eventDate: EventDateSchema,
    location: z.string().trim().min(1).max(150),
    guestCount: z.number().int().min(1).max(100_000),
    totalBudget: z.number().int().positive().max(1_000_000_000),
    feedback: z.string().trim().min(3).max(300).optional(),
    previousPlan: PreviousPlanSchema.optional(),
  })
  .strict()
  .refine((value) => Boolean(value.feedback) === Boolean(value.previousPlan), {
    message: "feedback and previousPlan must be provided together.",
  });

/**
 * Model output contains relative budget weights; application code
 * performs the budget arithmetic.
 */
export const ModelOutputSchema = z
  .object({
    ideas: z.array(IdeaSchema).min(3).max(8),
    budgetItems: z.array(ModelBudgetItemSchema).min(3).max(10),
    timeline: z.array(TimelineItemSchema).min(3).max(12),
    vendors: z.array(VendorRecommendationSchema).max(10).default([]),
  })
  .strict();

/** API response after server-side enrichment. */
export const RecommendationSchema = z
  .object({
    ideas: z.array(IdeaSchema).min(3).max(8),
    budgetItems: z.array(BudgetAmountSchema).min(3).max(10),
    timeline: z
      .array(RecommendedTimelineItemSchema)
      .min(3)
      .max(12),
    vendors: z.array(RecommendedVendorSchema).max(10).default([]),
  })
  .strict();


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