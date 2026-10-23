import { describe, expect, it } from "vitest";
import {
  applyRecommendations,
  buildTimeline,
  buildVendors,
  dateBefore,
  daysUntil,
  toPreviousPlan,
} from "../../src/domain/planBuilder";
import { samplePlan } from "../fixtures/samplePlan";

let counter = 0;
const id = () => `id-${(counter += 1)}`;

describe("date helpers", () => {
  it("counts back from the event date", () => {
    expect(dateBefore("2030-03-01", 1)).toBe("2030-02-28");
    expect(dateBefore("2030-03-01", 0)).toBe("2030-03-01");
  });

  it("measures whole days and clamps to 0..365", () => {
    expect(daysUntil("2030-03-01", "2030-02-28")).toBe(1);
    expect(daysUntil("2030-03-01", "2030-03-05")).toBe(0);
    expect(daysUntil("2030-03-01", "2020-01-01")).toBe(365);
  });
});

describe("buildTimeline", () => {
  it("creates dated items and keeps the urgent flag only when set", () => {
    const items = buildTimeline(
      "2030-03-01",
      [
        { title: "Book venue", daysBeforeEvent: 2, urgent: true },
        { title: "Send invites", daysBeforeEvent: 1, urgent: false },
      ],
      id,
    );

    expect(items[0]).toMatchObject({
      date: "2030-02-27",
      completed: false,
      urgent: true,
    });
    expect(items[1]).not.toHaveProperty("urgent");
  });
});

describe("buildVendors", () => {
  it("adds tips and book-by dates from suggestions", () => {
    const [vendor] = buildVendors(
      "wedding",
      "2030-03-01",
      [
        {
          name: "Caterer",
          category: "Catering",
          tip: "Ask for a tasting.",
          bookByDaysBefore: 10,
          urgent: false,
        },
      ],
      id,
    );

    expect(vendor).toMatchObject({
      name: "Caterer",
      tip: "Ask for a tasting.",
      bookBy: "2030-02-19",
      booked: false,
    });
  });

  it("falls back to templates without book-by dates", () => {
    const vendors = buildVendors("birthday", "2030-03-01");

    expect(vendors.length).toBeGreaterThan(0);
    expect(vendors[0]).not.toHaveProperty("bookBy");
  });

  it("omits an empty tip", () => {
    const [vendor] = buildVendors("wedding", "2030-03-01", [
      {
        name: "Caterer",
        category: "Catering",
        tip: "",
        bookByDaysBefore: 5,
        urgent: false,
      },
    ]);

    expect(vendor).not.toHaveProperty("tip");
  });
});

describe("toPreviousPlan", () => {
  it("summarizes a plan for the model within schema limits", () => {
    const longTitle = "t".repeat(500);
    const summary = toPreviousPlan({
      ...samplePlan,
      timeline: [
        { id: "x", title: longTitle, date: "2099-12-01", completed: false },
      ],
    });

    expect(summary.timeline[0].title).toHaveLength(120);
    expect(summary.timeline[0].daysBeforeEvent).toBe(30);
    expect(summary.vendors).toEqual([
      { name: "Caterer", category: "Catering" },
    ]);
    expect(summary.budgetItems).toEqual([{ name: "Venue", amount: 40000 }]);
  });
});

describe("applyRecommendations", () => {
  const recommendations = {
    ideas: ["One", "Two", "Three"],
    budgetItems: [
      { name: "Venue", amount: 30000 },
      { name: "Food", amount: 30000 },
      { name: "Decor", amount: 30000 },
    ],
    timeline: [
      { title: "send invites", daysBeforeEvent: 10, urgent: false },
      { title: "Book venue", daysBeforeEvent: 30, urgent: false },
      { title: "New task", daysBeforeEvent: 5, urgent: false },
    ],
    vendors: [
      {
        name: "caterer",
        category: "Catering",
        tip: "",
        bookByDaysBefore: 20,
        urgent: false,
      },
      {
        name: "DJ",
        category: "Entertainment",
        tip: "",
        bookByDaysBefore: 20,
        urgent: false,
      },
    ],
  };

  it("replaces generated content but keeps completed tasks and booked vendors", () => {
    const plan = {
      ...samplePlan,
      vendors: [
        {
          id: "v1",
          name: "Caterer",
          category: "Catering",
          booked: true,
          contact: "98765",
        },
      ],
    };

    const updated = applyRecommendations(plan, recommendations, id);

    expect(updated.id).toBe(plan.id);
    expect(updated.ideas).toEqual(["One", "Two", "Three"]);
    expect(updated.budgetItems).toHaveLength(3);
    expect(
      updated.timeline.find((t) => t.title === "send invites")?.completed,
    ).toBe(true);
    expect(
      updated.timeline.find((t) => t.title === "New task")?.completed,
    ).toBe(false);
    expect(updated.vendors.find((v) => v.name === "caterer")).toMatchObject({
      booked: true,
      contact: "98765",
    });
    expect(updated.vendors.find((v) => v.name === "DJ")?.booked).toBe(false);
  });
});
