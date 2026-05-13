"use client"

import { useEffect, useRef, ReactNode } from "react"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"

/**
 * PageTransition — wrapper tipis yang fade-in setiap kali pathname berubah.
 * Letakkan di layout.tsx sebagai pembungkus {children}.
 *
 * Respects prefers-reduced-motion: skip animasi jika user setting aktif.
 *
 * @example
 * // app/(dashboard)/layout.tsx
 * <PageTransition>{children}</PageTransition>
 */
export function PageTransition({ children, className }: { children: ReactNode; className?: string }) {
  const pathname = usePathname()
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    if (reduced) return

    // Reset & trigger animasi
    el.style.opacity = "0"
    el.style.transform = "translateY(6px)"
    el.style.transition = "none"

    // Force reflow
    void el.offsetHeight

    el.style.transition = "opacity 220ms cubic-bezier(0.16,1,0.3,1), transform 220ms cubic-bezier(0.16,1,0.3,1)"
    el.style.opacity = "1"
    el.style.transform = "translateY(0)"
  }, [pathname])

  return (
    <div ref={ref} className={cn("will-change-transform", className)}>
      {children}
    </div>
  )
}
