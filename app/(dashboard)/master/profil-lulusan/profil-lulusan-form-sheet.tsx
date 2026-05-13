"use client"

import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { toast } from "sonner"
import { saveProfilLulusan } from "./actions"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"

const profilLulusanSchema = z.object({
  id: z.string().optional(),
  kode: z.string().min(1, "Kode profil lulusan wajib diisi"),
  nama: z.string().min(3, "Nama profil lulusan minimal 3 karakter"),
  deskripsi: z.string().optional().nullable(),
  is_active: z.boolean().default(true),
})

type FormValues = z.infer<typeof profilLulusanSchema>

interface ProfilLulusanFormSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  initialData?: FormValues | null
}

export function ProfilLulusanFormSheet({ open, onOpenChange, initialData }: ProfilLulusanFormSheetProps) {
  const [isLoading, setIsLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<FormValues>({
    resolver: zodResolver(profilLulusanSchema) as any,
    defaultValues: {
      kode: "",
      nama: "",
      deskripsi: "",
      is_active: true,
    },
  })

  useEffect(() => {
    if (open) {
      if (initialData) {
        reset({
          id: initialData.id,
          kode: initialData.kode,
          nama: initialData.nama,
          deskripsi: initialData.deskripsi ?? "",
          is_active: initialData.is_active,
        })
      } else {
        reset({ kode: "", nama: "", deskripsi: "", is_active: true })
      }
    }
  }, [open, initialData, reset])

  const onSubmit = async (data: FormValues) => {
    setIsLoading(true)
    try {
      const result = await saveProfilLulusan(data)
      if (result.success) {
        toast.success(data.id ? "Profil lulusan berhasil diperbarui" : "Profil lulusan berhasil ditambahkan")
        onOpenChange(false)
      } else {
        toast.error(result.error || "Gagal menyimpan profil lulusan")
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
      <SheetContent className="sm:max-w-[480px] overflow-y-auto">
        <SheetHeader className="mb-6">
          <SheetTitle>{initialData?.id ? "Edit Profil Lulusan" : "Tambah Profil Lulusan"}</SheetTitle>
          <SheetDescription>
            {initialData?.id
              ? "Perbarui detail profil lulusan di bawah ini."
              : "Isi detail profil lulusan program studi."}
          </SheetDescription>
        </SheetHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="kode">Kode <span className="text-red-500">*</span></Label>
            <Input
              id="kode"
              placeholder="Contoh: PL1, PL2"
              {...register("kode")}
            />
            {errors.kode && <p className="text-sm text-red-500">{errors.kode.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="nama">Nama Profil Lulusan <span className="text-red-500">*</span></Label>
            <Input
              id="nama"
              placeholder="Contoh: Pengembang Perangkat Lunak"
              {...register("nama")}
            />
            {errors.nama && <p className="text-sm text-red-500">{errors.nama.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="deskripsi">Deskripsi</Label>
            <Textarea
              id="deskripsi"
              placeholder="Deskripsi singkat tentang profil lulusan ini (opsional)"
              className="min-h-[100px]"
              {...register("deskripsi")}
            />
            {errors.deskripsi && <p className="text-sm text-red-500">{errors.deskripsi.message}</p>}
          </div>

          <div className="flex items-center space-x-2 pt-2">
            <Switch
              id="is_active"
              checked={watch("is_active")}
              onCheckedChange={(val) => setValue("is_active", val)}
            />
            <Label htmlFor="is_active">Status Aktif</Label>
          </div>

          <div className="pt-6 flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Batal
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Menyimpan..." : "Simpan"}
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  )
}
