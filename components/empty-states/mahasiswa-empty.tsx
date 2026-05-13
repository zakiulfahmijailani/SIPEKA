"use client"

import { EmptyState, EmptySearchState } from "@/components/ui/empty-state"
import { Users } from "lucide-react"

interface MahasiswaEmptyProps {
  hasFilter: boolean
  searchQuery?: string
  onAdd: () => void
  onImport: () => void
  onClearSearch?: () => void
}

export function MahasiswaEmpty({
  hasFilter,
  searchQuery,
  onAdd,
  onImport,
  onClearSearch,
}: MahasiswaEmptyProps) {
  if (searchQuery && onClearSearch) {
    return (
      <EmptySearchState
        query={searchQuery}
        onClear={onClearSearch}
        className="col-span-full"
      />
    )
  }

  if (hasFilter) {
    return (
      <EmptyState
        icon={Users}
        title="Tidak ada mahasiswa yang cocok"
        description="Tidak ada mahasiswa yang sesuai dengan filter yang dipilih. Coba ubah filter angkatan atau status."
        action={{
          label: "Hapus Filter",
          onClick: onClearSearch ?? (() => {}),
        }}
      />
    )
  }

  return (
    <EmptyState
      icon={Users}
      title="Belum ada data mahasiswa"
      description="Mulai dengan menambahkan mahasiswa satu per satu atau import sekaligus dari file CSV."
      action={{ label: "Tambah Mahasiswa", onClick: onAdd }}
      secondaryAction={{ label: "Import dari CSV", onClick: onImport }}
    />
  )
}
