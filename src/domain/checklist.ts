import type { Vendor } from "./schema";

export function toggleVendorBooking(
  vendors: Vendor[],
  vendorId: string,
): Vendor[] {
  return vendors.map((vendor) =>
    vendor.id === vendorId
      ? { ...vendor, booked: !vendor.booked }
      : vendor,
  );
}

export function getVendorProgress(
  vendors: Vendor[],
): { booked: number; total: number; percentage: number } {
  const booked = vendors.filter((vendor) => vendor.booked).length;
  const total = vendors.length;

  return {
    booked,
    total,
    percentage: total === 0 ? 0 : Math.round((booked / total) * 100),
  };
}