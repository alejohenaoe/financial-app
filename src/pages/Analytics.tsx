import { useState } from "react"
import { getExpensesByCategory } from "@/services/transaction"
import { useEffect } from "react"
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts"
import { startOfMonth, endOfMonth, startOfYear, endOfYear, format, subMonths } from "date-fns"
import { cn, formatAmount } from "@/lib/utils"

type Period = "current-month" | "prev-month" | "current-year"

function getDateRange(period: Period): { from: string; to: string } {
  const now = new Date()
  switch (period) {
    case "current-month":
      return { from: format(startOfMonth(now), "yyyy-MM-dd"), to: format(endOfMonth(now), "yyyy-MM-dd") }
    case "prev-month": {
      const prev = subMonths(now, 1)
      return { from: format(startOfMonth(prev), "yyyy-MM-dd"), to: format(endOfMonth(prev), "yyyy-MM-dd") }
    }
    case "current-year":
      return { from: format(startOfYear(now), "yyyy-MM-dd"), to: format(endOfYear(now), "yyyy-MM-dd") }
  }
}

const CHART_COLORS = [
  "#007AFF", "#FF9500", "#34C759", "#FF3B30", "#AF52DE",
  "#5856D6", "#FF2D55", "#00C7BE", "#FF6482", "#5AC8FA",
]

export function Analytics() {
  const [period, setPeriod] = useState<Period>("current-month")
  const [data, setData] = useState<{ category: string; total: number; percentage: number }[]>([])

  useEffect(() => {
    loadData()
  }, [period])

  async function loadData() {
    const range = getDateRange(period)
    const result = await getExpensesByCategory(range.from, range.to)
    setData(result)
  }

  const totalExpenses = data.reduce((sum, d) => sum + d.total, 0)

  const periods = [
    { value: "current-month" as const, label: "Mes" },
    { value: "prev-month" as const, label: "Mes Ant." },
    { value: "current-year" as const, label: "Año" },
  ]

  return (
    <div className="space-y-5">
      <div className="bg-muted/50 rounded-xl p-1 flex">
        {periods.map((p) => (
          <button
            key={p.value}
            className={cn(
              "flex-1 py-2 text-sm font-medium rounded-[10px] transition-all duration-150",
              period === p.value
                ? "bg-white text-foreground shadow-sm"
                : "text-muted-foreground"
            )}
            onClick={() => setPeriod(p.value)}
          >
            {p.label}
          </button>
        ))}
      </div>

      {data.length === 0 ? (
        <div className="bg-card rounded-2xl shadow-sm border border-border/50 p-8">
          <p className="text-sm text-muted-foreground text-center">Sin gastos en este período</p>
        </div>
      ) : (
        <>
          <div className="bg-card rounded-2xl shadow-sm border border-border/50 p-5">
            <p className="text-xs font-medium text-muted-foreground tracking-widest uppercase mb-1">Total Gastado</p>
            <p className="text-3xl font-semibold tracking-tight">${formatAmount(totalExpenses)}</p>
            <div className="h-48 mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data}>
                  <XAxis dataKey="category" tick={{ fontSize: 11, fill: "#8E8E93" }} axisLine={false} tickLine={false} />
                  <YAxis hide />
                  <Tooltip
                    formatter={(value: number) => [`$${formatAmount(value)}`, "Monto"]}
                    contentStyle={{ borderRadius: 12, border: "1px solid #E5E5EA", boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}
                  />
                  <Bar dataKey="total" radius={[6, 6, 0, 0]} maxBarSize={32}>
                    {data.map((_, i) => (
                      <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-card rounded-2xl shadow-sm border border-border/50 p-5">
            <p className="text-xs font-medium text-muted-foreground tracking-widest uppercase mb-4">Desglose</p>
            <div className="space-y-3">
              {data.map((d, i) => (
                <div key={d.category}>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: CHART_COLORS[i % CHART_COLORS.length] }} />
                      <span className="text-sm">{d.category}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium">${formatAmount(d.total)}</span>
                      <span className="text-xs text-muted-foreground w-8 text-right">{d.percentage}%</span>
                    </div>
                  </div>
                  <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-300"
                      style={{ width: `${d.percentage}%`, backgroundColor: CHART_COLORS[i % CHART_COLORS.length] }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
