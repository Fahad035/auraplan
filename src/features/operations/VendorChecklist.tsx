import { useState, type FormEvent } from "react";
import {
  CheckCircle2,
  Circle,
  Plus,
  Store,
  Trash2,
} from "lucide-react";

import type { Vendor } from "../../domain/schema";
import { getVendorProgress } from "../../domain/checklist";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";

type VendorChecklistProps = {
  vendors: Vendor[];
  onChange: (vendors: Vendor[]) => void;
};

const vendorCategories = [
  "Venue",
  "Catering",
  "Photography",
  "Decoration",
  "Entertainment",
  "Florist",
  "Transportation",
  "Other",
];

export default function VendorChecklist({
  vendors,
  onChange,
}: VendorChecklistProps) {
  const [name, setName] = useState("");
  const [category, setCategory] = useState("Venue");
  const [contact, setContact] = useState("");
  const [error, setError] = useState("");

  const progress = getVendorProgress(vendors);
  const percentage = progress.percentage;

  function addVendor(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    const trimmedName = name.trim();
    const trimmedContact = contact.trim();

    if (!trimmedName) {
      setError("Enter a vendor name.");
      return;
    }

    if (trimmedName.length > 100) {
      setError("Vendor names must be 100 characters or fewer.");
      return;
    }

    if (trimmedContact.length > 150) {
      setError("Contact information must be 150 characters or fewer.");
      return;
    }

    const newVendor: Vendor = {
      id: crypto.randomUUID(),
      name: trimmedName,
      category,
      ...(trimmedContact ? { contact: trimmedContact } : {}),
      booked: false,
    };

    onChange([...vendors, newVendor]);
    setName("");
    setCategory("Venue");
    setContact("");
  }

  function toggleVendor(id: string) {
    onChange(
      vendors.map((vendor) =>
        vendor.id === id
          ? { ...vendor, booked: !vendor.booked }
          : vendor,
      ),
    );
  }

  function deleteVendor(id: string) {
    onChange(vendors.filter((vendor) => vendor.id !== id));
  }

  return (
    <Card
      title="Vendor checklist"
      description={`${percentage}% of vendors booked (${progress.booked}/${progress.total})`}
    >
      <form onSubmit={addVendor} className="mb-6 space-y-4">
        <div>
          <label
            htmlFor="vendor-name"
            className="text-sm font-medium text-slate-700"
          >
            Vendor name
          </label>
          <input
            id="vendor-name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="e.g. Grand Palace Banquets"
            maxLength={100}
            className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100"
          />
        </div>

        <div>
          <label
            htmlFor="vendor-category"
            className="text-sm font-medium text-slate-700"
          >
            Vendor category
          </label>
          <select
            id="vendor-category"
            value={category}
            onChange={(event) => setCategory(event.target.value)}
            className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100"
          >
            {vendorCategories.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label
            htmlFor="vendor-contact"
            className="text-sm font-medium text-slate-700"
          >
            Contact information (optional)
          </label>
          <input
            id="vendor-contact"
            value={contact}
            onChange={(event) => setContact(event.target.value)}
            placeholder="Phone number or email"
            maxLength={150}
            className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100"
          />
        </div>

        {error && (
          <p role="alert" className="text-sm text-red-600">
            {error}
          </p>
        )}

        <Button type="submit" className="w-full">
          <Plus size={16} />
          Add vendor
        </Button>
      </form>

      <div
        className="mb-5 h-2 overflow-hidden rounded-full bg-slate-100"
        role="progressbar"
        aria-label="Vendor booking progress"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={percentage}
      >
        <div
          className="h-full rounded-full bg-violet-600 transition-all"
          style={{ width: `${percentage}%` }}
        />
      </div>

      {vendors.length === 0 ? (
        <div className="py-5 text-center">
          <Store className="mx-auto size-8 text-slate-300" />

          <p className="mt-3 text-sm font-medium text-slate-700">
            No vendors added yet
          </p>

          <p className="mt-1 text-xs text-slate-500">
            Add your first vendor using the form above.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {vendors.map((vendor) => (
            <div
              key={vendor.id}
              className="flex items-start gap-3 rounded-xl border border-slate-100 p-3"
            >
              <button
                type="button"
                onClick={() => toggleVendor(vendor.id)}
                aria-label={
                  vendor.booked
                    ? `Mark ${vendor.name} unbooked`
                    : `Mark ${vendor.name} booked`
                }
                className="mt-0.5 shrink-0 text-violet-600"
              >
                {vendor.booked ? (
                  <CheckCircle2 size={20} />
                ) : (
                  <Circle size={20} />
                )}
              </button>

              <div className="min-w-0 flex-1">
                <p className="wrap-break-word text-sm font-medium text-slate-800">
                  {vendor.name}
                </p>

                <p className="mt-1 text-xs text-slate-500">
                  {vendor.category}
                </p>

                {vendor.tip && (
                  <p className="mt-1 text-xs text-slate-600">{vendor.tip}</p>
                )}

                {vendor.bookBy && (
                  <p className="mt-1 text-xs font-medium text-slate-600">
                    Book by{" "}
                    {new Date(`${vendor.bookBy}T00:00:00`).toLocaleDateString(
                      "en-IN",
                      { day: "numeric", month: "short", year: "numeric" },
                    )}
                  </p>
                )}

                {vendor.contact && (
                  <p className="mt-1 break-all text-xs text-slate-500">
                    {vendor.contact}
                  </p>
                )}
              </div>

              <div className="flex shrink-0 flex-col items-end gap-2">
                <span
                  className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                    vendor.booked
                      ? "bg-emerald-50 text-emerald-700"
                      : "bg-amber-50 text-amber-700"
                  }`}
                >
                  {vendor.booked ? "Booked" : "Pending"}
                </span>

                <button
                  type="button"
                  onClick={() => deleteVendor(vendor.id)}
                  aria-label={`Delete ${vendor.name}`}
                  className="rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-600"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}