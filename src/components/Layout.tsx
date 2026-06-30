import { Outlet, useLocation, useNavigate } from "react-router-dom"
import { PlusCircle, Clock, BarChart3, LogOut } from "lucide-react"
import { cn } from "@/lib/utils"
import { supabase } from "@/lib/supabase"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { useState } from "react"

const tabs = [
  { path: "/", label: "Agregar", icon: PlusCircle },
  { path: "/history", label: "Historial", icon: Clock },
  { path: "/analytics", label: "Estadísticas", icon: BarChart3 },
]

export function Layout() {
  const location = useLocation()
  const navigate = useNavigate()
  const [logoutOpen, setLogoutOpen] = useState(false)

  return (
    <div className="flex flex-col min-h-screen max-w-lg mx-auto">
      <main className="flex-1 pt-2 pb-20 px-4">
        <Outlet />
      </main>

      <nav className="sticky bottom-0 bg-card/80 backdrop-blur-md border-t border-border/50 pb-[env(safe-area-inset-bottom,4px)]">
        <div className="flex justify-around px-4 pt-1 pb-2">
          {tabs.map((tab) => {
            const isActive = tab.path === "/" ? location.pathname === "/" : location.pathname.startsWith(tab.path)
            return (
              <button
                key={tab.path}
                onClick={() => navigate(tab.path)}
                className={cn(
                  "flex flex-col items-center gap-0.5 py-1 px-3 rounded-lg transition-colors duration-150",
                  isActive ? "text-primary" : "text-muted-foreground"
                )}
              >
                <tab.icon className={cn("h-5 w-5 transition-all duration-150", isActive ? "fill-primary/20" : "")} />
                <span className="text-[10px] font-medium tracking-wide">{tab.label}</span>
              </button>
            )
          })}
          <button
            onClick={() => setLogoutOpen(true)}
            className="flex flex-col items-center gap-0.5 py-1 px-3 rounded-lg transition-colors duration-150 text-muted-foreground"
          >
            <LogOut className="h-5 w-5" />
            <span className="text-[10px] font-medium tracking-wide">Salir</span>
          </button>
        </div>
      </nav>

      <Dialog open={logoutOpen} onOpenChange={(open) => { if (!open) setLogoutOpen(false) }}>
        <DialogContent className="max-w-xs text-center">
          <div className="flex flex-col items-center gap-3 py-2">
            <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
              <LogOut className="h-6 w-6 text-muted-foreground" />
            </div>
            <p className="text-base font-semibold">Cerrar sesión</p>
            <p className="text-sm text-muted-foreground">¿Estás seguro?</p>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setLogoutOpen(false)}
              className="flex-1 h-11 rounded-xl text-sm font-medium bg-muted text-foreground hover:opacity-80 transition-opacity"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={() => {
                supabase.auth.signOut()
                setLogoutOpen(false)
              }}
              className="flex-1 h-11 rounded-xl text-sm font-medium bg-expense text-white hover:opacity-90 transition-opacity"
            >
              Cerrar sesión
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
