import { beforeEach, describe, expect, it, vi } from "vitest";
import type { VercelRequest, VercelResponse } from "@vercel/node";

const generateContent = vi.fn();

vi.mock("@google/genai", () => ({
  GoogleGenAI: class {
    models = { generateContent };
  },
}));

import handler from "../../api/plan";

const validBody = {
  eventType: "birthday",
  eventDate: "2099-12-31",
  location: "Hyderabad",
  guestCount: 50,
  totalBudget: 100000,
};

const aiResult = {
  ideas: ["Theme party", "Photo booth", "Live music"],
  budgetItems: [
    { name: "Venue", amount: 80000 },
    { name: "Food", amount: 60000 },
    { name: "Decor", amount: 20000 },
  ],
  timeline: [
    { title: "Book venue", daysBeforeEvent: 300 },
    { title: "Send invites", daysBeforeEvent: 30 },
    { title: "Final check", daysBeforeEvent: 0 },
  ],
  vendors: [{ name: "Caterer", category: "Catering" }],
};

let ipCounter = 0;

function call(
  body: unknown,
  options: { method?: string; headers?: Record<string, string> } = {},
) {
  ipCounter += 1;
  const headers: Record<string, string> = {
    "x-real-ip": `10.0.0.${ipCounter}`,
    ...options.headers,
  };
  const req = {
    method: options.method ?? "POST",
    headers,
    body,
    socket: { remoteAddress: "127.0.0.1" },
  } as unknown as VercelRequest;

  const result: { status: number; json: unknown; headers: Record<string, string> } = {
    status: 0,
    json: undefined,
    headers: {},
  };

  const res = {
    setHeader(key: string, value: string) {
      result.headers[key] = value;
      return res;
    },
    status(code: number) {
      result.status = code;
      return res;
    },
    json(payload: unknown) {
      result.json = payload;
      return res;
    },
  } as unknown as VercelResponse;

  return handler(req, res).then(() => result);
}

beforeEach(() => {
  generateContent.mockReset();
  process.env.GEMINI_API_KEY = "test-key";
  vi.spyOn(console, "error").mockImplementation(() => {});
  vi.spyOn(console, "info").mockImplementation(() => {});
});

describe("POST /api/plan", () => {
  it("rejects non-POST methods", async () => {
    const result = await call(validBody, { method: "GET" });
    expect(result.status).toBe(405);
    expect(result.headers.Allow).toBe("POST");
  });

  it("rejects oversized requests by content-length", async () => {
    const result = await call(validBody, {
      headers: { "content-length": "999999" },
    });
    expect(result.status).toBe(413);
  });

  it("rejects missing or array bodies", async () => {
    expect((await call(undefined)).status).toBe(400);
    expect((await call([])).status).toBe(400);
  });

  it("rejects invalid input and unknown fields", async () => {
    expect((await call({ ...validBody, guestCount: -1 })).status).toBe(400);
    expect((await call({ ...validBody, role: "admin" })).status).toBe(400);
  });

  it("rejects past dates", async () => {
    const result = await call({ ...validBody, eventDate: "2000-01-01" });
    expect(result.status).toBe(400);
  });

  it("returns 500 without leaking details when the key is missing", async () => {
    delete process.env.GEMINI_API_KEY;
    const result = await call(validBody);
    expect(result.status).toBe(500);
    expect(JSON.stringify(result.json)).not.toMatch(/key/i);
  });

  it("returns a validated plan with the budget enforced", async () => {
    generateContent.mockResolvedValue({ text: JSON.stringify(aiResult) });

    const result = await call(validBody);
    const json = result.json as {
      budgetItems: { amount: number }[];
      vendors: unknown[];
    };

    expect(result.status).toBe(200);
    expect(
      json.budgetItems.reduce((sum, item) => sum + item.amount, 0),
    ).toBeLessThanOrEqual(90000);
    expect(json.vendors).toHaveLength(1);
    expect(result.headers["Cache-Control"]).toBe("no-store");
  });

  it("returns 502 for empty, malformed or schema-invalid model output", async () => {
    generateContent.mockResolvedValueOnce({ text: "" });
    expect((await call(validBody)).status).toBe(502);

    generateContent.mockResolvedValueOnce({ text: "not json" });
    expect((await call(validBody)).status).toBe(502);

    generateContent.mockResolvedValueOnce({ text: JSON.stringify({ ideas: [] }) });
    expect((await call(validBody)).status).toBe(502);
  });

  it("retries once on a transient provider error", async () => {
    generateContent
      .mockRejectedValueOnce(Object.assign(new Error("busy"), { status: 503 }))
      .mockResolvedValueOnce({ text: JSON.stringify(aiResult) });

    const result = await call(validBody);
    expect(result.status).toBe(200);
    expect(generateContent).toHaveBeenCalledTimes(2);
  });

  it("does not retry non-transient errors", async () => {
    generateContent.mockRejectedValue(new Error("bad request"));
    const result = await call(validBody);
    expect(result.status).toBe(502);
    expect(generateContent).toHaveBeenCalledTimes(1);
  });

  it("rate limits repeated requests from one client", async () => {
    generateContent.mockResolvedValue({ text: JSON.stringify(aiResult) });
    const headers = { "x-real-ip": "203.0.113.9" };
    let last = 0;

    for (let i = 0; i < 11; i += 1) {
      const req = { method: "POST", headers, body: validBody, socket: {} };
      const res = {
        setHeader: () => res,
        status: (code: number) => {
          last = code;
          return res;
        },
        json: () => res,
      };
      await handler(req as unknown as VercelRequest, res as unknown as VercelResponse);
    }

    expect(last).toBe(429);
  });
});