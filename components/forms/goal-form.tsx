"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { goalSchema, type GoalFormValues } from "@/lib/schemas";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface GoalFormProps {
  defaultValues?: Partial<GoalFormValues>;
  submitLabel?: string;
  onSubmit: (values: GoalFormValues) => void;
}

export function GoalForm({
  defaultValues,
  submitLabel = "Enregistrer",
  onSubmit,
}: GoalFormProps) {
  const form = useForm<GoalFormValues>({
    resolver: zodResolver(goalSchema),
    defaultValues: {
      name: defaultValues?.name ?? "",
      targetAmount: defaultValues?.targetAmount ?? 0,
      currentAmount: defaultValues?.currentAmount ?? 0,
      deadline: defaultValues?.deadline ?? "",
      color: defaultValues?.color ?? "#0ea36c",
    },
  });

  useEffect(() => {
    if (!defaultValues) {
      return;
    }
    form.reset({
      name: defaultValues.name ?? "",
      targetAmount: defaultValues.targetAmount ?? 0,
      currentAmount: defaultValues.currentAmount ?? 0,
      deadline: defaultValues.deadline ?? "",
      color: defaultValues.color ?? "#0ea36c",
    });
  }, [defaultValues, form]);

  return (
    <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
      <div className="space-y-2">
        <label className="text-sm font-medium">Nom de l’objectif</label>
        <Input placeholder="Ex. Fonds d’urgence" {...form.register("name")} />
        <p className="text-xs text-destructive">{form.formState.errors.name?.message}</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <label className="text-sm font-medium">Montant cible</label>
          <Input
            type="number"
            min="0"
            step="10"
            {...form.register("targetAmount", { valueAsNumber: true })}
          />
          <p className="text-xs text-destructive">{form.formState.errors.targetAmount?.message}</p>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Montant actuel</label>
          <Input
            type="number"
            min="0"
            step="10"
            {...form.register("currentAmount", { valueAsNumber: true })}
          />
          <p className="text-xs text-destructive">{form.formState.errors.currentAmount?.message}</p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <label className="text-sm font-medium">Date cible (optionnel)</label>
          <Input type="date" {...form.register("deadline")} />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Couleur</label>
          <Input type="color" className="h-9 p-1" {...form.register("color")} />
          <p className="text-xs text-destructive">{form.formState.errors.color?.message}</p>
        </div>
      </div>

      <Button type="submit" className="w-full">
        {submitLabel}
      </Button>
    </form>
  );
}
