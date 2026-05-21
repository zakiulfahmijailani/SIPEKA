"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Sparkles, Loader2 } from "lucide-react"
import { analyzeCurriculumGaps } from "@/app/actions/ai-gap-analysis"
import { ScoreGauge } from "./score-gauge"
import { IssuesStrip } from "./issues-strip"
import { SummaryPanel } from "./summary-panel"
import { RecommendationsList, Recommendation } from "./recommendations-list"
import { toast } from "sonner"

export function AiAnalysisClient() {
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisResult, setAnalysisResult] = useState<any>(null)

  const handleAnalyze = async () => {
    setIsAnalyzing(true)
    try {
      const result = await analyzeCurriculumGaps()
      if (result.success && result.analysis) {
        setAnalysisResult(result.analysis)
        toast.success("Analisis AI berhasil diselesaikan!")
      } else {
        toast.error(result.error || "Gagal melakukan analisis")
      }
    } catch (error) {
      toast.error("Terjadi kesalahan saat memproses analisis AI")
    } finally {
      setIsAnalyzing(false)
    }
  }

  if (isAnalyzing && !analysisResult) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
          <Loader2 className="h-10 w-10 animate-spin text-indigo-600 mb-6" />
          <h3 className="text-xl font-semibold mb-2">Sedang Menganalisis Kurikulum...</h3>
          <p className="text-muted-foreground max-w-md">
            Claude AI sedang mengevaluasi pemetaan CPL, distribusi SKS, dan keseimbangan beban mata kuliah Anda. Ini mungkin memakan waktu beberapa detik.
          </p>
        </div>
      </div>
    )
  }

  if (!analysisResult) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-4 text-center bg-card border rounded-xl shadow-sm">
        <div className="w-16 h-16 bg-indigo-50 dark:bg-indigo-950/50 rounded-2xl flex items-center justify-center mb-6">
          <Sparkles className="h-8 w-8 text-indigo-600 dark:text-indigo-400" />
        </div>
        <h3 className="text-xl font-bold mb-3">Mulai Analisis Cerdas</h3>
        <p className="text-muted-foreground max-w-lg mb-8">
          Manfaatkan kecerdasan buatan untuk mengidentifikasi gap, ketidakseimbangan beban, dan peluang perbaikan pada kurikulum Anda berdasarkan standar BAN-PT dan IABEE/OBE.
        </p>
        <Button size="lg" onClick={handleAnalyze} disabled={isAnalyzing} className="bg-indigo-600 hover:bg-indigo-700 text-white">
          {isAnalyzing ? (
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
          ) : (
            <Sparkles className="mr-2 h-5 w-5" />
          )}
          Jalankan Analisis AI
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 h-full">
          <ScoreGauge score={analysisResult.overallScore} />
        </div>
        <div className="lg:col-span-2 h-full">
          <IssuesStrip 
            orphanCpls={analysisResult.orphanCpls.length}
            overloadedCourses={analysisResult.overloadedCourses.length}
            underloadedSemesters={analysisResult.underloadedSemesters.length}
            overloadedSemesters={analysisResult.overloadedSemesters.length}
          />
        </div>
      </div>

      <SummaryPanel 
        summary={analysisResult.summary} 
        generatedAt={analysisResult.generatedAt} 
        onRegenerate={handleAnalyze}
        isRegenerating={isAnalyzing}
      />

      <div className="space-y-4 pt-4">
        <h3 className="text-xl font-semibold">Rekomendasi Perbaikan</h3>
        <RecommendationsList recommendations={analysisResult.recommendations} />
      </div>
    </div>
  )
}
