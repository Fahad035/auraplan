import { LIMITS } from "./recommendation";
import type { EventType } from "./schema";

/** Raw values as typed into the event creation form. */
export interface EventFormValues {
  eventType: EventType;
  eventDate: string;
  location: string;
  guestCount: string;
  totalBudget: string;
}

/** Validated, normalised event details ready for the API. */
export interface EventInput {
  eventType: EventType;
  eventDate: string;
  location: string;
  guestCount: number;
  totalBudget: number;
}

export type EventInputResult =
  | { ok: true; value: EventInput }
  | { ok: false; error: string };

const fail = (error: string): EventInputResult => ({ ok: false, error });

/**
 * Validates the form values. Checks run in the order the fields appear to the
 * user, and the first problem found is reported.
 */
export function validateEventInput(
  values: EventFormValues,
  minimumDate: string,
): EventInputResult {
  const guestCount = Number(values.guestCount);
  const totalBudget = Number(values.totalBudget);
  const location = values.location.trim();

  if (
    !Number.isInteger(guestCount) ||
    guestCount < 1 ||
    guestCount > LIMITS.maxGuests
  ) {
    return fail(
      `Enter a valid guest count between 1 and ${LIMITS.maxGuests.toLocaleString("en-US")}.`,
    );
  }

  if (
    !Number.isSafeInteger(totalBudget) ||
    totalBudget <= 0 ||
    totalBudget > LIMITS.maxBudget
  ) {
    return fail(
      "Enter a whole-number budget greater than zero and no more than 1 billion.",
    );
  }

  if (!values.eventDate || values.eventDate < minimumDate) {
    return fail("Choose today or a future date for your event.");
  }

  if (!location || location.length > LIMITS.maxLocationLength) {
    return fail("Enter a valid event location.");
  }

  return {
    ok: true,
    value: {
      eventType: values.eventType,
      eventDate: values.eventDate,
      location,
      guestCount,
      totalBudget,
    },
  };
}