import { useState, useEffect, useRef } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, getDay, isSameDay, isSameMonth, isToday } from "date-fns"
import { es } from "date-fns/locale"
import { cn } from "@/lib/utils"

interface DatePickerProps {
  value: string
  onChange: (d: string) => void
  placeholder: string
}

const DAY_LABELS = ["D", "L", "M", "X", "J", "V", "S"]

function toDate(str: string) {
  const [y, m, d] = str.split("-").map(Number)
  return new Date(y, m - 1, d)
}

export function DatePicker({ value, onChange, placeholder }: DatePickerProps) {
  const [open, setOpen] = useState(false)
  const [viewDate, setViewDate] = useState(() => value ? toDate(value) : new Date())
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (value) setViewDate(toDate(value))
  }, [value])

  useEffect(() => {
    if (!open) return
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClick)
    return () => document.removeEventListener("mousedown", handleClick)
  }, [open])

  const monthStart = startOfMonth(viewDate)
  const monthEnd = endOfMonth(viewDate)
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd })
  const startDay = getDay(monthStart)

  function handleSelectDay(day: Date) {
    onChange(format(day, "yyyy-MM-dd"))
    setOpen(false)
  }

  function handleClear() {
    onChange("")
    setOpen(false)
  }

  return (
    <div ref={containerRef} className="relative flex-1">
      <div
        className="h-12 w-full bg-card rounded-full shadow-sm border border-border/50 px-4 flex items-center text-sm cursor-pointer select-none text-muted-foreground"
        onClick={() => setOpen(v => !v)}
      >
        {value ? value.split("-").reverse().join("/") : placeholder}
      </div>

      {open && (
        <div className="absolute top-full mt-1 left-0 right-0 z-50 bg-card rounded-2xl shadow-lg border border-border/50 p-3">
          <div className="flex items-center justify-between mb-3">
            <button
              type="button"
              onClick={() => setViewDate(d => subMonths(d, 1))}
              className="p-1 rounded-lg hover:bg-muted transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="text-sm font-medium capitalize">
              {format(viewDate, "MMMM yyyy", { locale: es })}
            </span>
            <button
              type="button"
              onClick={() => setViewDate(d => addMonths(d, 1))}
              className="p-1 rounded-lg hover:bg-muted transition-colors"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          <div className="grid grid-cols-7 gap-1 mb-1">
            {DAY_LABELS.map((label, i) => (
              <div key={i} className="text-center text-xs text-muted-foreground font-medium h-8 leading-8">
                {label}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {Array.from({ length: startDay }).map((_, i) => (
              <div key={`empty-${i}`} className="h-8" />
            ))}
            {days.map((day) => {
              const selected = value && isSameDay(day, toDate(value))
              const today = isToday(day)
              return (
                <button
                  key={day.toISOString()}
                  type="button"
                  onClick={() => handleSelectDay(day)}
                  className={cn(
                    "h-8 w-full rounded-lg text-sm transition-colors",
                    selected && "bg-primary text-white",
                    !selected && "hover:bg-muted",
                    today && !selected && "border border-primary/50",
                    !isSameMonth(day, viewDate) && "text-muted-foreground/30"
                  )}
                >
                  {format(day, "d")}
                </button>
              )
            })}
          </div>

          {value && (
            <button
              type="button"
              onClick={handleClear}
              className="w-full mt-2 py-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-muted"
            >
              Limpiar
            </button>
          )}
        </div>
      )}
    </div>
  )
}
