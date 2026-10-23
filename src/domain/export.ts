import type { EventPlan } from "./schema";
import { calculateBudget } from "./budget";
import { sortTimeline } from "./timeline";

const inr = (value: number) => `₹${value.toLocaleString("en-IN")}`;

/** Serializes a plan as formatted JSON for backup or sharing. */
export function planToJson(plan: EventPlan): string {
  return JSON.stringify(plan, null, 2);
}

/** Builds a readable Markdown summary of a plan. */
export function planToMarkdown(plan: EventPlan): string {
  const budget = calculateBudget(
    plan.totalBudget,
    plan.contingencyPercent,
    plan.budgetItems,
  );

  const lines: string[] = [
    `# ${plan.title}`,
    "",
    `- Type: ${plan.eventType}`,
    `- Date: ${plan.eventDate}`,
    `- Location: ${plan.location}`,
    `- Guests: ${plan.guestCount}`,
    "",
    "## Budget",
    "",
    `- Total budget: ${inr(budget.totalBudget)}`,
    `- Contingency reserve (${plan.contingencyPercent}%): ${inr(budget.contingency)}`,
    `- Allocated: ${inr(budget.allocated)}`,
    `- Remaining: ${inr(budget.remaining)}`,
    "",
    ...plan.budgetItems.map((item) => `- ${item.name}: ${inr(item.amount)}`),
    "",
    "## Timeline",
    "",
    ...sortTimeline(plan.timeline).map(
      (item) =>
        `- [${item.completed ? "x" : " "}] ${item.date} - ${item.title}`,
    ),
    "",
    "## Vendors",
    "",
    ...plan.vendors.map(
      (vendor) =>
        `- [${vendor.booked ? "x" : " "}] ${vendor.name} (${vendor.category})${
          vendor.contact ? ` - ${vendor.contact}` : ""
        }`,
    ),
    "",
    "## Ideas",
    "",
    ...plan.ideas.map((idea) => `- ${idea}`),
    "",
    "_AI-generated estimates. Verify quotes, contracts and permits before paying._",
    "",
  ];

  return lines.join("\n");
}

/** Triggers a browser download for the given text content. */
export function downloadTextFile(
  filename: string,
  content: string,
  mimeType: string,
): void {
  const url = URL.createObjectURL(new Blob([content], { type: mimeType }));
  const link = document.createElement("a");

  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

export function safeFileName(title: string): string {
  return (
    title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "event-plan"
  );
}
