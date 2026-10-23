import { useState } from "react";
import { afterEach, describe, expect, it } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import VendorChecklist from "../../src/features/operations/VendorChecklist";
import type { Vendor } from "../../src/domain/schema";

const start: Vendor[] = [
  { id: "v1", name: "Caterer", category: "Catering", booked: false, tip: "Ask for a tasting", bookBy: "2030-05-01" },
  { id: "v2", name: "Photographer", category: "Photography", booked: true, contact: "98765 43210" },
];

function Harness({ initial = start }: { initial?: Vendor[] }) {
  const [vendors, setVendors] = useState<Vendor[]>(initial);

  return <VendorChecklist vendors={vendors} onChange={setVendors} />;
}

afterEach(cleanup);

describe("VendorChecklist", () => {
  it("shows vendor details, tips, deadlines and booking status", () => {
    render(<Harness />);

    expect(screen.getByText("Ask for a tasting")).toBeInTheDocument();
    expect(screen.getByText(/^Book by/)).toBeInTheDocument();
    expect(screen.getByText("98765 43210")).toBeInTheDocument();
    expect(screen.getByText("Pending")).toBeInTheDocument();
    expect(screen.getByText("Booked")).toBeInTheDocument();
    expect(screen.getByText(/50% of vendors booked \(1\/2\)/)).toBeInTheDocument();
  });

  it("toggles booking status and progress", async () => {
    const user = userEvent.setup();
    render(<Harness />);

    await user.click(screen.getByRole("button", { name: "Mark Caterer booked" }));

    expect(screen.getByText(/100% of vendors booked \(2\/2\)/)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Mark Caterer unbooked" })).toBeInTheDocument();
  });

  it("adds a vendor with a category and contact, then resets the form", async () => {
    const user = userEvent.setup();
    render(<Harness />);

    await user.type(screen.getByLabelText(/vendor name/i), "Grand Palace");
    await user.selectOptions(screen.getByLabelText(/vendor category/i), "Venue");
    await user.type(screen.getByLabelText(/contact information/i), "hello@palace.example");
    await user.click(screen.getByRole("button", { name: /add vendor/i }));

    expect(screen.getByText("Grand Palace")).toBeInTheDocument();
    expect(screen.getByText("hello@palace.example")).toBeInTheDocument();
    expect(screen.getByLabelText(/vendor name/i)).toHaveValue("");
    expect(screen.getByLabelText(/vendor category/i)).toHaveValue("Venue");
  });

  it("validates name, name length and contact length", async () => {
    const user = userEvent.setup();
    render(<Harness />);

    await user.click(screen.getByRole("button", { name: /add vendor/i }));
    expect(screen.getByRole("alert")).toHaveTextContent(/enter a vendor name/i);

    fireEvent.change(screen.getByLabelText(/vendor name/i), { target: { value: "x".repeat(101) } });
    await user.click(screen.getByRole("button", { name: /add vendor/i }));
    expect(screen.getByRole("alert")).toHaveTextContent(/100 characters or fewer/i);

    fireEvent.change(screen.getByLabelText(/vendor name/i), { target: { value: "Valid name" } });
    fireEvent.change(screen.getByLabelText(/contact information/i), { target: { value: "c".repeat(151) } });
    await user.click(screen.getByRole("button", { name: /add vendor/i }));
    expect(screen.getByRole("alert")).toHaveTextContent(/150 characters or fewer/i);
  });

  it("deletes a vendor and shows the empty state", async () => {
    const user = userEvent.setup();
    render(<Harness initial={[start[0]]} />);

    await user.click(screen.getByRole("button", { name: "Delete Caterer" }));

    expect(screen.getByText(/no vendors added yet/i)).toBeInTheDocument();
  });
});