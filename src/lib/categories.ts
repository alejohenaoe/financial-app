import {
  UtensilsCrossed, ShoppingCart, Car, HeartPulse, Clapperboard,
  ShoppingBag, House, Briefcase, Fuel, CreditCard, CircleParking, Ellipsis,
  type LucideIcon,
} from "lucide-react"

export const CATEGORY_CONFIG: Record<string, { icon: LucideIcon; color: string }> = {
  Comida: { icon: UtensilsCrossed, color: "#FF6B35" },
  Supermercado: { icon: ShoppingCart, color: "#34C759" },
  Transporte: { icon: Car, color: "#007AFF" },
  Salud: { icon: HeartPulse, color: "#FF3B30" },
  Entretenimiento: { icon: Clapperboard, color: "#AF52DE" },
  Compras: { icon: ShoppingBag, color: "#FF9500" },
  Hogar: { icon: House, color: "#5AC8FA" },
  Trabajo: { icon: Briefcase, color: "#5856D6" },
  Gasolina: { icon: Fuel, color: "#FF9500" },
  Crédito: { icon: CreditCard, color: "#8E8E93" },
  Parqueadero: { icon: CircleParking, color: "#007AFF" },
  Otro: { icon: Ellipsis, color: "#C7C7CC" },
}

export function getCategoryIcon(category: string | null): LucideIcon {
  if (category && CATEGORY_CONFIG[category]) return CATEGORY_CONFIG[category].icon
  return Ellipsis
}

export function getCategoryColor(category: string | null): string {
  if (category && CATEGORY_CONFIG[category]) return CATEGORY_CONFIG[category].color
  return "#C7C7CC"
}

export const CATEGORY_COLORS = Object.values(CATEGORY_CONFIG).map((c) => c.color)
