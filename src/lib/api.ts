import { z } from "zod";

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
  totalBudget: number;
  eventDate: string;
}

export async function generateRecommendations(
  prompt: string,
  options: RecommendationOptions,
  signal?: AbortSignal,
): Promise<EventRecommendations> {
  const response = await fetch("/api/plan", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      prompt,
      totalBudget: options.totalBudget,
      eventDate: options.eventDate,
    }),
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