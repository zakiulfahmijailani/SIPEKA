"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { toast } from "sonner"
import { saveMahasiswa } from "./actions"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"

const mahasiswaSchema = z.object({
  id: z.string().optional(),
  nim: z.string().min(1, "NIM wajib diisi"),
  nama_lengkap: z.string().min(1, "Nama lengkap wajib diisi"),
  angkatan: z.coerce.number().min(2000, "Angkatan tidak valid"),
  track: z.enum(["UMUM", "ISG", "DMS"]),
  status: z.enum(["AKTIF", "CUTI", "LULUS", "DO"]),
  email: z.string().email("Email tidak valid").optional().or(z.literal("")),
})

type MahasiswaFormValues = z.infer<typeof mahasiswaSchema>

interface MahasiswaFormSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  initialData?: any | null
}

export function MahasiswaFormSheet({ open, onOpenChange, initialData }: MahasiswaFormSheetProps) {
  const [isLoading, setIsLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<MahasiswaFormValues>({
    resolver: zodResolver(mahasiswaSchema) as any,
    defaultValues: initialData ? {
      ...initialData,
      email: initialData.email || ""
    } : {
      nim: "",
      nama_lengkap: "",
      angkatan: new Date().getFullYear(),
      track: "UMUM",
      status: "AKTIF",
      email: "",
    },
  })

  // Watch values for selects
  const currentTrack = watch("track")
  const currentStatus = watch("status")

  const onSubmit = async (data: MahasiswaFormValues) => {
    setIsLoading(true)
    try {
      const result = await saveMahasiswa(data)
      if (result.success) {
        toast.success(data.id ? "Data mahasiswa diperbarui" : "Mahasiswa ditambahkan")
        onOpenChange(false)
        reset()
      } else {
        toast.error(result.error || "Gagal menyimpan")
      }
    } catch (error) {
      toast.error("Terjadi kesalahan sistem")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Sheet open={open} onOpenChange={(v) => {
      onOpenChange(v)
      if (!v) reset()
    }}>
      <SheetContent className="sm:max-w-[540px] overflow-y-auto">
        <SheetHeader className="mb-6">
          <SheetTitle>{initialData ? "Edit Mahasiswa" : "Tambah Mahasiswa"}</SheetTitle>
          <SheetDescription>
            Masukkan data diri mahasiswa dengan lengkap.
          </SheetDescription>
        </SheetHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pr-1">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="nim">NIM <span className="text-red-500">*</span></Label>
              <Input id="nim" placeholder="Contoh: 120220001" {...register("nim")} />
              {errors.nim && <p className="text-sm text-red-500">{errors.nim.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="angkatan">Angkatan <span className="text-red-500">*</span></Label>
              <Input id="angkatan" type="number" placeholder="2023" {...register("angkatan")} />
              {errors.angkatan && <p className="text-sm text-red-500">{errors.angkatan.message}</p>}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="nama_lengkap">Nama Lengkap <span className="text-red-500">*</span></Label>
            <Input id="nama_lengkap" placeholder="Nama Lengkap" {...register("nama_lengkap")} />
            {errors.nama_lengkap && <p className="text-sm text-red-500">{errors.nama_lengkap.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" placeholder="mahasiswa@example.com" {...register("email")} />
            {errors.email && <p className="text-sm text-red-500">{errors.email.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="track">Peminatan / Track</Label>
              <Select 
                value={currentTrack} 
                onValueChange={(val: any) => setValue("track", val)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pilih track" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="UMUM">UMUM</SelectItem>
                  <SelectItem value="ISG">ISG (Information Systems &amp; Governance)</SelectItem>
                  <SelectItem value="DMS">DMS (Data Management Systems)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status Akademik</Label>
              <Select 
                value={currentStatus} 
                onValueChange={(val: any) => setValue("status", val)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pilih status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="AKTIF">AKTIF</SelectItem>
                  <SelectItem value="CUTI">CUTI</SelectItem>
                  <SelectItem value="LULUS">LULUS</SelectItem>
                  <SelectItem value="DO">DO</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="pt-6 flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Batal
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Menyimpan..." : "Simpan Data"}
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  )
}
