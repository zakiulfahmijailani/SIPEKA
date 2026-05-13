"use client"

import { Badge } from "@/components/ui/badge"

export function CplSection({ cpls }: { cpls: any[] }) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold">CPL yang Dibebankan</h2>
        <p className="text-sm text-muted-foreground">Capaian Pembelajaran Lulusan yang ditargetkan MK ini (berdasarkan Peta Kurikulum)</p>
      </div>

      <div className="space-y-4">
        {cpls.length > 0 ? (
          cpls.map((cpl) => (
            <div key={cpl.id} className="p-4 border rounded-lg hover:border-blue-200 transition-colors bg-white shadow-sm flex gap-4">
              <div className="flex flex-col items-center gap-1 w-16 pt-1">
                <Badge variant="outline" className="font-mono bg-blue-50 text-blue-700 border-blue-100">{cpl.kode}</Badge>
              </div>
              <div className="flex-1 space-y-1">
                <div className="flex items-center gap-2">
                   <Badge className="text-[9px] uppercase">{cpl.domain.replace(/_/g, ' ')}</Badge>
                </div>
                <p className="text-sm text-gray-700 leading-relaxed">{cpl.rumusan}</p>
              </div>
            </div>
          ))
        ) : (
          <div className="p-8 text-center border-2 border-dashed rounded-lg bg-gray-50 italic text-muted-foreground">
            Tidak ada CPL yang dipetakan ke mata kuliah ini.
          </div>
        )}
      </div>
    </div>
  )
}
