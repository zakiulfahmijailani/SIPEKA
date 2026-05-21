"use client"

import { Sparkles, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { format } from "date-fns"
import { id } from "date-fns/locale"

interface Props {
  summary: string
  generatedAt: string
  onRegenerate: () => void
  isRegenerating: boolean
}

export function SummaryPanel({ summary, generatedAt, onRegenerate, isRegenerating }: Props) {
  return (
    <div className="bg-gradient-to-br from-indigo-50/50 via-white to-purple-50/50 dark:from-indigo-950/20 dark:via-background dark:to-purple-950/20 border rounded-xl overflow-hidden shadow-sm">
      <div className="p-5 border-b bg-white/50 dark:bg-background/50 backdrop-blur-sm flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded bg-indigo-100 text-indigo-600 dark:bg-indigo-900/50 dark:text-indigo-400">
            <Sparkles className="h-4 w-4" />
          </div>
          <h3 className="font-semibold text-lg">Ringkasan Analisis AI</h3>
          <span className="ml-2 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-black text-white dark:bg-white dark:text-black rounded-full">
            Claude
          </span>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={onRegenerate}
          disabled={isRegenerating}
          className="text-xs"
        >
          <RefreshCw className={`h-3.5 w-3.5 mr-2 ${isRegenerating ? "animate-spin" : ""}`} />
          {isRegenerating ? "Menganalisis..." : "Regenerate Analysis"}
        </Button>
      </div>
      
      <div className="p-6">
        <div className="prose prose-sm dark:prose-invert max-w-none space-y-4">
          {summary.split('\n').filter(p => p.trim() !== '').map((p, i) => (
            <p key={i} className="text-muted-foreground leading-relaxed">
              {p}
            </p>
          ))}
        </div>
      </div>
      
      <div className="px-6 py-3 bg-muted/30 border-t text-xs text-muted-foreground flex justify-between items-center">
        <span>Dianalisis pada {format(new Date(generatedAt), "d MMMM yyyy HH:mm", { locale: id })}</span>
      </div>
    </div>
  )
}
