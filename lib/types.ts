export type TransactionType = "income" | "expense";

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  categoryId: string;
  date: string;
  note?: string;
  paymentMethod?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  name: string;
  type: TransactionType;
  color?: string;
  icon?: string;
  isDefault?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface MonthlyBudget {
  id: string;
  month: string;
  totalLimit: number;
  categoryLimits: Record<string, number>;
  createdAt: string;
  updatedAt: string;
}

export interface SavingsGoal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  deadline?: string;
  color?: string;
  createdAt: string;
  updatedAt: string;
}

export type ThemePreference = "light" | "dark" | "system";

export interface UserPreferences {
  currency: string;
  locale: string;
  theme: ThemePreference;
  selectedMonth: string;
}

export interface TransactionFilters {
  month: string;
  categoryId: string;
  type: TransactionType | "all";
  search: string;
}

export interface DashboardSummary {
  totalBalance: number;
  monthlyIncome: number;
  monthlyExpense: number;
  availableToSpend: number;
}

export interface TrendPoint {
  month: string;
  income: number;
  expense: number;
  balance: number;
}

export interface CategorySpending {
  categoryId: string;
  categoryName: string;
  color: string;
  amount: number;
  percentage: number;
}

export interface GoalProgress {
  id: string;
  name: string;
  currentAmount: number;
  targetAmount: number;
  percentage: number;
  remaining: number;
  color: string;
  deadline?: string;
}

export interface DashboardData {
  summary: DashboardSummary;
  topCategories: CategorySpending[];
  trends: TrendPoint[];
  goals: GoalProgress[];
}
