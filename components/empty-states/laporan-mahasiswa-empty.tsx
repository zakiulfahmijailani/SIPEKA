import { SearchX, FileBarChart2, UserSearch } from "lucide-react"
import { EmptyState } from "@/components/empty-states"

interface LaporanMahasiswaEmptyProps {
  hasFilter?: boolean
  searchQuery?: string
  onClearFilter?: () => void
}

export function LaporanMahasiswaEmpty({ hasFilter, searchQuery, onClearFilter }: LaporanMahasiswaEmptyProps) {
  // State: search aktif tapi tidak ada hasil
  if (searchQuery) {
    return (
      <EmptyState
        icon={SearchX}
        title={`Tidak ada hasil untuk "${searchQuery}"`}
        description="Coba kata kunci lain atau hapus filter pencarian."
        action={onClearFilter ? { label: "Hapus Pencarian", onClick: onClearFilter } : undefined}
      />
    )
  }

  // State: filter tahun/prodi aktif tapi tidak ada data
  if (hasFilter) {
    return (
      <EmptyState
        icon={UserSearch}
        title="Tidak ada data mahasiswa"
        description="Tidak ada data nilai mahasiswa untuk filter yang dipilih. Coba ubah tahun akademik atau program studi."
        action={onClearFilter ? { label: "Reset Filter", onClick: onClearFilter } : undefined}
      />
    )
  }

  // State: belum ada filter dipilih sama sekali
  return (
    <EmptyState
      icon={FileBarChart2}
      title="Pilih filter untuk memulai"
      description="Pilih tahun akademik dan program studi untuk menampilkan laporan rekap nilai mahasiswa."
    />
  )
}
