import { FileX2, FolderOpen, ClipboardList, BarChart2, BookOpen, Users, PenSquare, SearchX, UserPlus } from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"

interface EmptyStateProps {
  icon?: React.ElementType
  title: string
  description: string
  action?: { label: string; href?: string; onClick?: () => void }
  secondaryAction?: { label: string; onClick?: () => void }
  className?: string
}

function EmptyState({ icon: Icon = FolderOpen, title, description, action, secondaryAction, className }: EmptyStateProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center py-16 px-6 text-center", className)}>
      <div className="h-12 w-12 rounded-xl bg-gray-50 flex items-center justify-center mb-4">
        <Icon className="h-5 w-5 text-gray-300" strokeWidth={1.5} />
      </div>
      <h3 className="text-sm font-semibold text-gray-700 mb-1.5">{title}</h3>
      <p className="text-sm text-gray-400 max-w-[30ch] leading-relaxed">{description}</p>
      <div className="flex gap-2 mt-6">
        {action && (
          action.href ? (
            <Link
              href={action.href}
              className={cn(buttonVariants({ variant: "outline", size: "sm" }), "gap-2")}
            >
              {action.label}
            </Link>
          ) : (
            <button
              onClick={action.onClick}
              className={cn(buttonVariants({ variant: "outline", size: "sm" }), "gap-2")}
            >
              {action.label}
            </button>
          )
        )}
        {secondaryAction && (
          <button
            onClick={secondaryAction.onClick}
            className={cn(buttonVariants({ variant: "default", size: "sm" }), "gap-2")}
          >
            {secondaryAction.label}
          </button>
        )}
      </div>
    </div>
  )
}

// ── Domain-specific empty states ──

export function RpsDosenEmpty() {
  return (
    <EmptyState
      icon={BookOpen}
      title="Belum ada mata kuliah"
      description="Kamu belum ditugaskan ke mata kuliah apapun di semester ini."
    />
  )
}

interface MahasiswaEmptyProps {
  hasFilter?: boolean
  searchQuery?: string
  onAdd?: () => void
  onImport?: () => void
  onClearSearch?: () => void
}

export function MahasiswaEmpty({ hasFilter, searchQuery, onAdd, onImport, onClearSearch }: MahasiswaEmptyProps) {
  // State: search aktif
  if (searchQuery) {
    return (
      <EmptyState
        icon={SearchX}
        title={`Tidak ada hasil untuk "${searchQuery}"`}
        description="Coba kata kunci lain atau hapus filter pencarian."
        action={onClearSearch ? { label: "Hapus Pencarian", onClick: onClearSearch } : undefined}
      />
    )
  }

  // State: filter aktif tapi tidak ada hasil
  if (hasFilter) {
    return (
      <EmptyState
        icon={SearchX}
        title="Tidak ada mahasiswa"
        description="Tidak ada mahasiswa yang sesuai dengan filter yang dipilih."
        action={onClearSearch ? { label: "Reset Filter", onClick: onClearSearch } : undefined}
      />
    )
  }

  // State: benar-benar kosong
  return (
    <EmptyState
      icon={Users}
      title="Belum ada mahasiswa"
      description="Mulai dengan menambahkan mahasiswa satu per satu atau import dari file CSV."
      action={onImport ? { label: "Import CSV", onClick: onImport } : undefined}
      secondaryAction={onAdd ? { label: "Tambah Mahasiswa", onClick: onAdd } : undefined}
    />
  )
}

export function NilaiEmpty({ onAction }: { onAction?: () => void }) {
  return (
    <EmptyState
      icon={PenSquare}
      title="Belum ada nilai"
      description="Input nilai mahasiswa untuk melihat rekap di sini."
      action={onAction ? { label: "Input Nilai", onClick: onAction } : { label: "Input Nilai", href: "/nilai/input" }}
    />
  )
}

export function LaporanEmpty() {
  return (
    <EmptyState
      icon={ClipboardList}
      title="Pilih filter untuk memulai"
      description="Pilih tahun akademik dan program studi untuk menampilkan laporan."
    />
  )
}

export function LaporanNoDataEmpty() {
  return (
    <EmptyState
      icon={BarChart2}
      title="Data belum tersedia"
      description="Belum ada data nilai yang cukup untuk menghitung ketercapaian CPL semester ini."
    />
  )
}

export function RpsListEmpty() {
  return (
    <EmptyState
      icon={FileX2}
      title="Tidak ada RPS"
      description="Belum ada RPS yang dibuat untuk semester ini."
    />
  )
}

export { EmptyState }

// ── Re-exports from sub-modules ──
export { IS2020NoCurriculumEmpty, IS2020NoMappingEmpty } from "./empty-states/is2020-empty"
export { LaporanMahasiswaEmpty } from "./empty-states/laporan-mahasiswa-empty"
