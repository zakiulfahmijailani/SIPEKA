"use client"

import { AlertTriangle, BookX, BookDown, BookUp } from "lucide-react"
import { cn } from "@/lib/utils"

interface Props {
  orphanCpls: number
  overloadedCourses: number
  underloadedSemesters: number
  overloadedSemesters: number
}

export function IssuesStrip({ orphanCpls, overloadedCourses, underloadedSemesters, overloadedSemesters }: Props) {
  return (
    <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 h-full">
      <StatCard 
        icon={BookX} 
        label="CPL Tanpa Dukungan MK" 
        value={orphanCpls} 
        isDanger={orphanCpls > 0} 
      />
      <StatCard 
        icon={AlertTriangle} 
        label="MK Overloaded (≥5 CPL)" 
        value={overloadedCourses} 
        isWarning={overloadedCourses > 0} 
      />
      <StatCard 
        icon={BookDown} 
        label="Semester Kurang Padat (<18 SKS)" 
        value={underloadedSemesters} 
        isWarning={underloadedSemesters > 0} 
      />
      <StatCard 
        icon={BookUp} 
        label="Semester Terlalu Padat (>24 SKS)" 
        value={overloadedSemesters} 
        isDanger={overloadedSemesters > 0} 
      />
    </div>
  )
}

function StatCard({ icon: Icon, label, value, isDanger, isWarning }: any) {
  let colorClass = "text-muted-foreground"
  let bgClass = "bg-secondary"
  
  if (isDanger) {
    colorClass = "text-red-600 dark:text-red-400"
    bgClass = "bg-red-50 dark:bg-red-950/50"
  } else if (isWarning) {
    colorClass = "text-yellow-600 dark:text-yellow-400"
    bgClass = "bg-yellow-50 dark:bg-yellow-950/50"
  }

  return (
    <div className="flex flex-col p-4 bg-card border rounded-xl shadow-sm justify-between">
      <div className="flex items-start justify-between">
        <div className={cn("p-2 rounded-lg", bgClass, colorClass)}>
          <Icon className="h-5 w-5" />
        </div>
        <span className={cn("text-2xl font-bold", (isDanger || isWarning) ? colorClass : "")}>
          {value}
        </span>
      </div>
      <p className="text-sm font-medium mt-3 text-muted-foreground leading-tight">
        {label}
      </p>
    </div>
  )
}
