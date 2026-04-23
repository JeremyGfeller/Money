export function toMonthKey(date: Date | string): string {
  const value = typeof date === "string" ? new Date(date) : date;
  const month = `${value.getMonth() + 1}`.padStart(2, "0");
  return `${value.getFullYear()}-${month}`;
}

export function formatMonthLabel(monthKey: string, locale = "fr-CH"): string {
  const [year, month] = monthKey.split("-");
  const date = new Date(Number(year), Number(month) - 1, 1);
  return new Intl.DateTimeFormat(locale, {
    month: "long",
    year: "numeric",
  }).format(date);
}

export function shiftMonth(monthKey: string, delta: number): string {
  const [year, month] = monthKey.split("-").map(Number);
  const date = new Date(year, month - 1 + delta, 1);
  return toMonthKey(date);
}

export function getPreviousMonths(monthKey: string, count: number): string[] {
  return Array.from({ length: count }, (_, index) =>
    shiftMonth(monthKey, -(count - index - 1))
  );
}
