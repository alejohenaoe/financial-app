import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { updateTransaction } from "@/services/transaction"
import { CATEGORIES, type Transaction } from "@/types"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useState } from "react"
import { cn, formatAmountInput, parseAmount } from "@/lib/utils"

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
)

type FormData = z.infer<typeof schema>

interface EditTransactionFormProps {
  transaction: Transaction
  onSuccess: (updated: Transaction) => void
}

export function EditTransactionForm({ transaction, onSuccess }: EditTransactionFormProps) {
  const [loading, setLoading] = useState(false)

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      type: transaction.type,
      amount: formatAmountInput(String(transaction.amount)),
      category: transaction.category || "",
      description: transaction.description || "",
      transaction_date: transaction.transaction_date,
    },
  })

  const amountValue = watch("amount")

  function handleAmountChange(e: React.ChangeEvent<HTMLInputElement>) {
    const formatted = formatAmountInput(e.target.value)
    setValue("amount", formatted, { shouldValidate: true })
  }

  const transactionType = watch("type")

  async function onSubmit(data: FormData) {
    setLoading(true)
    try {
      const updated = await updateTransaction(transaction.id, {
        type: data.type,
        amount: parseAmount(data.amount),
        category: data.type === "expense" ? (data.category as typeof CATEGORIES[number]) : null,
        description: data.description || null,
        transaction_date: data.transaction_date,
      })
      onSuccess(updated)
    } catch {
      // silent
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="bg-muted/50 rounded-xl p-1 flex">
        <button
          type="button"
          className={cn(
            "flex-1 py-2 text-sm font-medium rounded-[10px] transition-all duration-150",
            transactionType === "expense"
              ? "bg-expense text-white shadow-sm"
              : "text-muted-foreground"
          )}
          onClick={() => setValue("type", "expense")}
        >
          Gasto
        </button>
        <button
          type="button"
          className={cn(
            "flex-1 py-2 text-sm font-medium rounded-[10px] transition-all duration-150",
            transactionType === "income"
              ? "bg-income text-white shadow-sm"
              : "text-muted-foreground"
          )}
          onClick={() => setValue("type", "income")}
        >
          Ingreso
        </button>
      </div>

      <div className="space-y-2">
        <Label htmlFor="edit-amount" className="text-xs text-muted-foreground font-medium">Monto</Label>
        <Input id="edit-amount" type="text" inputMode="numeric" placeholder="0" name="amount" value={amountValue || ""} onChange={handleAmountChange} className="h-12 text-lg rounded-2xl border-border/50 px-4" />
        {errors.amount && <p className="text-xs text-expense">{errors.amount.message}</p>}
      </div>

      {transactionType === "expense" && (
        <div className="space-y-2">
          <Label className="text-xs text-muted-foreground font-medium">Categoría</Label>
          <Select
            onValueChange={(v) => setValue("category", v)}
            defaultValue={transaction.category || ""}
          >
            <SelectTrigger className="h-12 rounded-2xl border-border/50 text-base px-4">
              <SelectValue placeholder="Seleccionar categoría" />
            </SelectTrigger>
            <SelectContent>
              {CATEGORIES.map((cat) => (
                <SelectItem key={cat} value={cat}>{cat}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.category && <p className="text-xs text-expense">{errors.category.message}</p>}
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="edit-description" className="text-xs text-muted-foreground font-medium">Descripción (opcional)</Label>
        <Input id="edit-description" placeholder="Agregar nota..." className="h-12 rounded-2xl border-border/50 px-4" {...register("description")} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="edit-date" className="text-xs text-muted-foreground font-medium">Fecha</Label>
        <Input id="edit-date" type="date" className="h-12 rounded-2xl border-border/50 px-4" {...register("transaction_date")} />
      </div>

      <button
        type="submit"
        disabled={loading}
        className={cn(
          "w-full h-12 rounded-2xl text-base font-semibold transition-all duration-150 active:scale-[0.97]",
          transactionType === "expense"
            ? "bg-expense text-white hover:opacity-90"
            : "bg-income text-white hover:opacity-90"
        )}
      >
        {loading ? "Guardando..." : "Guardar Cambios"}
      </button>
    </form>
  )
}
