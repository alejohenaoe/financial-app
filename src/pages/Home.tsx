import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { createTransaction, getBalance, getRecentTransactions } from "@/services/transaction"
import { CATEGORIES, type Transaction } from "@/types"
import { useState, useEffect, useRef, useMemo } from "react"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { Check, ChevronRight, Loader2, Settings, ArrowRight, Tag } from "lucide-react"
import { Toast } from "@/components/Toast"
import { cn, formatAmount } from "@/lib/utils"
import { useNavigate } from "react-router-dom"
import { getCategoryIcon, getCategoryColor } from "@/lib/categories"

const schema = z.object({
  type: z.enum(["income", "expense"]),
  amount: z.string().min(1, "El monto es obligatorio"),
  category: z.string().optional(),
  description: z.string().optional(),
  transaction_date: z.string().min(1, "Date is required"),
}).refine(
  (data) => {
    if (data.type === "expense" && !data.category) return false
    return true
  },
  { message: "Seleccionar categoría", path: ["category"] }
).refine(
  (data) => {
    if (data.type === "income" && data.category) return false
    return true
  },
  { message: "No aplicar categoría a ingresos", path: ["category"] }
)

type FormData = z.infer<typeof schema>

export function Home() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [balance, setBalance] = useState({ income: 0, expense: 0, balance: 0 })
  const [recentTxs, setRecentTxs] = useState<Transaction[]>([])
  const [loadingSummary, setLoadingSummary] = useState(true)
  const [toast, setToast] = useState<string | null>(null)
  const [toastType, setToastType] = useState<"error" | "success">("error")
  const [balanceVisible, setBalanceVisible] = useState(false)
  const amountRef = useRef<HTMLInputElement>(null)

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    shouldFocusError: false,
    defaultValues: {
      type: "expense",
      amount: "",
      category: "",
      description: "",
      transaction_date: format(new Date(), "yyyy-MM-dd"),
    },
  })

  const transactionType = watch("type")

  useEffect(() => {
    loadSummary()
  }, [])

  useEffect(() => {
    function handleVisibilityChange() {
      if (document.hidden) setBalanceVisible(false)
    }
    document.addEventListener("visibilitychange", handleVisibilityChange)
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange)
  }, [])

  const recent = useMemo(() => recentTxs.slice(0, 3), [recentTxs])

  async function loadSummary() {
    setLoadingSummary(true)
    try {
      const [bal, txns] = await Promise.all([getBalance(), getRecentTransactions()])
      setBalance(bal)
      setRecentTxs(txns)
    } catch {
      setToast("Error al cargar el resumen")
      setToastType("error")
    } finally {
      setLoadingSummary(false)
    }
  }

  const { ref: amountRegisterRef } = register("amount")
  const amountValue = watch("amount")

  function handleAmountChange(e: React.ChangeEvent<HTMLInputElement>) {
    const digits = e.target.value.replace(/[^0-9.]/g, "").replace(/(\..*)\./g, "$1")
    setValue("amount", digits, { shouldValidate: true })
  }

  const parsedAmount = parseFloat(amountValue || "0")
  const canSave = parsedAmount > 0 && !loading

  async function onSubmit(data: FormData) {
    setLoading(true)
    try {
      const amountNum = parseFloat(data.amount.replace(/\./g, "").replace(/,/g, ""))
      await createTransaction({
        type: data.type,
        amount: amountNum,
        category: data.type === "expense" ? (data.category as typeof CATEGORIES[number]) : null,
        description: data.description || null,
        transaction_date: data.transaction_date,
      })
      reset({
        type: "expense",
        amount: "",
        category: "",
        description: "",
        transaction_date: format(new Date(), "yyyy-MM-dd"),
      })
      setSuccess(true)
      setTimeout(() => setSuccess(false), 1500)
      window.dispatchEvent(new CustomEvent("transaction-saved"))
      loadSummary()
    } catch {
      setToast("Error al guardar la transacción")
      setToastType("error")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex h-full flex-col">
      <header className="px-5 pt-[max(1.25rem,env(safe-area-inset-top))] pb-1">
        <div className="flex items-center justify-between">
          <button type="button" onClick={() => setBalanceVisible(v => !v)} className="text-left">
            <p className="text-[13px] font-medium text-muted-foreground">Saldo disponible</p>
            {loadingSummary ? (
              <div className="h-7 w-36 bg-muted rounded mt-1 animate-pulse" />
            ) : (
              <p className="mt-0.5 text-[22px] font-bold tracking-[-0.01em] text-foreground tabular-nums">
                {balanceVisible ? `$${formatAmount(Math.abs(balance.balance))}` : "******"}
              </p>
            )}
          </button>
          <button
            type="button"
            onClick={() => navigate("/settings")}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary text-muted-foreground transition-colors hover:text-foreground"
          >
            <Settings className="h-5 w-5" />
          </button>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto px-5">
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="mt-4 grid grid-cols-2 gap-1 rounded-2xl bg-secondary p-1">
            {(["expense", "income"] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => {
                  setValue("type", t)
                  amountRef.current?.focus()
                }}
                className={cn(
                  "rounded-xl py-2.5 text-[15px] font-semibold capitalize transition-all",
                  transactionType === t
                    ? t === "income"
                      ? "bg-card text-income shadow-sm"
                      : "bg-card text-expense shadow-sm"
                    : "text-muted-foreground",
                )}
              >
                {t === "expense" ? "Gasto" : "Ingreso"}
              </button>
            ))}
          </div>

          <div className="mt-8 flex flex-col items-center">
            <div className="flex items-center justify-center">
              <span
                className={cn(
                  "mr-1 text-4xl font-semibold",
                  transactionType === "income" ? "text-income" : "text-foreground/40",
                )}
              >
                $
              </span>
              <input
                ref={(e) => {
                  amountRegisterRef(e)
                  amountRef.current = e
                }}
                autoFocus
                inputMode="decimal"
                placeholder="0"
                value={amountValue}
                onChange={handleAmountChange}
                className={cn(
                  "w-[200px] bg-transparent text-center text-[56px] font-bold leading-none tracking-[-0.03em] outline-none placeholder:text-foreground/20 tabular-nums",
                  transactionType === "income" ? "text-income" : "text-foreground",
                )}
              />
            </div>
            <p className="mt-2 text-[13px] text-muted-foreground">
              {transactionType === "income" ? "Dinero que entra" : "Dinero que sale"}
            </p>
          </div>

          <div className="mt-8">
            <label className="mb-1.5 block px-1 text-[13px] font-medium text-muted-foreground">
              Descripción
            </label>
            <input
              placeholder={transactionType === "income" ? "Ej: Salario, reembolso" : "Ej: Café, supermercado"}
              autoComplete="off"
              className="w-full rounded-2xl border border-border/70 bg-card px-4 py-3.5 text-[16px] text-foreground outline-none transition-colors placeholder:text-muted-foreground/60 focus:border-primary"
              {...register("description")}
            />
          </div>

          {transactionType === "expense" && (
            <div className="mt-5">
              <div className="mb-2 flex items-center justify-between px-1">
                <label className="flex items-center gap-1.5 text-[13px] font-medium text-muted-foreground">
                  <Tag className="h-3.5 w-3.5" /> Categoría
                </label>
                <button
                  type="button"
                  onClick={() => navigate("/categories")}
                  className="text-[13px] font-medium text-primary"
                >
                  Administrar
                </button>
              </div>
              <div className="scrollbar-none -mx-5 flex gap-2.5 overflow-x-auto px-5 pb-1">
                {CATEGORIES.map((cat) => {
                  const Icon = getCategoryIcon(cat)
                  const color = getCategoryColor(cat)
                  const isSelected = watch("category") === cat
                  return (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setValue("category", isSelected ? "" : cat, { shouldValidate: true })}
                      className={cn(
                        "flex shrink-0 flex-col items-center gap-1.5 rounded-2xl border px-3 py-2.5 transition-all w-[88px] aspect-square",
                        isSelected
                          ? "border-primary bg-primary/5"
                          : "border-border/70 bg-card",
                      )}
                    >
                      <span
                        className="flex h-9 w-9 items-center justify-center rounded-full"
                        style={{
                          backgroundColor: `color-mix(in srgb, ${color} 16%, transparent)`,
                          color: color,
                        }}
                      >
                        <Icon className="h-4.5 w-4.5" strokeWidth={2.2} />
                      </span>
                      <span
                        className={cn(
                          "whitespace-nowrap overflow-hidden text-ellipsis max-w-full text-[12px] font-medium",
                          isSelected ? "text-foreground" : "text-muted-foreground",
                        )}
                      >
                        {cat}
                      </span>
                    </button>
                  )
                })}
              </div>
              {errors.category && <p className="text-xs text-expense mt-1 px-1">{errors.category.message}</p>}
            </div>
          )}

          <div className="mt-8">
            <div className="mb-2 flex items-center justify-between px-1">
              <h2 className="text-[15px] font-semibold text-foreground">Recientes</h2>
              <button
                type="button"
                onClick={() => navigate("/history")}
                className="flex items-center gap-0.5 text-[13px] font-medium text-primary"
              >
                Ver todos <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
            {loadingSummary ? (
              <div className="space-y-0 rounded-2xl border border-border/60 bg-card shadow-card overflow-hidden">
                {[1,2,3].map((i) => (
                  <div key={i} className="flex items-center gap-3 px-4 py-3 border-t border-border/60 first:border-t-0">
                    <div className="w-9 h-9 rounded-full bg-muted animate-pulse shrink-0" />
                    <div className="flex-1 space-y-1.5">
                      <div className="h-4 w-32 bg-muted rounded animate-pulse" />
                      <div className="h-3 w-20 bg-muted rounded animate-pulse" />
                    </div>
                    <div className="h-4 w-16 bg-muted rounded animate-pulse" />
                  </div>
                ))}
              </div>
            ) : recent.length === 0 ? (
              <div className="rounded-2xl border border-border/60 bg-card shadow-card px-4 py-8 text-center">
                <p className="text-sm text-muted-foreground">Sin movimientos</p>
              </div>
            ) : (
              <div className="overflow-hidden rounded-2xl border border-border/60 bg-card shadow-card">
                {recent.map((t, i) => {
                  const Icon = getCategoryIcon(t.type === "income" ? null : t.category)
                  const color = t.type === "income" ? "var(--income)" : getCategoryColor(t.category)
                  return (
                    <div
                      key={t.id}
                      className={cn(
                        "flex w-full items-center gap-3 px-4 py-3 text-left transition-colors",
                        i > 0 && "border-t border-border/60",
                      )}
                    >
                      <span
                        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full"
                        style={{
                          backgroundColor: t.type === "income"
                            ? "color-mix(in srgb, var(--income) 16%, transparent)"
                            : `color-mix(in srgb, ${getCategoryColor(t.category)} 16%, transparent)`,
                          color: color,
                        }}
                      >
                        <Icon className="h-4.5 w-4.5" strokeWidth={2.2} />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-[15px] font-medium text-foreground">
                          {t.description || t.type}
                        </span>
                        <span className="block text-[12px] text-muted-foreground">
                          {t.type === "income" ? "Ingreso" : t.category || "Gasto"}
                        </span>
                      </span>
                      <span className={cn("text-[15px] font-semibold tabular-nums", t.type === "income" ? "text-income" : "text-expense")}>
                        {t.type === "income" ? "+" : "-"}${formatAmount(Number(t.amount))}
                      </span>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          <div className="h-4" />
        </form>
      </div>

      <div className="sticky bottom-0 border-t border-border/60 bg-background/85 px-5 py-3 backdrop-blur-xl">
        <button
          type="button"
          disabled={!canSave}
          onClick={handleSubmit(onSubmit)}
          className={cn(
            "flex w-full items-center justify-center gap-2 rounded-2xl py-4 text-[17px] font-semibold text-primary-foreground transition-all",
            canSave ? "bg-primary active:scale-[0.98]" : "bg-primary/40",
          )}
        >
          {loading ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" /> Guardando…
            </>
          ) : success ? (
            <>
              <Check className="h-5 w-5" /> Guardado
            </>
          ) : (
            <>
              <Check className="h-5 w-5" /> Guardar {transactionType === "expense" ? "Gasto" : "Ingreso"}
            </>
          )}
        </button>
      </div>
      <Toast message={toast} type={toastType} onClose={() => setToast(null)} />
    </div>
  )
}