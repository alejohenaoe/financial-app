import { Outlet, useLocation, useNavigate } from "react-router-dom"
import { PlusCircle, List, BarChart3, Settings } from "lucide-react"
import { cn } from "@/lib/utils"

const tabs = [
  { path: "/", label: "Agregar", icon: PlusCircle },
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
        <div className="flex justify-around px-4 pt-1 pb-2">
          {tabs.map((tab) => {
            const isActive = tab.path === "/" ? location.pathname === "/" : location.pathname.startsWith(tab.path)
            return (
              <button
                key={tab.path}
                onClick={() => navigate(tab.path)}
                className={cn(
                  "flex flex-col items-center gap-0.5 py-1 px-3 transition-colors duration-150",
                  isActive ? "text-primary" : "text-muted-foreground"
                )}
              >
                <tab.icon className="h-5 w-5" />
                <span className="text-[10px] font-medium">{tab.label}</span>
              </button>
            )
          })}
        </div>
      </nav>
    </div>
  )
}