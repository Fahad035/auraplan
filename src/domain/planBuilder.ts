import { buildVendorChecklist } from "./checklist";
import { formatLocalDate } from "./dates";
import type { EventInput } from "./eventInput";
import { randomId } from "./ids";
import {
  CONTINGENCY_PERCENT,
  type PreviousPlan,
  type Recommendations,
} from "./recommendation";
import {
  EventPlanSchema,
  type EventPlan,
  type EventType,
  type TimelineItem,
  type Vendor,
} from "./schema";

const DAY_MS = 86_400_000;

/** How much of a plan is sent back to the model when refining. */
const PREVIOUS_PLAN_LIMITS = {
  ideas: 8,
  ideaLength: 250,
  budgetItems: 10,
  budgetNameLength: 80,
  timeline: 12,
  taskTitleLength: 120,
  vendors: 10,
  vendorNameLength: 100,
  vendorCategoryLength: 40,
} as const;

/** The calendar date that falls `days` before `eventDate` (YYYY-MM-DD). */
export function dateBefore(eventDate: string, days: number): string {
  const date = new Date(`${eventDate}T12:00:00`);
  date.setDate(date.getDate() - days);

  return formatLocalDate(date);
}

/** Whole days from `date` until `eventDate`, clamped to 0..365. */
export function daysUntil(eventDate: string, date: string): number {
  const diff = Math.round(
    (new Date(`${eventDate}T12:00:00`).getTime() -
      new Date(`${date}T12:00:00`).getTime()) /
      DAY_MS,
  );

  return Math.min(365, Math.max(0, diff));
}

export function buildTimeline(
  eventDate: string,
  items: Recommendations["timeline"],
  createId: () => string = randomId,
): TimelineItem[] {
  return items.map((item) => ({
    id: createId(),
    title: item.title,
    date: dateBefore(eventDate, item.daysBeforeEvent),
    completed: false,
    ...(item.urgent ? { urgent: true } : {}),
  }));
}

export function buildVendors(
  eventType: EventType,
  eventDate: string,
  suggestions: Recommendations["vendors"] = [],
  createId: () => string = randomId,
): Vendor[] {
  const vendors = buildVendorChecklist(eventType, suggestions, createId);

  return vendors.map((vendor, index) => {
    const suggestion = suggestions[index];

    if (!suggestion) return vendor;

    return {
      ...vendor,
      ...(suggestion.tip ? { tip: suggestion.tip } : {}),
      bookBy: dateBefore(eventDate, suggestion.bookByDaysBefore),
    };
  });
}

const clip = (value: string, max: number) => value.trim().slice(0, max);

/** Compact view of a plan sent back to the model when refining. */
export function toPreviousPlan(plan: EventPlan): PreviousPlan {
  const limits = PREVIOUS_PLAN_LIMITS;

  return {
    ideas: plan.ideas
      .slice(0, limits.ideas)
      .map((idea) => clip(idea, limits.ideaLength)),
    budgetItems: plan.budgetItems.slice(0, limits.budgetItems).map((item) => ({
      name: clip(item.name, limits.budgetNameLength),
      amount: item.amount,
    })),
    timeline: plan.timeline.slice(0, limits.timeline).map((item) => ({
      title: clip(item.title, limits.taskTitleLength),
      daysBeforeEvent: daysUntil(plan.eventDate, item.date),
    })),
    vendors: plan.vendors.slice(0, limits.vendors).map((vendor) => ({
      name: clip(vendor.name, limits.vendorNameLength),
      category: clip(vendor.category, limits.vendorCategoryLength),
    })),
  };
}

const norm = (value: string) => value.trim().toLowerCase();

/**
 * Replaces a plan's generated content with a revision, keeping completed
 * tasks and booked vendors (matched by title / name) and vendor contacts.
 */
export function applyRecommendations(
  plan: EventPlan,
  recommendations: Recommendations,
  createId: () => string = randomId,
): EventPlan {
  const completedTitles = new Set(
    plan.timeline.filter((item) => item.completed).map((i) => norm(i.title)),
  );
  const previousVendors = new Map(
    plan.vendors.map((vendor) => [norm(vendor.name), vendor]),
  );

  const timeline = buildTimeline(
    plan.eventDate,
    recommendations.timeline,
    createId,
  ).map((item) =>
    completedTitles.has(norm(item.title)) ? { ...item, completed: true } : item,
  );

  const vendors = buildVendors(
    plan.eventType,
    plan.eventDate,
    recommendations.vendors,
    createId,
  ).map((vendor) => {
    const previous = previousVendors.get(norm(vendor.name));

    return previous
      ? {
          ...vendor,
          booked: previous.booked,
          ...(previous.contact ? { contact: previous.contact } : {}),
        }
      : vendor;
  });

  return {
    ...plan,
    ideas: recommendations.ideas,
    budgetItems: recommendations.budgetItems.map((item) => ({
      id: createId(),
      name: item.name,
      amount: item.amount,
    })),
    timeline,
    vendors,
  };
}

/** Default plan title, e.g. "Birthday Celebration". */
function defaultPlanTitle(eventType: EventType): string {
  return `${eventType.charAt(0).toUpperCase()}${eventType.slice(1)} Celebration`;
}

/**
 * Builds a complete, validated plan from the user's event details and the
 * generated recommendations. Throws if the result does not match the schema.
 */
export function buildEventPlan(
  input: EventInput,
  recommendations: Recommendations,
  createId: () => string = randomId,
): EventPlan {
  const { eventType, eventDate } = input;

  const result = EventPlanSchema.safeParse({
    id: createId(),
    title: defaultPlanTitle(eventType),
    ...input,
    contingencyPercent: CONTINGENCY_PERCENT,
    budgetItems: recommendations.budgetItems.map((item) => ({
      id: createId(),
      name: item.name,
      amount: item.amount,
    })),
    timeline: buildTimeline(eventDate, recommendations.timeline, createId),
    vendors: buildVendors(
      eventType,
      eventDate,
      recommendations.vendors,
      createId,
    ),
    ideas: recommendations.ideas,
  });

  if (!result.success) {
    throw new Error(
      result.error.issues[0]?.message ?? "The generated event plan is invalid.",
    );
  }

  return result.data;
}