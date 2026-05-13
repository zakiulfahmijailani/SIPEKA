import { cn } from "@/lib/utils"

// --------------------------------------
// Primitive
// --------------------------------------
function ShimmerBlock({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <div className={cn("relative overflow-hidden bg-gray-100 rounded-lg", className)} style={style}>
      <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/60 to-transparent" />
    </div>
  )
}

// --------------------------------------
// CPL Attainment Skeleton
// --------------------------------------
export function CplAttainmentSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="space-y-2">
          <ShimmerBlock className="h-7 w-48" />
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
        <div className="bg-gray-50 px-5 py-3 flex gap-4 border-b border-gray-100">
          <ShimmerBlock className="h-4 w-20" />
          <ShimmerBlock className="h-4 w-48" />
          <ShimmerBlock className="h-4 w-16 ml-auto" />
          <ShimmerBlock className="h-4 w-16" />
          <ShimmerBlock className="h-4 w-12" />
        </div>
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

// --------------------------------------
// Dashboard Skeleton
// --------------------------------------
export function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      {/* Page title */}
      <div className="space-y-2">
        <ShimmerBlock className="h-7 w-48" />
        <ShimmerBlock className="h-4 w-72" />
      </div>

      {/* Stat cards row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="border border-gray-100 rounded-xl p-5 space-y-3">
            <div className="flex justify-between items-center">
              <ShimmerBlock className="h-3 w-24" />
              <ShimmerBlock className="h-8 w-8 rounded-lg" />
            </div>
            <ShimmerBlock className="h-8 w-20" />
            <ShimmerBlock className="h-3 w-32" />
          </div>
        ))}
      </div>

      {/* Main content grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Large chart */}
        <div className="lg:col-span-2 border border-gray-100 rounded-xl p-5 space-y-3">
          <div className="flex justify-between items-center">
            <ShimmerBlock className="h-5 w-40" />
            <ShimmerBlock className="h-8 w-32 rounded-full" />
          </div>
          <ShimmerBlock className="h-[300px] w-full" />
        </div>

        {/* Side list */}
        <div className="border border-gray-100 rounded-xl p-5 space-y-4">
          <ShimmerBlock className="h-5 w-32" />
          {[...Array(6)].map((_, i) => (
            <div key={i} className="flex items-center gap-3 py-3.5 border-b border-gray-50 last:border-0">
              <ShimmerBlock className="h-9 w-9 rounded-full shrink-0" />
              <div className="flex-1 space-y-1">
                <ShimmerBlock className="h-3.5 w-32" />
                <ShimmerBlock className="h-3 w-20" />
              </div>
              <ShimmerBlock className="h-5 w-12" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// --------------------------------------
// Table Skeleton
// --------------------------------------
export function TableSkeleton({
  cols = 4,
  rows = 6,
}: {
  cols?: number
  rows?: number
}) {
  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex justify-between items-center">
        <div className="space-y-1.5">
          <ShimmerBlock className="h-6 w-40" />
          <ShimmerBlock className="h-4 w-56" />
        </div>
        <div className="flex gap-2">
          <ShimmerBlock className="h-9 w-32 rounded-lg" />
          <ShimmerBlock className="h-9 w-28 rounded-lg" />
        </div>
      </div>

      {/* Table */}
      <div className="border border-gray-100 rounded-xl overflow-hidden">
        {/* Header */}
        <div
          className="bg-gray-50 px-5 py-3.5 grid gap-4 border-b border-gray-100"
          style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}
        >
          {[...Array(cols)].map((_, i) => (
            <ShimmerBlock key={i} className="h-3.5" style={{ width: `${50 + (i % 3) * 20}px` }} />
          ))}
        </div>
        {[...Array(rows)].map((_, i) => (
          <div
            key={i}
            className="px-5 py-3.5 grid gap-4 items-center border-b border-gray-50 last:border-0"
            style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}
          >
            {[...Array(cols)].map((_, j) => (
              <ShimmerBlock key={j} className="h-4" style={{ width: `${40 + (j % 4) * 15}px` }} />
            ))}
          </div>
        ))}
      </div>

      {/* Pagination */}
      <div className="flex justify-between items-center">
        <ShimmerBlock className="h-4 w-32" />
        <div className="flex gap-2">
          {[...Array(4)].map((_, i) => (
            <ShimmerBlock key={i} className="h-8 w-8 rounded-md" />
          ))}
        </div>
      </div>
    </div>
  )
}

// --------------------------------------
// List Page Skeleton
// --------------------------------------
export function ListPageSkeleton() {
  return <TableSkeleton cols={4} rows={8} />
}

// --------------------------------------
// Form Page Skeleton
// --------------------------------------
export function FormPageSkeleton() {
  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="space-y-2">
        <ShimmerBlock className="h-6 w-40" />
        <ShimmerBlock className="h-4 w-64" />
      </div>

      {/* Form card */}
      <div className="border border-gray-100 rounded-xl p-6 space-y-5">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="space-y-2">
            <ShimmerBlock className="h-3.5 w-24" />
            <ShimmerBlock className="h-10 w-full rounded-md" />
          </div>
        ))}
        <div className="flex justify-end gap-2 pt-2">
          <ShimmerBlock className="h-10 w-24 rounded-lg" />
          <ShimmerBlock className="h-10 w-28 rounded-lg" />
        </div>
      </div>
    </div>
  )
}

// --------------------------------------
// Detail Page Skeleton
// --------------------------------------
export function DetailPageSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div className="space-y-2">
          <ShimmerBlock className="h-7 w-56" />
          <ShimmerBlock className="h-4 w-80" />
        </div>
        <div className="flex gap-2">
          <ShimmerBlock className="h-9 w-24 rounded-lg" />
          <ShimmerBlock className="h-9 w-20 rounded-lg" />
        </div>
      </div>

      {/* Detail card */}
      <div className="border border-gray-100 rounded-xl p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-5">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="space-y-1.5">
              <ShimmerBlock className="h-3.5 w-24" />
              <ShimmerBlock className="h-5" style={{ width: `${60 + (i % 3) * 30}px` }} />
            </div>
          ))}
        </div>
      </div>

      {/* Related table */}
      <TableSkeleton cols={3} rows={5} />
    </div>
  )
}

// --------------------------------------
// Card Grid Skeleton
// --------------------------------------
export function CardGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <ShimmerBlock className="h-6 w-48" />
        <ShimmerBlock className="h-9 w-32 rounded-lg" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(count)].map((_, i) => (
          <div key={i} className="border border-gray-100 rounded-xl p-5 space-y-3">
            <div className="flex items-center gap-3 mb-3">
              <ShimmerBlock className="h-10 w-10 rounded-lg shrink-0" />
              <div className="space-y-1">
                <ShimmerBlock className="h-4.5 w-32" />
                <ShimmerBlock className="h-3.5 w-20" />
              </div>
            </div>
            <ShimmerBlock className="h-3 w-full" />
            <ShimmerBlock className="h-3 w-3/4" />
            <div className="flex gap-2 pt-1">
              <ShimmerBlock className="h-5 w-16 rounded-full" />
              <ShimmerBlock className="h-5 w-12 rounded-full" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// --------------------------------------
// Stat Card Skeleton
// --------------------------------------
export function StatCardSkeleton() {
  return (
    <div className="border border-gray-100 rounded-xl p-5 space-y-3">
      <div className="flex justify-between items-center">
        <ShimmerBlock className="h-3.5 w-28" />
        <ShimmerBlock className="h-8 w-8 rounded-lg" />
      </div>
      <ShimmerBlock className="h-8 w-20" />
      <ShimmerBlock className="h-3 w-36" />
    </div>
  )
}
