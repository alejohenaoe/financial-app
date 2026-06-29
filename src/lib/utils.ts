import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatAmount(n: number) {
  return Math.round(n).toLocaleString("es-ES")
}

export function formatAmountInput(value: string) {
  const digits = value.replace(/\D/g, "")
  if (!digits) return ""
  return Number(digits).toLocaleString("es-ES")
}

export function parseAmount(value: string) {
  return Number(value.replace(/\./g, ""))
}
