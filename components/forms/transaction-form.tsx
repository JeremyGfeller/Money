"use client";

import { useEffect, useMemo } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { transactionSchema, type TransactionFormValues } from "@/lib/schemas";
import type { Category } from "@/lib/types";
import { PAYMENT_METHODS } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface TransactionFormProps {
  categories: Category[];
  defaultValues?: Partial<TransactionFormValues>;
  defaultType?: "income" | "expense";
  autoFocusAmount?: boolean;
  submitLabel?: string;
  onSubmit: (values: TransactionFormValues) => void;
}

export function TransactionForm({
  categories,
  defaultValues,
  defaultType = "expense",
  autoFocusAmount = false,
  submitLabel = "Enregistrer",
  onSubmit,
}: TransactionFormProps) {
  const form = useForm<TransactionFormValues>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      type: defaultValues?.type ?? defaultType,
      amount: defaultValues?.amount ?? 0,
      categoryId: defaultValues?.categoryId ?? "",
      date: defaultValues?.date ?? new Date().toISOString().slice(0, 10),
      note: defaultValues?.note ?? "",
      paymentMethod: defaultValues?.paymentMethod ?? "",
    },
  });

  const selectedType = useWatch({ control: form.control, name: "type" }) ?? "expense";

  const categoryOptions = useMemo(
    () => categories.filter((category) => category.type === selectedType),
    [categories, selectedType]
  );

  useEffect(() => {
    if (!defaultValues) {
      return;
    }
    form.reset({
      type: defaultValues.type ?? defaultType,
      amount: defaultValues.amount ?? 0,
      categoryId: defaultValues.categoryId ?? "",
      date: defaultValues.date ?? new Date().toISOString().slice(0, 10),
      note: defaultValues.note ?? "",
      paymentMethod: defaultValues.paymentMethod ?? "",
    });
  }, [defaultValues, defaultType, form]);

  useEffect(() => {
    const currentCategory = form.getValues("categoryId");
    const hasCategory = categoryOptions.some((category) => category.id === currentCategory);
    if (!hasCategory) {
      form.setValue("categoryId", categoryOptions[0]?.id ?? "", {
        shouldValidate: true,
      });
    }
  }, [categoryOptions, form]);

  return (
    <form
      className="space-y-4"
      onSubmit={form.handleSubmit((values) => {
        onSubmit(values);
        if (!defaultValues) {
          form.reset({
            type: defaultType,
            amount: 0,
            categoryId: categoryOptions[0]?.id ?? "",
            date: new Date().toISOString().slice(0, 10),
            note: "",
            paymentMethod: "",
          });
        }
      })}
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <label className="text-sm font-medium">Type</label>
          <Controller
            control={form.control}
            name="type"
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Choisir un type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="expense">Depense</SelectItem>
                  <SelectItem value="income">Revenu</SelectItem>
                </SelectContent>
              </Select>
            )}
          />
          <p className="text-xs text-destructive">{form.formState.errors.type?.message}</p>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Montant</label>
          <Input
            type="number"
            step="0.01"
            min="0"
            placeholder="0.00"
            autoFocus={autoFocusAmount}
            {...form.register("amount", { valueAsNumber: true })}
          />
          <p className="text-xs text-destructive">{form.formState.errors.amount?.message}</p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <label className="text-sm font-medium">Categorie</label>
          <Controller
            control={form.control}
            name="categoryId"
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Choisir une categorie" />
                </SelectTrigger>
                <SelectContent>
                  {categoryOptions.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          <p className="text-xs text-destructive">{form.formState.errors.categoryId?.message}</p>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Date</label>
          <Input type="date" aria-label="Date de transaction" {...form.register("date")} />
          <p className="text-xs text-destructive">{form.formState.errors.date?.message}</p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <label className="text-sm font-medium">Mode de paiement (optionnel)</label>
          <Controller
            control={form.control}
            name="paymentMethod"
            render={({ field }) => (
              <Select
                value={field.value || "none"}
                onValueChange={(value) => field.onChange(value === "none" ? "" : value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choisir" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Non precise</SelectItem>
                  {PAYMENT_METHODS.map((method) => (
                    <SelectItem key={method} value={method}>
                      {method}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          <p className="text-xs text-destructive">{form.formState.errors.paymentMethod?.message}</p>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Note (optionnel)</label>
          <Textarea rows={3} {...form.register("note")} />
          <p className="text-xs text-destructive">{form.formState.errors.note?.message}</p>
        </div>
      </div>

      <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
        {submitLabel}
      </Button>
    </form>
  );
}
