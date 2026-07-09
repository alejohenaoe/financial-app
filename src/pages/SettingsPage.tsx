import { useState, useEffect } from "react"
import { Moon, Sun, LogOut, Download } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Toast } from "@/components/Toast"
import { cn } from "@/lib/utils"

export function SettingsPage() {
  const [darkMode, setDarkMode] = useState(() => {
    if (typeof document === "undefined") return false
    return document.documentElement.classList.contains("dark")
  })
  const [logoutOpen, setLogoutOpen] = useState(false)
  const [toast, setToast] = useState<string | null>(null)

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark")
    } else {
      document.documentElement.classList.remove("dark")
    }
  }, [darkMode])

  return (
    <div className="space-y-6 pt-2 pb-4">
      <div className="bg-card rounded-2xl shadow-sm border border-border overflow-hidden">
        <div className="px-5 pt-5 pb-2">
          <p className="text-xs font-medium text-muted-foreground tracking-wider uppercase">Preferencias</p>
        </div>
        <div className="px-5">
          <div className="flex items-center justify-between py-3">
            <div className="flex items-center gap-3">
              {darkMode ? (
                <Moon className="h-5 w-5 text-muted-foreground" />
              ) : (
                <Sun className="h-5 w-5 text-muted-foreground" />
              )}
              <p className="text-sm text-foreground">Modo oscuro</p>
            </div>
            <button
              type="button"
              onClick={() => setDarkMode((v) => !v)}
              className={cn(
                "w-11 h-6 rounded-full transition-colors duration-200 relative",
                darkMode ? "bg-income" : "bg-border"
              )}
            >
              <div
                className={cn(
                  "absolute top-0.5 w-5 h-5 rounded-full bg-card shadow-sm transition-transform duration-200",
                  darkMode ? "translate-x-[22px]" : "translate-x-0.5"
                )}
              />
            </button>
          </div>
        </div>
      </div>

      <div className="bg-card rounded-2xl shadow-sm border border-border overflow-hidden">
        <div className="px-5 pt-5 pb-2">
          <p className="text-xs font-medium text-muted-foreground tracking-wider uppercase">Datos</p>
        </div>
        <div className="px-5 pb-3">
          <button
            type="button"
            className="flex items-center gap-3 py-3 w-full"
            onClick={() => setToast("Exportación en desarrollo")}
          >
            <Download className="h-5 w-5 text-muted-foreground" />
            <p className="text-sm text-foreground">Exportar datos</p>
          </button>
        </div>
      </div>

      <div className="bg-card rounded-2xl shadow-sm border border-border overflow-hidden">
        <div className="px-5 pt-5 pb-2">
          <p className="text-xs font-medium text-muted-foreground tracking-wider uppercase">Acerca de</p>
        </div>
        <div className="px-5 pb-3">
          <div className="py-3">
            <p className="text-sm text-foreground">Finanzas</p>
            <p className="text-xs text-muted-foreground">Versión 1.0.0 · Prototipo</p>
          </div>
          <button
            type="button"
            onClick={() => setLogoutOpen(true)}
            className="flex items-center gap-3 py-3 w-full border-t border-border"
          >
            <LogOut className="h-5 w-5 text-expense" />
            <p className="text-sm text-expense">Cerrar sesión</p>
          </button>
        </div>
      </div>

      <Dialog open={logoutOpen} onOpenChange={(open) => { if (!open) setLogoutOpen(false) }}>
        <DialogContent className="max-w-xs text-center">
          <div className="flex flex-col items-center gap-3 py-2">
            <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center">
              <LogOut className="h-6 w-6 text-muted-foreground" />
            </div>
            <p className="text-base font-semibold">Cerrar sesión</p>
            <p className="text-sm text-muted-foreground">¿Estás seguro?</p>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setLogoutOpen(false)}
              className="flex-1 h-11 rounded-xl text-sm font-medium bg-secondary text-foreground hover:opacity-80 transition-opacity"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={() => {
                supabase.auth.signOut()
                setLogoutOpen(false)
              }}
              className="flex-1 h-11 rounded-xl text-sm font-medium bg-expense text-primary-foreground hover:opacity-90 transition-opacity"
            >
              Cerrar sesión
            </button>
          </div>
        </DialogContent>
      </Dialog>
      <Toast message={toast} type="error" onClose={() => setToast(null)} />
    </div>
  )
}