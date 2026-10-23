import { randomId } from "./ids";
import type { EventType, Vendor } from "./schema";

export function toggleVendorBooking(
  vendors: Vendor[],
  vendorId: string,
): Vendor[] {
  return vendors.map((vendor) =>
    vendor.id === vendorId
      ? { ...vendor, booked: !vendor.booked }
      : vendor,
  );
}

export function getVendorProgress(
  vendors: Vendor[],
): { booked: number; total: number; percentage: number } {
  const booked = vendors.filter((vendor) => vendor.booked).length;
  const total = vendors.length;

  return {
    booked,
    total,
    percentage: total === 0 ? 0 : Math.round((booked / total) * 100),
  };
}

const VENDOR_TEMPLATES: Record<
  EventType,
  ReadonlyArray<{ name: string; category: string }>
> = {
  wedding: [
    { name: "Venue", category: "Venue" },
    { name: "Caterer", category: "Catering" },
    { name: "Photographer", category: "Photography" },
    { name: "Decorator", category: "Decoration" },
    { name: "Florist", category: "Florist" },
    { name: "Music / DJ", category: "Entertainment" },
  ],
  birthday: [
    { name: "Venue", category: "Venue" },
    { name: "Caterer or bakery", category: "Catering" },
    { name: "Decorator", category: "Decoration" },
    { name: "Entertainer", category: "Entertainment" },
    { name: "Photographer", category: "Photography" },
  ],
  community: [
    { name: "Venue or hall", category: "Venue" },
    { name: "Caterer", category: "Catering" },
    { name: "Sound and lighting", category: "Entertainment" },
    { name: "Transport", category: "Transportation" },
  ],
};

/**
 * Builds the starting vendor checklist. AI suggestions are used when
 * available; otherwise a template for the event type is used so the
 * checklist is never empty.
 */
export function buildVendorChecklist(
  eventType: EventType,
  suggestions: ReadonlyArray<{ name: string; category: string }> = [],
  createId: () => string = randomId,
): Vendor[] {
  const source =
    suggestions.length > 0 ? suggestions : VENDOR_TEMPLATES[eventType];

  return source.map((item) => ({
    id: createId(),
    name: item.name,
    category: item.category,
    booked: false,
  }));
}