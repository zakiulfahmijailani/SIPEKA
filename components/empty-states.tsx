import { FileX2, FolderOpen, ClipboardList, BarChart2, BookOpen, Users, PenSquare } from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"

interface EmptyStateProps {
  icon?: React.ElementType
  title: string
  description: string
  action?: { label: string; href?: string; onClick?: () => void }
  className?: string
}

function EmptyState({ icon: Icon = FolderOpen, title, description, action, className }: EmptyStateProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center py-16 px-6 text-center", className)}>
      <div className="h-12 w-12 rounded-xl bg-gray-50 flex items-center justify-center mb-4">
        <Icon className="h-5 w-5 text-gray-300" strokeWidth={1.5} />
      </div>
      <h3 className="text-sm font-semibold text-gray-700 mb-1.5">{title}</h3>
      <p className="text-sm text-gray-400 max-w-[30ch] leading-relaxed">{description}</p>
      {action && (
        action.href ? (
          <Link
            href={action.href}
            className={cn(buttonVariants({ variant: "outline", size: "sm" }), "mt-6 gap-2")}
          >
            {action.label}
          </Link>
        ) : (
          <button
            onClick={action.onClick}
            className={cn(buttonVariants({ variant: "outline", size: "sm" }), "mt-6 gap-2")}
          >
            {action.label}
          </button>
        )
      )}
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

export function MahasiswaEmpty() {
  return (
    <EmptyState
      icon={Users}
      title="Belum ada mahasiswa"
      description="Belum ada mahasiswa yang terdaftar di kelas ini."
      action={{ label: "Import Mahasiswa", href: "/mahasiswa/import" }}
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
