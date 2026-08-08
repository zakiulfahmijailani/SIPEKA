"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { toast } from "sonner"
import { saveDosirMk } from "./actions"
import { BookOpen, CalendarDays, GraduationCap, UsersRound } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet"

const dosirSchema = z.object({
  id: z.string().optional(),
  mk_id: z.string().min(1, "Mata Kuliah wajib dipilih"),
  dosen_id: z.string().min(1, "Dosen wajib dipilih"),
  tahun_akademik_id: z.string().min(1, "Tahun Akademik wajib dipilih"),
  kelas: z.string().min(1).max(2).toUpperCase(),
  is_active: z.boolean().default(true),
})

type DosirFormValues = z.infer<typeof dosirSchema>

interface DosirFormSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  initialData?: any | null
  mks: { id: string, label: string }[]
  dosens: { id: string, label: string }[]
  tas: { id: string, label: string }[]
}

export function DosirFormSheet({ open, onOpenChange, initialData, mks, dosens, tas }: DosirFormSheetProps) {
  const [isLoading, setIsLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<DosirFormValues>({
    resolver: zodResolver(dosirSchema) as any,
    defaultValues: initialData ? {
      ...initialData,
      is_active: initialData.is_active
    } : {
      mk_id: "",
      dosen_id: "",
      tahun_akademik_id: "",
      kelas: "A",
      is_active: true,
    },
  })

  const onSubmit = async (data: DosirFormValues) => {
    setIsLoading(true)
    try {
      const result = await saveDosirMk(data)
      if (result.success) {
        toast.success(data.id ? "Penugasan diperbarui" : "Penugasan ditambahkan")
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
      <SheetContent className="!w-full !max-w-none overflow-hidden border-l border-white/70 bg-white/95 p-0 shadow-[-24px_0_80px_rgba(15,23,42,0.18)] backdrop-blur-xl sm:!w-[520px]">
        <div className="flex h-full min-h-0 flex-col">
          <SheetHeader className="shrink-0 border-b border-slate-200/80 bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 px-6 py-7 text-white sm:px-8">
            <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-2xl border border-white/15 bg-white/10 text-blue-100 shadow-inner">
              <GraduationCap className="h-5 w-5" />
            </div>
            <SheetTitle className="text-xl font-semibold tracking-tight text-white">
              {initialData ? "Edit Penugasan" : "Tambah Penugasan"}
            </SheetTitle>
            <SheetDescription className="max-w-sm text-sm leading-6 text-slate-300">
              Hubungkan mata kuliah, dosen pengampu, dan kelas untuk satu tahun akademik.
            </SheetDescription>
          </SheetHeader>

          <form id="dosir-form" onSubmit={handleSubmit(onSubmit)} className="min-h-0 flex-1 overflow-y-auto px-6 py-6 sm:px-8">
            <div className="space-y-6">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-blue-700">Informasi utama</p>
                <p className="mt-1 text-sm text-slate-500">Pilih komponen penugasan yang akan dibuat.</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="mk_id" className="flex items-center gap-2 text-sm font-semibold text-slate-800">
                  <BookOpen className="h-4 w-4 text-blue-600" />
                  Mata Kuliah <span className="text-red-500">*</span>
                </Label>
                <select
                  id="mk_id"
                  {...register("mk_id")}
                  className="flex h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm text-slate-800 shadow-sm outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
                >
                  <option value="">Pilih mata kuliah...</option>
                  {mks.map((mk) => <option key={mk.id} value={mk.id}>{mk.label}</option>)}
                </select>
                <p className="text-xs text-slate-400">Ketik kode atau nama mata kuliah setelah dropdown dibuka untuk mencari cepat.</p>
                {errors.mk_id && <p className="text-sm text-red-500">{errors.mk_id.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="dosen_id" className="flex items-center gap-2 text-sm font-semibold text-slate-800">
                  <UsersRound className="h-4 w-4 text-blue-600" />
                  Dosen Pengampu <span className="text-red-500">*</span>
                </Label>
                <select
                  id="dosen_id"
                  {...register("dosen_id")}
                  className="flex h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm text-slate-800 shadow-sm outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
                >
                  <option value="">Pilih dosen pengampu...</option>
                  {dosens.map((dosen) => <option key={dosen.id} value={dosen.id}>{dosen.label}</option>)}
                </select>
                {errors.dosen_id && <p className="text-sm text-red-500">{errors.dosen_id.message}</p>}
              </div>

              <div className="rounded-2xl border border-slate-200/80 bg-slate-50/70 p-4">
                <div className="mb-4 flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-100 text-blue-700">
                    <CalendarDays className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-800">Periode perkuliahan</p>
                    <p className="text-xs text-slate-500">Tentukan tahun akademik dan kelas.</p>
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-[1fr_100px]">
                  <div className="space-y-2">
                    <Label htmlFor="tahun_akademik_id" className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Tahun Akademik <span className="text-red-500">*</span>
                    </Label>
                    <select
                      id="tahun_akademik_id"
                      {...register("tahun_akademik_id")}
                      className="flex h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-800 shadow-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                    >
                      <option value="">Pilih TA...</option>
                      {tas.map((ta) => <option key={ta.id} value={ta.id}>{ta.label}</option>)}
                    </select>
                    {errors.tahun_akademik_id && <p className="text-sm text-red-500">{errors.tahun_akademik_id.message}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="kelas" className="text-xs font-semibold uppercase tracking-wide text-slate-500">Kelas <span className="text-red-500">*</span></Label>
                    <Input id="kelas" placeholder="A" {...register("kelas")} maxLength={2} className="h-10 rounded-xl bg-white text-center text-sm font-semibold uppercase shadow-sm" />
                    {errors.kelas && <p className="text-sm text-red-500">{errors.kelas.message}</p>}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm">
                <div>
                  <p className="text-sm font-semibold text-slate-800">Status penugasan</p>
                  <p className="mt-1 text-xs text-slate-500">Penugasan aktif akan langsung terlihat oleh dosen.</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs font-semibold text-emerald-600">Aktif</span>
                  <Switch
                    id="is_active"
                    checked={watch("is_active")}
                    onCheckedChange={(val) => setValue("is_active", val)}
                  />
                </div>
              </div>
            </div>
          </form>

          <div className="shrink-0 border-t border-slate-200/80 bg-white/90 px-6 py-4 sm:px-8">
            <div className="flex gap-3">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="h-11 flex-1 rounded-xl border-slate-200">
                Batal
              </Button>
              <Button type="submit" form="dosir-form" disabled={isLoading} className="h-11 flex-[1.4] rounded-xl bg-blue-700 shadow-lg shadow-blue-700/20 hover:bg-blue-800">
                {isLoading ? "Menyimpan..." : "Simpan Penugasan"}
              </Button>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
