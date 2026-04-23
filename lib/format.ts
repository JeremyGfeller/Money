export function formatCurrency(
  amount: number,
  locale = "fr-CH",
  currency = "CHF"
): string {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatDate(date: string, locale = "fr-CH"): string {
  return new Intl.DateTimeFormat(locale, {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(date));
}

export function formatPercentage(value: number): string {
  return `${Math.round(value)}%`;
}
