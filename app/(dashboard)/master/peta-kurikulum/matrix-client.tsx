"use client"

import { useState } from "react"
import { togglePetaKurikulum } from "./actions"
import { toast } from "sonner"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export function MatrixClient({ 
  mks, 
  cpls, 
  initialMappings, 
  role 
}: { 
  mks: any[], 
  cpls: any[], 
  initialMappings: Record<string, boolean>,
  role: string
}) {
  // Use optimistic state for instant UI response
  const [mappings, setMappings] = useState<Record<string, boolean>>(initialMappings)
  const canEdit = role === "SUPER_ADMIN" || role === "KAPRODI"

  const getMappingKey = (mkId: string, cplId: string) => `${mkId}_${cplId}`

  const handleToggle = async (mkId: string, cplId: string) => {
    if (!canEdit) return

    const key = getMappingKey(mkId, cplId)
    const currentVal = mappings[key]
    
    // Optimistic update
    setMappings(prev => ({
      ...prev,
      [key]: !currentVal
    }))

    try {
      const res = await togglePetaKurikulum(mkId, cplId)
      if (!res.success) {
        // Revert on error
        setMappings(prev => ({
          ...prev,
          [key]: currentVal
        }))
        toast.error(res.error)
      } else {
        toast.success(res.isAdded ? "Pemetaan ditambahkan" : "Pemetaan dihapus", {
          duration: 1500
        })
      }
    } catch (e) {
      // Revert on error
      setMappings(prev => ({
        ...prev,
        [key]: currentVal
      }))
      toast.error("Terjadi kesalahan")
    }
  }

  const getDomainColor = (domain: string) => {
    switch (domain) {
      case "SIKAP": return "bg-blue-500"
      case "PENGETAHUAN": return "bg-green-500"
      case "KETERAMPILAN_UMUM": return "bg-orange-500"
      case "KETERAMPILAN_KHUSUS": return "bg-purple-500"
      default: return "bg-gray-500"
    }
  }

  const renderMatrix = (filteredMks: any[]) => {
    // Calculate column totals
    const cplCounts = cpls.map(cpl => {
      let count = 0
      filteredMks.forEach(mk => {
        if (mappings[getMappingKey(mk.id, cpl.id)]) count++
      })
      return count
    })

    return (
      <div className="overflow-x-auto border rounded-md bg-white">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="p-3 text-left font-medium min-w-[250px] sticky left-0 bg-gray-50 z-10 border-r">
                Mata Kuliah
              </th>
              {cpls.map(cpl => (
                <th key={cpl.id} className="p-2 text-center border-r min-w-[60px]" title={cpl.rumusan}>
                  <div className="flex flex-col items-center justify-center gap-1">
                    <span className="font-semibold text-xs">{cpl.kode}</span>
                    <div className={`w-2 h-2 rounded-full ${getDomainColor(cpl.domain)}`} title={cpl.domain}></div>
                  </div>
                </th>
              ))}
              <th className="p-3 text-center font-medium bg-gray-50 min-w-[80px]">
                Total CPL
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredMks.map(mk => {
              // Row total
              let mkCplCount = 0
              cpls.forEach(cpl => {
                if (mappings[getMappingKey(mk.id, cpl.id)]) mkCplCount++
              })

              return (
                <tr key={mk.id} className="border-b hover:bg-slate-50 transition-colors">
                  <td className="p-3 sticky left-0 bg-white group-hover:bg-slate-50 z-10 border-r">
                    <div className="flex flex-col">
                      <span className="font-semibold">{mk.kode}</span>
                      <span className="text-muted-foreground text-xs truncate max-w-[220px]" title={mk.nama_id}>
                        {mk.nama_id} ({mk.sks_teori + mk.sks_praktik} SKS)
                      </span>
                    </div>
                  </td>
                  {cpls.map(cpl => {
                    const isMapped = mappings[getMappingKey(mk.id, cpl.id)]
                    return (
                      <td 
                        key={cpl.id} 
                        className={`p-0 border-r text-center align-middle ${canEdit ? 'cursor-pointer hover:bg-blue-50' : ''}`}
                        onClick={() => handleToggle(mk.id, cpl.id)}
                      >
                        <div className="w-full h-full min-h-[48px] flex items-center justify-center">
                          {isMapped && (
                            <div className="w-3 h-3 bg-slate-800 rounded-full shadow-sm animate-in zoom-in-50 duration-200"></div>
                          )}
                        </div>
                      </td>
                    )
                  })}
                  <td className="p-3 text-center bg-gray-50 font-semibold text-slate-700">
                    {mkCplCount}
                  </td>
                </tr>
              )
            })}
          </tbody>
          <tfoot className="bg-gray-100 border-t font-semibold">
            <tr>
              <td className="p-3 text-right sticky left-0 bg-gray-100 z-10 border-r">
                Total MK per CPL:
              </td>
              {cplCounts.map((count, i) => (
                <td key={i} className={`p-3 text-center border-r ${count < 3 ? 'text-red-600 bg-red-50' : 'text-slate-700'}`}>
                  {count}
                </td>
              ))}
              <td className="p-3 bg-gray-100"></td>
            </tr>
          </tfoot>
        </table>
      </div>
    )
  }

  const wajibMks = mks.filter(mk => mk.status === "WAJIB")
  const bisMks = mks.filter(mk => mk.status === "PILIHAN" && mk.track === "BIS")
  const dsaMks = mks.filter(mk => mk.status === "PILIHAN" && mk.track === "DSA")

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Peta Kurikulum</h1>
        <p className="text-muted-foreground">Matriks pemetaan Mata Kuliah terhadap Capaian Pembelajaran Lulusan (CPL)</p>
      </div>

      <Tabs defaultValue="wajib" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="wajib">Mata Kuliah Wajib</TabsTrigger>
          <TabsTrigger value="bis">Pilihan BIS</TabsTrigger>
          <TabsTrigger value="dsa">Pilihan DSA</TabsTrigger>
        </TabsList>
        
        <TabsContent value="wajib" className="mt-0">
          {renderMatrix(wajibMks)}
        </TabsContent>
        
        <TabsContent value="bis" className="mt-0">
          {renderMatrix(bisMks)}
        </TabsContent>
        
        <TabsContent value="dsa" className="mt-0">
          {renderMatrix(dsaMks)}
        </TabsContent>
      </Tabs>

      <div className="flex gap-4 items-center text-sm pt-4 border-t text-muted-foreground">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-blue-500"></div> Sikap
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-green-500"></div> Pengetahuan
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-orange-500"></div> KU
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-purple-500"></div> KK
        </div>
        <div className="flex items-center gap-2 ml-4">
          <div className="w-3 h-3 bg-slate-800 rounded-full"></div> Terpetakan
        </div>
        <div className="flex items-center gap-2 ml-4">
          <span className="text-red-600 font-semibold">Merah</span>: Cakupan &lt; 3 MK
        </div>
      </div>
    </div>
  )
}
