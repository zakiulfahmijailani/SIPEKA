"use client"

import { EmptyState } from "@/components/ui/empty-state"
import { BarChart3, AlertCircle } from "lucide-react"

export function LaporanEmpty({
  onSelectFilter,
}: {
  onSelectFilter?: () => void
}) {
  return (
    <EmptyState
      icon={BarChart3}
      title="Pilih parameter laporan"
      description="Pilih program studi, tahun akademik, dan semester untuk menampilkan laporan ketercapaian CPL dan CPMK."
      action={onSelectFilter ? { label: "Atur Filter", onClick: onSelectFilter } : undefined}
    />
  )
}

export function LaporanNoDataEmpty() {
  return (
    <EmptyState
      icon={AlertCircle}
      title="Data belum tersedia"
      description="Belum ada data nilai yang cukup untuk menghasilkan laporan pada periode ini. Pastikan nilai sudah diinput terlebih dahulu."
    />
  )
}
