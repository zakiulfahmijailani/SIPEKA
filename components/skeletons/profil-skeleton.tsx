import { cn } from "@/lib/utils"

function Shimmer({ className }: { className?: string }) {
  return (
    <div className={cn("relative overflow-hidden bg-muted rounded-md", className)}>
      <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/60 to-transparent" />
    </div>
  )
}

export function ProfilSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <Shimmer className="h-7 w-32" />
        <Shimmer className="h-4 w-52" />
      </div>

      {/* Profile card */}
      <div className="border border-border rounded-xl p-6 flex items-start gap-6">
        <div className="relative">
          <Shimmer className="h-24 w-24 rounded-full" />
          <Shimmer className="h-7 w-7 rounded-full absolute bottom-0 right-0" />
        </div>
        <div className="flex-1 space-y-3">
          <Shimmer className="h-7 w-48" />
          <Shimmer className="h-4 w-36" />
          <Shimmer className="h-4 w-52" />
          <div className="flex gap-2 pt-1">
            <Shimmer className="h-6 w-24 rounded-full" />
            <Shimmer className="h-6 w-20 rounded-full" />
          </div>
        </div>
        <Shimmer className="h-9 w-28 rounded-lg" />
      </div>

      {/* Info sections */}
      {["Informasi Pribadi", "Informasi Akademik"].map((_, si) => (
        <div key={si} className="border border-border rounded-xl p-6 space-y-5">
          <div className="flex justify-between items-center pb-1">
            <Shimmer className="h-5 w-40" />
            <Shimmer className="h-8 w-20 rounded-lg" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-5">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="space-y-1.5">
                <Shimmer className="h-3.5 w-24" />
                <Shimmer className="h-5 w-40" />
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* Password change */}
      <div className="border border-border rounded-xl p-6 space-y-4">
        <Shimmer className="h-5 w-36" />
        {[...Array(3)].map((_, i) => (
          <div key={i} className="space-y-2">
            <Shimmer className="h-3.5 w-32" />
            <Shimmer className="h-10 w-full rounded-md" />
          </div>
        ))}
        <div className="flex justify-end">
          <Shimmer className="h-9 w-36 rounded-lg" />
        </div>
      </div>
    </div>
  )
}
