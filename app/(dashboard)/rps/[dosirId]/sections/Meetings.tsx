"use client"

import { useState, useCallback, useEffect } from "react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Loader2 } from "lucide-react"
import { debounce } from "lodash"
import { saveMeetings } from "../../actions"

interface MeetingsSectionProps {
  rpsId: string
  initialMeetings: any[]
}

export function MeetingsSection({ rpsId, initialMeetings }: MeetingsSectionProps) {
  const [meetings, setMeetings] = useState<any[]>(() => {
    // Ensure we have 16 meetings
    const m = Array.from({ length: 16 }, (_, i) => {
      const existing = initialMeetings.find(em => em.minggu_ke === i + 1)
      return existing || {
        minggu_ke: i + 1,
        materi: "",
        metode: "Ceramah, Diskusi",
        media: "Laptop, Projector, LMS",
        estimasi_waktu: "150 menit",
      }
    })
    return m
  })
  const [isSaving, setIsSaving] = useState(false)

  const debouncedSave = useCallback(
    debounce(async (data: any[]) => {
      setIsSaving(true)
      await saveMeetings(rpsId, data)
      setIsSaving(false)
    }, 2000),
    [rpsId]
  )

  const handleChange = (index: number, field: string, value: string) => {
    const updated = [...meetings]
    updated[index][field] = value
    setMeetings(updated)
    debouncedSave(updated)
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold">Rencana Pertemuan</h2>
          <p className="text-sm text-muted-foreground">Rincian materi dan metode pembelajaran untuk 16 minggu</p>
        </div>
        {isSaving && <Loader2 className="h-4 w-4 animate-spin text-blue-600" />}
      </div>

      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader className="bg-gray-50">
            <TableRow>
              <TableHead className="w-16 text-center">Mng</TableHead>
              <TableHead>Materi / Topik Pembelajaran</TableHead>
              <TableHead className="w-[200px]">Metode & Media</TableHead>
              <TableHead className="w-[100px]">Waktu</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {meetings.map((m, idx) => (
              <TableRow key={idx}>
                <TableCell className="text-center font-bold text-gray-400">{m.minggu_ke}</TableCell>
                <TableCell className="p-2">
                  <Textarea 
                    className="min-h-[60px] text-xs resize-none"
                    placeholder={`Topik minggu ke-${m.minggu_ke}`}
                    value={m.materi}
                    onChange={(e) => handleChange(idx, "materi", e.target.value)}
                  />
                </TableCell>
                <TableCell className="p-2 space-y-1">
                  <Input 
                    className="h-8 text-[10px] placeholder:text-[9px]"
                    placeholder="Metode"
                    value={m.metode}
                    onChange={(e) => handleChange(idx, "metode", e.target.value)}
                  />
                  <Input 
                    className="h-8 text-[10px] placeholder:text-[9px]"
                    placeholder="Media"
                    value={m.media}
                    onChange={(e) => handleChange(idx, "media", e.target.value)}
                  />
                </TableCell>
                <TableCell className="p-2">
                  <Input 
                    className="h-8 text-xs text-center"
                    value={m.estimasi_waktu}
                    onChange={(e) => handleChange(idx, "estimasi_waktu", e.target.value)}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
