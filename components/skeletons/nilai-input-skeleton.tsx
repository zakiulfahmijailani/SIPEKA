import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader } from "@/components/ui/card"

function StudentRowSkeleton() {
  return (
    <div className="grid grid-cols-[2rem_1fr_repeat(4,minmax(0,1fr))_6rem] items-center gap-3 px-4 py-3 border-b last:border-0">
      {/* No */}
      <Skeleton className="h-4 w-6" />
      {/* Nama */}
      <div className="space-y-1">
        <Skeleton className="h-4 w-36" />
        <Skeleton className="h-3 w-24" />
      </div>
      {/* Komponen nilai × 4 */}
      {Array.from({ length: 4 }).map((_, i) => (
        <Skeleton key={i} className="h-8 rounded-md" />
      ))}
      {/* Nilai akhir */}
      <Skeleton className="h-8 rounded-md" />
    </div>
  )
}

export function NilaiInputSkeleton() {
  return (
    <div className="space-y-6">
      {/* Selector dosir MK */}
      <Card className="border-none shadow-md">
        <CardHeader>
          <Skeleton className="h-5 w-48 mb-1" />
          <Skeleton className="h-3 w-72" />
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-9 w-40 rounded-md" />
          ))}
        </CardContent>
      </Card>

      {/* Tabel input nilai */}
      <Card className="border-none shadow-md">
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="space-y-1.5">
            <Skeleton className="h-5 w-56" />
            <Skeleton className="h-3 w-40" />
          </div>
          <Skeleton className="h-9 w-32 rounded-md" />
        </CardHeader>
        <CardContent className="p-0">
          {/* Header kolom */}
          <div className="grid grid-cols-[2rem_1fr_repeat(4,minmax(0,1fr))_6rem] gap-3 px-4 py-3 bg-muted/30 border-b">
            {["#", "Mahasiswa", "Tugas", "UTS", "UAS", "Partisipasi", "Nilai Akhir"].map((h) => (
              <Skeleton key={h} className="h-3 w-4/5" />
            ))}
          </div>
          {Array.from({ length: 8 }).map((_, i) => (
            <StudentRowSkeleton key={i} />
          ))}
        </CardContent>
      </Card>

      {/* Tombol simpan */}
      <div className="flex justify-end">
        <Skeleton className="h-10 w-32 rounded-md" />
      </div>
    </div>
  )
}
