import type { EventType } from "../domain/schema";
import {
  RecommendationSchema,
  type PreviousPlan,
  type Recommendations,
} from "../domain/recommendation";

export type EventRecommendations = Recommendations;

export interface RecommendationOptions {
  eventType: EventType;
  eventDate: string;
  location: string;
  guestCount: number;
  totalBudget: number;
  /** Plain-language change request; requires previousPlan. */
  feedback?: string;
  previousPlan?: PreviousPlan;
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