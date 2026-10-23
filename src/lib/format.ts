const inrFormatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

/** Formats a whole-rupee amount, e.g. 125000 -> "₹1,25,000". */
export function formatCurrency(value: number): string {
  return inrFormatter.format(value);
}

/** Formats a YYYY-MM-DD string as a short date, e.g. "5 Nov 2026". */
export function formatShortDate(isoDate: string): string {
  return new Date(`${isoDate}T00:00:00`).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

/** Formats a YYYY-MM-DD string as a long date, e.g. "Thu, 5 November 2026". */
export function formatLongDate(isoDate: string): string {
  const date = new Date(`${isoDate}T12:00:00`);

  if (Number.isNaN(date.getTime())) {
    return isoDate;
  }

  return date.toLocaleDateString("en-IN", {
    weekday: "short",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}