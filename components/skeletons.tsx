import { cn } from "@/lib/utils"

function ShimmerBlock({ className }: { className?: string }) {
  return (
    <div className={cn("relative overflow-hidden bg-gray-100 rounded-lg", className)}>
      <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/60 to-transparent" />
    </div>
  )
}

export function CplAttainmentSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="space-y-2">
          <ShimmerBlock className="h-6 w-48" />
          <ShimmerBlock className="h-4 w-64" />
        </div>
        <div className="flex gap-2">
          <ShimmerBlock className="h-9 w-28" />
          <ShimmerBlock className="h-9 w-16" />
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-4 p-4 border border-gray-100 rounded-lg">
        <div className="space-y-2">
          <ShimmerBlock className="h-3 w-24" />
          <ShimmerBlock className="h-9 w-[200px]" />
        </div>
        <div className="space-y-2">
          <ShimmerBlock className="h-3 w-16" />
          <ShimmerBlock className="h-9 w-[130px]" />
        </div>
      </div>

      {/* KPI tiles */}
      <div className="grid grid-cols-3 gap-3">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="border border-gray-100 rounded-lg px-5 py-4 space-y-2">
            <ShimmerBlock className="h-3 w-16" />
            <ShimmerBlock className="h-8 w-12" />
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="border border-gray-100 rounded-lg p-5 space-y-3">
          <div className="flex items-center gap-2">
            <ShimmerBlock className="h-4 w-4 rounded" />
            <ShimmerBlock className="h-4 w-32" />
          </div>
          <ShimmerBlock className="h-[280px] w-full" />
        </div>
        <div className="border border-gray-100 rounded-lg p-5 space-y-3">
          <div className="flex items-center gap-2">
            <ShimmerBlock className="h-4 w-4 rounded" />
            <ShimmerBlock className="h-4 w-40" />
          </div>
          <ShimmerBlock className="h-[280px] w-full" />
        </div>
      </div>

      {/* Table */}
      <div className="border border-gray-100 rounded-lg overflow-hidden">
        {/* Table header */}
        <div className="bg-gray-50 px-5 py-3 flex gap-4 border-b border-gray-100">
          <ShimmerBlock className="h-4 w-20" />
          <ShimmerBlock className="h-4 w-48" />
          <ShimmerBlock className="h-4 w-16 ml-auto" />
          <ShimmerBlock className="h-4 w-16" />
          <ShimmerBlock className="h-4 w-12" />
        </div>
        {/* Table rows */}
        {[...Array(6)].map((_, i) => (
          <div key={i} className="px-5 py-3.5 flex items-center gap-4 border-b border-gray-50">
            <ShimmerBlock className="h-4 w-4 rounded-sm" />
            <ShimmerBlock className="h-4 w-16" />
            <ShimmerBlock className="h-4 w-64" />
            <ShimmerBlock className="h-4 w-10 ml-auto" />
            <ShimmerBlock className="h-5 w-12" />
            <ShimmerBlock className="h-6 w-20 rounded-full" />
          </div>
        ))}
      </div>
    </div>
  )
}
