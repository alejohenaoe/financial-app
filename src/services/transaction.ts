import { supabase } from "@/lib/supabase"
import type { Transaction, InsertTransaction } from "@/types"

export async function getTransactions({
  pageParam = 0,
  search,
  type,
  dateFrom,
  dateTo,
}: {
  pageParam?: number
  search?: string
  type?: string
  dateFrom?: string
  dateTo?: string
}): Promise<{ data: Transaction[]; nextPage: number | null }> {
  const limit = 10
  const from = pageParam * limit
  const to = from + limit - 1

  let query = supabase
    .from("transactions")
    .select("*", { count: "exact" })
    .order("transaction_date", { ascending: false })
    .order("created_at", { ascending: false })
    .range(from, to)

  if (search) {
    query = query.ilike("description", `%${search}%`)
  }

  if (type && type !== "all") {
    query = query.eq("type", type)
  }

  if (dateFrom) {
    query = query.gte("transaction_date", dateFrom)
  }

  if (dateTo) {
    query = query.lte("transaction_date", dateTo)
  }

  const { data, error, count } = await query

  if (error) throw error

  const nextPage = count !== null && to < count ? pageParam + 1 : null

  return { data: data as Transaction[], nextPage }
}

export async function getRecentTransactions(limit = 5): Promise<Transaction[]> {
  const { data, error } = await supabase
    .from("transactions")
    .select("*")
    .order("transaction_date", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(limit)

  if (error) throw error
  return data as Transaction[]
}

export async function getBalance(): Promise<{ income: number; expense: number; balance: number }> {
  const { data, error } = await supabase.from("transactions").select("type, amount")

  if (error) throw error

  const income = data.filter((t) => t.type === "income").reduce((sum, t) => sum + Number(t.amount), 0)
  const expense = data.filter((t) => t.type === "expense").reduce((sum, t) => sum + Number(t.amount), 0)

  return { income, expense, balance: income - expense }
}

export async function createTransaction(transaction: InsertTransaction): Promise<Transaction> {
  if (transaction.type === "expense" && !transaction.category) {
    throw new Error("Category is required for expenses")
  }
  const { data, error } = await supabase
    .from("transactions")
    .insert({
      type: transaction.type,
      amount: transaction.amount,
      category: transaction.type === "expense" ? transaction.category : null,
      description: transaction.description || null,
      transaction_date: transaction.transaction_date,
    })
    .select()
    .single()

  if (error) throw error
  return data as Transaction
}

export async function updateTransaction(
  id: string,
  transaction: Partial<InsertTransaction>
): Promise<Transaction> {
  const updates: Record<string, unknown> = {}
  if (transaction.type !== undefined) updates.type = transaction.type
  if (transaction.amount !== undefined) updates.amount = transaction.amount
  if (transaction.description !== undefined) updates.description = transaction.description
  if (transaction.transaction_date !== undefined) updates.transaction_date = transaction.transaction_date
  if (transaction.type === "expense" && transaction.category !== undefined) {
    updates.category = transaction.category
  } else if (transaction.type === "income") {
    updates.category = null
  }

  const { data, error } = await supabase
    .from("transactions")
    .update(updates)
    .eq("id", id)
    .select()
    .single()

  if (error) throw error
  return data as Transaction
}

export async function deleteTransaction(id: string): Promise<void> {
  const { error } = await supabase.from("transactions").delete().eq("id", id)
  if (error) throw error
}

export async function getExpensesByCategory(
  dateFrom: string,
  dateTo: string
): Promise<{ category: string; total: number; percentage: number }[]> {
  const { data, error } = await supabase
    .from("transactions")
    .select("category, amount")
    .eq("type", "expense")
    .gte("transaction_date", dateFrom)
    .lte("transaction_date", dateTo)

  if (error) throw error

  const total = data.reduce((sum, t) => sum + Number(t.amount), 0)
  const grouped: Record<string, number> = {}

  for (const t of data) {
    const cat = t.category || "Other"
    grouped[cat] = (grouped[cat] || 0) + Number(t.amount)
  }

  return Object.entries(grouped)
    .map(([category, totalAmount]) => ({
      category,
      total: totalAmount,
      percentage: total > 0 ? Math.round((totalAmount / total) * 100) : 0,
    }))
    .sort((a, b) => b.total - a.total)
}
