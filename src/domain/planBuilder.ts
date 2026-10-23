import { buildVendorChecklist } from "./checklist";
import type { PreviousPlan, Recommendations } from "./recommendation";
import type { EventPlan, EventType, TimelineItem, Vendor } from "./schema";

const DAY_MS = 86_400_000;

function formatLocalDate(date: Date): string {
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0"),
  ].join("-");
}

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
  createId: () => string = () => crypto.randomUUID(),
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
  createId: () => string = () => crypto.randomUUID(),
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
  return {
    ideas: plan.ideas.slice(0, 8).map((idea) => clip(idea, 250)),
    budgetItems: plan.budgetItems.slice(0, 10).map((item) => ({
      name: clip(item.name, 80),
      amount: item.amount,
    })),
    timeline: plan.timeline.slice(0, 12).map((item) => ({
      title: clip(item.title, 120),
      daysBeforeEvent: daysUntil(plan.eventDate, item.date),
    })),
    vendors: plan.vendors.slice(0, 10).map((vendor) => ({
      name: clip(vendor.name, 100),
      category: clip(vendor.category, 40),
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
  createId: () => string = () => crypto.randomUUID(),
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