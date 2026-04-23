"use client";

import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { budgetSchema, type BudgetFormValues } from "@/lib/schemas";
import type { Category } from "@/lib/types";
import { formatMonthLabel } from "@/lib/date";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface BudgetFormProps {
  month: string;
  categories: Category[];
  totalLimit?: number;
  categoryLimits?: Record<string, number>;
  locale: string;
  submitLabel?: string;
  onSubmit: (values: { month: string; totalLimit: number; categoryLimits: Record<string, number> }) => void;
}

export function BudgetForm({
  month,
  categories,
  totalLimit,
  categoryLimits,
  locale,
  submitLabel = "Enregistrer le budget",
  onSubmit,
}: BudgetFormProps) {
  const expenseCategories = useMemo(
    () => categories.filter((category) => category.type === "expense"),
    [categories]
  );

  const [limits, setLimits] = useState<Record<string, number>>(() => categoryLimits ?? {});

  const form = useForm<BudgetFormValues>({
    resolver: zodResolver(budgetSchema),
    defaultValues: {
      month,
      totalLimit: totalLimit ?? 0,
    },
  });

  return (
    <form
      className="space-y-4"
      onSubmit={form.handleSubmit((values) =>
        onSubmit({
          month: values.month,
          totalLimit: values.totalLimit,
          categoryLimits: limits,
        })
      )}
    >
      <div className="space-y-2">
        <label className="text-sm font-medium">Mois</label>
        <Input value={formatMonthLabel(month, locale)} disabled />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Budget mensuel total</label>
        <Input
          type="number"
          min="0"
          step="10"
          {...form.register("totalLimit", { valueAsNumber: true })}
        />
        <p className="text-xs text-destructive">{form.formState.errors.totalLimit?.message}</p>
      </div>

      <div className="space-y-3">
        <h4 className="text-sm font-medium">Plafonds par categorie</h4>
        {expenseCategories.map((category) => (
          <div key={category.id} className="grid grid-cols-[1fr_auto] items-center gap-3">
            <span className="text-sm text-muted-foreground">{category.name}</span>
            <Input
              type="number"
              min="0"
              step="10"
              className="w-32"
              value={limits[category.id] ?? 0}
              onChange={(event) =>
                setLimits((current) => ({
                  ...current,
                  [category.id]: Number(event.target.value || 0),
                }))
              }
            />
          </div>
        ))}
      </div>

      <Button type="submit" className="w-full">
        {submitLabel}
      </Button>
    </form>
  );
}

