import { describe, expect, it } from "vitest";
import { planToJson, planToMarkdown, safeFileName } from "../../src/domain/export";
import { samplePlan } from "../fixtures/samplePlan";

describe("export helpers", () => {
  it("serializes a plan as JSON that round-trips", () => {
    expect(JSON.parse(planToJson(samplePlan))).toEqual(samplePlan);
  });

  it("builds a Markdown summary with sorted timeline and budget math", () => {
    const markdown = planToMarkdown(samplePlan);

    expect(markdown).toContain("# Birthday Celebration");
    expect(markdown).toContain("Remaining: ₹50,000");
    expect(markdown.indexOf("Book venue")).toBeLessThan(
      markdown.indexOf("Send invites"),
    );
    expect(markdown).toContain("- [x] 2099-12-20 - Send invites");
    expect(markdown).toContain("- [ ] Caterer (Catering)");
  });

  it("creates safe file names", () => {
    expect(safeFileName("Birthday Celebration!")).toBe("birthday-celebration");
    expect(safeFileName("???")).toBe("event-plan");
  });
});