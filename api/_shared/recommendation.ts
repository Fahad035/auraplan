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

export const PlanRequestSchema = z
  .object({
    eventType: EventTypeSchema,
    eventDate: EventDateSchema,
    location: z.string().trim().min(1).max(150),
    guestCount: z.number().int().min(1).max(100_000),
    totalBudget: z.number().int().positive().max(1_000_000_000),
  })
  .strict();

/**
 * Single source of truth for the AI response shape.
 * Imported by the serverless function and by the browser client so the
 * two validation layers cannot drift apart.
 */
export const RecommendationSchema = z
  .object({
    ideas: z.array(z.string().trim().min(1).max(250)).min(3).max(8),
    budgetItems: z
      .array(
        z
          .object({
            name: z.string().trim().min(1).max(80),
            amount: z.number().finite().nonnegative(),
          })
          .strict(),
      )
      .min(3)
      .max(10),
    timeline: z
      .array(
        z
          .object({
            title: z.string().trim().min(1).max(120),
            daysBeforeEvent: z.number().int().min(0).max(365),
          })
          .strict(),
      )
      .min(3)
      .max(12),
    vendors: z
      .array(
        z
          .object({
            name: z.string().trim().min(1).max(100),
            category: z.string().trim().min(1).max(40),
          })
          .strict(),
      )
      .max(10)
      .default([]),
  })
  .strict();

export type PlanRequest = z.infer<typeof PlanRequestSchema>;
export type Recommendations = z.infer<typeof RecommendationSchema>;

export type BudgetItem = {
  name: string;
  amount: number;
};

/**
 * Guarantees the allocated amount never exceeds the budget left after the
 * contingency reserve, regardless of what the model returned.
 */
export function enforceBudgetLimit(
  items: BudgetItem[],
  totalBudget: number,
  contingencyPercent = CONTINGENCY_PERCENT,
): BudgetItem[] {
  const contingency = Math.round(totalBudget * (contingencyPercent / 100));
  const availableBudget = Math.max(0, totalBudget - contingency);

  const normalizedItems = items.map((item) => ({
    ...item,
    amount: Math.round(item.amount),
  }));

  if (normalizedItems.length === 0) {
    return normalizedItems;
  }

  const allocated = normalizedItems.reduce((sum, item) => sum + item.amount, 0);

  if (allocated <= availableBudget) {
    return normalizedItems;
  }

  const largestAmount = Math.max(...normalizedItems.map((item) => item.amount));

  // Divide by the largest amount first to avoid overflow with huge values.
  const normalizedTotal = normalizedItems.reduce(
    (sum, item) => sum + item.amount / largestAmount,
    0,
  );

  const scaledItems = normalizedItems.map((item) => ({
    ...item,
    amount: Math.floor(
      (item.amount / largestAmount / normalizedTotal) * availableBudget,
    ),
  }));

  let remaining =
    availableBudget - scaledItems.reduce((sum, item) => sum + item.amount, 0);

  for (let index = 0; remaining > 0; index = (index + 1) % scaledItems.length) {
    scaledItems[index].amount += 1;
    remaining -= 1;
  }

  return scaledItems;
}

type RateLimitEntry = { timestamps: number[] };

/**
 * Sliding-window limiter. State is per serverless instance, so it is a
 * best-effort abuse guard; use a shared store (e.g. Vercel KV/Upstash)
 * for strict global limits.
 */
export function createRateLimiter(windowMs: number, maxRequests: number) {
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