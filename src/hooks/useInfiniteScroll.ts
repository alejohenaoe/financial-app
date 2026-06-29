import { useRef, useEffect, useCallback } from "react"

export function useInfiniteScroll(callback: () => void, enabled: boolean) {
  const observerRef = useRef<IntersectionObserver | null>(null)
  const sentinelRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (observerRef.current) {
        observerRef.current.disconnect()
      }

      if (!node || !enabled) return

      observerRef.current = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting) {
            callback()
          }
        },
        { threshold: 0.5 }
      )

      observerRef.current.observe(node)
    },
    [callback, enabled]
  )

  useEffect(() => {
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect()
      }
    }
  }, [])

  return sentinelRef
}
