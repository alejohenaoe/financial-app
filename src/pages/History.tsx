import { useState, useCallback, useEffect, useRef } from "react"
import { getTransactions, deleteTransaction } from "@/services/transaction"
import type { Transaction } from "@/types"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { ArrowDownRight, ArrowUpRight, Search, Trash2, Pencil, TriangleAlert } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useInfiniteScroll } from "@/hooks/useInfiniteScroll"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { EditTransactionForm } from "@/components/EditTransactionForm"
import { cn, formatAmount } from "@/lib/utils"

export function History() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState("")
  const [typeFilter, setTypeFilter] = useState("all")
  const [editTxn, setEditTxn] = useState<Transaction | null>(null)
  const [editOpen, setEditOpen] = useState(false)
  const [deleteConfirmTxn, setDeleteConfirmTxn] = useState<Transaction | null>(null)

  const filterLabels: Record<string, string> = { all: "Todos", income: "Ingreso", expense: "Gasto" }

  const pageRef = useRef(0)
  const loadingRef = useRef(false)
  const hasMoreRef = useRef(true)

  const loadMore = useCallback(async () => {
    if (loadingRef.current || !hasMoreRef.current) return
    loadingRef.current = true
    setLoading(true)
    const currentPage = pageRef.current
    try {
      const result = await getTransactions({
        pageParam: currentPage,
        search,
        type: typeFilter,
      })
      if (currentPage === 0) {
        setTransactions(result.data)
      } else {
        setTransactions((prev) => [...prev, ...result.data])
      }
      hasMoreRef.current = result.nextPage !== null
      pageRef.current = currentPage + 1
    } catch {
      // silent
    } finally {
      loadingRef.current = false
      setLoading(false)
    }
  }, [search, typeFilter])

  useEffect(() => {
    pageRef.current = 0
    loadingRef.current = false
    hasMoreRef.current = true
    setTransactions([])
    loadMore()
  }, [loadMore])

  const sentinelRef = useInfiniteScroll(loadMore, hasMoreRef.current && !loading)

  async function handleDelete(id: string) {
    await deleteTransaction(id)
    setTransactions((prev) => prev.filter((t) => t.id !== id))
  }

  function handleEdit(txn: Transaction) {
    setEditTxn(txn)
    setEditOpen(true)
  }

  function handleEditSuccess(updated: Transaction) {
    setTransactions((prev) => prev.map((t) => (t.id === updated.id ? updated : t)))
    setEditOpen(false)
    setEditTxn(null)
  }

  return (
    <div className="space-y-4">
      <div className="bg-card rounded-2xl shadow-sm border border-border/50 px-4 py-3 flex items-center gap-2">
        <Search className="h-4 w-4 text-muted-foreground shrink-0" />
        <input
          placeholder="Buscar movimientos..."
          className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="bg-muted/50 rounded-xl p-1 flex">
        {["all", "income", "expense"].map((type) => (
          <button
            key={type}
            className={cn(
              "flex-1 py-2 text-sm font-medium rounded-[10px] transition-all duration-150",
              typeFilter === type
                ? "bg-white text-foreground shadow-sm"
                : "text-muted-foreground"
            )}
            onClick={() => setTypeFilter(type)}
          >
            {filterLabels[type]}
          </button>
        ))}
      </div>

      {transactions.length === 0 && !loading ? (
        <p className="text-sm text-muted-foreground text-center py-8">Sin movimientos</p>
      ) : (
        <div className="space-y-2">
          {transactions.map((t) => (
            <div
              key={t.id}
              className="bg-card rounded-2xl shadow-sm border border-border/50 px-4 py-3"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div className={cn(
                    "shrink-0 w-9 h-9 rounded-full flex items-center justify-center",
                    t.type === "income" ? "bg-income/10" : "bg-expense/10"
                  )}>
                    {t.type === "income" ? (
                      <ArrowUpRight className="h-4 w-4 text-income" />
                    ) : (
                      <ArrowDownRight className="h-4 w-4 text-expense" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium truncate">{t.description || t.category || t.type}</p>
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(t.transaction_date), "d MMM, yyyy", { locale: es })}
                      {t.category && <span className="ml-1.5">· {t.category}</span>}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <p className={cn(
                    "text-sm font-semibold mr-1",
                    t.type === "income" ? "text-income" : "text-expense"
                  )}>
                    {t.type === "income" ? "+" : "-"}${formatAmount(Number(t.amount))}
                  </p>
                  <button
                    onClick={() => handleEdit(t)}
                    className="p-1.5 rounded-full hover:bg-muted transition-colors"
                  >
                    <Pencil className="h-3.5 w-3.5 text-muted-foreground" />
                  </button>
                  <button
                    onClick={() => setDeleteConfirmTxn(t)}
                    className="p-1.5 rounded-full hover:bg-muted transition-colors"
                  >
                    <Trash2 className="h-3.5 w-3.5 text-expense" />
                  </button>
                </div>
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
              className="flex-1 h-11 rounded-xl text-sm font-medium bg-muted text-foreground hover:opacity-80 transition-opacity"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={() => {
                if (deleteConfirmTxn) handleDelete(deleteConfirmTxn.id)
                setDeleteConfirmTxn(null)
              }}
              className="flex-1 h-11 rounded-xl text-sm font-medium bg-expense text-white hover:opacity-90 transition-opacity"
            >
              Eliminar
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
