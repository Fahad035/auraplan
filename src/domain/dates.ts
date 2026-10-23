const MS_PER_DAY = 24 * 60 * 60 * 1000;

/** Formats a Date as a local calendar date (YYYY-MM-DD). */
export function formatLocalDate(date: Date): string {
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0"),
  ].join("-");
}

/** Today's local calendar date (YYYY-MM-DD). */
export function todayLocalDate(): string {
  return formatLocalDate(new Date());
}

/**
 * Whole calendar days from today until `isoDate` (YYYY-MM-DD): negative if
 * the date has passed, or `null` if it is not a real calendar date.
 */
export function daysFromToday(isoDate: string): number | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(isoDate);

  if (!match) {
    return null;
  }

  const [year, month, day] = [match[1], match[2], match[3]].map(Number);
  const target = new Date(Date.UTC(year, month - 1, day));

  if (
    target.getUTCFullYear() !== year ||
    target.getUTCMonth() !== month - 1 ||
    target.getUTCDate() !== day
  ) {
    return null;
  }

  const now = new Date();
  const today = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());

  return Math.round((target.getTime() - today) / MS_PER_DAY);
}