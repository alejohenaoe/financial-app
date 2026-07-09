import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { ArrowLeft, Check, Pencil, Trash2, Plus, X } from "lucide-react"
import { CATEGORIES } from "@/types"
import { getCategoryIcon, getCategoryColor } from "@/lib/categories"
import { cn } from "@/lib/utils"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Toast } from "@/components/Toast"

const STORAGE_KEY = "financial-app-categories"

interface CategoryItem {
  id: string
  name: string
  hidden: boolean
}

function loadCategories(): CategoryItem[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) return JSON.parse(stored)
  } catch {}
  return CATEGORIES.map((name) => ({ id: name, name, hidden: false }))
}

function saveCategories(items: CategoryItem[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
}

export function CategoriesPage() {
  const navigate = useNavigate()
  const [items, setItems] = useState<CategoryItem[]>(loadCategories)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editValue, setEditValue] = useState("")
  const [adding, setAdding] = useState(false)
  const [newName, setNewName] = useState("")
  const [deleteTarget, setDeleteTarget] = useState<CategoryItem | null>(null)
  const [toast, setToast] = useState<string | null>(null)

  const visible = items.filter((i) => !i.hidden)

  function startEdit(item: CategoryItem) {
    setEditingId(item.id)
    setEditValue(item.name)
  }

  function saveEdit(id: string) {
    const updated = items.map((i) =>
      i.id === id ? { ...i, name: editValue.trim() || i.name } : i,
    )
    setItems(updated)
    saveCategories(updated)
    setEditingId(null)
    setToast("Categoría actualizada")
  }

  function cancelEdit() {
    setEditingId(null)
    setEditValue("")
  }

  function confirmDelete() {
    if (!deleteTarget) return
    const updated = items.map((i) =>
      i.id === deleteTarget.id ? { ...i, hidden: true } : i,
    )
    setItems(updated)
    saveCategories(updated)
    setDeleteTarget(null)
    setToast("Categoría eliminada")
  }

  function addCategory() {
    const name = newName.trim()
    if (!name) return
    const id = name.toLowerCase().replace(/\s+/g, "-")
    if (items.some((i) => i.id === id)) {
      setToast("La categoría ya existe")
      return
    }
    const updated = [...items, { id, name, hidden: false }]
    setItems(updated)
    saveCategories(updated)
    setNewName("")
    setAdding(false)
    setToast("Categoría agregada")
  }

  return (
    <div className="flex flex-col h-dvh">
      <header className="px-5 pt-[max(1.25rem,env(safe-area-inset-top))] pb-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="text-[22px] font-bold tracking-[-0.01em] text-foreground">Categorías</h1>
        </div>
        <button
          type="button"
          onClick={() => setAdding(true)}
          className="flex items-center gap-1 rounded-xl bg-primary px-4 py-2 text-[13px] font-semibold text-primary-foreground"
        >
          <Plus className="h-4 w-4" /> Agregar
        </button>
      </header>

      <div className="flex-1 overflow-y-auto px-5 pb-4">
        {adding && (
          <div className="mb-3 flex items-center gap-2 rounded-2xl border border-primary/50 bg-card px-4 py-3 shadow-sm">
            <input
              autoFocus
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Nombre de la categoría"
              className="flex-1 bg-transparent text-[15px] text-foreground outline-none placeholder:text-muted-foreground/60"
              onKeyDown={(e) => {
                if (e.key === "Enter") addCategory()
                if (e.key === "Escape") { setAdding(false); setNewName("") }
              }}
            />
            <button
              type="button"
              onClick={addCategory}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground"
            >
              <Check className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => { setAdding(false); setNewName("") }}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary text-muted-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        <div className="overflow-hidden rounded-2xl border border-border/60 bg-card shadow-card">
          {visible.map((item, i) => {
            const Icon = getCategoryIcon(item.name)
            const color = getCategoryColor(item.name)
            const isEditing = editingId === item.id
            return (
              <div
                key={item.id}
                className={cn(
                  "flex items-center gap-3 px-4 py-3.5 transition-colors",
                  i > 0 && "border-t border-border/60",
                )}
              >
                <span
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full"
                  style={{
                    backgroundColor: `color-mix(in srgb, ${color} 16%, transparent)`,
                    color: color,
                  }}
                >
                  <Icon className="h-4.5 w-4.5" strokeWidth={2.2} />
                </span>

                {isEditing ? (
                  <input
                    autoFocus
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    className="flex-1 rounded-lg border border-border/70 bg-muted px-3 py-1.5 text-[15px] text-foreground outline-none"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") saveEdit(item.id)
                      if (e.key === "Escape") cancelEdit()
                    }}
                  />
                ) : (
                  <span className="flex-1 text-[15px] font-medium text-foreground">{item.name}</span>
                )}

                <div className="flex items-center gap-1 shrink-0">
                  {isEditing ? (
                    <>
                      <button
                        type="button"
                        onClick={() => saveEdit(item.id)}
                        className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary"
                      >
                        <Check className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={cancelEdit}
                        className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary text-muted-foreground"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        type="button"
                        onClick={() => startEdit(item)}
                        className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary text-muted-foreground transition-colors hover:text-foreground"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeleteTarget(item)}
                        className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary text-muted-foreground transition-colors hover:text-expense"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        {visible.length === 0 && (
          <div className="rounded-2xl border border-border/60 bg-card shadow-card px-4 py-8 text-center mt-3">
            <p className="text-sm text-muted-foreground">No hay categorías. Agrega una nueva.</p>
          </div>
        )}
      </div>

      <div className="pb-[env(safe-area-inset-bottom)]" />

      <Dialog open={!!deleteTarget} onOpenChange={(open) => { if (!open) setDeleteTarget(null) }}>
        <DialogContent className="max-w-xs text-center">
          <div className="flex flex-col items-center gap-3 py-2">
            <div className="w-12 h-12 rounded-full bg-expense/10 flex items-center justify-center">
              <Trash2 className="h-6 w-6 text-expense" />
            </div>
            <p className="text-base font-semibold">¿Eliminar categoría?</p>
            <p className="text-sm text-muted-foreground">
              "<strong>{deleteTarget?.name}</strong>" se ocultará de la lista.
            </p>
            <p className="text-xs text-muted-foreground">Las transacciones existentes no se verán afectadas.</p>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setDeleteTarget(null)}
              className="flex-1 h-11 rounded-xl text-sm font-medium bg-secondary text-secondary-foreground hover:opacity-80 transition-opacity"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={confirmDelete}
              className="flex-1 h-11 rounded-xl text-sm font-medium bg-expense text-primary-foreground hover:opacity-90 transition-opacity"
            >
              Eliminar
            </button>
          </div>
        </DialogContent>
      </Dialog>
      <Toast message={toast} type="success" onClose={() => setToast(null)} />
    </div>
  )
}