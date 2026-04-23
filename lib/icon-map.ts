import type { LucideIcon } from "lucide-react";
import {
  Briefcase,
  Car,
  Coffee,
  HeartPulse,
  House,
  PiggyBank,
  ShoppingBasket,
  Wallet,
} from "lucide-react";

const iconMap: Record<string, LucideIcon> = {
  Wallet,
  Briefcase,
  House,
  ShoppingBasket,
  Car,
  Coffee,
  HeartPulse,
  PiggyBank,
};

export function getCategoryIcon(iconName?: string): LucideIcon {
  if (!iconName) {
    return Wallet;
  }
  return iconMap[iconName] ?? Wallet;
}

export const categoryIconOptions = Object.keys(iconMap);
