import { cn } from "@/lib/utils"

function Shimmer({ className }: { className?: string }) {
  return (
    <div className={cn("relative overflow-hidden bg-muted rounded-md", className)}>
      <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/60 to-transparent" />
    </div>
  )
}

/** Generic master-data list skeleton (Mata Kuliah, Dosen, Program Studi, dsb) */
export function MasterListSkeleton({
  colWidths = ["w-8", "w-20", "w-56", "w-28", "w-24", "w-16"],
  rows = 8,
}: {
  colWidths?: string[]
  rows?: number
}) {
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

      {/* Search */}
      <div className="flex gap-3">
        <Shimmer className="h-9 flex-1 max-w-sm rounded-lg" />
        <Shimmer className="h-9 w-28 rounded-lg" />
      </div>

      {/* Table */}
      <div className="border border-border rounded-xl overflow-hidden">
        <div className="bg-muted/50 px-5 py-3 flex gap-6 border-b border-border">
          {colWidths.map((w, i) => (
            <Shimmer key={i} className={`h-3.5 ${w}`} />
          ))}
        </div>
        {[...Array(rows)].map((_, i) => (
          <div key={i} className="px-5 py-3.5 flex items-center gap-6 border-b border-border/50 last:border-0">
            {colWidths.map((w, j) => (
              <Shimmer key={j} className={`h-4 ${w}`} />
            ))}
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
