import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render, renderHook, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

import NotFound from "../../src/components/shared/NotFound";
import IdeasPanel from "../../src/features/operations/IdeasPanel";
import { useDocumentTitle } from "../../src/lib/useDocumentTitle";

afterEach(cleanup);

describe("IdeasPanel", () => {
  it("lists every idea", () => {
    render(
      <IdeasPanel
        ideas={[
          "Marigold mandap: fits Jaipur",
          "Live shehnai: welcome",
          "Welcome kits: sweets",
        ]}
      />,
    );

    expect(
      screen.getByRole("heading", { name: /personalized ideas/i }),
    ).toBeInTheDocument();
    expect(screen.getAllByRole("listitem")).toHaveLength(3);
  });

  it("explains when there are no ideas", () => {
    render(<IdeasPanel ideas={[]} />);

    expect(screen.getByText(/no ideas were saved/i)).toBeInTheDocument();
  });
});

describe("page titles and 404", () => {
  it("sets a descriptive document title", () => {
    renderHook(() => useDocumentTitle("Plan your event"));

    expect(document.title).toBe("Plan your event | AuraPlan");
  });

  it("renders a not-found page with a way home", () => {
    render(
      <MemoryRouter>
        <NotFound />
      </MemoryRouter>,
    );

    expect(
      screen.getByRole("heading", { level: 1, name: /page not found/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /back to the planner/i }),
    ).toHaveAttribute("href", "/");
    expect(document.title).toBe("Page not found | AuraPlan");
  });
});
