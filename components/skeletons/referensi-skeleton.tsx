import { cn } from "@/lib/utils"

function Shimmer({ className }: { className?: string }) {
  return (
    <div className={cn("relative overflow-hidden bg-muted rounded-md", className)}>
      <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/60 to-transparent" />
    </div>
  )
}

export function ReferensiSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="space-y-2">
          <Shimmer className="h-7 w-44" />
          <Shimmer className="h-4 w-60" />
        </div>
        <Shimmer className="h-9 w-32 rounded-lg" />
      </div>

      {/* Tabs (Skala, Bobot, dsb) */}
      <div className="flex gap-1 border-b border-border pb-0">
        {[...Array(4)].map((_, i) => (
          <Shimmer key={i} className="h-9 w-28 rounded-t-md" />
        ))}
      </div>

      {/* Table */}
      <div className="border border-border rounded-xl overflow-hidden">
        <div className="bg-muted/50 px-5 py-3 flex gap-6 border-b border-border">
          {["w-12", "w-32", "w-24", "w-48", "w-20"].map((w, i) => (
            <Shimmer key={i} className={`h-3.5 ${w}`} />
          ))}
        </div>
        {[...Array(6)].map((_, i) => (
          <div key={i} className="px-5 py-3.5 flex items-center gap-6 border-b border-border/50 last:border-0">
            <Shimmer className="h-4 w-12" />
            <Shimmer className="h-4 w-32" />
            <Shimmer className="h-4 w-20" />
            <Shimmer className="h-4 w-52" />
            <div className="flex gap-2 ml-auto">
              <Shimmer className="h-8 w-8 rounded-md" />
              <Shimmer className="h-8 w-8 rounded-md" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
