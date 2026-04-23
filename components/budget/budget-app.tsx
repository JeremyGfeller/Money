"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ArrowDownCircle,
  ArrowUpCircle,
  CirclePlus,
  Coins,
  HandCoins,
  MoreHorizontal,
  PiggyBank,
  Target,
  Wallet,
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  XAxis,
  YAxis,
} from "recharts";
import { toast } from "sonner";
import { useBudgetStore } from "@/store/use-budget-store";
import {
  useCategoryBudgetProgress,
  useDashboardQuery,
  useFilteredTransactionsQuery,
} from "@/hooks/use-budget-queries";
import { useMonthOptions } from "@/hooks/use-month-options";
import type {
  Category,
  GoalProgress,
  SavingsGoal,
  Transaction,
  TransactionFilters,
  TransactionType,
} from "@/lib/types";
import { formatMonthLabel } from "@/lib/date";
import { formatCurrency, formatDate, formatPercentage } from "@/lib/format";
import { getCategoryIcon } from "@/lib/icon-map";
import { BudgetSkeleton } from "@/components/budget/budget-skeleton";
import { ThemeToggle } from "@/components/budget/theme-toggle";
import { BudgetForm } from "@/components/forms/budget-form";
import { CategoryForm } from "@/components/forms/category-form";
import { GoalForm } from "@/components/forms/goal-form";
import { TransactionForm } from "@/components/forms/transaction-form";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type DeleteTarget =
  | { type: "transaction" | "category" | "goal"; id: string; label: string }
  | null;

function kpiMeta(currency: string) {
  return [
    {
      key: "totalBalance",
      label: "Solde total",
      hint: "Vision globale",
      icon: Wallet,
      color: "text-primary",
      format: (value: number, locale: string) => formatCurrency(value, locale, currency),
    },
    {
      key: "monthlyIncome",
      label: "Revenus du mois",
      hint: "Entrees",
      icon: ArrowUpCircle,
      color: "text-chart-1",
      format: (value: number, locale: string) => formatCurrency(value, locale, currency),
    },
    {
      key: "monthlyExpense",
      label: "Depenses du mois",
      hint: "Sorties",
      icon: ArrowDownCircle,
      color: "text-chart-4",
      format: (value: number, locale: string) => formatCurrency(value, locale, currency),
    },
    {
      key: "availableToSpend",
      label: "Reste disponible",
      hint: "Marge actuelle",
      icon: PiggyBank,
      color: "text-chart-2",
      format: (value: number, locale: string) => formatCurrency(value, locale, currency),
    },
  ] as const;
}

function buildTransactionDefaults(transaction: Transaction | undefined) {
  if (!transaction) return undefined;
  return {
    type: transaction.type,
    amount: transaction.amount,
    categoryId: transaction.categoryId,
    date: transaction.date.slice(0, 10),
    note: transaction.note,
    paymentMethod: transaction.paymentMethod,
  };
}

function buildCategoryDefaults(category: Category | undefined) {
  if (!category) return undefined;
  return {
    name: category.name,
    type: category.type,
    color: category.color,
    icon: category.icon,
  };
}

function buildGoalDefaults(goal: SavingsGoal | undefined) {
  if (!goal) return undefined;
  return {
    name: goal.name,
    targetAmount: goal.targetAmount,
    currentAmount: goal.currentAmount,
    deadline: goal.deadline,
    color: goal.color,
  };
}

function EmptyState({
  title,
  actionLabel,
  onAction,
}: {
  title: string;
  actionLabel: string;
  onAction: () => void;
}) {
  return (
    <div className="rounded-xl border border-dashed bg-card/80 p-6 text-center text-sm text-muted-foreground">
      <p>{title}</p>
      <Button size="sm" variant="outline" className="mt-3" onClick={onAction}>
        {actionLabel}
      </Button>
    </div>
  );
}

function GoalCard({
  goal,
  locale,
  currency,
  onEdit,
  onDelete,
}: {
  goal: GoalProgress;
  locale: string;
  currency: string;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <Card className="premium-panel">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div>
            <CardTitle className="text-base">{goal.name}</CardTitle>
            <CardDescription>
              {goal.deadline ? `Echeance ${formatDate(goal.deadline, locale)}` : "Sans echeance"}
            </CardDescription>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreHorizontal className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={onEdit}>Modifier</DropdownMenuItem>
              <DropdownMenuItem className="text-destructive" onClick={onDelete}>
                Supprimer
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">
            {formatCurrency(goal.currentAmount, locale, currency)} /{" "}
            {formatCurrency(goal.targetAmount, locale, currency)}
          </span>
          <span className="font-semibold">{formatPercentage(goal.percentage)}</span>
        </div>
        <Progress value={goal.percentage} />
      </CardContent>
    </Card>
  );
}

export function BudgetApp() {
  const hasHydrated = useBudgetStore((state) => state.hasHydrated);
  const preferences = useBudgetStore((state) => state.preferences);
  const categories = useBudgetStore((state) => state.categories);
  const budgets = useBudgetStore((state) => state.budgets);
  const goals = useBudgetStore((state) => state.goals);
  const transactions = useBudgetStore((state) => state.transactions);
  const demoMode = useBudgetStore((state) => state.demoMode);

  const setSelectedMonth = useBudgetStore((state) => state.setSelectedMonth);
  const addTransaction = useBudgetStore((state) => state.addTransaction);
  const restoreTransaction = useBudgetStore((state) => state.restoreTransaction);
  const updateTransaction = useBudgetStore((state) => state.updateTransaction);
  const deleteTransaction = useBudgetStore((state) => state.deleteTransaction);
  const addCategory = useBudgetStore((state) => state.addCategory);
  const updateCategory = useBudgetStore((state) => state.updateCategory);
  const deleteCategory = useBudgetStore((state) => state.deleteCategory);
  const setMonthlyBudget = useBudgetStore((state) => state.setMonthlyBudget);
  const addGoal = useBudgetStore((state) => state.addGoal);
  const updateGoal = useBudgetStore((state) => state.updateGoal);
  const deleteGoal = useBudgetStore((state) => state.deleteGoal);
  const setDemoData = useBudgetStore((state) => state.setDemoData);
  const resetData = useBudgetStore((state) => state.resetData);

  const selectedMonth = preferences.selectedMonth;
  const locale = preferences.locale;
  const currency = preferences.currency;
  const monthOptions = useMonthOptions(selectedMonth);

  const [filters, setFilters] = useState<TransactionFilters>({
    month: selectedMonth,
    categoryId: "all",
    type: "all",
    search: "",
  });
  const [quickAddOpen, setQuickAddOpen] = useState(false);
  const [quickAddType, setQuickAddType] = useState<TransactionType>("expense");
  const [transactionDialogOpen, setTransactionDialogOpen] = useState(false);
  const [editingTransactionId, setEditingTransactionId] = useState<string | null>(null);
  const [categoryDialogOpen, setCategoryDialogOpen] = useState(false);
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
  const [goalDialogOpen, setGoalDialogOpen] = useState(false);
  const [editingGoalId, setEditingGoalId] = useState<string | null>(null);
  const [budgetDialogOpen, setBudgetDialogOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<DeleteTarget>(null);

  const dashboardQuery = useDashboardQuery(selectedMonth);
  const filteredTransactionsQuery = useFilteredTransactionsQuery(filters);
  const categoryBudgetQuery = useCategoryBudgetProgress(selectedMonth);

  const monthBudget = useMemo(
    () => budgets.find((budget) => budget.month === selectedMonth),
    [budgets, selectedMonth]
  );
  const editingTransaction = useMemo(
    () => transactions.find((item) => item.id === editingTransactionId),
    [transactions, editingTransactionId]
  );
  const editingCategory = useMemo(
    () => categories.find((item) => item.id === editingCategoryId),
    [categories, editingCategoryId]
  );
  const editingGoal = useMemo(
    () => goals.find((item) => item.id === editingGoalId),
    [goals, editingGoalId]
  );

  const dashboardData = dashboardQuery.data;
  const filteredTransactions = filteredTransactionsQuery.data ?? [];
  const categoryBudgetData = categoryBudgetQuery.data ?? [];

  const openQuickAdd = useCallback((type: TransactionType) => {
    setQuickAddType(type);
    setQuickAddOpen(true);
  }, []);

  const openTransactionDialog = useCallback((type: TransactionType) => {
    setEditingTransactionId(null);
    setQuickAddType(type);
    setTransactionDialogOpen(true);
  }, []);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      const editing =
        target?.tagName === "INPUT" ||
        target?.tagName === "TEXTAREA" ||
        target?.tagName === "SELECT" ||
        target?.isContentEditable;
      if (editing) return;

      const key = event.key.toLowerCase();
      if (key === "n") {
        event.preventDefault();
        openQuickAdd("expense");
      }
      if (key === "r") {
        event.preventDefault();
        openQuickAdd("income");
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [openQuickAdd]);

  if (!hasHydrated) return <BudgetSkeleton />;

  const summary = dashboardData?.summary ?? {
    totalBalance: 0,
    monthlyIncome: 0,
    monthlyExpense: 0,
    availableToSpend: 0,
  };
  const topCategories = dashboardData?.topCategories ?? [];
  const trends = dashboardData?.trends ?? [];
  const goalProgress = dashboardData?.goals ?? [];
  const monthlyBudgetRatio =
    monthBudget?.totalLimit && monthBudget.totalLimit > 0
      ? Math.min((summary.monthlyExpense / monthBudget.totalLimit) * 100, 100)
      : 0;

  const handleDelete = () => {
    if (!deleteTarget) return;

    if (deleteTarget.type === "transaction") {
      const deleted = transactions.find((item) => item.id === deleteTarget.id);
      deleteTransaction(deleteTarget.id);
      toast.success("Transaction supprimee.", {
        action: deleted
          ? { label: "Annuler", onClick: () => restoreTransaction(deleted) }
          : undefined,
      });
    }
    if (deleteTarget.type === "goal") {
      deleteGoal(deleteTarget.id);
      toast.success("Objectif supprime.");
    }
    if (deleteTarget.type === "category") {
      const ok = deleteCategory(deleteTarget.id);
      toast[ok ? "success" : "error"](
        ok ? "Categorie supprimee." : "Categorie encore utilisee."
      );
    }

    setDeleteTarget(null);
  };

  return (
    <>
      <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-6 p-4 pb-28 sm:p-6 sm:pb-8">
        <header className="premium-panel overflow-hidden border-none bg-[linear-gradient(120deg,rgba(16,166,105,0.14)_0%,rgba(15,123,155,0.10)_52%,rgba(255,255,255,0)_100%)] p-5 sm:p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                  <Wallet className="size-5" />
                </div>
                <div>
                  <h1 className="text-2xl font-semibold tracking-tight">MoneyPilot</h1>
                  <p className="text-xs text-muted-foreground">Fintech budget dashboard</p>
                </div>
                {demoMode ? <Badge variant="secondary">Demo</Badge> : null}
              </div>
              <p className="text-sm text-muted-foreground">
                Vue premium et claire de votre situation financiere. Raccourcis clavier N et R.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Select
                value={selectedMonth}
                onValueChange={(value) => {
                  setSelectedMonth(value);
                  setFilters((current) => ({ ...current, month: value }));
                }}
              >
                <SelectTrigger className="w-[170px]">
                  <SelectValue placeholder="Mois" />
                </SelectTrigger>
                <SelectContent>
                  {monthOptions.map((month) => (
                    <SelectItem key={month} value={month}>
                      {formatMonthLabel(month, locale)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                variant="outline"
                onClick={() => {
                  if (demoMode) {
                    resetData();
                    toast.success("Donnees reinitialisees.");
                  } else {
                    setDemoData();
                    toast.success("Donnees demo chargees.");
                  }
                }}
              >
                {demoMode ? "Vider demo" : "Charger demo"}
              </Button>
              <ThemeToggle />
            </div>
          </div>

          <div className="mt-4 grid gap-2 sm:grid-cols-3">
            <Button onClick={() => openQuickAdd("expense")}>
              <Coins className="size-4" />
              Ajouter depense
            </Button>
            <Button variant="secondary" onClick={() => openQuickAdd("income")}>
              <HandCoins className="size-4" />
              Ajouter revenu
            </Button>
            <Button variant="outline" onClick={() => openTransactionDialog("expense")}>
              <CirclePlus className="size-4" />
              Formulaire complet
            </Button>
          </div>
        </header>

        <Tabs defaultValue="overview" className="gap-4">
          <div className="overflow-x-auto pb-1">
            <TabsList className="h-11 w-max rounded-xl border bg-card/85 p-1 backdrop-blur">
              <TabsTrigger value="overview">Vue globale</TabsTrigger>
              <TabsTrigger value="transactions">Transactions</TabsTrigger>
              <TabsTrigger value="budget">Budget</TabsTrigger>
              <TabsTrigger value="goals">Objectifs</TabsTrigger>
              <TabsTrigger value="categories">Categories</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="overview" className="space-y-4">
            <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {kpiMeta(currency).map((item) => {
                const Icon = item.icon;
                return (
                  <Card key={item.key} className="premium-panel">
                    <CardHeader className="pb-2">
                      <CardDescription className="text-xs uppercase tracking-wide">
                        {item.label}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-1">
                      <div className="flex items-center justify-between">
                        <p className="text-xl font-semibold">{item.format(summary[item.key], locale)}</p>
                        <Icon className={`size-5 ${item.color}`} />
                      </div>
                      <p className="text-xs text-muted-foreground">{item.hint}</p>
                    </CardContent>
                  </Card>
                );
              })}
            </section>

            <section className="grid gap-4 lg:grid-cols-2">
              <Card className="premium-panel">
                <CardHeader>
                  <CardTitle className="text-base">Tendance 6 mois</CardTitle>
                  <CardDescription>Evolution revenus / depenses</CardDescription>
                </CardHeader>
                <CardContent className="h-72">
                  {trends.length === 0 ? (
                    <EmptyState
                      title="Ajoutez des transactions pour alimenter le graphique."
                      actionLabel="Ajouter depense"
                      onAction={() => openQuickAdd("expense")}
                    />
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={trends}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <RechartsTooltip
                          formatter={(value) => formatCurrency(Number(value ?? 0), locale, currency)}
                        />
                        <Bar dataKey="income" fill="var(--color-chart-1)" radius={[6, 6, 0, 0]} />
                        <Bar dataKey="expense" fill="var(--color-chart-4)" radius={[6, 6, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </CardContent>
              </Card>

              <Card className="premium-panel">
                <CardHeader>
                  <CardTitle className="text-base">Top depenses</CardTitle>
                  <CardDescription>Categories les plus consommatrices</CardDescription>
                </CardHeader>
                <CardContent className="h-72">
                  {topCategories.length === 0 ? (
                    <EmptyState
                      title="Aucune depense sur cette periode."
                      actionLabel="Ajouter depense"
                      onAction={() => openQuickAdd("expense")}
                    />
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={topCategories} dataKey="amount" nameKey="categoryName" innerRadius={65} outerRadius={95}>
                          {topCategories.map((entry) => (
                            <Cell key={entry.categoryId} fill={entry.color} />
                          ))}
                        </Pie>
                        <RechartsTooltip
                          formatter={(value) => formatCurrency(Number(value ?? 0), locale, currency)}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  )}
                </CardContent>
              </Card>
            </section>
          </TabsContent>

          <TabsContent value="transactions">
            <Card className="premium-panel">
              <CardHeader className="gap-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <CardTitle className="text-base">Historique transactions</CardTitle>
                    <CardDescription>Filtrage rapide et edition directe</CardDescription>
                  </div>
                  <Button onClick={() => openTransactionDialog("expense")}>
                    <CirclePlus className="size-4" />
                    Nouvelle transaction
                  </Button>
                </div>
                <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
                  <Input
                    placeholder="Recherche"
                    value={filters.search}
                    onChange={(event) => setFilters((current) => ({ ...current, search: event.target.value }))}
                  />
                  <Select
                    value={filters.type}
                    onValueChange={(value) =>
                      setFilters((current) => ({ ...current, type: value as TransactionFilters["type"] }))
                    }
                  >
                    <SelectTrigger><SelectValue placeholder="Type" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tous types</SelectItem>
                      <SelectItem value="income">Revenus</SelectItem>
                      <SelectItem value="expense">Depenses</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select
                    value={filters.categoryId}
                    onValueChange={(value) => setFilters((current) => ({ ...current, categoryId: value }))}
                  >
                    <SelectTrigger><SelectValue placeholder="Categorie" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Toutes categories</SelectItem>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>{category.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={filters.month} onValueChange={(value) => setFilters((current) => ({ ...current, month: value }))}>
                    <SelectTrigger><SelectValue placeholder="Mois" /></SelectTrigger>
                    <SelectContent>
                      {monthOptions.map((month) => (
                        <SelectItem key={month} value={month}>{formatMonthLabel(month, locale)}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button variant="outline" onClick={() => setFilters({ month: selectedMonth, categoryId: "all", type: "all", search: "" })}>
                    Reinitialiser
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {filteredTransactions.length === 0 ? (
                  <EmptyState
                    title="Aucune transaction avec ces filtres."
                    actionLabel="Ajouter transaction"
                    onAction={() => openTransactionDialog("expense")}
                  />
                ) : (
                  <>
                    <div className="space-y-3 md:hidden">
                      {filteredTransactions.map((transaction) => {
                        const category = categories.find((item) => item.id === transaction.categoryId);
                        return (
                          <article key={transaction.id} className="rounded-xl border bg-card p-4 shadow-xs">
                            <div className="flex items-start justify-between gap-3">
                              <div className="space-y-1">
                                <p className="text-xs text-muted-foreground">
                                  {formatDate(transaction.date, locale)}
                                </p>
                                <p className="font-semibold">
                                  {category?.name ?? "Categorie supprimee"}
                                </p>
                              </div>
                              <div className="text-right">
                                <Badge variant={transaction.type === "income" ? "secondary" : "outline"}>
                                  {transaction.type === "income" ? "Revenu" : "Depense"}
                                </Badge>
                                <p className="mt-1 text-base font-semibold">
                                  <span
                                    className={
                                      transaction.type === "income" ? "text-chart-1" : "text-chart-4"
                                    }
                                  >
                                    {transaction.type === "income" ? "+" : "-"}
                                    {formatCurrency(transaction.amount, locale, currency)}
                                  </span>
                                </p>
                              </div>
                            </div>

                            {(transaction.note || transaction.paymentMethod) ? (
                              <div className="mt-3 space-y-1 text-xs text-muted-foreground">
                                {transaction.note ? <p>Note: {transaction.note}</p> : null}
                                {transaction.paymentMethod ? (
                                  <p>Paiement: {transaction.paymentMethod}</p>
                                ) : null}
                              </div>
                            ) : null}

                            <div className="mt-3 grid grid-cols-2 gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setEditingTransactionId(transaction.id);
                                  setTransactionDialogOpen(true);
                                }}
                              >
                                Modifier
                              </Button>
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() =>
                                  setDeleteTarget({
                                    type: "transaction",
                                    id: transaction.id,
                                    label: "cette transaction",
                                  })
                                }
                              >
                                Supprimer
                              </Button>
                            </div>
                          </article>
                        );
                      })}
                    </div>

                    <div className="hidden md:block">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Date</TableHead><TableHead>Type</TableHead><TableHead>Categorie</TableHead>
                            <TableHead>Note</TableHead><TableHead>Paiement</TableHead>
                            <TableHead className="text-right">Montant</TableHead><TableHead className="w-10" />
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredTransactions.map((transaction) => {
                            const category = categories.find((item) => item.id === transaction.categoryId);
                            return (
                              <TableRow key={transaction.id}>
                                <TableCell>{formatDate(transaction.date, locale)}</TableCell>
                                <TableCell>
                                  <Badge variant={transaction.type === "income" ? "secondary" : "outline"}>
                                    {transaction.type === "income" ? "Revenu" : "Depense"}
                                  </Badge>
                                </TableCell>
                                <TableCell>{category?.name ?? "Categorie supprimee"}</TableCell>
                                <TableCell className="max-w-[180px] truncate">{transaction.note || "-"}</TableCell>
                                <TableCell>{transaction.paymentMethod || "-"}</TableCell>
                                <TableCell className="text-right font-semibold">
                                  <span className={transaction.type === "income" ? "text-chart-1" : "text-chart-4"}>
                                    {transaction.type === "income" ? "+" : "-"}
                                    {formatCurrency(transaction.amount, locale, currency)}
                                  </span>
                                </TableCell>
                                <TableCell>
                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreHorizontal className="size-4" /></Button></DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                      <DropdownMenuItem onClick={() => { setEditingTransactionId(transaction.id); setTransactionDialogOpen(true); }}>Modifier</DropdownMenuItem>
                                      <DropdownMenuItem className="text-destructive" onClick={() => setDeleteTarget({ type: "transaction", id: transaction.id, label: "cette transaction" })}>Supprimer</DropdownMenuItem>
                                    </DropdownMenuContent>
                                  </DropdownMenu>
                                </TableCell>
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="budget">
            <Card className="premium-panel">
              <CardHeader>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div><CardTitle className="text-base">Budget {formatMonthLabel(selectedMonth, locale)}</CardTitle><CardDescription>Plafond global et categories</CardDescription></div>
                  <Button variant="outline" onClick={() => setBudgetDialogOpen(true)}>Configurer budget</Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-3 sm:grid-cols-3">
                  <div className="rounded-lg border bg-card p-4"><p className="text-xs text-muted-foreground">Plafond</p><p className="mt-1 text-lg font-semibold">{formatCurrency(monthBudget?.totalLimit ?? 0, locale, currency)}</p></div>
                  <div className="rounded-lg border bg-card p-4"><p className="text-xs text-muted-foreground">Depense</p><p className="mt-1 text-lg font-semibold">{formatCurrency(summary.monthlyExpense, locale, currency)}</p></div>
                  <div className="rounded-lg border bg-card p-4"><p className="text-xs text-muted-foreground">Progression</p><p className="mt-1 text-lg font-semibold">{formatPercentage(monthlyBudgetRatio)}</p><Progress value={monthlyBudgetRatio} className="mt-2" /></div>
                </div>
                {categoryBudgetData.length === 0 ? (
                  <EmptyState title="Aucun plafond par categorie." actionLabel="Configurer mon budget" onAction={() => setBudgetDialogOpen(true)} />
                ) : (
                  <div className="space-y-3">
                    {categoryBudgetData.map((item) => (
                      <div key={item.categoryId} className="space-y-1.5 rounded-lg border bg-card p-3">
                        <div className="flex items-center justify-between text-sm">
                          <span className="font-medium">{item.categoryName}</span>
                          <span className={item.isOverBudget ? "text-destructive" : "text-muted-foreground"}>
                            {formatCurrency(item.spent, locale, currency)} / {formatCurrency(item.limit, locale, currency)}
                          </span>
                        </div>
                        <Progress value={Math.min(item.ratio, 100)} />
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="goals" className="space-y-4">
            <div className="flex justify-end">
              <Button onClick={() => { setEditingGoalId(null); setGoalDialogOpen(true); }}>
                <Target className="size-4" /> Nouvel objectif
              </Button>
            </div>
            {goalProgress.length === 0 ? (
              <EmptyState title="Aucun objectif actif." actionLabel="Creer un objectif" onAction={() => { setEditingGoalId(null); setGoalDialogOpen(true); }} />
            ) : (
              <div className="grid gap-3 md:grid-cols-2">
                {goalProgress.map((goal) => (
                  <GoalCard
                    key={goal.id}
                    goal={goal}
                    locale={locale}
                    currency={currency}
                    onEdit={() => { setEditingGoalId(goal.id); setGoalDialogOpen(true); }}
                    onDelete={() => setDeleteTarget({ type: "goal", id: goal.id, label: `objectif ${goal.name}` })}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="categories" className="space-y-4">
            <div className="flex justify-end">
              <Button onClick={() => { setEditingCategoryId(null); setCategoryDialogOpen(true); }}>
                <CirclePlus className="size-4" /> Nouvelle categorie
              </Button>
            </div>
            <Card className="premium-panel">
              <CardHeader><CardTitle className="text-base">Categories</CardTitle><CardDescription>Organisation des revenus et depenses</CardDescription></CardHeader>
              <CardContent>
                <Table>
                  <TableHeader><TableRow><TableHead>Nom</TableHead><TableHead>Type</TableHead><TableHead>Couleur</TableHead><TableHead>Statut</TableHead><TableHead className="w-10" /></TableRow></TableHeader>
                  <TableBody>
                    {categories.map((category) => {
                      const Icon = getCategoryIcon(category.icon);
                      return (
                        <TableRow key={category.id}>
                          <TableCell><div className="flex items-center gap-2"><Icon className="size-4 text-muted-foreground" /><span>{category.name}</span></div></TableCell>
                          <TableCell><Badge variant={category.type === "income" ? "secondary" : "outline"}>{category.type === "income" ? "Revenu" : "Depense"}</Badge></TableCell>
                          <TableCell><span className="inline-flex items-center gap-2 text-sm text-muted-foreground"><span className="inline-block size-3 rounded-full border" style={{ backgroundColor: category.color ?? "#64748b" }} />{category.color ?? "auto"}</span></TableCell>
                          <TableCell>{category.isDefault ? <Badge variant="outline">Defaut</Badge> : <Badge variant="secondary">Personnalisee</Badge>}</TableCell>
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreHorizontal className="size-4" /></Button></DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => { setEditingCategoryId(category.id); setCategoryDialogOpen(true); }}>Modifier</DropdownMenuItem>
                                {!category.isDefault ? <DropdownMenuItem className="text-destructive" onClick={() => setDeleteTarget({ type: "category", id: category.id, label: `categorie ${category.name}` })}>Supprimer</DropdownMenuItem> : null}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      <div className="fixed inset-x-0 bottom-0 z-40 border-t bg-background/95 p-3 backdrop-blur sm:hidden">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-2">
          <Button onClick={() => openQuickAdd("expense")} className="h-11"><Coins className="size-4" />Depense</Button>
          <Button variant="secondary" onClick={() => openQuickAdd("income")} className="h-11"><HandCoins className="size-4" />Revenu</Button>
        </div>
      </div>

      <Sheet open={quickAddOpen} onOpenChange={setQuickAddOpen}>
        <SheetContent side="right" className="w-full sm:max-w-xl">
          <SheetHeader className="mb-4">
            <SheetTitle>{quickAddType === "expense" ? "Nouvelle depense" : "Nouveau revenu"}</SheetTitle>
            <SheetDescription>Saisie rapide en quelques secondes.</SheetDescription>
          </SheetHeader>
          <TransactionForm categories={categories} defaultType={quickAddType} autoFocusAmount onSubmit={(values) => { addTransaction(values); toast.success("Transaction enregistree."); setQuickAddOpen(false); }} submitLabel="Ajouter transaction" />
        </SheetContent>
      </Sheet>

      <Dialog open={transactionDialogOpen} onOpenChange={setTransactionDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editingTransaction ? "Modifier transaction" : "Nouvelle transaction"}</DialogTitle><DialogDescription>Formulaire complet transaction.</DialogDescription></DialogHeader>
          <TransactionForm categories={categories} defaultValues={buildTransactionDefaults(editingTransaction)} defaultType={quickAddType} autoFocusAmount submitLabel={editingTransaction ? "Mettre a jour" : "Creer transaction"} onSubmit={(values) => { if (editingTransaction) { updateTransaction(editingTransaction.id, values); toast.success("Transaction mise a jour."); } else { addTransaction(values); toast.success("Transaction ajoutee."); } setTransactionDialogOpen(false); setEditingTransactionId(null); }} />
        </DialogContent>
      </Dialog>

      <Dialog open={categoryDialogOpen} onOpenChange={setCategoryDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editingCategory ? "Modifier categorie" : "Nouvelle categorie"}</DialogTitle><DialogDescription>Personnalisez vos categories.</DialogDescription></DialogHeader>
          <CategoryForm defaultValues={buildCategoryDefaults(editingCategory)} submitLabel={editingCategory ? "Mettre a jour" : "Creer categorie"} onSubmit={(values) => { if (editingCategory) { updateCategory(editingCategory.id, values); toast.success("Categorie mise a jour."); } else { addCategory(values); toast.success("Categorie creee."); } setCategoryDialogOpen(false); setEditingCategoryId(null); }} />
        </DialogContent>
      </Dialog>

      <Dialog open={goalDialogOpen} onOpenChange={setGoalDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editingGoal ? "Modifier objectif" : "Nouvel objectif"}</DialogTitle><DialogDescription>Fixez une cible simple et lisible.</DialogDescription></DialogHeader>
          <GoalForm defaultValues={buildGoalDefaults(editingGoal)} submitLabel={editingGoal ? "Mettre a jour" : "Creer objectif"} onSubmit={(values) => { if (editingGoal) { updateGoal(editingGoal.id, values); toast.success("Objectif mis a jour."); } else { addGoal(values); toast.success("Objectif cree."); } setGoalDialogOpen(false); setEditingGoalId(null); }} />
        </DialogContent>
      </Dialog>

      <Dialog open={budgetDialogOpen} onOpenChange={setBudgetDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Configurer budget mensuel</DialogTitle><DialogDescription>Plafond total et limites categories.</DialogDescription></DialogHeader>
          <BudgetForm key={`${selectedMonth}-${monthBudget?.updatedAt ?? "new"}`} month={selectedMonth} locale={locale} categories={categories} totalLimit={monthBudget?.totalLimit ?? 0} categoryLimits={monthBudget?.categoryLimits ?? {}} onSubmit={(values) => { setMonthlyBudget(values); setBudgetDialogOpen(false); toast.success("Budget enregistre."); }} />
        </DialogContent>
      </Dialog>

      <AlertDialog open={Boolean(deleteTarget)} onOpenChange={(open) => (!open ? setDeleteTarget(null) : undefined)}>
        <AlertDialogContent>
          <AlertDialogHeader><AlertDialogTitle>Confirmer suppression</AlertDialogTitle><AlertDialogDescription>Cette action supprimera {deleteTarget?.label ?? "cet element"}.</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter><AlertDialogCancel>Annuler</AlertDialogCancel><AlertDialogAction className="bg-destructive hover:bg-destructive/90" onClick={handleDelete}>Supprimer</AlertDialogAction></AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
