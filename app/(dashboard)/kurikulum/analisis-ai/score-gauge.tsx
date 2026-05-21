"use client"

import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"

interface ScoreGaugeProps {
  score: number
}

export function ScoreGauge({ score }: ScoreGaugeProps) {
  const [value, setValue] = useState(0)

  useEffect(() => {
    const timeout = setTimeout(() => {
      setValue(score)
    }, 100)
    return () => clearTimeout(timeout)
  }, [score])

  const getColor = (s: number) => {
    if (s >= 80) return "text-teal-500 stroke-teal-500"
    if (s >= 60) return "text-yellow-500 stroke-yellow-500"
    return "text-red-500 stroke-red-500"
  }

  const radius = 60
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference - (value / 100) * circumference

  return (
    <div className="flex flex-col items-center justify-center p-6 bg-card rounded-xl border shadow-sm h-full">
      <div className="relative flex items-center justify-center">
        <svg className="w-40 h-40 transform -rotate-90">
          <circle
            cx="80"
            cy="80"
            r={radius}
            stroke="currentColor"
            strokeWidth="12"
            fill="transparent"
            className="text-muted stroke-muted opacity-20"
          />
          <circle
            cx="80"
            cy="80"
            r={radius}
            stroke="currentColor"
            strokeWidth="12"
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            className={cn(getColor(score))}
            strokeLinecap="round"
            style={{ transition: 'stroke-dashoffset 1.5s ease-out' }}
          />
        </svg>
        <div className="absolute flex flex-col items-center justify-center">
          <span className="text-4xl font-bold">{value}</span>
          <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider mt-1">
            Score
          </span>
        </div>
      </div>
      <p className="mt-6 text-sm font-medium text-center">Skor Kualitas Kurikulum</p>
    </div>
  )
}
