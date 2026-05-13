"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { toast } from "sonner"
import { saveCPL } from "./actions"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
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

const cplSchema = z.object({
  id: z.string().optional(),
  kode: z.string().min(1, "Kode CPL wajib diisi"),
  slug: z.string().min(1, "Slug wajib diisi"),
  domain: z.enum(["SIKAP", "PENGETAHUAN", "KETERAMPILAN_UMUM", "KETERAMPILAN_KHUSUS"], {
    message: "Domain wajib dipilih",
  }),
  urutan: z.coerce.number().min(1, "Urutan harus > 0"),
  rumusan: z.string().min(20, "Rumusan minimal 20 karakter"),
  is_active: z.boolean().default(true),
})

type CPLFormValues = z.infer<typeof cplSchema>

interface CplFormSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  initialData?: CPLFormValues | null
}

export function CplFormSheet({ open, onOpenChange, initialData }: CplFormSheetProps) {
  const [isLoading, setIsLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<CPLFormValues>({
    resolver: zodResolver(cplSchema) as any,
    defaultValues: initialData || {
      kode: "",
      slug: "",
      domain: "SIKAP",
      urutan: 1,
      rumusan: "",
      is_active: true,
    },
  })

  // Set initial data when sheet opens with existing data
  useState(() => {
    if (initialData) {
      reset(initialData)
    }
  })

  const onSubmit = async (data: CPLFormValues) => {
    setIsLoading(true)
    try {
      const result = await saveCPL(data)
      if (result.success) {
        toast.success(data.id ? "CPL berhasil diperbarui" : "CPL berhasil ditambahkan")
        onOpenChange(false)
        reset()
      } else {
        toast.error(result.error || "Gagal menyimpan CPL")
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
      <SheetContent className="sm:max-w-[500px] overflow-y-auto">
        <SheetHeader className="mb-6">
          <SheetTitle>{initialData ? "Edit CPL" : "Tambah CPL"}</SheetTitle>
          <SheetDescription>
            Masukkan detail Capaian Pembelajaran Lulusan (CPL) di bawah ini.
          </SheetDescription>
        </SheetHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="kode">Kode CPL <span className="text-red-500">*</span></Label>
            <Input id="kode" placeholder="Contoh: CPL01" {...register("kode")} />
            {errors.kode && <p className="text-sm text-red-500">{errors.kode.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="slug">Slug <span className="text-red-500">*</span></Label>
            <Input id="slug" placeholder="Contoh: KK1" {...register("slug")} />
            {errors.slug && <p className="text-sm text-red-500">{errors.slug.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="domain">Domain <span className="text-red-500">*</span></Label>
            <Select 
              value={watch("domain")} 
              onValueChange={(val: any) => setValue("domain", val)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Pilih domain" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="SIKAP">SIKAP</SelectItem>
                <SelectItem value="PENGETAHUAN">PENGETAHUAN</SelectItem>
                <SelectItem value="KETERAMPILAN_UMUM">KETERAMPILAN UMUM</SelectItem>
                <SelectItem value="KETERAMPILAN_KHUSUS">KETERAMPILAN KHUSUS</SelectItem>
              </SelectContent>
            </Select>
            {errors.domain && <p className="text-sm text-red-500">{errors.domain.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="urutan">Urutan <span className="text-red-500">*</span></Label>
            <Input id="urutan" type="number" min="1" {...register("urutan")} />
            {errors.urutan && <p className="text-sm text-red-500">{errors.urutan.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="rumusan">Rumusan <span className="text-red-500">*</span></Label>
            <Textarea 
              id="rumusan" 
              placeholder="Rumusan CPL lengkap..." 
              className="min-h-[100px]"
              {...register("rumusan")} 
            />
            {errors.rumusan && <p className="text-sm text-red-500">{errors.rumusan.message}</p>}
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
              {isLoading ? "Menyimpan..." : "Simpan CPL"}
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  )
}
