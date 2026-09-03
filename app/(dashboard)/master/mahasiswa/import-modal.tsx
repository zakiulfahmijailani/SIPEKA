"use client"

import { useState } from "react"
import { toast } from "sonner"
import Papa from "papaparse"
import { bulkImportMahasiswa } from "./actions"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Download, Upload, AlertCircle } from "lucide-react"

interface ImportModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ImportModal({ open, onOpenChange }: ImportModalProps) {
  const [file, setFile] = useState<File | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleDownloadTemplate = () => {
    const csvContent = "nim,nama_lengkap,angkatan,status,track,email\n120220001,Mahasiswa Contoh,2023,AKTIF,UMUM,example@mail.com"
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    const url = URL.createObjectURL(blob)
    link.setAttribute("href", url)
    link.setAttribute("download", "template_mahasiswa.csv")
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0])
    }
  }

  const handleImport = async () => {
    if (!file) return

    setIsLoading(true)
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        try {
          const result = await bulkImportMahasiswa(results.data)
          if (result.success) {
            toast.success(`${result.count} data mahasiswa berhasil diimport`)
            onOpenChange(false)
            setFile(null)
          } else {
            toast.error(result.error || "Gagal mengimport data")
          }
        } catch (error) {
          toast.error("Terjadi kesalahan saat memproses data")
        } finally {
          setIsLoading(false)
        }
      },
      error: (error) => {
        toast.error("Gagal membaca file CSV: " + error.message)
        setIsLoading(false)
      }
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Import Mahasiswa</DialogTitle>
          <DialogDescription>
            Import data mahasiswa dari file CSV. Pastikan format kolom sesuai template.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="bg-amber-50 border border-amber-200 rounded-md p-3 flex gap-3">
            <AlertCircle className="h-5 w-5 text-amber-600 shrink-0" />
            <div className="text-sm text-amber-800">
              <p className="font-semibold">Penting:</p>
              <ul className="list-disc list-inside space-y-1 mt-1 text-xs">
                <li>Kolom: nim, nama_lengkap, angkatan</li>
                <li>Opsional: status, track, email</li>
                <li>Status: AKTIF, CUTI, LULUS, DO</li>
                <li>Track: UMUM, ISG, DMS</li>
              </ul>
            </div>
          </div>

          <Button 
            variant="outline" 
            className="w-full flex items-center gap-2"
            onClick={handleDownloadTemplate}
          >
            <Download className="h-4 w-4" />
            Download Template CSV
          </Button>

          <div className="space-y-2">
            <Label htmlFor="csv-file">Pilih File CSV</Label>
            <Input 
              id="csv-file" 
              type="file" 
              accept=".csv" 
              onChange={handleFileChange}
              disabled={isLoading}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)} disabled={isLoading}>
            Batal
          </Button>
          <Button 
            onClick={handleImport} 
            disabled={!file || isLoading}
            className="flex items-center gap-2"
          >
            <Upload className="h-4 w-4" />
            {isLoading ? "Mengimport..." : "Mulai Import"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

import { Label } from "@/components/ui/label"
