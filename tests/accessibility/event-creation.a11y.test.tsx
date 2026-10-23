import { cleanup, render } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { MemoryRouter } from "react-router-dom";
import axe from "axe-core";
import EventCreationForm from "../../src/features/assistant/EventCreationForm";

afterEach(() => {
  cleanup();
});

describe("Event creation form accessibility", () => {
  it("has no automatically detectable accessibility violations", async () => {
    const { container } = render(
      <MemoryRouter>
        <EventCreationForm />
      </MemoryRouter>,
    );

    const results = await axe.run(container);

    expect(
      results.violations.map(({ id, impact, description, nodes }) => ({
        id,
        impact,
        description,
        elements: nodes.map(({ target }) => target),
      })),
    ).toEqual([]);
  });
});
