import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import App from "../../src/App";

beforeEach(() => {
  localStorage.clear();
  window.history.pushState({}, "", "/");
  vi.stubGlobal("matchMedia", (query: string) => ({
    matches: false,
    media: query,
    addEventListener: () => {},
    removeEventListener: () => {},
  }));
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

describe("App shell", () => {
  it("has a skip link that targets the main content", async () => {
    render(<App />);

    expect(
      screen.getByRole("link", { name: /skip to main content/i }),
    ).toHaveAttribute("href", "#main-content");
    expect(
      await screen.findByRole("heading", {
        level: 1,
        name: /every celebration/i,
      }),
    ).toBeInTheDocument();
  });

  it("shows a real not-found page for unknown routes", async () => {
    window.history.pushState({}, "", "/does-not-exist");
    render(<App />);

    expect(
      await screen.findByRole("heading", { level: 1, name: /page not found/i }),
    ).toBeInTheDocument();
    expect(document.title).toBe("Page not found | AuraPlan");
  });

  it("toggles and remembers the theme", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(
      await screen.findByRole("button", { name: /switch to dark mode/i }),
    );

    expect(localStorage.getItem("auraplan-theme")).toBe("dark");
    expect(
      screen.getByRole("button", { name: /switch to light mode/i }),
    ).toBeInTheDocument();
  });
});
