"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { toast } from "sonner"
import { saveTahunAkademik } from "./actions"

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

const taSchema = z.object({
  id: z.string().optional(),
  kode: z.string().min(1, "Kode TA wajib diisi"),
  nama: z.string().min(1, "Nama TA wajib diisi"),
  semester: z.coerce.number().min(1).max(2),
  tahun_mulai: z.coerce.number().min(2000),
})

type TAFormValues = z.infer<typeof taSchema>

interface TaFormSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  initialData?: TAFormValues | null
}

export function TaFormSheet({ open, onOpenChange, initialData }: TaFormSheetProps) {
  const [isLoading, setIsLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<TAFormValues>({
    resolver: zodResolver(taSchema) as any,
    defaultValues: initialData || {
      kode: "",
      nama: "",
      semester: 1,
      tahun_mulai: new Date().getFullYear(),
    },
  })

  const onSubmit = async (data: TAFormValues) => {
    setIsLoading(true)
    try {
      const result = await saveTahunAkademik(data)
      if (result.success) {
        toast.success(data.id ? "Tahun Akademik diperbarui" : "Tahun Akademik ditambahkan")
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
      <SheetContent className="sm:max-w-[500px]">
        <SheetHeader className="mb-6">
          <SheetTitle>{initialData ? "Edit Tahun Akademik" : "Tambah Tahun Akademik"}</SheetTitle>
          <SheetDescription>
            Atur periode tahun akademik dan semester di sini.
          </SheetDescription>
        </SheetHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="kode">Kode TA <span className="text-red-500">*</span></Label>
            <Input id="kode" placeholder="Contoh: 2026/2027-1" {...register("kode")} />
            {errors.kode && <p className="text-sm text-red-500">{errors.kode.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="nama">Nama TA <span className="text-red-500">*</span></Label>
            <Input id="nama" placeholder="Contoh: Ganjil 2026/2027" {...register("nama")} />
            {errors.nama && <p className="text-sm text-red-500">{errors.nama.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="semester">Semester <span className="text-red-500">*</span></Label>
              <Select 
                value={watch("semester")?.toString()} 
                onValueChange={(val: any) => setValue("semester", parseInt(val))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pilih semester" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 (Ganjil)</SelectItem>
                  <SelectItem value="2">2 (Genap)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="tahun_mulai">Tahun Mulai <span className="text-red-500">*</span></Label>
              <Input id="tahun_mulai" type="number" {...register("tahun_mulai")} />
              {errors.tahun_mulai && <p className="text-sm text-red-500">{errors.tahun_mulai.message}</p>}
            </div>
          </div>

          <div className="pt-6 flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Batal
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Menyimpan..." : "Simpan TA"}
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  )
}
