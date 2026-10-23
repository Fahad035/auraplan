import { describe, expect, it } from "vitest";
import {
  validateEventInput,
  type EventFormValues,
} from "../../src/domain/eventInput";

const MINIMUM_DATE = "2026-10-23";

const validValues: EventFormValues = {
  eventType: "birthday",
  eventDate: "2026-12-01",
  location: "  Hyderabad, Telangana  ",
  guestCount: "50",
  totalBudget: "50000",
};

function errorFor(overrides: Partial<EventFormValues>) {
  const result = validateEventInput(
    { ...validValues, ...overrides },
    MINIMUM_DATE,
  );

  return result.ok ? null : result.error;
}

describe("validateEventInput", () => {
  it("returns normalised numbers and a trimmed location", () => {
    expect(validateEventInput(validValues, MINIMUM_DATE)).toEqual({
      ok: true,
      value: {
        eventType: "birthday",
        eventDate: "2026-12-01",
        location: "Hyderabad, Telangana",
        guestCount: 50,
        totalBudget: 50000,
      },
    });
  });

  it("accepts today as the event date", () => {
    expect(errorFor({ eventDate: MINIMUM_DATE })).toBeNull();
  });

  it.each(["0", "1.5", "100001", "abc", ""])(
    "rejects the guest count %j",
    (guestCount) => {
      expect(errorFor({ guestCount })).toBe(
        "Enter a valid guest count between 1 and 100,000.",
      );
    },
  );

  it.each(["0", "-5", "1000000001", "12.5", "abc"])(
    "rejects the budget %j",
    (totalBudget) => {
      expect(errorFor({ totalBudget })).toBe(
        "Enter a whole-number budget greater than zero and no more than 1 billion.",
      );
    },
  );

  it.each(["", "2026-10-22"])("rejects the date %j", (eventDate) => {
    expect(errorFor({ eventDate })).toBe(
      "Choose today or a future date for your event.",
    );
  });

  it.each(["", "   ", "x".repeat(151)])(
    "rejects the location %j",
    (location) => {
      expect(errorFor({ location })).toBe("Enter a valid event location.");
    },
  );

  it("reports the guest count problem before any other", () => {
    expect(
      errorFor({ guestCount: "0", totalBudget: "0", eventDate: "", location: "" }),
    ).toBe("Enter a valid guest count between 1 and 100,000.");
  });
});