import { Outlet, useLocation, useNavigate } from "react-router-dom"
import { Plus, List, BarChart3, Settings } from "lucide-react"
import { cn } from "@/lib/utils"

const tabs = [
  { path: "/", label: "Agregar", icon: Plus },
  { path: "/history", label: "Movimientos", icon: List },
  { path: "/analytics", label: "Estadísticas", icon: BarChart3 },
  { path: "/settings", label: "Ajustes", icon: Settings },
]

export function Layout() {
  const location = useLocation()
  const navigate = useNavigate()

  return (
    <div className="flex flex-col h-dvh max-w-lg mx-auto bg-background">
      <main className="flex-1 min-h-0 overflow-y-auto">
        <Outlet />
      </main>

      <nav className="sticky bottom-0 bg-card/85 backdrop-blur-xl border-t border-border pb-[env(safe-area-inset-bottom,4px)]">
        <div className="flex justify-around px-3 pt-1.5 pb-2">
          {tabs.map((tab) => {
            const isActive = tab.path === "/" ? location.pathname === "/" : location.pathname.startsWith(tab.path)
            return (
              <button
                key={tab.path}
                onClick={() => navigate(tab.path)}
                className="flex flex-col items-center gap-1 px-4 py-1.5 transition-all duration-150"
              >
                <div className={cn(
                  "flex items-center justify-center rounded-2xl p-2 transition-all duration-150",
                  isActive ? "bg-primary/10" : ""
                )}>
                  <tab.icon className={cn("h-5 w-5", isActive ? "text-primary" : "text-muted-foreground")} />
                </div>
                <span className={cn(
                  "text-[10px] font-medium transition-colors duration-150",
                  isActive ? "text-primary" : "text-muted-foreground"
                )}>{tab.label}</span>
              </button>
            )
          })}
        </div>
      </nav>
    </div>
  )
}