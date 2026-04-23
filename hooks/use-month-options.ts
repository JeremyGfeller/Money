import { getPreviousMonths } from "@/lib/date";

export function useMonthOptions(currentMonth: string) {
  return getPreviousMonths(currentMonth, 12).reverse();
}
