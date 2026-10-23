import { useState, type FormEvent } from "react";
import { Plus, Store } from "lucide-react";

import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import ChecklistRow from "../../components/ui/ChecklistRow";
import { inputClass, labelClass } from "../../components/ui/fieldStyles";
import ProgressBar from "../../components/ui/ProgressBar";
import {
  getVendorProgress,
  toggleVendorBooking,
} from "../../domain/checklist";
import type { Vendor } from "../../domain/schema";
import { formatShortDate } from "../../lib/format";

type VendorChecklistProps = {
  vendors: Vendor[];
  onChange: (vendors: Vendor[]) => void;
};

const MAX_VENDOR_NAME_LENGTH = 100;
const MAX_VENDOR_CONTACT_LENGTH = 150;
const DEFAULT_CATEGORY = "Venue";

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
  const [category, setCategory] = useState(DEFAULT_CATEGORY);
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

    if (trimmedName.length > MAX_VENDOR_NAME_LENGTH) {
      setError(
        `Vendor names must be ${MAX_VENDOR_NAME_LENGTH} characters or fewer.`,
      );
      return;
    }

    if (trimmedContact.length > MAX_VENDOR_CONTACT_LENGTH) {
      setError(
        `Contact information must be ${MAX_VENDOR_CONTACT_LENGTH} characters or fewer.`,
      );
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
    setCategory(DEFAULT_CATEGORY);
    setContact("");
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
          <label htmlFor="vendor-name" className={labelClass}>
            Vendor name
          </label>
          <input
            id="vendor-name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="e.g. Grand Palace Banquets"
            maxLength={MAX_VENDOR_NAME_LENGTH}
            className={`mt-2 ${inputClass}`}
          />
        </div>

        <div>
          <label htmlFor="vendor-category" className={labelClass}>
            Vendor category
          </label>
          <select
            id="vendor-category"
            value={category}
            onChange={(event) => setCategory(event.target.value)}
            className={`mt-2 ${inputClass}`}
          >
            {vendorCategories.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="vendor-contact" className={labelClass}>
            Contact information (optional)
          </label>
          <input
            id="vendor-contact"
            value={contact}
            onChange={(event) => setContact(event.target.value)}
            placeholder="Phone number or email"
            maxLength={MAX_VENDOR_CONTACT_LENGTH}
            className={`mt-2 ${inputClass}`}
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

      <ProgressBar
        label="Vendor booking progress"
        percentage={percentage}
        className="mb-5"
      />

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
            <ChecklistRow
              key={vendor.id}
              checked={vendor.booked}
              toggleLabel={
                vendor.booked
                  ? `Mark ${vendor.name} unbooked`
                  : `Mark ${vendor.name} booked`
              }
              onToggle={() => onChange(toggleVendorBooking(vendors, vendor.id))}
              deleteLabel={`Delete ${vendor.name}`}
              onDelete={() => deleteVendor(vendor.id)}
              aside={
                <span
                  className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                    vendor.booked
                      ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300"
                      : "bg-amber-50 text-amber-700"
                  }`}
                >
                  {vendor.booked ? "Booked" : "Pending"}
                </span>
              }
            >
              <p className="wrap-break-word text-sm font-medium text-slate-800">
                {vendor.name}
              </p>

              <p className="mt-1 text-xs text-slate-500">{vendor.category}</p>

              {vendor.tip && (
                <p className="mt-1 text-xs text-slate-600">{vendor.tip}</p>
              )}

              {vendor.bookBy && (
                <p className="mt-1 text-xs font-medium text-slate-600">
                  Book by {formatShortDate(vendor.bookBy)}
                </p>
              )}

              {vendor.contact && (
                <p className="mt-1 break-all text-xs text-slate-500">
                  {vendor.contact}
                </p>
              )}
            </ChecklistRow>
          ))}
        </div>
      )}
    </Card>
  );
}