import { cn } from "@/lib/utils"

function Shimmer({ className }: { className?: string }) {
  return (
    <div className={cn("relative overflow-hidden bg-muted rounded-md", className)}>
      <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/60 to-transparent" />
    </div>
  )
}

export function RpsListSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="space-y-2">
          <Shimmer className="h-7 w-36" />
          <Shimmer className="h-4 w-56" />
        </div>
        <Shimmer className="h-9 w-32 rounded-lg" />
      </div>

      {/* Filter bar */}
      <div className="flex gap-3">
        <Shimmer className="h-9 flex-1 max-w-sm rounded-lg" />
        <Shimmer className="h-9 w-36 rounded-lg" />
        <Shimmer className="h-9 w-28 rounded-lg" />
      </div>

      {/* Card list */}
      {[...Array(5)].map((_, i) => (
        <div key={i} className="border border-border rounded-xl p-5 flex items-center gap-5">
          <Shimmer className="h-12 w-12 rounded-lg shrink-0" />
          <div className="flex-1 space-y-2">
            <Shimmer className="h-5 w-64" />
            <div className="flex gap-4">
              <Shimmer className="h-3.5 w-24" />
              <Shimmer className="h-3.5 w-20" />
              <Shimmer className="h-3.5 w-28" />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Shimmer className="h-6 w-20 rounded-full" />
            <Shimmer className="h-8 w-8 rounded-md" />
            <Shimmer className="h-8 w-8 rounded-md" />
          </div>
        </div>
      ))}

      {/* Pagination */}
      <div className="flex justify-between items-center">
        <Shimmer className="h-4 w-36" />
        <div className="flex gap-1.5">
          {[...Array(4)].map((_, i) => (
            <Shimmer key={i} className="h-8 w-8 rounded-md" />
          ))}
        </div>
      </div>
    </div>
  )
}

export function RpsDetailSkeleton() {
  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2">
        <Shimmer className="h-4 w-14" />
        <Shimmer className="h-4 w-3" />
        <Shimmer className="h-4 w-48" />
      </div>

      {/* Header */}
      <div className="flex justify-between items-start">
        <div className="space-y-2">
          <Shimmer className="h-8 w-72" />
          <div className="flex gap-3">
            <Shimmer className="h-4 w-32" />
            <Shimmer className="h-4 w-24" />
          </div>
        </div>
        <div className="flex gap-2">
          <Shimmer className="h-9 w-28 rounded-lg" />
          <Shimmer className="h-9 w-24 rounded-lg" />
        </div>
      </div>

      {/* Mata kuliah info */}
      <div className="border border-border rounded-xl p-5">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="space-y-1.5">
              <Shimmer className="h-3.5 w-20" />
              <Shimmer className="h-5 w-28" />
            </div>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-border">
        {["Capaian", "Bahan Kajian", "Penilaian", "Rencana"].map((_, i) => (
          <Shimmer key={i} className="h-9 w-28 rounded-t-md" />
        ))}
      </div>

      {/* Pertemuan list */}
      {[...Array(6)].map((_, i) => (
        <div key={i} className="border border-border rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Shimmer className="h-8 w-8 rounded-lg" />
              <Shimmer className="h-5 w-32" />
            </div>
            <Shimmer className="h-6 w-20 rounded-full" />
          </div>
          <Shimmer className="h-3.5 w-full" />
          <Shimmer className="h-3.5 w-3/4" />
        </div>
      ))}
    </div>
  )
}
