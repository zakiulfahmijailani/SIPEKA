"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { FileSpreadsheet, FileText, Loader2 } from "lucide-react"
import { exportCurriculumToExcel } from "@/app/actions/export-curriculum"
import { exportCurriculumPdf } from "@/app/actions/export-curriculum-pdf"

export function ExportButtons() {
  const [isExportingExcel, setIsExportingExcel] = useState(false)
  const [isExportingPdf, setIsExportingPdf] = useState(false)

  const handleExportExcel = async () => {
    try {
      setIsExportingExcel(true)
      const result = await exportCurriculumToExcel()
      if (result.success && result.data && result.filename) {
        const byteCharacters = atob(result.data)
        const byteNumbers = new Array(byteCharacters.length)
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i)
        }
        const byteArray = new Uint8Array(byteNumbers)
        const blob = new Blob([byteArray], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" })
        const url = URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = result.filename
        a.click()
        URL.revokeObjectURL(url)
      } else {
        alert(result.error || "Gagal mengekspor data.")
      }
    } catch (error) {
      console.error(error)
      alert("Terjadi kesalahan saat mengekspor Excel.")
    } finally {
      setIsExportingExcel(false)
    }
  }

  const handleExportPdf = async () => {
    try {
      setIsExportingPdf(true)
      const result = await exportCurriculumPdf()
      if (result.success && result.data && result.filename) {
        const byteCharacters = atob(result.data)
        const byteNumbers = new Array(byteCharacters.length)
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i)
        }
        const byteArray = new Uint8Array(byteNumbers)
        const blob = new Blob([byteArray], { type: "application/pdf" })
        const url = URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = result.filename
        a.click()
        URL.revokeObjectURL(url)
      } else {
        alert(result.error || "Gagal mengekspor data.")
      }
    } catch (error) {
      console.error(error)
      alert("Terjadi kesalahan saat mengekspor PDF.")
    } finally {
      setIsExportingPdf(false)
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button 
        variant="outline" 
        onClick={handleExportExcel} 
        disabled={isExportingExcel || isExportingPdf}
      >
        {isExportingExcel ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <FileSpreadsheet className="mr-2 h-4 w-4 text-emerald-600" />
        )}
        Export Excel (.xlsx)
      </Button>
      
      <Button 
        variant="outline" 
        onClick={handleExportPdf} 
        disabled={isExportingExcel || isExportingPdf}
      >
        {isExportingPdf ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <FileText className="mr-2 h-4 w-4 text-rose-600" />
        )}
        Export PDF
      </Button>
    </div>
  )
}
