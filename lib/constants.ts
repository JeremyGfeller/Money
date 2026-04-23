import type {
  Category,
  MonthlyBudget,
  SavingsGoal,
  Transaction,
  UserPreferences,
} from "@/lib/types";
import { shiftMonth, toMonthKey } from "@/lib/date";

const nowIso = new Date().toISOString();

export const STORAGE_KEY = "money-pilot-store";

export const DEFAULT_PREFERENCES: UserPreferences = {
  currency: "CHF",
  locale: "fr-CH",
  theme: "system",
  selectedMonth: toMonthKey(new Date()),
};

export const PAYMENT_METHODS = [
  "Carte",
  "Espèces",
  "Virement",
  "Prélèvement",
  "Twint",
  "Autre",
] as const;

export const DEFAULT_CATEGORIES: Category[] = [
  {
    id: "cat-salary",
    name: "Salaire",
    type: "income",
    icon: "Wallet",
    color: "#0ea36c",
    isDefault: true,
    createdAt: nowIso,
    updatedAt: nowIso,
  },
  {
    id: "cat-freelance",
    name: "Freelance",
    type: "income",
    icon: "Briefcase",
    color: "#0f7b9b",
    isDefault: true,
    createdAt: nowIso,
    updatedAt: nowIso,
  },
  {
    id: "cat-housing",
    name: "Logement",
    type: "expense",
    icon: "House",
    color: "#f97316",
    isDefault: true,
    createdAt: nowIso,
    updatedAt: nowIso,
  },
  {
    id: "cat-food",
    name: "Courses",
    type: "expense",
    icon: "ShoppingBasket",
    color: "#14b8a6",
    isDefault: true,
    createdAt: nowIso,
    updatedAt: nowIso,
  },
  {
    id: "cat-transport",
    name: "Transport",
    type: "expense",
    icon: "Car",
    color: "#3b82f6",
    isDefault: true,
    createdAt: nowIso,
    updatedAt: nowIso,
  },
  {
    id: "cat-leisure",
    name: "Loisirs",
    type: "expense",
    icon: "Coffee",
    color: "#8b5cf6",
    isDefault: true,
    createdAt: nowIso,
    updatedAt: nowIso,
  },
  {
    id: "cat-health",
    name: "Santé",
    type: "expense",
    icon: "HeartPulse",
    color: "#ef4444",
    isDefault: true,
    createdAt: nowIso,
    updatedAt: nowIso,
  },
];

export interface DemoDataset {
  transactions: Transaction[];
  budgets: MonthlyBudget[];
  goals: SavingsGoal[];
}

export function buildDemoDataset(): DemoDataset {
  const today = new Date();
  const currentMonth = toMonthKey(today);
  const previousMonth = shiftMonth(currentMonth, -1);
  const twoMonthsAgo = shiftMonth(currentMonth, -2);
  const isoToday = today.toISOString();

  const transactions: Transaction[] = [
    {
      id: "tx-salary-current",
      type: "income",
      amount: 5200,
      categoryId: "cat-salary",
      date: new Date(today.getFullYear(), today.getMonth(), 1).toISOString(),
      note: "Salaire mensuel",
      paymentMethod: "Virement",
      createdAt: isoToday,
      updatedAt: isoToday,
    },
    {
      id: "tx-rent-current",
      type: "expense",
      amount: 1650,
      categoryId: "cat-housing",
      date: new Date(today.getFullYear(), today.getMonth(), 2).toISOString(),
      note: "Loyer",
      paymentMethod: "Prélèvement",
      createdAt: isoToday,
      updatedAt: isoToday,
    },
    {
      id: "tx-groceries-current",
      type: "expense",
      amount: 320,
      categoryId: "cat-food",
      date: new Date(today.getFullYear(), today.getMonth(), 8).toISOString(),
      note: "Courses hebdo",
      paymentMethod: "Carte",
      createdAt: isoToday,
      updatedAt: isoToday,
    },
    {
      id: "tx-transport-current",
      type: "expense",
      amount: 120,
      categoryId: "cat-transport",
      date: new Date(today.getFullYear(), today.getMonth(), 10).toISOString(),
      note: "Abonnement train",
      paymentMethod: "Carte",
      createdAt: isoToday,
      updatedAt: isoToday,
    },
    {
      id: "tx-leisure-current",
      type: "expense",
      amount: 190,
      categoryId: "cat-leisure",
      date: new Date(today.getFullYear(), today.getMonth(), 12).toISOString(),
      note: "Sortie week-end",
      paymentMethod: "Carte",
      createdAt: isoToday,
      updatedAt: isoToday,
    },
    {
      id: "tx-freelance-current",
      type: "income",
      amount: 760,
      categoryId: "cat-freelance",
      date: new Date(today.getFullYear(), today.getMonth(), 14).toISOString(),
      note: "Mission ponctuelle",
      paymentMethod: "Virement",
      createdAt: isoToday,
      updatedAt: isoToday,
    },
    {
      id: "tx-salary-prev",
      type: "income",
      amount: 5200,
      categoryId: "cat-salary",
      date: `${previousMonth}-01T08:00:00.000Z`,
      note: "Salaire mensuel",
      paymentMethod: "Virement",
      createdAt: isoToday,
      updatedAt: isoToday,
    },
    {
      id: "tx-housing-prev",
      type: "expense",
      amount: 1650,
      categoryId: "cat-housing",
      date: `${previousMonth}-02T09:00:00.000Z`,
      note: "Loyer",
      paymentMethod: "Prélèvement",
      createdAt: isoToday,
      updatedAt: isoToday,
    },
    {
      id: "tx-food-prev",
      type: "expense",
      amount: 340,
      categoryId: "cat-food",
      date: `${previousMonth}-11T12:00:00.000Z`,
      note: "Courses",
      paymentMethod: "Carte",
      createdAt: isoToday,
      updatedAt: isoToday,
    },
    {
      id: "tx-salary-prev-2",
      type: "income",
      amount: 5100,
      categoryId: "cat-salary",
      date: `${twoMonthsAgo}-01T08:00:00.000Z`,
      note: "Salaire mensuel",
      paymentMethod: "Virement",
      createdAt: isoToday,
      updatedAt: isoToday,
    },
    {
      id: "tx-food-prev-2",
      type: "expense",
      amount: 290,
      categoryId: "cat-food",
      date: `${twoMonthsAgo}-09T12:00:00.000Z`,
      note: "Courses",
      paymentMethod: "Carte",
      createdAt: isoToday,
      updatedAt: isoToday,
    },
  ];

  const budgets: MonthlyBudget[] = [
    {
      id: `budget-${currentMonth}`,
      month: currentMonth,
      totalLimit: 2900,
      categoryLimits: {
        "cat-housing": 1700,
        "cat-food": 500,
        "cat-transport": 200,
        "cat-leisure": 260,
        "cat-health": 180,
      },
      createdAt: isoToday,
      updatedAt: isoToday,
    },
    {
      id: `budget-${previousMonth}`,
      month: previousMonth,
      totalLimit: 2850,
      categoryLimits: {
        "cat-housing": 1700,
        "cat-food": 460,
        "cat-transport": 210,
        "cat-leisure": 250,
      },
      createdAt: isoToday,
      updatedAt: isoToday,
    },
  ];

  const goals: SavingsGoal[] = [
    {
      id: "goal-emergency",
      name: "Fonds de sécurité",
      targetAmount: 10000,
      currentAmount: 4600,
      deadline: `${shiftMonth(currentMonth, 8)}-15`,
      color: "#0ea36c",
      createdAt: isoToday,
      updatedAt: isoToday,
    },
    {
      id: "goal-holidays",
      name: "Vacances d'été",
      targetAmount: 2500,
      currentAmount: 1450,
      deadline: `${shiftMonth(currentMonth, 2)}-20`,
      color: "#0f7b9b",
      createdAt: isoToday,
      updatedAt: isoToday,
    },
  ];

  return { transactions, budgets, goals };
}
