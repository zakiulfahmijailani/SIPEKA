"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { toast } from "sonner"
import { saveDosirMk } from "./actions"
import { Check, ChevronsUpDown } from "lucide-react"
import { cn } from "@/lib/utils"

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
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

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
  const [mkOpen, setMkOpen] = useState(false)
  const [dosenOpen, setDosenOpen] = useState(false)

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

  const selectedMk = watch("mk_id")
  const selectedDosen = watch("dosen_id")

  return (
    <Sheet open={open} onOpenChange={(v) => {
      onOpenChange(v)
      if (!v) reset()
    }}>
      <SheetContent className="sm:max-w-[500px]">
        <SheetHeader className="mb-6">
          <SheetTitle>{initialData ? "Edit Penugasan" : "Tambah Penugasan"}</SheetTitle>
          <SheetDescription>
            Tugaskan dosen pengampu ke mata kuliah untuk tahun akademik tertentu.
          </SheetDescription>
        </SheetHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2 flex flex-col">
            <Label>Mata Kuliah <span className="text-red-500">*</span></Label>
            <Popover open={mkOpen} onOpenChange={setMkOpen}>
              <PopoverTrigger
                render={
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={mkOpen}
                    className="justify-between w-full font-normal"
                  />
                }
              >
                {selectedMk
                  ? mks.find((mk) => mk.id === selectedMk)?.label
                  : "Pilih mata kuliah..."}
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </PopoverTrigger>
              <PopoverContent className="w-[450px] p-0">
                <Command>
                  <CommandInput placeholder="Cari mata kuliah..." />
                  <CommandList>
                    <CommandEmpty>MK tidak ditemukan.</CommandEmpty>
                    <CommandGroup>
                      {mks.map((mk) => (
                        <CommandItem
                          key={mk.id}
                          value={mk.label}
                          onSelect={() => {
                            setValue("mk_id", mk.id)
                            setMkOpen(false)
                          }}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              selectedMk === mk.id ? "opacity-100" : "opacity-0"
                            )}
                          />
                          {mk.label}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
            {errors.mk_id && <p className="text-sm text-red-500">{errors.mk_id.message}</p>}
          </div>

          <div className="space-y-2 flex flex-col">
            <Label>Dosen Pengampu <span className="text-red-500">*</span></Label>
            <Popover open={dosenOpen} onOpenChange={setDosenOpen}>
              <PopoverTrigger
                render={
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={dosenOpen}
                    className="justify-between w-full font-normal"
                  />
                }
              >
                {selectedDosen
                  ? dosens.find((d) => d.id === selectedDosen)?.label
                  : "Pilih dosen..."}
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </PopoverTrigger>
              <PopoverContent className="w-[450px] p-0">
                <Command>
                  <CommandInput placeholder="Cari dosen..." />
                  <CommandList>
                    <CommandEmpty>Dosen tidak ditemukan.</CommandEmpty>
                    <CommandGroup>
                      {dosens.map((d) => (
                        <CommandItem
                          key={d.id}
                          value={d.label}
                          onSelect={() => {
                            setValue("dosen_id", d.id)
                            setDosenOpen(false)
                          }}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              selectedDosen === d.id ? "opacity-100" : "opacity-0"
                            )}
                          />
                          {d.label}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
            {errors.dosen_id && <p className="text-sm text-red-500">{errors.dosen_id.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="ta">Tahun Akademik <span className="text-red-500">*</span></Label>
              <Select 
                value={watch("tahun_akademik_id")} 
                onValueChange={(val: any) => setValue("tahun_akademik_id", val)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pilih TA" />
                </SelectTrigger>
                <SelectContent>
                  {tas.map(ta => (
                    <SelectItem key={ta.id} value={ta.id}>{ta.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.tahun_akademik_id && <p className="text-sm text-red-500">{errors.tahun_akademik_id.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="kelas">Kelas <span className="text-red-500">*</span></Label>
              <Input id="kelas" placeholder="Contoh: A" {...register("kelas")} maxLength={2} className="uppercase" />
              {errors.kelas && <p className="text-sm text-red-500">{errors.kelas.message}</p>}
            </div>
          </div>

          <div className="flex items-center space-x-2 pt-2">
            <Switch 
              id="is_active" 
              checked={watch("is_active")}
              onCheckedChange={(val) => setValue("is_active", val)}
            />
            <Label htmlFor="is_active">Aktif</Label>
          </div>

          <div className="pt-6 flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Batal
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Menyimpan..." : "Simpan Penugasan"}
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  )
}
