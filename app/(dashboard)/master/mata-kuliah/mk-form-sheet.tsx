"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { toast } from "sonner"
import { saveMK } from "./actions"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ScrollArea } from "@/components/ui/scroll-area"
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

const mkSchema = z.object({
  id: z.string().optional(),
  kode: z.string().min(1, "Kode MK wajib diisi"),
  nama_id: z.string().min(1, "Nama MK wajib diisi"),
  nama_en: z.string().optional(),
  sks_teori: z.coerce.number().min(0).max(6),
  sks_praktik: z.coerce.number().min(0).max(6),
  semester_rekomendasi: z.coerce.number().min(1).max(8),
  status: z.enum(["WAJIB", "PILIHAN"]),
  track: z.enum(["UMUM", "BIS", "DSA"]),
  tipe_aktivitas: z.enum(["TEORI", "PRAKTIKUM", "TEORI_PRAKTIKUM", "SEMINAR", "PROYEK"]),
  deskripsi: z.string().optional(),
})

type MKFormValues = z.infer<typeof mkSchema>

interface MkFormSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  initialData?: MKFormValues | null
}

export function MkFormSheet({ open, onOpenChange, initialData }: MkFormSheetProps) {
  const [isLoading, setIsLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<MKFormValues>({
    resolver: zodResolver(mkSchema) as any,
    defaultValues: initialData || {
      kode: "",
      nama_id: "",
      nama_en: "",
      sks_teori: 2,
      sks_praktik: 0,
      semester_rekomendasi: 1,
      status: "WAJIB",
      track: "UMUM",
      tipe_aktivitas: "TEORI",
      deskripsi: "",
    },
  })

  useState(() => {
    if (initialData) {
      reset(initialData)
    }
  })

  const onSubmit = async (data: MKFormValues) => {
    setIsLoading(true)
    try {
      const result = await saveMK(data)
      if (result.success) {
        toast.success(data.id ? "Mata Kuliah berhasil diperbarui" : "Mata Kuliah berhasil ditambahkan")
        onOpenChange(false)
        reset()
      } else {
        toast.error(result.error || "Gagal menyimpan Mata Kuliah")
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
      <SheetContent className="sm:max-w-[600px] w-full p-0 flex flex-col">
        <SheetHeader className="p-6 border-b">
          <SheetTitle>{initialData ? "Edit Mata Kuliah" : "Tambah Mata Kuliah"}</SheetTitle>
          <SheetDescription>
            Masukkan detail informasi Mata Kuliah di bawah ini.
          </SheetDescription>
        </SheetHeader>

        <ScrollArea className="flex-1 p-6">
          <form id="mk-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="kode">Kode MK <span className="text-red-500">*</span></Label>
                <Input id="kode" placeholder="Contoh: SI101" {...register("kode")} />
                {errors.kode && <p className="text-sm text-red-500">{errors.kode.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="semester_rekomendasi">Semester Rekomendasi <span className="text-red-500">*</span></Label>
                <Select 
                  value={watch("semester_rekomendasi")?.toString()} 
                  onValueChange={(val: any) => setValue("semester_rekomendasi", parseInt(val))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih semester" />
                  </SelectTrigger>
                  <SelectContent>
                    {[1, 2, 3, 4, 5, 6, 7, 8].map(s => (
                      <SelectItem key={s} value={s.toString()}>Semester {s}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.semester_rekomendasi && <p className="text-sm text-red-500">{errors.semester_rekomendasi.message}</p>}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="nama_id">Nama (Bahasa Indonesia) <span className="text-red-500">*</span></Label>
              <Input id="nama_id" placeholder="Contoh: Pemrograman Dasar" {...register("nama_id")} />
              {errors.nama_id && <p className="text-sm text-red-500">{errors.nama_id.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="nama_en">Nama (English)</Label>
              <Input id="nama_en" placeholder="Contoh: Basic Programming" {...register("nama_en")} />
              {errors.nama_en && <p className="text-sm text-red-500">{errors.nama_en.message}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="sks_teori">SKS Teori <span className="text-red-500">*</span></Label>
                <Input id="sks_teori" type="number" min="0" max="6" {...register("sks_teori")} />
                {errors.sks_teori && <p className="text-sm text-red-500">{errors.sks_teori.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="sks_praktik">SKS Praktik <span className="text-red-500">*</span></Label>
                <Input id="sks_praktik" type="number" min="0" max="6" {...register("sks_praktik")} />
                {errors.sks_praktik && <p className="text-sm text-red-500">{errors.sks_praktik.message}</p>}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="status">Status MK <span className="text-red-500">*</span></Label>
                <Select value={watch("status")} onValueChange={(val: any) => setValue("status", val)}>
                  <SelectTrigger><SelectValue placeholder="Pilih status" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="WAJIB">WAJIB</SelectItem>
                    <SelectItem value="PILIHAN">PILIHAN</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="track">Track Peminatan <span className="text-red-500">*</span></Label>
                <Select value={watch("track")} onValueChange={(val: any) => setValue("track", val)}>
                  <SelectTrigger><SelectValue placeholder="Pilih track" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="UMUM">UMUM</SelectItem>
                    <SelectItem value="BIS">Business Information Systems</SelectItem>
                    <SelectItem value="DSA">Data Science & Analytics</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="tipe_aktivitas">Tipe Aktivitas <span className="text-red-500">*</span></Label>
              <Select value={watch("tipe_aktivitas")} onValueChange={(val: any) => setValue("tipe_aktivitas", val)}>
                <SelectTrigger><SelectValue placeholder="Pilih tipe" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="TEORI">Teori Kelas</SelectItem>
                  <SelectItem value="PRAKTIKUM">Praktikum Lab</SelectItem>
                  <SelectItem value="TEORI_PRAKTIKUM">Teori + Praktikum</SelectItem>
                  <SelectItem value="SEMINAR">Seminar</SelectItem>
                  <SelectItem value="PROYEK">Proyek</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="deskripsi">Deskripsi Singkat</Label>
              <Textarea 
                id="deskripsi" 
                placeholder="Deskripsi mata kuliah..." 
                className="min-h-[100px]"
                {...register("deskripsi")} 
              />
              {errors.deskripsi && <p className="text-sm text-red-500">{errors.deskripsi.message}</p>}
            </div>
          </form>
        </ScrollArea>

        <div className="p-6 border-t mt-auto flex justify-end space-x-2 bg-gray-50">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Batal
          </Button>
          <Button type="submit" form="mk-form" disabled={isLoading}>
            {isLoading ? "Menyimpan..." : "Simpan MK"}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  )
}
