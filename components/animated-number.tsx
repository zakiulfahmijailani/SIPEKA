"use client"

import { useEffect, useRef, useState } from "react"

interface AnimatedNumberProps {
  value: number
  decimals?: number
  suffix?: string
  prefix?: string
  duration?: number
}

export function AnimatedNumber({
  value,
  decimals = 0,
  suffix = "",
  prefix = "",
  duration = 600,
}: AnimatedNumberProps) {
  const [display, setDisplay] = useState(value)
  const prevRef = useRef(value)
  const frameRef = useRef<number | undefined>(undefined)

  useEffect(() => {
    const start = prevRef.current
    const end = value
    prevRef.current = value

    if (start === end) return

    const startTime = performance.now()

    const tick = (now: number) => {
      const elapsed = Math.min((now - startTime) / duration, 1)
      // ease-out cubic
      const eased = 1 - Math.pow(1 - elapsed, 3)
      setDisplay(start + (end - start) * eased)
      if (elapsed < 1) {
        frameRef.current = requestAnimationFrame(tick)
      } else {
        setDisplay(end)
      }
    }

    frameRef.current = requestAnimationFrame(tick)

    return () => {
      if (frameRef.current !== undefined) cancelAnimationFrame(frameRef.current)
    }
  }, [value, duration])

  return (
    <span className="tabular-nums">
      {prefix}{display.toFixed(decimals)}{suffix}
    </span>
  )
}
