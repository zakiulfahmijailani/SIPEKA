"use client"

import { useCountUp } from "@/hooks/use-count-up"
import { cn } from "@/lib/utils"

interface AnimatedNumberProps {
  value: number
  suffix?: string
  prefix?: string
  decimals?: number
  duration?: number
  className?: string
  enabled?: boolean
}

/**
 * AnimatedNumber — komponen angka animasi count-up.
 * Gunakan di KPI tiles, summary stats, dsb.
 *
 * @example
 * <AnimatedNumber value={142} className="text-3xl font-bold" />
 * <AnimatedNumber value={87.5} decimals={1} suffix="%" />
 */
export function AnimatedNumber({
  value,
  suffix = "",
  prefix = "",
  decimals = 0,
  duration = 900,
  className,
  enabled = true,
}: AnimatedNumberProps) {
  const display = useCountUp({ end: value, decimals, duration, enabled })

  return (
    <span className={cn("tabular-nums", className)}>
      {prefix}{display}{suffix}
    </span>
  )
}
