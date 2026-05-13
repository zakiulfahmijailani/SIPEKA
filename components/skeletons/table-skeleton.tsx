import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader } from "@/components/ui/card"

interface TableSkeletonProps {
  /** Jumlah kolom tabel */
  cols?: number
  /** Jumlah baris data yang dirender sebagai skeleton */
  rows?: number
  /** Tampilkan header + tombol aksi di atas tabel */
  showHeader?: boolean
}

export function TableSkeleton({
  cols = 5,
  rows = 6,
  showHeader = true,
}: TableSkeletonProps) {
  return (
    <Card className="border-none shadow-md">
      {showHeader && (
        <CardHeader className="flex flex-row items-center justify-between gap-4 flex-wrap">
          <div className="space-y-1.5">
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-3 w-56" />
          </div>
          <div className="flex items-center gap-2">
            {/* Search input */}
            <Skeleton className="h-9 w-48 rounded-md" />
            {/* Add button */}
            <Skeleton className="h-9 w-28 rounded-md" />
          </div>
        </CardHeader>
      )}

      <CardContent className="p-0">
        <div className="overflow-hidden rounded-b-lg">
          {/* Table header row */}
          <div
            className="grid border-b bg-muted/30 px-4 py-3 gap-4"
            style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}
          >
            {Array.from({ length: cols }).map((_, i) => (
              <Skeleton key={i} className="h-3 w-3/4" />
            ))}
          </div>

          {/* Data rows */}
          {Array.from({ length: rows }).map((_, row) => (
            <div
              key={row}
              className="grid px-4 py-3 gap-4 border-b last:border-0 hover:bg-muted/20 transition-colors"
              style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}
            >
              {Array.from({ length: cols }).map((_, col) => (
                <Skeleton
                  key={col}
                  className="h-4"
                  // Variasikan lebar biar kelihatan lebih natural
                  style={{ width: `${55 + ((row * cols + col) % 4) * 12}%` }}
                />
              ))}
            </div>
          ))}
        </div>

        {/* Pagination placeholder */}
        <div className="flex items-center justify-between px-4 py-3 border-t">
          <Skeleton className="h-4 w-40" />
          <div className="flex gap-1">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-8 w-8 rounded-md" />
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
