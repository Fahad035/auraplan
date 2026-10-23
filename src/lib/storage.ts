import { EventPlanSchema, type EventPlan } from "../domain/schema";

const STORAGE_KEY = "auraplan:event-plans";

export function loadEventPlans(): EventPlan[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);

    if (!raw) return [];

    const parsed: unknown = JSON.parse(raw);

    if (!Array.isArray(parsed)) return [];

    return parsed.flatMap((item) => {
      const result = EventPlanSchema.safeParse(item);
      return result.success ? [result.data] : [];
    });
  } catch {
    return [];
  }
}

export function saveEventPlans(plans: EventPlan[]): void {
  const validated = plans.map((plan) => EventPlanSchema.parse(plan));
  localStorage.setItem(STORAGE_KEY, JSON.stringify(validated));
}
