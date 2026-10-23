import { cleanup, render } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { MemoryRouter } from "react-router-dom";
import axe from "axe-core";
import OperationsPage from "../../src/features/operations/OperationsPage";
import { samplePlan } from "../fixtures/samplePlan";

beforeEach(() => {
  localStorage.setItem("auraplan:event-plans", JSON.stringify([samplePlan]));
});

afterEach(() => {
  cleanup();
  localStorage.clear();
});

async function violationsFor(container: HTMLElement) {
  const results = await axe.run(container, {
    rules: { region: { enabled: false } },
  });

  return results.violations.map(({ id, impact, nodes }) => ({
    id,
    impact,
    elements: nodes.map(({ target }) => target),
  }));
}

describe("Operations page accessibility", () => {
  it("has no detectable violations in light theme", async () => {
    const { container } = render(
      <MemoryRouter>
        <OperationsPage />
      </MemoryRouter>,
    );

    expect(await violationsFor(container)).toEqual([]);
  });

  it("has no detectable violations in dark theme", async () => {
    const { container } = render(
      <div className="dark" data-theme="dark">
        <MemoryRouter>
          <OperationsPage />
        </MemoryRouter>
      </div>,
    );

    expect(await violationsFor(container)).toEqual([]);
  });
});
