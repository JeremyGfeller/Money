import { getPreviousMonths, toMonthKey } from "@/lib/date";
import type {
  Category,
  CategorySpending,
  DashboardData,
  GoalProgress,
  MonthlyBudget,
  SavingsGoal,
  Transaction,
  TransactionFilters,
  TrendPoint,
} from "@/lib/types";

function getMonthlyTransactions(transactions: Transaction[], month: string) {
  return transactions.filter((transaction) => toMonthKey(transaction.date) === month);
}

function sumAmounts(transactions: Transaction[], type: "income" | "expense"): number {
  return transactions
    .filter((transaction) => transaction.type === type)
    .reduce((total, transaction) => total + transaction.amount, 0);
}

function getTotalBalance(transactions: Transaction[]): number {
  return transactions.reduce((total, transaction) => {
    if (transaction.type === "income") {
      return total + transaction.amount;
    }
    return total - transaction.amount;
  }, 0);
}

function getBudgetForMonth(budgets: MonthlyBudget[], month: string) {
  return budgets.find((budget) => budget.month === month);
}

function getTopCategorySpending(
  transactions: Transaction[],
  categories: Category[]
): CategorySpending[] {
  const expenses = transactions.filter((transaction) => transaction.type === "expense");
  const totalExpenses = expenses.reduce((sum, transaction) => sum + transaction.amount, 0);
  const byCategory = new Map<string, number>();

  for (const expense of expenses) {
    byCategory.set(expense.categoryId, (byCategory.get(expense.categoryId) ?? 0) + expense.amount);
  }

  return Array.from(byCategory.entries())
    .map(([categoryId, amount]) => {
      const category = categories.find((item) => item.id === categoryId);
      return {
        categoryId,
        categoryName: category?.name ?? "Catégorie supprimée",
        color: category?.color ?? "#64748b",
        amount,
        percentage: totalExpenses === 0 ? 0 : (amount / totalExpenses) * 100,
      };
    })
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 5);
}

function getTrends(
  transactions: Transaction[],
  month: string,
  locale: string
): TrendPoint[] {
  const months = getPreviousMonths(month, 6);
  return months.map((monthItem) => {
    const monthlyTransactions = getMonthlyTransactions(transactions, monthItem);
    const income = sumAmounts(monthlyTransactions, "income");
    const expense = sumAmounts(monthlyTransactions, "expense");
    const label = new Intl.DateTimeFormat(locale, { month: "short" }).format(
      new Date(`${monthItem}-01T00:00:00`)
    );

    return {
      month: label,
      income,
      expense,
      balance: income - expense,
    };
  });
}

function getGoalsProgress(goals: SavingsGoal[]): GoalProgress[] {
  return goals.map((goal) => {
    const percentage = Math.min((goal.currentAmount / goal.targetAmount) * 100, 100);
    return {
      id: goal.id,
      name: goal.name,
      currentAmount: goal.currentAmount,
      targetAmount: goal.targetAmount,
      percentage,
      remaining: Math.max(goal.targetAmount - goal.currentAmount, 0),
      color: goal.color ?? "#0ea36c",
      deadline: goal.deadline,
    };
  });
}

export function buildDashboardData(params: {
  transactions: Transaction[];
  categories: Category[];
  budgets: MonthlyBudget[];
  goals: SavingsGoal[];
  month: string;
  locale: string;
}): DashboardData {
  const { transactions, categories, budgets, goals, month, locale } = params;
  const monthTransactions = getMonthlyTransactions(transactions, month);
  const monthIncome = sumAmounts(monthTransactions, "income");
  const monthExpense = sumAmounts(monthTransactions, "expense");
  const monthBudget = getBudgetForMonth(budgets, month);
  const availableToSpend = (monthBudget?.totalLimit ?? monthIncome) - monthExpense;

  return {
    summary: {
      totalBalance: getTotalBalance(transactions),
      monthlyIncome: monthIncome,
      monthlyExpense: monthExpense,
      availableToSpend,
    },
    topCategories: getTopCategorySpending(monthTransactions, categories),
    trends: getTrends(transactions, month, locale),
    goals: getGoalsProgress(goals),
  };
}

export function getFilteredTransactions(
  transactions: Transaction[],
  categories: Category[],
  filters: TransactionFilters
): Transaction[] {
  const normalizedSearch = filters.search.trim().toLowerCase();

  return transactions
    .filter((transaction) => toMonthKey(transaction.date) === filters.month)
    .filter((transaction) =>
      filters.categoryId === "all" ? true : transaction.categoryId === filters.categoryId
    )
    .filter((transaction) =>
      filters.type === "all" ? true : transaction.type === filters.type
    )
    .filter((transaction) => {
      if (!normalizedSearch) {
        return true;
      }
      const category = categories.find((item) => item.id === transaction.categoryId);
      const searchableContent = [
        transaction.note ?? "",
        transaction.paymentMethod ?? "",
        category?.name ?? "",
        transaction.amount.toString(),
      ]
        .join(" ")
        .toLowerCase();

      return searchableContent.includes(normalizedSearch);
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export function getCategoryBudgetProgress(
  transactions: Transaction[],
  categories: Category[],
  budget: MonthlyBudget | undefined,
  month: string
) {
  if (!budget) {
    return [];
  }

  const monthExpenses = getMonthlyTransactions(transactions, month).filter(
    (transaction) => transaction.type === "expense"
  );
  const spentByCategory = new Map<string, number>();

  for (const expense of monthExpenses) {
    spentByCategory.set(expense.categoryId, (spentByCategory.get(expense.categoryId) ?? 0) + expense.amount);
  }

  return Object.entries(budget.categoryLimits)
    .map(([categoryId, limit]) => {
      const category = categories.find((item) => item.id === categoryId);
      const spent = spentByCategory.get(categoryId) ?? 0;
      const ratio = limit === 0 ? 0 : (spent / limit) * 100;
      return {
        categoryId,
        categoryName: category?.name ?? "Catégorie supprimée",
        color: category?.color ?? "#64748b",
        spent,
        limit,
        ratio,
        isOverBudget: spent > limit,
      };
    })
    .sort((a, b) => b.ratio - a.ratio);
}
