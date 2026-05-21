"use client"

import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Target, Scale, BarChart2, GitMerge } from "lucide-react"
import { cn } from "@/lib/utils"

export interface Recommendation {
  priority: "high" | "medium" | "low"
  category: "coverage" | "balance" | "distribution" | "redundancy"
  title: string
  description: string
  affectedItems: string[]
}

interface Props {
  recommendations: Recommendation[]
}

export function RecommendationsList({ recommendations }: Props) {
  const [filter, setFilter] = useState<"all" | "high" | "medium" | "low">("all")

  const filtered = filter === "all" ? recommendations : recommendations.filter(r => r.priority === filter)

  const CategoryIcon = ({ category }: { category: string }) => {
    switch (category) {
      case "coverage": return <Target className="h-5 w-5" />
      case "balance": return <Scale className="h-5 w-5" />
      case "distribution": return <BarChart2 className="h-5 w-5" />
      case "redundancy": return <GitMerge className="h-5 w-5" />
      default: return <Target className="h-5 w-5" />
    }
  }

  const getPriorityColor = (p: string) => {
    if (p === "high") return "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400 border-red-200 dark:border-red-800"
    if (p === "medium") return "bg-yellow-100 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800"
    return "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400 border-gray-200 dark:border-gray-700"
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        <FilterBtn active={filter === "all"} onClick={() => setFilter("all")} label="Semua" />
        <FilterBtn active={filter === "high"} onClick={() => setFilter("high")} label="High Priority" />
        <FilterBtn active={filter === "medium"} onClick={() => setFilter("medium")} label="Medium" />
        <FilterBtn active={filter === "low"} onClick={() => setFilter("low")} label="Low" />
      </div>

      <div className="grid gap-4">
        {filtered.length === 0 && (
          <div className="p-8 text-center text-muted-foreground border rounded-lg bg-card">
            Tidak ada rekomendasi untuk kategori ini.
          </div>
        )}
        {filtered.map((r, i) => (
          <div 
            key={i} 
            className="flex gap-4 p-5 bg-card border rounded-xl shadow-sm"
          >
            <div className="p-2 rounded-lg h-fit bg-secondary text-secondary-foreground">
              <CategoryIcon category={r.category} />
            </div>
            <div className="flex-1 space-y-2">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <h4 className="font-semibold text-[15px]">{r.title}</h4>
                <Badge variant="outline" className={cn("capitalize text-[10px] font-bold tracking-wide", getPriorityColor(r.priority))}>
                  {r.priority} Priority
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">{r.description}</p>
              {r.affectedItems && r.affectedItems.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {r.affectedItems.map(item => (
                    <Badge key={item} variant="secondary" className="text-xs">
                      {item}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function FilterBtn({ active, onClick, label }: { active: boolean, onClick: () => void, label: string }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "px-4 py-1.5 text-xs font-semibold rounded-full transition-colors whitespace-nowrap",
        active ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
      )}
    >
      {label}
    </button>
  )
}
