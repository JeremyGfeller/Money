"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { buildDashboardData, getCategoryBudgetProgress, getFilteredTransactions } from "@/lib/finance";
import type { TransactionFilters } from "@/lib/types";
import { useBudgetStore } from "@/store/use-budget-store";

export function useDashboardQuery(month: string) {
  const categories = useBudgetStore((state) => state.categories);
  const transactions = useBudgetStore((state) => state.transactions);
  const budgets = useBudgetStore((state) => state.budgets);
  const goals = useBudgetStore((state) => state.goals);
  const locale = useBudgetStore((state) => state.preferences.locale);
  const lastUpdated = useBudgetStore((state) => state.lastUpdated);

  return useQuery({
    queryKey: ["dashboard", month, lastUpdated],
    queryFn: () =>
      buildDashboardData({
        categories,
        transactions,
        budgets,
        goals,
        month,
        locale,
      }),
    staleTime: Infinity,
    gcTime: Infinity,
  });
}

export function useFilteredTransactionsQuery(filters: TransactionFilters) {
  const categories = useBudgetStore((state) => state.categories);
  const transactions = useBudgetStore((state) => state.transactions);
  const lastUpdated = useBudgetStore((state) => state.lastUpdated);

  return useQuery({
    queryKey: ["transactions", filters, lastUpdated],
    queryFn: () => getFilteredTransactions(transactions, categories, filters),
    staleTime: Infinity,
    gcTime: Infinity,
  });
}

export function useCategoryBudgetProgress(month: string) {
  const categories = useBudgetStore((state) => state.categories);
  const transactions = useBudgetStore((state) => state.transactions);
  const budgets = useBudgetStore((state) => state.budgets);
  const lastUpdated = useBudgetStore((state) => state.lastUpdated);

  const monthBudget = useMemo(
    () => budgets.find((budget) => budget.month === month),
    [budgets, month]
  );

  return useQuery({
    queryKey: ["category-budgets", month, lastUpdated],
    queryFn: () => getCategoryBudgetProgress(transactions, categories, monthBudget, month),
    staleTime: Infinity,
    gcTime: Infinity,
  });
}
