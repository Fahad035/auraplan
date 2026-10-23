import { afterEach, describe, expect, it, vi } from "vitest";
import { generateRecommendations } from "../../src/lib/api";

const options = {
  eventType: "birthday" as const,
  eventDate: "2099-12-31",
  location: "Hyderabad",
  guestCount: 50,
  totalBudget: 50000,
};

const valid = {
  ideas: ["a", "b", "c"],
  budgetItems: [
    { name: "Venue", amount: 1 },
    { name: "Food", amount: 2 },
    { name: "Decor", amount: 3 },
  ],
  timeline: [
    { title: "a", daysBeforeEvent: 1 },
    { title: "b", daysBeforeEvent: 2 },
    { title: "c", daysBeforeEvent: 3 },
  ],
};

function mockFetch(
  response: Partial<Response> & { json?: () => Promise<unknown> },
) {
  vi.stubGlobal("fetch", vi.fn().mockResolvedValue(response));
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("generateRecommendations", () => {
  it("posts the options and returns validated data with default vendors", async () => {
    mockFetch({ ok: true, json: async () => valid });

    const result = await generateRecommendations(options);

    expect(result.vendors).toEqual([]);
    expect(fetch).toHaveBeenCalledWith(
      "/api/plan",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify(options),
      }),
    );
  });

  it("throws the server's error message", async () => {
    mockFetch({
      ok: false,
      json: async () => ({ error: "Too many requests." }),
    });
    await expect(generateRecommendations(options)).rejects.toThrow(
      "Too many requests.",
    );
  });

  it("throws a generic message for non-JSON errors", async () => {
    mockFetch({
      ok: false,
      json: async () => {
        throw new Error("not json");
      },
    });
    await expect(generateRecommendations(options)).rejects.toThrow(
      "Unable to generate event recommendations.",
    );
  });

  it("rejects malformed successful responses", async () => {
    mockFetch({ ok: true, json: async () => ({ ideas: [] }) });
    await expect(generateRecommendations(options)).rejects.toThrow(
      "The server returned invalid event recommendations.",
    );
  });
});
