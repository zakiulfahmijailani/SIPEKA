import { BookMarked, GitMerge } from "lucide-react"
import { EmptyState } from "@/components/empty-states"

export function IS2020NoCurriculumEmpty() {
  return (
    <EmptyState
      icon={BookMarked}
      title="Data kurikulum belum tersedia"
      description="Belum ada mata kuliah yang terdaftar di kurikulum aktif. Tambahkan mata kuliah terlebih dahulu di menu Master."
      action={{ label: "Ke Master Kurikulum", href: "/kurikulum" }}
    />
  )
}

export function IS2020NoMappingEmpty() {
  return (
    <EmptyState
      icon={GitMerge}
      title="Pemetaan IS2020 belum ada"
      description="Belum ada Knowledge Area IS2020 yang dipetakan ke mata kuliah. Lengkapi RPS untuk memulai analisis cakupan kurikulum."
      action={{ label: "Ke Daftar RPS", href: "/rps" }}
    />
  )
}
