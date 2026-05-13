import { cn } from "@/lib/utils"

function Shimmer({ className }: { className?: string }) {
  return (
    <div className={cn("relative overflow-hidden bg-muted rounded-md", className)}>
      <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/60 to-transparent" />
    </div>
  )
}

export function PengaturanSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <Shimmer className="h-7 w-36" />
        <Shimmer className="h-4 w-56" />
      </div>

      {/* Settings layout: sidebar + content */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Sidebar nav */}
        <div className="md:col-span-1 border border-border rounded-xl p-4 space-y-2 h-fit">
          {[...Array(5)].map((_, i) => (
            <Shimmer key={i} className="h-9 w-full rounded-lg" />
          ))}
        </div>

        {/* Content panel */}
        <div className="md:col-span-3 border border-border rounded-xl p-6 space-y-6">
          <div className="space-y-1.5">
            <Shimmer className="h-6 w-40" />
            <Shimmer className="h-4 w-64" />
          </div>
          <div className="space-y-5">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="space-y-2">
                <Shimmer className="h-3.5 w-28" />
                <Shimmer className="h-10 w-full rounded-md" />
              </div>
            ))}
          </div>
          <div className="flex justify-end gap-2 pt-2 border-t border-border">
            <Shimmer className="h-9 w-20 rounded-lg" />
            <Shimmer className="h-9 w-28 rounded-lg" />
          </div>
        </div>
      </div>
    </div>
  )
}
