import { cn } from "@/lib/utils"

function Shimmer({ className }: { className?: string }) {
  return (
    <div className={cn("relative overflow-hidden bg-muted rounded-md", className)}>
      <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/60 to-transparent" />
    </div>
  )
}

export function ImportSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <Shimmer className="h-7 w-44" />
        <Shimmer className="h-4 w-64" />
      </div>

      {/* Step indicator */}
      <div className="flex items-center gap-2">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="flex items-center gap-2">
            <Shimmer className="h-8 w-8 rounded-full" />
            <Shimmer className="h-4 w-20" />
            {i < 3 && <Shimmer className="h-1 w-12 rounded-full" />}
          </div>
        ))}
      </div>

      {/* Upload zone */}
      <div className="border-2 border-dashed border-border rounded-xl p-10 flex flex-col items-center gap-4">
        <Shimmer className="h-16 w-16 rounded-full" />
        <div className="space-y-2 text-center">
          <Shimmer className="h-5 w-48 mx-auto" />
          <Shimmer className="h-4 w-64 mx-auto" />
        </div>
        <Shimmer className="h-9 w-36 rounded-lg" />
      </div>

      {/* Template download */}
      <div className="border border-border rounded-xl p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Shimmer className="h-10 w-10 rounded-lg" />
          <div className="space-y-1">
            <Shimmer className="h-4 w-40" />
            <Shimmer className="h-3.5 w-28" />
          </div>
        </div>
        <Shimmer className="h-9 w-32 rounded-lg" />
      </div>
    </div>
  )
}
