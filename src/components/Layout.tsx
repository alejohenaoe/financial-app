import { Outlet, useLocation, useNavigate } from "react-router-dom"
import { PlusCircle, Clock, BarChart3 } from "lucide-react"
import { cn } from "@/lib/utils"

const tabs = [
  { path: "/", label: "Agregar", icon: PlusCircle, activeIcon: PlusCircle },
  { path: "/history", label: "Historial", icon: Clock, activeIcon: Clock },
  { path: "/analytics", label: "Estadísticas", icon: BarChart3, activeIcon: BarChart3 },
]

export function Layout() {
  const location = useLocation()
  const navigate = useNavigate()

  return (
    <div className="flex flex-col min-h-screen max-w-lg mx-auto px-4">
      <main className="flex-1 pt-2 pb-4">
        <Outlet />
      </main>

      <nav className="sticky bottom-0 bg-card/90 backdrop-blur-xl border-t border-border/50 pb-1 -mx-4 px-4">
        <div className="flex justify-around pt-1">
          {tabs.map((tab) => {
            const isActive = tab.path === "/" ? location.pathname === "/" : location.pathname.startsWith(tab.path)
            return (
              <button
                key={tab.path}
                onClick={() => navigate(tab.path)}
                className={cn(
                  "flex flex-col items-center gap-0.5 py-1 px-6 rounded-lg transition-colors duration-150",
                  isActive ? "text-primary" : "text-muted-foreground"
                )}
              >
                <tab.icon className={cn("h-5 w-5 transition-all duration-150", isActive ? "fill-primary/20" : "")} />
                <span className="text-[10px] font-medium tracking-wide">{tab.label}</span>
              </button>
            )
          })}
        </div>
      </nav>
    </div>
  )
}
