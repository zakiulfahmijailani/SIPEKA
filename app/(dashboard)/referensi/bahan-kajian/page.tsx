import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  CURRICULUM_2026_BAHAN_KAJIAN,
  CURRICULUM_2026_BK_TO_CPL,
  CURRICULUM_2026_BK_TO_MK,
} from "@/db/curriculum-2026-reference"

export default function ReferensiBahanKajianPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Bahan Kajian Kurikulum 2026</h1>
        <p className="text-muted-foreground">
          Daftar 17 bahan kajian terbaru berdasarkan Simulasi SIF1 R2.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        {CURRICULUM_2026_BAHAN_KAJIAN.map((bk) => {
          const cplCodes = CURRICULUM_2026_BK_TO_CPL[bk.kode] ?? []
          const mkCodes = CURRICULUM_2026_BK_TO_MK[bk.kode] ?? []

          return (
            <Card key={bk.kode} className="border-t-4 border-t-blue-600">
              <CardHeader className="pb-3">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <p className="text-sm font-semibold text-blue-600">{bk.kode}</p>
                    <CardTitle className="mt-1 text-lg">{bk.nama}</CardTitle>
                  </div>
                  <Badge variant={bk.kompetensi === "Utama" ? "default" : "outline"}>
                    {bk.kompetensi}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm leading-relaxed text-muted-foreground">{bk.deskripsi}</p>

                <div className="space-y-2">
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    CPL terkait
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {cplCodes.map((kode) => (
                      <Badge key={kode} variant="secondary">{kode}</Badge>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Mata kuliah ({mkCodes.length})
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {mkCodes.map((kode) => (
                      <Badge key={kode} variant="outline">{kode}</Badge>
                    ))}
                  </div>
                </div>

                <p className="border-t pt-3 text-xs text-muted-foreground">
                  Referensi: {bk.referensi.join(" · ")}
                </p>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}

