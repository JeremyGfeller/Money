import { z } from "zod";

export const transactionTypeSchema = z.enum(["income", "expense"]);

export const transactionSchema = z.object({
  type: transactionTypeSchema,
  amount: z.number().positive("Le montant doit être supérieur à 0."),
  categoryId: z.string().min(1, "La catégorie est obligatoire."),
  date: z
    .string()
    .min(1, "La date est obligatoire.")
    .refine((value) => !Number.isNaN(Date.parse(value)), "Date invalide."),
  note: z.string().trim().max(160, "Maximum 160 caractères.").optional(),
  paymentMethod: z
    .string()
    .trim()
    .max(40, "Maximum 40 caractères.")
    .optional(),
});

export const categorySchema = z.object({
  name: z.string().trim().min(2, "Nom trop court.").max(40, "Nom trop long."),
  type: transactionTypeSchema,
  color: z
    .string()
    .trim()
    .regex(/^#([0-9a-fA-F]{6})$/, "La couleur doit être au format hex (#RRGGBB).")
    .optional()
    .or(z.literal("")),
  icon: z.string().trim().max(40).optional(),
});

export const budgetSchema = z.object({
  month: z
    .string()
    .regex(/^\d{4}-\d{2}$/, "Le mois doit être au format AAAA-MM."),
  totalLimit: z.number().nonnegative("Le budget total doit être positif."),
});

export const categoryBudgetSchema = z.object({
  categoryId: z.string().min(1),
  limit: z.number().nonnegative("Le plafond doit être positif."),
});

export const goalSchema = z
  .object({
    name: z.string().trim().min(2, "Nom trop court.").max(80, "Nom trop long."),
    targetAmount: z.number().positive("La cible doit être supérieure à 0."),
    currentAmount: z.number().nonnegative("Le montant actuel doit être positif."),
    deadline: z.string().optional(),
    color: z
      .string()
      .trim()
      .regex(/^#([0-9a-fA-F]{6})$/, "La couleur doit être au format hex (#RRGGBB).")
      .optional()
      .or(z.literal("")),
  })
  .refine((values) => values.currentAmount <= values.targetAmount, {
    path: ["currentAmount"],
    message: "Le montant actuel ne peut pas dépasser la cible.",
  });

export type TransactionFormValues = z.infer<typeof transactionSchema>;
export type CategoryFormValues = z.infer<typeof categorySchema>;
export type BudgetFormValues = z.infer<typeof budgetSchema>;
export type CategoryBudgetFormValues = z.infer<typeof categoryBudgetSchema>;
export type GoalFormValues = z.infer<typeof goalSchema>;
