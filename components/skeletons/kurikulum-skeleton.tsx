import { cn } from "@/lib/utils"

function Shimmer({ className }: { className?: string }) {
  return (
    <div className={cn("relative overflow-hidden bg-muted rounded-md", className)}>
      <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/60 to-transparent" />
    </div>
  )
}

export function KurikulumListSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="space-y-2">
          <Shimmer className="h-7 w-40" />
          <Shimmer className="h-4 w-56" />
        </div>
        <Shimmer className="h-9 w-36 rounded-lg" />
      </div>

      {/* Search + filter bar */}
      <div className="flex gap-3">
        <Shimmer className="h-9 flex-1 max-w-xs rounded-lg" />
        <Shimmer className="h-9 w-28 rounded-lg" />
      </div>

      {/* Card grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="border border-border rounded-xl p-5 space-y-3">
            <div className="flex items-start justify-between">
              <div className="space-y-1.5">
                <Shimmer className="h-5 w-36" />
                <Shimmer className="h-3.5 w-24" />
              </div>
              <Shimmer className="h-6 w-16 rounded-full" />
            </div>
            <Shimmer className="h-3 w-full" />
            <Shimmer className="h-3 w-4/5" />
            <div className="flex gap-2 pt-1">
              <Shimmer className="h-5 w-14 rounded-full" />
              <Shimmer className="h-5 w-18 rounded-full" />
            </div>
            <div className="flex justify-between pt-2 border-t border-border">
              <Shimmer className="h-4 w-20" />
              <Shimmer className="h-4 w-16" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export function KurikulumDetailSkeleton() {
  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2">
        <Shimmer className="h-4 w-20" />
        <Shimmer className="h-4 w-3" />
        <Shimmer className="h-4 w-32" />
      </div>

      {/* Header */}
      <div className="flex justify-between items-start">
        <div className="space-y-2">
          <Shimmer className="h-8 w-64" />
          <Shimmer className="h-4 w-48" />
        </div>
        <div className="flex gap-2">
          <Shimmer className="h-9 w-24 rounded-lg" />
          <Shimmer className="h-9 w-20 rounded-lg" />
        </div>
      </div>

      {/* Info card */}
      <div className="border border-border rounded-xl p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="space-y-1.5">
              <Shimmer className="h-3.5 w-24" />
              <Shimmer className="h-5 w-32" />
            </div>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-border pb-0">
        {[...Array(4)].map((_, i) => (
          <Shimmer key={i} className="h-9 w-24 rounded-t-md" />
        ))}
      </div>

      {/* CPL table */}
      <div className="border border-border rounded-xl overflow-hidden">
        <div className="bg-muted/50 px-5 py-3 flex gap-6 border-b border-border">
          {["w-16", "w-64", "w-20", "w-20"].map((w, i) => (
            <Shimmer key={i} className={`h-3.5 ${w}`} />
          ))}
        </div>
        {[...Array(5)].map((_, i) => (
          <div key={i} className="px-5 py-3.5 flex items-center gap-6 border-b border-border/50 last:border-0">
            <Shimmer className="h-4 w-14" />
            <Shimmer className="h-4 w-72" />
            <Shimmer className="h-5 w-16 rounded-full ml-auto" />
            <Shimmer className="h-8 w-8 rounded-md" />
          </div>
        ))}
      </div>
    </div>
  )
}
