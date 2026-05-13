import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader } from "@/components/ui/card"

// KPI Cards row
function KpiCardSkeleton() {
  return (
    <Card className="border-none shadow-md overflow-hidden relative">
      <div className="absolute top-0 left-0 w-1 h-full bg-muted" />
      <CardHeader className="pb-2">
        <Skeleton className="h-3 w-24 mb-2" />
        <Skeleton className="h-9 w-16" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-4 w-36" />
      </CardContent>
    </Card>
  )
}

// Bar/Radar chart placeholder
function ChartCardSkeleton() {
  return (
    <Card className="border-none shadow-md">
      <CardHeader>
        <Skeleton className="h-5 w-48 mb-1" />
        <Skeleton className="h-3 w-64" />
      </CardHeader>
      <CardContent className="h-[300px] flex flex-col justify-end gap-2 px-4 pb-4">
        <div className="flex items-end gap-3 h-full">
          {[60, 85, 45, 70, 90, 55, 75].map((h, i) => (
            <Skeleton
              key={i}
              className="flex-1 rounded-t-md rounded-b-none"
              style={{ height: `${h}%` }}
            />
          ))}
        </div>
        <Skeleton className="h-3 w-full" />
      </CardContent>
    </Card>
  )
}

// RPS list rows
function RpsListSkeleton() {
  return (
    <Card className="lg:col-span-2 border-none shadow-md">
      <CardHeader className="flex flex-row items-center justify-between">
        <Skeleton className="h-5 w-48" />
        <Skeleton className="h-4 w-20" />
      </CardHeader>
      <CardContent className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex items-center justify-between p-3 border rounded-lg">
            <div className="flex gap-4 items-center">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="space-y-1.5">
                <Skeleton className="h-4 w-40" />
                <Skeleton className="h-3 w-56" />
              </div>
            </div>
            <Skeleton className="h-8 w-20 rounded-md" />
          </div>
        ))}
      </CardContent>
    </Card>
  )
}

// Recent activity feed
function ActivityFeedSkeleton() {
  return (
    <Card className="border-none shadow-md">
      <CardHeader>
        <Skeleton className="h-5 w-36" />
      </CardHeader>
      <CardContent className="space-y-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex gap-3">
            <div className="mt-1.5">
              <Skeleton className="h-2 w-2 rounded-full" />
            </div>
            <div className="space-y-1.5 flex-1">
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-4/5" />
              <Skeleton className="h-3 w-24" />
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}

// Dosen: dosir MK card
function DosenMkCardSkeleton() {
  return (
    <Card className="border-none shadow-md">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start mb-2">
          <Skeleton className="h-5 w-16 rounded-full" />
          <Skeleton className="h-5 w-5 rounded-full" />
        </div>
        <Skeleton className="h-6 w-48 mb-1" />
        <Skeleton className="h-3 w-32" />
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-1">
          <div className="flex justify-between">
            <Skeleton className="h-3 w-32" />
            <Skeleton className="h-3 w-8" />
          </div>
          <Skeleton className="h-1.5 w-full rounded-full" />
        </div>
        <div className="flex gap-2 pt-2">
          <Skeleton className="h-8 flex-1 rounded-md" />
          <Skeleton className="h-8 flex-1 rounded-md" />
        </div>
      </CardContent>
    </Card>
  )
}

// ─── EXPORTED SKELETONS ──────────────────────────────────────────────────────

export function AdminDashboardSkeleton() {
  return (
    <div className="space-y-8 pb-10">
      {/* KPI row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => <KpiCardSkeleton key={i} />)}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <ChartCardSkeleton />
        <ChartCardSkeleton />
      </div>

      {/* Bottom row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <RpsListSkeleton />
        <ActivityFeedSkeleton />
      </div>
    </div>
  )
}

export function DosenDashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 3 }).map((_, i) => <DosenMkCardSkeleton key={i} />)}
      </div>
    </div>
  )
}
