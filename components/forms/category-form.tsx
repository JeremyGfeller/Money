"use client";

import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { categorySchema, type CategoryFormValues } from "@/lib/schemas";
import { categoryIconOptions } from "@/lib/icon-map";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface CategoryFormProps {
  defaultValues?: Partial<CategoryFormValues>;
  submitLabel?: string;
  onSubmit: (values: CategoryFormValues) => void;
}

export function CategoryForm({
  defaultValues,
  submitLabel = "Enregistrer",
  onSubmit,
}: CategoryFormProps) {
  const form = useForm<CategoryFormValues>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: defaultValues?.name ?? "",
      type: defaultValues?.type ?? "expense",
      color: defaultValues?.color ?? "#0ea36c",
      icon: defaultValues?.icon ?? "Wallet",
    },
  });

  useEffect(() => {
    if (!defaultValues) {
      return;
    }
    form.reset({
      name: defaultValues.name ?? "",
      type: defaultValues.type ?? "expense",
      color: defaultValues.color ?? "#0ea36c",
      icon: defaultValues.icon ?? "Wallet",
    });
  }, [defaultValues, form]);

  return (
    <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
      <div className="space-y-2">
        <label className="text-sm font-medium">Nom</label>
        <Input placeholder="Ex. Restaurant" {...form.register("name")} />
        <p className="text-xs text-destructive">{form.formState.errors.name?.message}</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <label className="text-sm font-medium">Type</label>
          <Controller
            control={form.control}
            name="type"
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="expense">Dépense</SelectItem>
                  <SelectItem value="income">Revenu</SelectItem>
                </SelectContent>
              </Select>
            )}
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Couleur</label>
          <Input type="color" className="h-9 p-1" {...form.register("color")} />
          <p className="text-xs text-destructive">{form.formState.errors.color?.message}</p>
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Icône</label>
        <Controller
          control={form.control}
          name="icon"
          render={({ field }) => (
            <Select value={field.value || "Wallet"} onValueChange={field.onChange}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {categoryIconOptions.map((iconName) => (
                  <SelectItem key={iconName} value={iconName}>
                    {iconName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
      </div>

      <Button type="submit" className="w-full">
        {submitLabel}
      </Button>
    </form>
  );
}
