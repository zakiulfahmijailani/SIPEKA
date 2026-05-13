"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { toast } from "sonner"
import { saveUser } from "./actions"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
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

const userSchema = z.object({
  id: z.string().optional(),
  email: z.string().email("Email tidak valid"),
  nama_lengkap: z.string().min(1, "Nama lengkap wajib diisi"),
  nidn: z.string().optional(),
  role: z.enum(["SUPER_ADMIN", "KAPRODI", "DOSEN", "VIEWER"]),
  password: z.string().min(8, "Kata sandi minimal 8 karakter").optional(),
  is_active: z.boolean().default(true),
})

type UserFormValues = z.infer<typeof userSchema>

interface UserFormSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  initialData?: any | null
}

export function UserFormSheet({ open, onOpenChange, initialData }: UserFormSheetProps) {
  const [isLoading, setIsLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<UserFormValues>({
    resolver: zodResolver(userSchema) as any,
    defaultValues: initialData ? {
      ...initialData,
      is_active: initialData.is_active,
      password: ""
    } : {
      email: "",
      nama_lengkap: "",
      nidn: "",
      role: "DOSEN",
      password: "",
      is_active: true,
    },
  })

  const onSubmit = async (data: UserFormValues) => {
    setIsLoading(true)
    try {
      const result = await saveUser(data)
      if (result.success) {
        toast.success(data.id ? "Pengguna diperbarui" : "Pengguna ditambahkan")
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
          <SheetTitle>{initialData ? "Ubah Data Pengguna" : "Tambah Pengguna"}</SheetTitle>
          <SheetDescription>
            Kelola informasi profil dan hak akses pengguna.
          </SheetDescription>
        </SheetHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="nama_lengkap">Nama Lengkap <span className="text-red-500">*</span></Label>
            <Input id="nama_lengkap" placeholder="Nama Lengkap" {...register("nama_lengkap")} />
            {errors.nama_lengkap && <p className="text-sm text-red-500">{errors.nama_lengkap.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email <span className="text-red-500">*</span></Label>
            <Input id="email" type="email" placeholder="email@example.com" {...register("email")} />
            {errors.email && <p className="text-sm text-red-500">{errors.email.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="nidn">NIDN</Label>
              <Input id="nidn" placeholder="NIDN" {...register("nidn")} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="role">Role <span className="text-red-500">*</span></Label>
              <Select 
                value={watch("role")} 
                onValueChange={(val: any) => setValue("role", val)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pilih role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="SUPER_ADMIN">SUPER ADMIN</SelectItem>
                  <SelectItem value="KAPRODI">KAPRODI</SelectItem>
                  <SelectItem value="DOSEN">DOSEN</SelectItem>
                  <SelectItem value="VIEWER">VIEWER</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {!initialData && (
            <div className="space-y-2">
              <Label htmlFor="password">Kata Sandi <span className="text-red-500">*</span></Label>
              <Input id="password" type="password" placeholder="Minimal 8 karakter" {...register("password")} />
              {errors.password && <p className="text-sm text-red-500">{errors.password.message}</p>}
            </div>
          )}

          <div className="flex items-center space-x-2 pt-2">
            <Switch 
              id="is_active" 
              checked={watch("is_active")}
              onCheckedChange={(val) => setValue("is_active", val)}
            />
            <Label htmlFor="is_active">Akun Aktif</Label>
          </div>

          <div className="pt-6 flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Batal
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Menyimpan..." : "Simpan Pengguna"}
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  )
}
