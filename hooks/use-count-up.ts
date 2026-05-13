"use client"

import { useEffect, useRef, useState } from "react"

interface UseCountUpOptions {
  end: number
  duration?: number // ms
  decimals?: number
  start?: number
  enabled?: boolean // pause jika skeleton masih loading
}

/**
 * useCountUp — animasi angka dari `start` ke `end` saat komponen mount.
 * Respects prefers-reduced-motion: langsung tunjuk nilai akhir tanpa animasi.
 *
 * @example
 * const count = useCountUp({ end: 142 })
 * <span>{count}</span>
 */
export function useCountUp({
  end,
  duration = 900,
  decimals = 0,
  start = 0,
  enabled = true,
}: UseCountUpOptions): string {
  const [value, setValue] = useState(start)
  const rafRef = useRef<number | null>(null)
  const reduced = typeof window !== "undefined"
    ? window.matchMedia("(prefers-reduced-motion: reduce)").matches
    : false

  useEffect(() => {
    if (!enabled) return
    if (reduced) {
      setValue(end)
      return
    }

    const startTime = performance.now()
    const range = end - start

    const tick = (now: number) => {
      const elapsed = now - startTime
      const progress = Math.min(elapsed / duration, 1)
      // easeOutQuart
      const eased = 1 - Math.pow(1 - progress, 4)
      setValue(start + range * eased)
      if (progress < 1) {
        rafRef.current = requestAnimationFrame(tick)
      } else {
        setValue(end)
      }
    }

    rafRef.current = requestAnimationFrame(tick)
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current) }
  }, [end, start, duration, enabled, reduced])

  return decimals > 0
    ? value.toFixed(decimals)
    : Math.round(value).toLocaleString("id-ID")
}
