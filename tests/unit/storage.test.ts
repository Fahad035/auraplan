import { beforeEach, describe, expect, it } from "vitest";
import { loadEventPlans, saveEventPlans } from "../../src/lib/storage";
import { samplePlan } from "../fixtures/samplePlan";

const KEY = "auraplan:event-plans";

beforeEach(() => {
  localStorage.clear();
});

describe("event plan storage", () => {
  it("returns an empty list when nothing is stored", () => {
    expect(loadEventPlans()).toEqual([]);
  });

  it("round-trips valid plans", () => {
    saveEventPlans([samplePlan]);
    expect(loadEventPlans()).toEqual([samplePlan]);
  });

  it("ignores stored data that is not an array", () => {
    localStorage.setItem(KEY, JSON.stringify({ not: "an array" }));
    expect(loadEventPlans()).toEqual([]);
  });

  it("ignores corrupted JSON", () => {
    localStorage.setItem(KEY, "{broken");
    expect(loadEventPlans()).toEqual([]);
  });

  it("drops invalid entries but keeps valid ones", () => {
    localStorage.setItem(KEY, JSON.stringify([samplePlan, { id: "" }]));
    expect(loadEventPlans()).toEqual([samplePlan]);
  });

  it("refuses to save an invalid plan", () => {
    expect(() => saveEventPlans([{ ...samplePlan, guestCount: 0 }])).toThrow();
  });
});
