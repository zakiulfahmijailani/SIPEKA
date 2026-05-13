import { cn } from "@/lib/utils"

function Shimmer({ className }: { className?: string }) {
  return (
    <div className={cn("relative overflow-hidden bg-muted rounded-md", className)}>
      <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/60 to-transparent" />
    </div>
  )
}

export function MahasiswaListSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="space-y-2">
          <Shimmer className="h-7 w-40" />
          <Shimmer className="h-4 w-56" />
        </div>
        <div className="flex gap-2">
          <Shimmer className="h-9 w-28 rounded-lg" />
          <Shimmer className="h-9 w-32 rounded-lg" />
        </div>
      </div>

      {/* Search + filter */}
      <div className="flex gap-3">
        <Shimmer className="h-9 flex-1 max-w-sm rounded-lg" />
        <Shimmer className="h-9 w-36 rounded-lg" />
        <Shimmer className="h-9 w-28 rounded-lg" />
      </div>

      {/* Table */}
      <div className="border border-border rounded-xl overflow-hidden">
        <div className="bg-muted/50 px-5 py-3 flex gap-6 border-b border-border">
          {["w-8", "w-24", "w-48", "w-32", "w-24", "w-20", "w-16"].map((w, i) => (
            <Shimmer key={i} className={`h-3.5 ${w}`} />
          ))}
        </div>
        {[...Array(10)].map((_, i) => (
          <div key={i} className="px-5 py-3.5 flex items-center gap-6 border-b border-border/50 last:border-0">
            <Shimmer className="h-4 w-4 rounded-sm" />
            <Shimmer className="h-4 w-24" />
            <Shimmer className="h-4 w-52" />
            <Shimmer className="h-4 w-32" />
            <Shimmer className="h-4 w-24" />
            <Shimmer className="h-5 w-16 rounded-full ml-auto" />
            <Shimmer className="h-8 w-20 rounded-md" />
          </div>
        ))}
      </div>

      {/* Pagination */}
      <div className="flex justify-between items-center">
        <Shimmer className="h-4 w-40" />
        <div className="flex gap-1.5">
          {[...Array(5)].map((_, i) => (
            <Shimmer key={i} className="h-8 w-8 rounded-md" />
          ))}
        </div>
      </div>
    </div>
  )
}

export function MahasiswaDetailSkeleton() {
  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2">
        <Shimmer className="h-4 w-20" />
        <Shimmer className="h-4 w-3" />
        <Shimmer className="h-4 w-32" />
      </div>

      {/* Profile header */}
      <div className="border border-border rounded-xl p-6 flex items-start gap-6">
        <Shimmer className="h-20 w-20 rounded-full shrink-0" />
        <div className="flex-1 space-y-2">
          <Shimmer className="h-7 w-56" />
          <Shimmer className="h-4 w-28" />
          <div className="flex gap-2 pt-1">
            <Shimmer className="h-6 w-20 rounded-full" />
            <Shimmer className="h-6 w-24 rounded-full" />
          </div>
        </div>
        <div className="flex gap-2">
          <Shimmer className="h-9 w-24 rounded-lg" />
          <Shimmer className="h-9 w-20 rounded-lg" />
        </div>
      </div>

      {/* Detail grid */}
      <div className="border border-border rounded-xl p-6">
        <Shimmer className="h-5 w-32 mb-5" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-5">
          {[...Array(9)].map((_, i) => (
            <div key={i} className="space-y-1.5">
              <Shimmer className="h-3.5 w-24" />
              <Shimmer className="h-5 w-36" />
            </div>
          ))}
        </div>
      </div>

      {/* Nilai summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="border border-border rounded-xl p-4 space-y-2">
            <Shimmer className="h-3.5 w-20" />
            <Shimmer className="h-7 w-14" />
          </div>
        ))}
      </div>

      {/* Transkrip table */}
      <div className="border border-border rounded-xl overflow-hidden">
        <div className="bg-muted/50 px-5 py-3 flex gap-6 border-b border-border">
          {["w-16", "w-48", "w-6", "w-10", "w-10", "w-10", "w-14"].map((w, i) => (
            <Shimmer key={i} className={`h-3.5 ${w}`} />
          ))}
        </div>
        {[...Array(8)].map((_, i) => (
          <div key={i} className="px-5 py-3.5 flex items-center gap-6 border-b border-border/50 last:border-0">
            <Shimmer className="h-4 w-16" />
            <Shimmer className="h-4 w-52" />
            <Shimmer className="h-4 w-6" />
            <Shimmer className="h-4 w-10" />
            <Shimmer className="h-4 w-10" />
            <Shimmer className="h-4 w-10" />
            <Shimmer className="h-5 w-12 rounded-full ml-auto" />
          </div>
        ))}
      </div>
    </div>
  )
}
