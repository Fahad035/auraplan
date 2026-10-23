import { describe, expect, it } from "vitest";
import {
  getVendorProgress,
  toggleVendorBooking,
} from "../../src/domain/checklist";
import type { Vendor } from "../../src/domain/schema";

const vendors: Vendor[] = [
  {
    id: "venue",
    name: "Event Venue",
    category: "Venue",
    booked: true,
  },
  {
    id: "catering",
    name: "Catering Service",
    category: "Catering",
    booked: false,
  },
];

describe("vendor checklist utilities", () => {
  it("toggles a vendor booking status", () => {
    const updated = toggleVendorBooking(vendors, "catering");

    expect(updated[1].booked).toBe(true);
    expect(vendors[1].booked).toBe(false);
  });

  it("leaves other vendors unchanged", () => {
    const updated = toggleVendorBooking(vendors, "catering");

    expect(updated[0]).toEqual(vendors[0]);
  });

  it("calculates vendor booking progress", () => {
    expect(getVendorProgress(vendors)).toEqual({
      booked: 1,
      total: 2,
      percentage: 50,
    });
  });

  it("handles an empty vendor checklist", () => {
    expect(getVendorProgress([])).toEqual({
      booked: 0,
      total: 0,
      percentage: 0,
    });
  });

  it("does not change vendors when the ID is unknown", () => {
    expect(toggleVendorBooking(vendors, "unknown")).toEqual(vendors);
  });
});
