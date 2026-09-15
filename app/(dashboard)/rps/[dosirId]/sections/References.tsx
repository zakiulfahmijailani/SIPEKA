"use client"

import { useState, useCallback, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Plus, Trash, Loader2, BookOpen } from "lucide-react"
import { debounce } from "lodash"
import { toast } from "sonner"
import { saveReferences } from "../../actions"
import type { RegisterRpsSectionSave } from "../rps-save-progress"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface ReferencesSectionProps {
  rpsId: string
  initialReferences: any[]
  registerSave: RegisterRpsSectionSave
  onSaved?: (data: any[]) => void
}

export function ReferencesSection({ rpsId, initialReferences, registerSave, onSaved }: ReferencesSectionProps) {
  const [refs, setRefs] = useState<any[]>(initialReferences)
  const [isSaving, setIsSaving] = useState(false)
  const saveQueueRef = useRef<Promise<void>>(Promise.resolve())
  const debouncedSaveRef = useRef<ReturnType<typeof debounce> | null>(null)

  const persist = useCallback((data: any[]) => {
    const snapshot = data.map((item) => ({ ...item }))
    const queued = saveQueueRef.current.then(async () => {
      setIsSaving(true)
      try {
        const result = await saveReferences(rpsId, snapshot)
        if (result.success) {
          onSaved?.(result.data || snapshot)
        } else {
          toast.error(result.error || "Referensi belum tersimpan")
        }
        return result
      } catch (error) {
        const message = error instanceof Error ? error.message : "Referensi belum tersimpan"
        toast.error(message)
        return { success: false, error: message }
      } finally {
        setIsSaving(false)
      }
    })

    saveQueueRef.current = queued.then(() => undefined, () => undefined)
    return queued
  }, [onSaved, rpsId])

  useEffect(() => {
    const debounced = debounce((data: any[]) => { void persist(data) }, 1500)
    debouncedSaveRef.current = debounced
    return () => {
      debounced.flush()
      debouncedSaveRef.current = null
    }
  }, [persist])

  const saveNow = useCallback(async () => {
    debouncedSaveRef.current?.cancel()
    return persist(refs)
  }, [persist, refs])

  useEffect(() => {
    registerSave(saveNow)
    return () => registerSave(null)
  }, [registerSave, saveNow])

  const handleAdd = () => {
    const newItem = {
      jenis: "Buku",
      teks: "",
      urutan: refs.length + 1
    }
    setRefs([...refs, newItem])
  }

  const handleDelete = (index: number) => {
    const updated = refs.filter((_, i) => i !== index)
    setRefs(updated)
    debouncedSaveRef.current?.(updated)
  }

  const handleChange = (index: number, field: string, value: any) => {
    const updated = [...refs]
    updated[index] = { ...updated[index], [field]: value }
    setRefs(updated)
    debouncedSaveRef.current?.(updated)
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold">Referensi</h2>
          <p className="text-sm text-muted-foreground">Daftar buku, jurnal, atau sumber belajar lainnya</p>
        </div>
        <div className="flex items-center gap-2">
           {isSaving && <Loader2 className="h-4 w-4 animate-spin text-blue-600" />}
           <Button variant="outline" size="sm" onClick={handleAdd} className="gap-2">
             <Plus className="h-4 w-4" /> Tambah Referensi
           </Button>
        </div>
      </div>

      <div className="space-y-4">
        {refs.map((r, idx) => (
          <div key={idx} className="p-4 border rounded-lg bg-white shadow-sm flex gap-4 items-start group">
            <div className="w-[120px]">
              <Select 
                value={r.jenis} 
                onValueChange={(val) => handleChange(idx, "jenis", val || "Buku")}
              >
                <SelectTrigger className="h-9 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Buku">Buku</SelectItem>
                  <SelectItem value="Jurnal">Jurnal</SelectItem>
                  <SelectItem value="Web">Web</SelectItem>
                  <SelectItem value="Lainnya">Lainnya</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex-1">
              <Input 
                className="h-9 text-sm"
                placeholder="Penulis, Judul, Tahun, Penerbit..."
                value={r.teks}
                onChange={(e) => handleChange(idx, "teks", e.target.value)}
              />
            </div>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => handleDelete(idx)}
              className="text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <Trash className="h-4 w-4" />
            </Button>
          </div>
        ))}

        {refs.length === 0 && (
          <div className="py-12 text-center border-2 border-dashed rounded-xl bg-gray-50">
            <BookOpen className="h-8 w-8 mx-auto mb-2 text-gray-300" />
            <p className="text-muted-foreground italic">Belum ada referensi yang ditambahkan.</p>
          </div>
        )}
      </div>
    </div>
  )
}
