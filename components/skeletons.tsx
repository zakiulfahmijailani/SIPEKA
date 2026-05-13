import { cn } from "@/lib/utils"
import { CSSProperties } from "react"

// ── Base skeleton atom ── shimmer variant
function Skeleton({ className, style }: { className?: string; style?: CSSProperties }) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-md bg-gray-100",
        className
      )}
      style={style}
    >
      <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.5s_ease-in-out_infinite] bg-gradient-to-r from-transparent via-white/60 to-transparent" />
    </div>
  )
}

// ── KPI card skeleton ──
function KpiCardSkeleton() {
  return (
    <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm space-y-3">
      <div className="flex justify-between items-start">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-7 w-7 rounded-md" />
      </div>
      <Skeleton className="h-8 w-16" />
      <Skeleton className="h-3 w-20" />
    </div>
  )
}

// ── Chart area skeleton ──
function ChartSkeleton({ height = 200 }: { height?: number }) {
  return (
    <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
      <div className="space-y-2 mb-4">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-3 w-48" />
      </div>
      <Skeleton className="w-full rounded-lg" style={{ height }} />
    </div>
  )
}

// ── Table row skeleton ──
function TableRowSkeleton({ cols = 5, highlight = false }: { cols?: number; highlight?: boolean }) {
  return (
    <tr className={cn("border-b border-gray-50", highlight && "bg-gray-50/40")}>
      {/* chevron col */}
      <td className="px-4 py-3 w-8">
        <Skeleton className="h-4 w-4 rounded" />
      </td>
      {Array.from({ length: cols }).map((_, i) => (
        <td key={i} className="px-4 py-3">
          <Skeleton
            className={cn(
              "h-4",
              i === 0 ? "w-16" : i === 1 ? "w-full" : "w-12 mx-auto"
            )}
          />
        </td>
      ))}
    </tr>
  )
}

// ── Table skeleton (header + N rows) ──
function TableSkeleton({ rows = 5, cols = 5 }: { rows?: number; cols?: number }) {
  return (
    <div className="rounded-xl border border-gray-100 bg-white shadow-sm overflow-hidden">
      <div className="flex gap-4 px-4 py-3 bg-gray-50 border-b border-gray-100">
        {Array.from({ length: cols }).map((_, i) => (
          <Skeleton key={i} className={cn("h-3", i === 1 ? "flex-1" : "w-16")} />
        ))}
      </div>
      <table className="w-full">
        <tbody>
          {Array.from({ length: rows }).map((_, i) => (
            <TableRowSkeleton key={i} cols={cols} highlight={i % 2 === 1} />
          ))}
        </tbody>
      </table>
    </div>
  )
}

// ── Card list row skeleton (RPS list, aktivitas) ──
function CardRowSkeleton() {
  return (
    <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg border border-gray-100">
      <Skeleton className="h-7 w-7 rounded-md shrink-0" />
      <div className="flex-1 space-y-1.5">
        <Skeleton className="h-3.5 w-2/3" />
        <Skeleton className="h-3 w-1/3" />
      </div>
      <Skeleton className="h-7 w-16 rounded-md" />
    </div>
  )
}

// ── MK drill-down bar skeleton ──
function MkBarRowSkeleton() {
  return (
    <div className="flex items-center gap-3 px-4 py-2">
      <Skeleton className="h-3 w-[88px] shrink-0" />
      <Skeleton className="flex-1 h-2 rounded-full" />
      <Skeleton className="h-3 w-[42px] shrink-0" />
      <Skeleton className="h-3 w-[54px] shrink-0" />
    </div>
  )
}

// ── Dashboard skeleton (full page) ──
export function DashboardSkeleton() {
  return (
    <div className="space-y-5 pb-10">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {Array.from({ length: 4 }).map((_, i) => <KpiCardSkeleton key={i} />)}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <ChartSkeleton height={180} />
        <ChartSkeleton height={180} />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 rounded-xl border border-gray-100 bg-white p-5 shadow-sm space-y-2">
          <div className="flex justify-between mb-3">
            <Skeleton className="h-4 w-36" />
            <Skeleton className="h-3 w-16" />
          </div>
          {Array.from({ length: 3 }).map((_, i) => <CardRowSkeleton key={i} />)}
        </div>
        <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm space-y-4">
          <Skeleton className="h-4 w-24 mb-2" />
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex gap-3">
              <Skeleton className="mt-1 h-1.5 w-1.5 rounded-full shrink-0" />
              <div className="space-y-1 flex-1">
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ── CPL Attainment page skeleton ── (inline loading state inside client component)
export function CplAttainmentSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="space-y-2">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-72" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-8 w-28 rounded-md" />
          <Skeleton className="h-8 w-16 rounded-md" />
        </div>
      </div>

      {/* Filters bar */}
      <div className="flex gap-4 p-4 bg-white border border-gray-100 rounded-lg shadow-sm">
        <div className="space-y-1.5">
          <Skeleton className="h-2.5 w-24" />
          <Skeleton className="h-9 w-[200px] rounded-md" />
        </div>
        <div className="space-y-1.5">
          <Skeleton className="h-2.5 w-16" />
          <Skeleton className="h-9 w-[130px] rounded-md" />
        </div>
      </div>

      {/* Mini KPI tiles — 3 col, mirrors real layout */}
      <div className="grid grid-cols-3 gap-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="rounded-xl border border-gray-100 bg-white px-5 py-4 shadow-sm space-y-2">
            <Skeleton className="h-2.5 w-20" />
            <Skeleton className="h-8 w-14" />
            {i === 1 && <Skeleton className="h-2.5 w-16" />}
          </div>
        ))}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Radar placeholder */}
        <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
          <div className="space-y-1.5 mb-5">
            <Skeleton className="h-4 w-36" />
            <Skeleton className="h-3 w-52" />
          </div>
          {/* Radar shape suggestion */}
          <div className="flex items-center justify-center" style={{ height: 320 }}>
            <div className="relative w-48 h-48">
              {["w-48 h-48", "w-36 h-36", "w-24 h-24", "w-12 h-12"].map((s, i) => (
                <div
                  key={i}
                  className={cn(
                    "absolute inset-0 m-auto rounded-full border border-gray-100 bg-gray-50",
                    s
                  )}
                />
              ))}
              {/* spokes */}
              {[0, 60, 120, 180, 240, 300].map((deg) => (
                <div
                  key={deg}
                  className="absolute top-1/2 left-1/2 h-[1px] w-24 origin-left bg-gray-100"
                  style={{ transform: `rotate(${deg}deg)` }}
                />
              ))}
              <Skeleton className="absolute inset-[18px] rounded-full" />
            </div>
          </div>
        </div>

        {/* Horizontal bar placeholder */}
        <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
          <div className="space-y-1.5 mb-5">
            <Skeleton className="h-4 w-36" />
            <Skeleton className="h-3 w-52" />
          </div>
          <div className="space-y-3 py-4" style={{ height: 320 }}>
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <Skeleton className="h-3 w-12 shrink-0" />
                <Skeleton
                  className="h-5 rounded-r-sm"
                  style={{ width: `${[72, 55, 88, 40, 65, 78][i]}%` }}
                />
                <Skeleton className="h-3 w-8 shrink-0" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Table card */}
      <div className="rounded-xl border border-gray-100 bg-white shadow-sm overflow-hidden">
        {/* Table header text */}
        <div className="px-5 pt-5 pb-3 border-b border-gray-100 space-y-1.5">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-3 w-64" />
        </div>
        {/* Column headers */}
        <div className="flex items-center gap-3 px-4 py-3 bg-gray-50 border-b border-gray-100">
          <Skeleton className="h-3 w-4" />
          <Skeleton className="h-3 w-16" />
          <Skeleton className="flex-1 h-3" />
          <Skeleton className="h-3 w-16" />
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-3 w-14" />
        </div>
        {/* Rows */}
        <table className="w-full">
          <tbody>
            {Array.from({ length: 6 }).map((_, i) => (
              <TableRowSkeleton key={i} cols={5} highlight={i % 2 === 1} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ── Nilai/RPS list skeleton ──
export function ListPageSkeleton({ rows = 8, cols = 4 }: { rows?: number; cols?: number }) {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <Skeleton className="h-6 w-40" />
        <Skeleton className="h-9 w-28 rounded-md" />
      </div>
      <TableSkeleton rows={rows} cols={cols} />
    </div>
  )
}

export { Skeleton, KpiCardSkeleton, ChartSkeleton, TableSkeleton, CardRowSkeleton, MkBarRowSkeleton }
