import { useState, useCallback, useEffect, useRef } from "react"
import { getTransactions, deleteTransaction, getBalance } from "@/services/transaction"
import { CATEGORIES, type Transaction } from "@/types"
import { format, isToday, isYesterday, parseISO, startOfMonth, endOfMonth } from "date-fns"
import { es } from "date-fns/locale"
import { ArrowUpRight, Trash2, Pencil, TriangleAlert } from "lucide-react"
import { getCategoryIcon, getCategoryColor } from "@/lib/categories"
import { useInfiniteScroll } from "@/hooks/useInfiniteScroll"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { EditTransactionForm } from "@/components/EditTransactionForm"
import { Toast } from "@/components/Toast"
import { cn, formatAmount } from "@/lib/utils"

function getMonthRange(monthOffset: number) {
  const now = new Date()
  const date = new Date(now.getFullYear(), now.getMonth() + monthOffset, 1)
  return {
    from: format(startOfMonth(date), "yyyy-MM-dd"),
    to: format(endOfMonth(date), "yyyy-MM-dd"),
    label: format(date, "MMMM yyyy", { locale: es }),
  }
}

const MONTH_OPTIONS = [
  { value: "all", label: "Todos los meses" },
  { value: "0", ...getMonthRange(0) },
  { value: "-1", ...getMonthRange(-1) },
  { value: "-2", ...getMonthRange(-2) },
  { value: "-3", ...getMonthRange(-3) },
  { value: "-4", ...getMonthRange(-4) },
  { value: "-5", ...getMonthRange(-5) },
]

function formatDateGroup(dateStr: string) {
  const d = parseISO(dateStr)
  if (isToday(d)) return "Hoy"
  if (isYesterday(d)) return "Ayer"
  return format(d, "EEEE, d 'de' MMMM", { locale: es })
}

function formatTransactionDate(dateStr: string) {
  const d = parseISO(dateStr)
  if (isToday(d)) return "Hoy"
  if (isYesterday(d)) return "Ayer"
  return format(d, "d MMM", { locale: es })
}

export function History() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(false)
  const [monthFilter, setMonthFilter] = useState("all")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [totals, setTotals] = useState({ income: 0, expense: 0 })
  const [editTxn, setEditTxn] = useState<Transaction | null>(null)
  const [editOpen, setEditOpen] = useState(false)
  const [deleteConfirmTxn, setDeleteConfirmTxn] = useState<Transaction | null>(null)
  const [toast, setToast] = useState<string | null>(null)
  const [toastType, setToastType] = useState<"error" | "success">("error")

  const pageRef = useRef(0)
  const loadingRef = useRef(false)
  const hasMoreRef = useRef(true)

  useEffect(() => {
    if (monthFilter !== "all") {
      const month = MONTH_OPTIONS.find(m => m.value === monthFilter)
      if (month && "from" in month) {
        loadTotals(month.from, month.to)
        return
      }
    }
    loadTotals()
  }, [monthFilter])

  async function loadTotals(from?: string, to?: string) {
    try {
      const bal = await getBalance()
      if (from && to) {
        const all = await getTransactions({ pageParam: 0, dateFrom: from, dateTo: to })
        const allTxns = all.data
        let income = 0, expense = 0
        for (const t of allTxns) {
          if (t.type === "income") income += Number(t.amount)
          else expense += Number(t.amount)
        }
        setTotals({ income, expense })
      } else {
        setTotals({ income: bal.income, expense: bal.expense })
      }
    } catch {
      setTotals({ income: 0, expense: 0 })
    }
  }

  const loadMore = useCallback(async () => {
    if (loadingRef.current || !hasMoreRef.current) return
    loadingRef.current = true
    setLoading(true)
    const currentPage = pageRef.current
    try {
      let dateFrom: string | undefined
      let dateTo: string | undefined
      if (monthFilter !== "all") {
        const month = MONTH_OPTIONS.find(m => m.value === monthFilter)
        if (month && "from" in month) {
          dateFrom = month.from
          dateTo = month.to
        }
      }
      const result = await getTransactions({
        pageParam: currentPage,
        category: categoryFilter !== "all" ? categoryFilter : undefined,
        dateFrom,
        dateTo,
      })
      if (currentPage === 0) {
        setTransactions(result.data)
      } else {
        setTransactions((prev) => [...prev, ...result.data])
      }
      hasMoreRef.current = result.nextPage !== null
      pageRef.current = currentPage + 1
    } catch {
      setToast("Error al cargar movimientos")
      setToastType("error")
    } finally {
      loadingRef.current = false
      setLoading(false)
    }
  }, [monthFilter, categoryFilter])

  useEffect(() => {
    pageRef.current = 0
    loadingRef.current = false
    hasMoreRef.current = true
    setTransactions([])
    loadMore()
  }, [loadMore])

  const sentinelRef = useInfiniteScroll(loadMore, hasMoreRef.current && !loading)

  async function handleDelete(id: string) {
    try {
      await deleteTransaction(id)
      setTransactions((prev) => prev.filter((t) => t.id !== id))
    } catch {
      setToast("Error al eliminar el movimiento")
      setToastType("error")
    }
  }

  function handleEdit(txn: Transaction) {
    setEditTxn(txn)
    setEditOpen(true)
  }

  function handleEditSuccess() {
    setEditOpen(false)
    setEditTxn(null)
    pageRef.current = 0
    hasMoreRef.current = true
    loadingRef.current = false
    loadMore()
  }

  const grouped = transactions.reduce<Record<string, Transaction[]>>((acc, t) => {
    const key = formatDateGroup(t.transaction_date)
    if (!acc[key]) acc[key] = []
    acc[key].push(t)
    return acc
  }, {})

  return (
    <div className="space-y-4 pt-2">
      <div className="flex gap-2">
        <div className="flex-1 bg-card rounded-2xl shadow-sm border border-border px-4 py-3">
          <select
            value={monthFilter}
            onChange={(e) => setMonthFilter(e.target.value)}
            className="w-full bg-transparent text-sm font-medium text-foreground outline-none"
          >
            {MONTH_OPTIONS.map((m) => (
              <option key={m.value} value={m.value}>
                {m.label.charAt(0).toUpperCase() + m.label.slice(1)}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="bg-card rounded-2xl shadow-sm border border-border px-5 py-3 flex items-center gap-6">
        <div>
          <p className="text-xs text-muted-foreground">Ingresos</p>
          <p className="text-sm font-semibold text-income">+${formatAmount(totals.income)}</p>
        </div>
        <div className="w-px h-8 bg-border" />
        <div>
          <p className="text-xs text-muted-foreground">Gastos</p>
          <p className="text-sm font-semibold text-expense">-${formatAmount(totals.expense)}</p>
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none -mx-4 px-4">
        <button
          onClick={() => setCategoryFilter("all")}
          className={cn(
            "shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all duration-150 border",
            categoryFilter === "all"
              ? "bg-primary text-primary-foreground border-primary"
              : "bg-card text-foreground border-border"
          )}
        >
          Todos
        </button>
        {CATEGORIES.map((cat) => {
          const Icon = getCategoryIcon(cat)
          const isActive = categoryFilter === cat
          return (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={cn(
                "shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-all duration-150 border",
                isActive
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-card text-foreground border-border hover:border-primary/30"
              )}
            >
              <Icon className={cn("h-4 w-4", isActive ? "text-primary-foreground" : "")} style={!isActive ? { color: getCategoryColor(cat) } : undefined} />
              {cat}
            </button>
          )
        })}
      </div>

      {transactions.length === 0 && !loading ? (
        <p className="text-sm text-muted-foreground text-center py-8">Sin movimientos</p>
      ) : (
        <div className="space-y-4">
          {Object.entries(grouped).map(([dateLabel, txns]) => (
            <div key={dateLabel}>
              <p className="text-xs font-medium text-muted-foreground tracking-wide uppercase mb-2 px-1">
                {dateLabel}
              </p>
              <div className="space-y-1">
                {txns.map((t) => {
                  const Icon = t.type === "income" ? ArrowUpRight : getCategoryIcon(t.category)
                  const iconColor = t.type === "income" ? "var(--income)" : getCategoryColor(t.category)
                  const bgClass = t.type === "income" ? "bg-income/10" : "bg-secondary"
                  return (
                    <div
                      key={t.id}
                      className="bg-card rounded-2xl shadow-sm border border-border px-4 py-3"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          <div className={cn("shrink-0 w-9 h-9 rounded-full flex items-center justify-center", bgClass)}>
                            <Icon className="h-4 w-4" style={{ color: iconColor }} />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium truncate text-foreground">{t.description || t.type}</p>
                            <p className="text-xs text-muted-foreground">
                              {t.category && <span>{t.category}</span>}
                              {t.category && <span className="mx-1">·</span>}
                              <span>{formatTransactionDate(t.transaction_date)}</span>
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          <p className={cn("text-sm font-semibold mr-1", t.type === "income" ? "text-income" : "text-expense")}>
                            {t.type === "income" ? "+" : "-"}${formatAmount(Number(t.amount))}
                          </p>
                          <button
                            onClick={() => handleEdit(t)}
                            className="p-1.5 rounded-full hover:bg-secondary transition-colors"
                          >
                            <Pencil className="h-3.5 w-3.5 text-muted-foreground" />
                          </button>
                          <button
                            onClick={() => setDeleteConfirmTxn(t)}
                            className="p-1.5 rounded-full hover:bg-secondary transition-colors"
                          >
                            <Trash2 className="h-3.5 w-3.5 text-expense" />
                          </button>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {hasMoreRef.current && <div ref={sentinelRef} className="h-4" />}
      {loading && (
        <div className="flex justify-center py-4">
          <div className="w-5 h-5 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
        </div>
      )}
      {!hasMoreRef.current && transactions.length > 0 && (
        <p className="text-center text-xs text-muted-foreground pb-2">Todos los movimientos cargados</p>
      )}

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Movimiento</DialogTitle>
          </DialogHeader>
          {editTxn && (
            <EditTransactionForm transaction={editTxn} onSuccess={handleEditSuccess} />
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={!!deleteConfirmTxn} onOpenChange={(open) => { if (!open) setDeleteConfirmTxn(null) }}>
        <DialogContent className="max-w-xs text-center">
          <div className="flex flex-col items-center gap-3 py-2">
            <div className="w-12 h-12 rounded-full bg-expense/10 flex items-center justify-center">
              <TriangleAlert className="h-6 w-6 text-expense" />
            </div>
            <p className="text-base font-semibold">¿Eliminar movimiento?</p>
            <p className="text-sm text-muted-foreground">
              {deleteConfirmTxn?.description || deleteConfirmTxn?.category || (deleteConfirmTxn?.type === "income" ? "Ingreso" : "Gasto")}
            </p>
            <p className="text-xs text-muted-foreground">Esta acción no se puede deshacer.</p>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setDeleteConfirmTxn(null)}
              className="flex-1 h-11 rounded-xl text-sm font-medium bg-secondary text-foreground hover:opacity-80 transition-opacity"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={() => {
                if (deleteConfirmTxn) handleDelete(deleteConfirmTxn.id)
                setDeleteConfirmTxn(null)
              }}
              className="flex-1 h-11 rounded-xl text-sm font-medium bg-expense text-primary-foreground hover:opacity-90 transition-opacity"
            >
              Eliminar
            </button>
          </div>
        </DialogContent>
      </Dialog>
      <Toast message={toast} type={toastType} onClose={() => setToast(null)} />
    </div>
  )
}