import { cn } from "@/lib/utils"

function Shimmer({ className }: { className?: string }) {
  return (
    <div className={cn("relative overflow-hidden bg-muted rounded-md", className)}>
      <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/60 to-transparent" />
    </div>
  )
}

export function LaporanListSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="space-y-2">
          <Shimmer className="h-7 w-44" />
          <Shimmer className="h-4 w-60" />
        </div>
        <div className="flex gap-2">
          <Shimmer className="h-9 w-28 rounded-lg" />
          <Shimmer className="h-9 w-32 rounded-lg" />
        </div>
      </div>

      {/* Filter bar */}
      <div className="flex gap-3">
        <Shimmer className="h-9 flex-1 max-w-sm rounded-lg" />
        <Shimmer className="h-9 w-32 rounded-lg" />
        <Shimmer className="h-9 w-28 rounded-lg" />
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="border border-border rounded-xl p-5 space-y-3">
            <div className="flex justify-between items-center">
              <Shimmer className="h-3.5 w-24" />
              <Shimmer className="h-8 w-8 rounded-lg" />
            </div>
            <Shimmer className="h-8 w-16" />
            <Shimmer className="h-3 w-28" />
          </div>
        ))}
      </div>

      {/* Chart placeholder */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {[...Array(2)].map((_, i) => (
          <div key={i} className="border border-border rounded-xl p-5 space-y-3">
            <div className="flex justify-between items-center">
              <Shimmer className="h-5 w-40" />
              <Shimmer className="h-8 w-28 rounded-full" />
            </div>
            <Shimmer className="h-[240px] w-full rounded-lg" />
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="border border-border rounded-xl overflow-hidden">
        <div className="bg-muted/50 px-5 py-3 flex gap-6 border-b border-border">
          {["w-16", "w-40", "w-24", "w-20", "w-20", "w-16"].map((w, i) => (
            <Shimmer key={i} className={`h-3.5 ${w}`} />
          ))}
        </div>
        {[...Array(7)].map((_, i) => (
          <div key={i} className="px-5 py-3.5 flex items-center gap-6 border-b border-border/50 last:border-0">
            <Shimmer className="h-4 w-16" />
            <Shimmer className="h-4 w-44" />
            <Shimmer className="h-4 w-24" />
            <Shimmer className="h-5 w-16 rounded-full ml-auto" />
            <Shimmer className="h-5 w-14 rounded-full" />
            <Shimmer className="h-8 w-8 rounded-md" />
          </div>
        ))}
      </div>
    </div>
  )
}

export function LaporanMahasiswaSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="space-y-2">
          <Shimmer className="h-7 w-52" />
          <Shimmer className="h-4 w-68" />
        </div>
        <Shimmer className="h-9 w-28 rounded-lg" />
      </div>

      {/* Student info card */}
      <div className="border border-border rounded-xl p-5 flex items-center gap-5">
        <Shimmer className="h-16 w-16 rounded-full shrink-0" />
        <div className="space-y-2 flex-1">
          <Shimmer className="h-5 w-48" />
          <Shimmer className="h-4 w-32" />
          <div className="flex gap-3">
            <Shimmer className="h-5 w-20 rounded-full" />
            <Shimmer className="h-5 w-24 rounded-full" />
          </div>
        </div>
        <div className="grid grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="text-center space-y-1">
              <Shimmer className="h-6 w-12 mx-auto" />
              <Shimmer className="h-3 w-16" />
            </div>
          ))}
        </div>
      </div>

      {/* Progress chart + breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 border border-border rounded-xl p-5 space-y-3">
          <Shimmer className="h-5 w-40" />
          <Shimmer className="h-[240px] w-full rounded-lg" />
        </div>
        <div className="border border-border rounded-xl p-5 space-y-3">
          <Shimmer className="h-5 w-32" />
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
              <div className="space-y-1">
                <Shimmer className="h-3.5 w-12" />
                <Shimmer className="h-3 w-32" />
              </div>
              <Shimmer className="h-5 w-12 rounded-full" />
            </div>
          ))}
        </div>
      </div>

      {/* Nilai table */}
      <div className="border border-border rounded-xl overflow-hidden">
        <div className="bg-muted/50 px-5 py-3 flex gap-6 border-b border-border">
          {["w-14", "w-48", "w-10", "w-10", "w-10", "w-14", "w-16"].map((w, i) => (
            <Shimmer key={i} className={`h-3.5 ${w}`} />
          ))}
        </div>
        {[...Array(6)].map((_, i) => (
          <div key={i} className="px-5 py-3.5 flex items-center gap-6 border-b border-border/50 last:border-0">
            <Shimmer className="h-4 w-14" />
            <Shimmer className="h-4 w-52" />
            <Shimmer className="h-4 w-10" />
            <Shimmer className="h-4 w-10" />
            <Shimmer className="h-4 w-10" />
            <Shimmer className="h-4 w-12 ml-auto" />
            <Shimmer className="h-5 w-12 rounded-full" />
          </div>
        ))}
      </div>
    </div>
  )
}
