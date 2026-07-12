import { useState } from "react"
import { getBalance, getExpensesByCategory, getMonthlyTotals } from "@/services/transaction"
import { useEffect } from "react"
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, CartesianGrid } from "recharts"
import { format, startOfMonth, endOfMonth } from "date-fns"
import { es } from "date-fns/locale"
import { Toast } from "@/components/Toast"
import { cn, formatAmount } from "@/lib/utils"
import { getCategoryColor } from "@/lib/categories"

export function Analytics() {
  const [balance, setBalance] = useState({ income: 0, expense: 0, balance: 0 })
  const [categoryData, setCategoryData] = useState<{ category: string; total: number; percentage: number }[]>([])
  const [monthlyData, setMonthlyData] = useState<{ month: string; income: number; expense: number }[]>([])
  const [toast, setToast] = useState<string | null>(null)

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    try {
      const now = new Date()
      const from = format(startOfMonth(now), "yyyy-MM-dd")
      const to = format(endOfMonth(now), "yyyy-MM-dd")

      const [bal, categories, monthly] = await Promise.all([
        getBalance(),
        getExpensesByCategory(from, to),
        getMonthlyTotals(3),
      ])
      setBalance(bal)
      setCategoryData(categories)
      setMonthlyData(monthly)
    } catch {
      setToast("Error al cargar estadísticas")
    }
  }

  const totalExpenses = categoryData.reduce((sum, d) => sum + d.total, 0)
  const netThisMonth = monthlyData.length > 0
    ? monthlyData[monthlyData.length - 1].income - monthlyData[monthlyData.length - 1].expense
    : 0

  return (
    <div className="space-y-4 pt-2 px-5">
      <div className="bg-card rounded-3xl shadow-sm border border-border p-5 text-center">
        <p className="text-xs font-medium text-muted-foreground tracking-wider uppercase">Balance total</p>
        <p className={cn("text-4xl font-light tracking-tight mt-1", balance.balance < 0 ? "text-expense" : "text-foreground")}>
          ${formatAmount(Math.abs(balance.balance))}
        </p>
        <p className={cn("text-sm mt-1 font-medium", netThisMonth >= 0 ? "text-income" : "text-expense")}>
          {netThisMonth >= 0 ? "+" : ""}${formatAmount(Math.abs(netThisMonth))} este mes
        </p>
      </div>

      <div className="flex gap-3">
        <div className="flex-1 bg-card rounded-3xl shadow-sm border border-border p-4">
          <p className="text-xs text-muted-foreground">Ingresos</p>
          <p className="text-lg font-semibold text-income mt-1">+${formatAmount(balance.income)}</p>
        </div>
        <div className="flex-1 bg-card rounded-3xl shadow-sm border border-border p-4">
          <p className="text-xs text-muted-foreground">Gastos</p>
          <p className="text-lg font-semibold text-expense mt-1">-${formatAmount(balance.expense)}</p>
        </div>
      </div>

      {monthlyData.length > 0 && (
        <div className="bg-card rounded-3xl shadow-sm border border-border p-5">
          <p className="text-xs font-medium text-muted-foreground tracking-wider uppercase mb-4">Ingresos vs Gastos</p>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--background)" />
                <XAxis dataKey="month" tick={{ fontSize: 12, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} />
                <YAxis hide />
                <Tooltip
                  formatter={(value: number, name: string) => [`$${formatAmount(value)}`, name === "income" ? "Ingresos" : "Gastos"]}
                  contentStyle={{ borderRadius: 12, border: "1px solid var(--border)", boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}
                />
                <Bar dataKey="income" name="income" fill="var(--income)" radius={[4, 4, 0, 0]} maxBarSize={24} />
                <Bar dataKey="expense" name="expense" fill="var(--expense)" radius={[4, 4, 0, 0]} maxBarSize={24} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {categoryData.length > 0 && (
        <div className="bg-card rounded-3xl shadow-sm border border-border p-5">
          <p className="text-xs font-medium text-muted-foreground tracking-wider uppercase mb-1">Gastado</p>
          <p className="text-2xl font-semibold tracking-tight text-foreground mb-4">${formatAmount(totalExpenses)}</p>
          <div className="space-y-3">
            {categoryData.map((d) => (
              <div key={d.category}>
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: getCategoryColor(d.category) }} />
                    <span className="text-sm text-foreground">{d.category}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-foreground">${formatAmount(d.total)}</span>
                    <span className="text-xs text-muted-foreground w-8 text-right">{d.percentage}%</span>
                  </div>
                </div>
                <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-300"
                    style={{ width: `${d.percentage}%`, backgroundColor: getCategoryColor(d.category) }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {monthlyData.length > 0 && (
        <div className="bg-card rounded-3xl shadow-sm border border-border p-5">
          <p className="text-xs font-medium text-muted-foreground tracking-wider uppercase mb-4">Tendencia de gastos</p>
          <div className="h-40">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--background)" />
                <XAxis dataKey="month" tick={{ fontSize: 12, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} />
                <YAxis hide />
                <Tooltip
                  formatter={(value: number) => [`$${formatAmount(value)}`, "Gastos"]}
                  contentStyle={{ borderRadius: 12, border: "1px solid var(--border)", boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}
                />
                <Line type="monotone" dataKey="expense" stroke="var(--expense)" strokeWidth={2} dot={{ fill: "var(--expense)", r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {categoryData.length === 0 && monthlyData.length === 0 && (
        <div className="bg-card rounded-2xl shadow-sm border border-border p-8">
          <p className="text-sm text-muted-foreground text-center">Sin datos en este período</p>
        </div>
      )}
      <Toast message={toast} type="error" onClose={() => setToast(null)} />
    </div>
  )
}