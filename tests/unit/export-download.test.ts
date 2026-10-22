import { afterEach, describe, expect, it, vi } from "vitest";
import { downloadTextFile } from "../../src/domain/export";

afterEach(() => {
  vi.restoreAllMocks();
  document.body.innerHTML = "";
});

describe("downloadTextFile", () => {
  it("creates a temporary link, clicks it, and releases the object URL", () => {
    const createObjectURL = vi.fn(() => "blob:test-url");
    const revokeObjectURL = vi.fn();

    Object.defineProperty(URL, "createObjectURL", {
      configurable: true,
      writable: true,
      value: createObjectURL,
    });
    Object.defineProperty(URL, "revokeObjectURL", {
      configurable: true,
      writable: true,
      value: revokeObjectURL,
    });

    let clickedLink: HTMLAnchorElement | undefined;
    vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(
      function (this: HTMLAnchorElement) {
        clickedLink = this;
      },
    );

    downloadTextFile("plan.json", "{}", "application/json");

    expect(createObjectURL).toHaveBeenCalledOnce();
    expect(clickedLink?.download).toBe("plan.json");
    expect(clickedLink?.href).toBe("blob:test-url");
    expect(revokeObjectURL).toHaveBeenCalledWith("blob:test-url");
    expect(document.querySelector("a[download]")).toBeNull();
  });
});