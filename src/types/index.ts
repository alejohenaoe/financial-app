export type TransactionType = "income" | "expense"

export const CATEGORIES = [
  "Comida",
  "Supermercado",
  "Transporte",
  "Salud",
  "Entretenimiento",
  "Compras",
  "Hogar",
  "Trabajo",
  "Otro",
] as const

export type Category = (typeof CATEGORIES)[number]

export interface Transaction {
  id: string
  user_id: string
  type: TransactionType
  amount: number
  category: Category | null
  description: string | null
  transaction_date: string
  created_at: string
  updated_at: string
}

export interface InsertTransaction {
  type: TransactionType
  amount: number
  category?: Category | null
  description?: string | null
  transaction_date: string
}
