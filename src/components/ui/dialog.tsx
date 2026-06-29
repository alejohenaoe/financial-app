import * as React from "react"

interface DialogContextValue {
  open: boolean
  setOpen: (v: boolean) => void
}

const DialogContext = React.createContext<DialogContextValue>({
  open: false,
  setOpen: () => {},
})

function useDialog() {
  return React.useContext(DialogContext)
}

export function Dialog({
  children,
  open,
  onOpenChange,
}: {
  children: React.ReactNode
  open?: boolean
  onOpenChange?: (open: boolean) => void
}) {
  const [isOpen, setIsOpen] = React.useState(false)
  const isControlled = open !== undefined
  const currentOpen = isControlled ? open : isOpen

  const setOpen = (val: boolean) => {
    if (!isControlled) setIsOpen(val)
    onOpenChange?.(val)
  }

  return (
    <DialogContext.Provider value={{ open: currentOpen, setOpen }}>
      {children}
    </DialogContext.Provider>
  )
}

export function DialogTrigger({ children }: { children: React.ReactElement<{ onClick?: () => void }> }) {
  const { setOpen } = useDialog()
  return React.cloneElement(children, {
    onClick: () => setOpen(true),
  })
}

export const DialogContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, children, ...props }, ref) => {
    const { open, setOpen } = useDialog()
    if (!open) return null
    return (
      <div className="fixed inset-0 z-50 flex items-end justify-center">
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setOpen(false)} />
        <div
          ref={ref}
          className={`relative z-50 w-full max-w-lg bg-card rounded-t-3xl border border-border/50 shadow-xl mx-0 p-6 max-h-[90vh] overflow-y-auto animate-in slide-in-from-bottom duration-300 ${className || ""}`}
          {...props}
        >
          <div className="w-8 h-1 rounded-full bg-muted-foreground/30 mx-auto mb-5" />
          {children}
        </div>
      </div>
    )
  }
)
DialogContent.displayName = "DialogContent"

export function DialogHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={`flex flex-col space-y-1.5 mb-4 ${className || ""}`} {...props} />
}

export const DialogTitle = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={`text-lg font-semibold tracking-tight ${className || ""}`} {...props} />
  )
)
DialogTitle.displayName = "DialogTitle"
