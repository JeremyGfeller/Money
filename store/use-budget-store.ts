"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { buildDemoDataset, DEFAULT_CATEGORIES, DEFAULT_PREFERENCES, STORAGE_KEY } from "@/lib/constants";
import type {
  Category,
  MonthlyBudget,
  SavingsGoal,
  ThemePreference,
  Transaction,
  TransactionType,
  UserPreferences,
} from "@/lib/types";
import { createId } from "@/lib/utils";
import { toMonthKey } from "@/lib/date";

interface AddTransactionInput {
  type: TransactionType;
  amount: number;
  categoryId: string;
  date: string;
  note?: string;
  paymentMethod?: string;
}

interface UpdateTransactionInput {
  amount?: number;
  categoryId?: string;
  date?: string;
  note?: string;
  paymentMethod?: string;
  type?: TransactionType;
}

interface AddCategoryInput {
  name: string;
  type: TransactionType;
  color?: string;
  icon?: string;
}

interface AddGoalInput {
  name: string;
  targetAmount: number;
  currentAmount: number;
  deadline?: string;
  color?: string;
}

interface SetMonthlyBudgetInput {
  month: string;
  totalLimit: number;
  categoryLimits: Record<string, number>;
}

interface BudgetStoreState {
  transactions: Transaction[];
  categories: Category[];
  budgets: MonthlyBudget[];
  goals: SavingsGoal[];
  preferences: UserPreferences;
  demoMode: boolean;
  lastUpdated: number;
  hasHydrated: boolean;
  setHasHydrated: (value: boolean) => void;
  setSelectedMonth: (month: string) => void;
  setThemePreference: (theme: ThemePreference) => void;
  addTransaction: (input: AddTransactionInput) => void;
  restoreTransaction: (transaction: Transaction) => void;
  updateTransaction: (id: string, input: UpdateTransactionInput) => void;
  deleteTransaction: (id: string) => void;
  addCategory: (input: AddCategoryInput) => void;
  updateCategory: (id: string, input: AddCategoryInput) => void;
  deleteCategory: (id: string) => boolean;
  setMonthlyBudget: (input: SetMonthlyBudgetInput) => void;
  setCategoryBudget: (month: string, categoryId: string, limit: number) => void;
  removeCategoryBudget: (month: string, categoryId: string) => void;
  addGoal: (input: AddGoalInput) => void;
  updateGoal: (id: string, input: Partial<AddGoalInput>) => void;
  deleteGoal: (id: string) => void;
  setDemoData: () => void;
  resetData: () => void;
}

function nowIso() {
  return new Date().toISOString();
}

function findOrCreateBudget(
  budgets: MonthlyBudget[],
  month: string,
  totalLimit = 0
): MonthlyBudget {
  const existing = budgets.find((budget) => budget.month === month);
  if (existing) {
    return existing;
  }

  const timestamp = nowIso();
  return {
    id: `budget-${month}`,
    month,
    totalLimit,
    categoryLimits: {},
    createdAt: timestamp,
    updatedAt: timestamp,
  };
}

const initialState = {
  transactions: [] as Transaction[],
  categories: DEFAULT_CATEGORIES,
  budgets: [] as MonthlyBudget[],
  goals: [] as SavingsGoal[],
  preferences: DEFAULT_PREFERENCES,
  demoMode: false,
};

export const useBudgetStore = create<BudgetStoreState>()(
  persist(
    (set, get) => ({
      ...initialState,
      lastUpdated: Date.now(),
      hasHydrated: false,
      setHasHydrated: (value) => set({ hasHydrated: value }),
      setSelectedMonth: (month) =>
        set((state) => ({
          preferences: { ...state.preferences, selectedMonth: month },
          lastUpdated: Date.now(),
        })),
      setThemePreference: (theme) =>
        set((state) => ({
          preferences: { ...state.preferences, theme },
          lastUpdated: Date.now(),
        })),
      addTransaction: (input) =>
        set((state) => {
          const timestamp = nowIso();
          const newTransaction: Transaction = {
            id: createId("tx"),
            type: input.type,
            amount: input.amount,
            categoryId: input.categoryId,
            date: new Date(input.date).toISOString(),
            note: input.note?.trim() || undefined,
            paymentMethod: input.paymentMethod?.trim() || undefined,
            createdAt: timestamp,
            updatedAt: timestamp,
          };

          return {
            transactions: [newTransaction, ...state.transactions],
            lastUpdated: Date.now(),
          };
        }),
      restoreTransaction: (transaction) =>
        set((state) => ({
          transactions: [transaction, ...state.transactions.filter((item) => item.id !== transaction.id)],
          lastUpdated: Date.now(),
        })),
      updateTransaction: (id, input) =>
        set((state) => ({
          transactions: state.transactions.map((transaction) =>
            transaction.id === id
              ? {
                  ...transaction,
                  ...input,
                  date: input.date ? new Date(input.date).toISOString() : transaction.date,
                  note: input.note?.trim() || undefined,
                  paymentMethod: input.paymentMethod?.trim() || undefined,
                  updatedAt: nowIso(),
                }
              : transaction
          ),
          lastUpdated: Date.now(),
        })),
      deleteTransaction: (id) =>
        set((state) => ({
          transactions: state.transactions.filter((transaction) => transaction.id !== id),
          lastUpdated: Date.now(),
        })),
      addCategory: (input) =>
        set((state) => {
          const timestamp = nowIso();
          const newCategory: Category = {
            id: createId("cat"),
            name: input.name,
            type: input.type,
            color: input.color || undefined,
            icon: input.icon || undefined,
            createdAt: timestamp,
            updatedAt: timestamp,
          };
          return {
            categories: [...state.categories, newCategory],
            lastUpdated: Date.now(),
          };
        }),
      updateCategory: (id, input) =>
        set((state) => ({
          categories: state.categories.map((category) =>
            category.id === id
              ? {
                  ...category,
                  ...input,
                  color: input.color || undefined,
                  icon: input.icon || undefined,
                  updatedAt: nowIso(),
                }
              : category
          ),
          lastUpdated: Date.now(),
        })),
      deleteCategory: (id) => {
        const state = get();
        const hasTransactions = state.transactions.some(
          (transaction) => transaction.categoryId === id
        );

        if (hasTransactions) {
          return false;
        }

        set((currentState) => ({
          categories: currentState.categories.filter((category) => category.id !== id),
          budgets: currentState.budgets.map((budget) => {
            const nextCategoryLimits = { ...budget.categoryLimits };
            delete nextCategoryLimits[id];
            return { ...budget, categoryLimits: nextCategoryLimits, updatedAt: nowIso() };
          }),
          lastUpdated: Date.now(),
        }));

        return true;
      },
      setMonthlyBudget: (input) =>
        set((state) => {
          const existing = state.budgets.find((budget) => budget.month === input.month);
          const timestamp = nowIso();
          if (existing) {
            return {
              budgets: state.budgets.map((budget) =>
                budget.month === input.month
                  ? {
                      ...budget,
                      totalLimit: input.totalLimit,
                      categoryLimits: input.categoryLimits,
                      updatedAt: timestamp,
                    }
                  : budget
              ),
              lastUpdated: Date.now(),
            };
          }

          return {
            budgets: [
              ...state.budgets,
              {
                id: `budget-${input.month}`,
                month: input.month,
                totalLimit: input.totalLimit,
                categoryLimits: input.categoryLimits,
                createdAt: timestamp,
                updatedAt: timestamp,
              },
            ],
            lastUpdated: Date.now(),
          };
        }),
      setCategoryBudget: (month, categoryId, limit) =>
        set((state) => {
          const targetBudget = findOrCreateBudget(state.budgets, month);
          const nextBudget: MonthlyBudget = {
            ...targetBudget,
            categoryLimits: { ...targetBudget.categoryLimits, [categoryId]: limit },
            updatedAt: nowIso(),
          };

          const nextBudgets = state.budgets.some((budget) => budget.month === month)
            ? state.budgets.map((budget) => (budget.month === month ? nextBudget : budget))
            : [...state.budgets, nextBudget];

          return {
            budgets: nextBudgets,
            lastUpdated: Date.now(),
          };
        }),
      removeCategoryBudget: (month, categoryId) =>
        set((state) => ({
          budgets: state.budgets.map((budget) => {
            if (budget.month !== month) {
              return budget;
            }
            const nextCategoryLimits = { ...budget.categoryLimits };
            delete nextCategoryLimits[categoryId];
            return {
              ...budget,
              categoryLimits: nextCategoryLimits,
              updatedAt: nowIso(),
            };
          }),
          lastUpdated: Date.now(),
        })),
      addGoal: (input) =>
        set((state) => {
          const timestamp = nowIso();
          const newGoal: SavingsGoal = {
            id: createId("goal"),
            name: input.name,
            targetAmount: input.targetAmount,
            currentAmount: input.currentAmount,
            deadline: input.deadline || undefined,
            color: input.color || undefined,
            createdAt: timestamp,
            updatedAt: timestamp,
          };
          return {
            goals: [...state.goals, newGoal],
            lastUpdated: Date.now(),
          };
        }),
      updateGoal: (id, input) =>
        set((state) => ({
          goals: state.goals.map((goal) =>
            goal.id === id
              ? {
                  ...goal,
                  ...input,
                  deadline: input.deadline || undefined,
                  color: input.color || undefined,
                  updatedAt: nowIso(),
                }
              : goal
          ),
          lastUpdated: Date.now(),
        })),
      deleteGoal: (id) =>
        set((state) => ({
          goals: state.goals.filter((goal) => goal.id !== id),
          lastUpdated: Date.now(),
        })),
      setDemoData: () =>
        set((state) => {
          const dataset = buildDemoDataset();
          const selectedMonth = toMonthKey(new Date());
          return {
            ...state,
            categories: DEFAULT_CATEGORIES,
            transactions: dataset.transactions,
            budgets: dataset.budgets,
            goals: dataset.goals,
            demoMode: true,
            preferences: { ...state.preferences, selectedMonth },
            lastUpdated: Date.now(),
          };
        }),
      resetData: () =>
        set((state) => ({
          ...initialState,
          preferences: { ...state.preferences, ...DEFAULT_PREFERENCES },
          lastUpdated: Date.now(),
        })),
    }),
    {
      name: STORAGE_KEY,
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        transactions: state.transactions,
        categories: state.categories,
        budgets: state.budgets,
        goals: state.goals,
        preferences: state.preferences,
        demoMode: state.demoMode,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);
