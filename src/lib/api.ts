
import { z } from "zod";
import type { EventType } from "../domain/schema";

const RecommendationSchema = z
  .object({
    ideas: z.array(z.string().min(1).max(250)).min(3).max(8),
    budgetItems: z
      .array(
        z
          .object({
            name: z.string().min(1).max(80),
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
            title: z.string().min(1).max(120),
            daysBeforeEvent: z.number().int().min(0).max(365),
          })
          .strict(),
      )
      .min(3)
      .max(12),
  })
  .strict();

export type EventRecommendations = z.infer<
  typeof RecommendationSchema
>;

export interface RecommendationOptions {
  eventType: EventType;
  eventDate: string;
  location: string;
  guestCount: number;
  totalBudget: number;
}

export async function generateRecommendations(
  options: RecommendationOptions,
  signal?: AbortSignal,
): Promise<EventRecommendations> {
  const response = await fetch("/api/plan", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(options),
    signal,
  });

  const data: unknown = await response.json().catch(() => null);

  if (!response.ok) {
    const message =
      typeof data === "object" &&
      data !== null &&
      "error" in data &&
      typeof data.error === "string"
        ? data.error
        : "Unable to generate event recommendations.";

    throw new Error(message);
  }

  const result = RecommendationSchema.safeParse(data);

  if (!result.success) {
    throw new Error(
      "The server returned invalid event recommendations.",
    );
  }

  return result.data;
}
