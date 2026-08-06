"use client"

import Link from "next/link"
import { ArrowLeft, Printer } from "lucide-react"

import { Button } from "@/components/ui/button"

export function PrintToolbar({ backHref, label }: { backHref: string; label: string }) {
  return (
    <div className="no-print mb-6 flex items-center justify-between rounded-xl border bg-white p-3 shadow-sm">
      <Button render={<Link href={backHref} />} variant="ghost" className="gap-2">
        <ArrowLeft className="h-4 w-4" /> Kembali
      </Button>
      <Button onClick={() => window.print()} className="gap-2">
        <Printer className="h-4 w-4" /> Cetak {label}
      </Button>
    </div>
  )
}
