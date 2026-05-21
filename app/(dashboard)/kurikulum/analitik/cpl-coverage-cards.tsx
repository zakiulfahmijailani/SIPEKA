"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface CplCoverageCardsProps {
  cpls: {
    code: string
    description: string
    category: string
    supportingCourses: number
    totalSks: number
    coveragePercent: number
  }[]
}

export function CplCoverageCards({ cpls }: CplCoverageCardsProps) {
  const getStatusClasses = (count: number) => {
    if (count >= 3) return "text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-900"
    if (count >= 1) return "text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-900"
    return "text-rose-700 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/30 border-rose-200 dark:border-rose-900"
  }

  const getProgressColor = (count: number) => {
    if (count >= 3) return "bg-emerald-500"
    if (count >= 1) return "bg-amber-500"
    return "bg-rose-500"
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {cpls.map((cpl) => (
        <Card key={cpl.code} className={`border transition-colors ${getStatusClasses(cpl.supportingCourses)}`}>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-bold">{cpl.code}</CardTitle>
              <Badge variant="outline" className="bg-background/50 backdrop-blur-sm">
                {cpl.category}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm line-clamp-3 opacity-90" title={cpl.description}>
              {cpl.description}
            </p>
            
            <div className="space-y-3">
              <div className="flex justify-between text-sm font-medium">
                <span>MK Pendukung</span>
                <span>{cpl.supportingCourses} MK</span>
              </div>
              
              <div className="flex justify-between text-sm font-medium">
                <span>Total SKS</span>
                <span>{cpl.totalSks} SKS</span>
              </div>
              
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-medium mb-1">
                  <span>Intensitas Cakupan</span>
                  <span>{Math.round(cpl.coveragePercent)}%</span>
                </div>
                <div className="w-full bg-background/50 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${getProgressColor(cpl.supportingCourses)} transition-all`} 
                    style={{ width: `${Math.min(cpl.coveragePercent, 100)}%` }} 
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
