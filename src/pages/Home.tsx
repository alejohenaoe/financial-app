import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { createTransaction, getBalance, getRecentTransactions } from "@/services/transaction"
import { CATEGORIES, type Transaction } from "@/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useState, useEffect, useRef } from "react"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { ArrowDownRight, ArrowUpRight, Check } from "lucide-react"
import { formatAmount, formatAmountInput, parseAmount } from "@/lib/utils"

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
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [balance, setBalance] = useState({ income: 0, expense: 0, balance: 0 })
  const [recent, setRecent] = useState<Transaction[]>([])
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

  async function loadSummary() {
    const [bal, txns] = await Promise.all([getBalance(), getRecentTransactions()])
    setBalance(bal)
    setRecent(txns)
  }

  const { ref: amountRegisterRef } = register("amount")
  const amountValue = watch("amount")

  function handleAmountChange(e: React.ChangeEvent<HTMLInputElement>) {
    const formatted = formatAmountInput(e.target.value)
    setValue("amount", formatted, { shouldValidate: true })
  }

  async function onSubmit(data: FormData) {
    setLoading(true)
    try {
      await createTransaction({
        type: data.type,
        amount: parseAmount(data.amount),
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
      amountRef.current?.focus()
      window.dispatchEvent(new CustomEvent("transaction-saved"))
      loadSummary()
    } catch {
      // silent
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-5">
      <div className="bg-card rounded-2xl shadow-sm border border-border/50 p-5 text-center">
        <p className="text-xs font-medium text-muted-foreground tracking-widest uppercase">Saldo</p>
        <p className={`mt-1 flex items-center justify-center ${balance.balance < 0 ? "text-expense" : ""}`}>
          {balance.balance < 0 && <span className="text-5xl font-light tracking-tight text-expense mr-0.5">−</span>}
          <span className="text-2xl font-light text-muted-foreground align-top mr-1">$</span>
          <span className="text-5xl font-light tracking-tight">{formatAmount(Math.abs(balance.balance))}</span>
        </p>
        <div className="flex justify-center gap-5 mt-3">
          <div className="flex items-center gap-1.5 text-sm">
            <div className="w-2 h-2 rounded-full bg-income" />
            <span className="text-muted-foreground">${formatAmount(balance.income)}</span>
          </div>
          <div className="flex items-center gap-1.5 text-sm">
            <div className="w-2 h-2 rounded-full bg-expense" />
            <span className="text-muted-foreground">${formatAmount(balance.expense)}</span>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="bg-muted/50 rounded-xl p-1 flex">
          <button
            type="button"
            className={`flex-1 py-2 text-sm font-medium rounded-[10px] transition-all duration-150 ${
              transactionType === "expense"
                ? "bg-expense text-white shadow-sm"
                : "text-muted-foreground"
            }`}
            onClick={() => setValue("type", "expense")}
          >
            Gasto
          </button>
          <button
            type="button"
            className={`flex-1 py-2 text-sm font-medium rounded-[10px] transition-all duration-150 ${
              transactionType === "income"
                ? "bg-income text-white shadow-sm"
                : "text-muted-foreground"
            }`}
            onClick={() => setValue("type", "income")}
          >
            Ingreso
          </button>
        </div>

        <div className="bg-card rounded-2xl shadow-sm border border-border/50 px-5 py-4">
          <div className="flex items-center">
            <span className="text-3xl font-semibold text-muted-foreground mr-2">$</span>
            <input
              id="amount"
              type="text"
              inputMode="numeric"
              placeholder="0"
              autoFocus
              name="amount"
              value={amountValue || ""}
              onChange={handleAmountChange}
              className="flex-1 bg-transparent text-4xl font-semibold tracking-tight outline-none placeholder:text-muted-foreground/40"
              ref={(e) => {
                amountRegisterRef(e)
                ;(amountRef as React.MutableRefObject<HTMLInputElement | null>).current = e
              }}
            />
          </div>
          {errors.amount && <p className="text-xs text-expense mt-2">{errors.amount.message}</p>}
        </div>

        <div className="flex gap-3">
          {transactionType === "expense" ? (
            <div className="flex-1">
              <Select
                onValueChange={(v) => setValue("category", v)}
                defaultValue=""
              >
                <SelectTrigger className="h-12 bg-card rounded-2xl shadow-sm border-border/50 text-base px-5">
                  <SelectValue placeholder="Categoría" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="" disabled>Seleccionar categoría</SelectItem>
                  {CATEGORIES.map((cat) => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.category && <p className="text-xs text-expense mt-1 ml-1">{errors.category.message}</p>}
            </div>
          ) : (
            <div className="flex-1">
              <Input
                placeholder="Nota"
                className="h-12 bg-card rounded-2xl shadow-sm border-border/50 text-base px-5"
                {...register("description")}
              />
            </div>
          )}
          <div className="w-44">
            <Input
              id="date"
              type="date"
              className="h-12 bg-card rounded-2xl shadow-sm border-border/50 text-base w-full px-4"
              {...register("transaction_date")}
            />
          </div>
        </div>

        {transactionType === "expense" && (
          <Input
            placeholder="Nota"
            className="h-12 bg-card rounded-2xl shadow-sm border-border/50 text-base px-5"
            {...register("description")}
          />
        )}

        <button
          type="submit"
          disabled={loading}
          className={`w-full h-13 rounded-2xl text-base font-semibold transition-all duration-150 active:scale-[0.97] ${
            success
              ? "bg-income text-white scale-[0.97]"
              : transactionType === "expense"
                ? "bg-expense text-white hover:opacity-90"
                : "bg-income text-white hover:opacity-90"
          }`}
        >
          {success ? (
            <span className="flex items-center justify-center gap-2">
              <Check className="h-5 w-5" /> Guardado
            </span>
          ) : loading ? (
            "Guardando..."
          ) : (
            `Agregar ${transactionType === "expense" ? "Gasto" : "Ingreso"}`
          )}
        </button>
      </form>

      <div className="bg-card rounded-2xl shadow-sm border border-border/50 p-5">
        <p className="text-xs font-medium text-muted-foreground tracking-widest uppercase mb-3">Recientes</p>
        {recent.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-3">Sin movimientos</p>
        ) : (
          <div className="space-y-0">
            {recent.map((t, i) => (
              <div
                key={t.id}
                className={`flex items-center justify-between py-3 ${
                  i < recent.length - 1 ? "border-b border-border/50" : ""
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`shrink-0 w-9 h-9 rounded-full flex items-center justify-center ${
                    t.type === "income" ? "bg-income/10" : "bg-expense/10"
                  }`}>
                    {t.type === "income" ? (
                      <ArrowUpRight className="h-4 w-4 text-income" />
                    ) : (
                      <ArrowDownRight className="h-4 w-4 text-expense" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{t.description || t.category || t.type}</p>
                    <p className="text-xs text-muted-foreground">{format(new Date(t.transaction_date), "d MMM", { locale: es })}</p>
                  </div>
                </div>
                <p className={`shrink-0 text-sm font-semibold ${
                  t.type === "income" ? "text-income" : "text-expense"
                }`}>
                  {t.type === "income" ? "+" : "-"}${formatAmount(Number(t.amount))}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
