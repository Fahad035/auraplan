import { describe, expect, it } from "vitest";
import {
  formatCurrency,
  formatLongDate,
  formatShortDate,
} from "../../src/lib/format";

describe("formatCurrency", () => {
  it("formats rupees with Indian digit grouping and no decimals", () => {
    expect(formatCurrency(125000)).toBe("₹1,25,000");
    expect(formatCurrency(0)).toBe("₹0");
  });

  it("formats negative amounts", () => {
    expect(formatCurrency(-5000)).toContain("5,000");
  });
});

describe("formatShortDate", () => {
  it("shows day, short month and year", () => {
    const text = formatShortDate("2026-11-05");

    expect(text).toContain("5");
    expect(text).toContain("Nov");
    expect(text).toContain("2026");
  });
});

describe("formatLongDate", () => {
  it("shows weekday, day, full month and year", () => {
    const text = formatLongDate("2026-11-05");

    expect(text).toContain("Thu");
    expect(text).toContain("5");
    expect(text).toContain("November");
    expect(text).toContain("2026");
  });

  it("returns the original text when it is not a valid date", () => {
    expect(formatLongDate("not-a-date")).toBe("not-a-date");
  });
});