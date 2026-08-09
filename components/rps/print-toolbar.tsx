"use client"

import Link from "next/link"
import { ArrowLeft, Download, FileText, Printer } from "lucide-react"

import { Button } from "@/components/ui/button"

export function PrintToolbar({ backHref, label, documentType, dosirId }: { backHref: string; label: string; documentType?: "rps" | "rtm" | "rpm"; dosirId?: string }) {
  return (
    <div className="no-print mb-6 flex items-center justify-between rounded-xl border bg-white p-3 shadow-sm">
      <Button render={<Link href={backHref} />} variant="ghost" className="gap-2">
        <ArrowLeft className="h-4 w-4" /> Kembali
      </Button>
      <div className="flex items-center gap-2">
        {documentType && dosirId && <>
          <Button render={<a href={`/api/export/${documentType}/${dosirId}?format=docx`} />} variant="outline" className="gap-2"><FileText className="h-4 w-4" /> Unduh DOCX</Button>
          <Button render={<a href={`/api/export/${documentType}/${dosirId}?format=pdf`} />} variant="outline" className="gap-2"><Download className="h-4 w-4" /> Unduh PDF</Button>
        </>}
        <Button onClick={() => window.print()} className="gap-2"><Printer className="h-4 w-4" /> Cetak {label}</Button>
      </div>
    </div>
  )
}
