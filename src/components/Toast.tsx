import { useEffect } from "react"
import { cn } from "@/lib/utils"

interface ToastProps {
  message: string | null
  type?: "error" | "success"
  onClose: () => void
}

export function Toast({ message, type = "error", onClose }: ToastProps) {
  useEffect(() => {
    if (!message) return
    const t = setTimeout(onClose, 4000)
    return () => clearTimeout(t)
  }, [message, onClose])

  if (!message) return null

  return (
    <div
      className={cn(
        "fixed bottom-24 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-xl text-sm font-medium shadow-lg animate-in fade-in slide-in-from-bottom-2 duration-200 text-center max-w-[80vw]",
        type === "error" ? "bg-expense text-white" : "bg-income text-white"
      )}
    >
      {message}
    </div>
  )
}
