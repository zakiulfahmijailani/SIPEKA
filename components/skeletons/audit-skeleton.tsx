import { cn } from "@/lib/utils"

function Shimmer({ className }: { className?: string }) {
  return (
    <div className={cn("relative overflow-hidden bg-muted rounded-md", className)}>
      <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/60 to-transparent" />
    </div>
  )
}

export function AuditSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="space-y-2">
          <Shimmer className="h-7 w-36" />
          <Shimmer className="h-4 w-56" />
        </div>
        <Shimmer className="h-9 w-28 rounded-lg" />
      </div>

      {/* Filter bar */}
      <div className="flex gap-3 flex-wrap">
        <Shimmer className="h-9 flex-1 min-w-48 max-w-xs rounded-lg" />
        <Shimmer className="h-9 w-36 rounded-lg" />
        <Shimmer className="h-9 w-36 rounded-lg" />
        <Shimmer className="h-9 w-28 rounded-lg" />
      </div>

      {/* Timeline / log list */}
      <div className="space-y-1">
        {[...Array(10)].map((_, i) => (
          <div key={i} className="flex items-start gap-4 px-5 py-4 border border-border rounded-xl">
            <Shimmer className="h-8 w-8 rounded-full shrink-0 mt-0.5" />
            <div className="flex-1 space-y-2">
              <div className="flex items-center justify-between">
                <Shimmer className="h-4 w-64" />
                <Shimmer className="h-3.5 w-32" />
              </div>
              <div className="flex gap-3">
                <Shimmer className="h-3.5 w-28" />
                <Shimmer className="h-3.5 w-20" />
                <Shimmer className="h-5 w-16 rounded-full" />
              </div>
            </div>
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
