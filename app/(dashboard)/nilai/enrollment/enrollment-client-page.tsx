"use client"

import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { ChevronDown, ChevronUp, UserPlus, Trash, Upload, Search, GraduationCap } from "lucide-react"
import { enrollMahasiswa, unenrollMahasiswa, bulkEnrollMahasiswa } from "./actions"
import { toast } from "sonner"
import Papa from "papaparse"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"

export function EnrollmentClientPage({ 
  dosirs, 
  allStudents 
}: { 
  dosirs: any[], 
  allStudents: any[] 
}) {
  const [expandedDosir, setExpandedDosir] = useState<string | null>(null)
  const [isImporting, setIsImporting] = useState<string | null>(null)

  const toggleExpand = (id: string) => {
    setExpandedDosir(expandedDosir === id ? null : id)
  }

  const handleEnroll = async (dosirId: string, mahasiswaId: string) => {
    const res = await enrollMahasiswa(dosirId, mahasiswaId)
    if (res.success) {
      toast.success("Mahasiswa berhasil didaftarkan")
    } else {
      toast.error(res.error || "Gagal")
    }
  }

  const handleUnenroll = async (id: string) => {
    if (confirm("Hapus pendaftaran mahasiswa ini?")) {
      const res = await unenrollMahasiswa(id)
      if (res.success) {
        toast.success("Pendaftaran dibatalkan")
      } else {
        toast.error(res.error || "Gagal")
      }
    }
  }

  const handleImportCSV = (dosirId: string, file: File) => {
    setIsImporting(dosirId)
    Papa.parse(file, {
      header: false,
      skipEmptyLines: true,
      complete: async (results) => {
        const nims = results.data.map((row: any) => String(row[0]).trim())
        const res = await bulkEnrollMahasiswa(dosirId, nims)
        if (res.success) {
          toast.success(`${res.count} mahasiswa berhasil diproses`)
        } else {
          toast.error(res.error || "Gagal import")
        }
        setIsImporting(null)
      }
    })
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Enrollment Mahasiswa</h1>
        <p className="text-muted-foreground">Daftarkan mahasiswa ke dalam kelas Mata Kuliah</p>
      </div>

      <div className="grid gap-4">
        {dosirs.map((dosir) => (
          <Card key={dosir.id} className="overflow-hidden border-gray-200">
            <CardHeader className="p-4 cursor-pointer hover:bg-gray-50 transition-colors" onClick={() => toggleExpand(dosir.id)}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold">
                    {dosir.mk.kode.substring(0, 2)}
                  </div>
                  <div>
                    <CardTitle className="text-lg flex items-center gap-2">
                      {dosir.mk.nama_id}
                      <Badge variant="outline" className="text-xs font-mono">{dosir.kelas}</Badge>
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">
                      Dosen: {dosir.dosen.nama_lengkap} • {dosir.tahunAkademik.kode}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right mr-4">
                    <p className="text-sm font-semibold">{dosir.enrollments.length}</p>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider">Mahasiswa</p>
                  </div>
                  {expandedDosir === dosir.id ? <ChevronUp className="h-5 w-5 text-gray-400" /> : <ChevronDown className="h-5 w-5 text-gray-400" />}
                </div>
              </div>
            </CardHeader>

            {expandedDosir === dosir.id && (
              <CardContent className="p-0 border-t">
                <div className="p-4 bg-gray-50 flex flex-wrap gap-3 items-center justify-between border-b">
                  <div className="flex gap-2">
                    <StudentSelector 
                      students={allStudents} 
                      onSelect={(studentId) => handleEnroll(dosir.id, studentId)} 
                    />
                    
                    <div className="relative">
                      <Button variant="outline" size="sm" className="flex items-center gap-2 relative">
                        <Upload className="h-3 w-3" />
                        Import CSV NIM
                        <input 
                          type="file" 
                          className="absolute inset-0 opacity-0 cursor-pointer"
                          accept=".csv"
                          onChange={(e) => e.target.files?.[0] && handleImportCSV(dosir.id, e.target.files[0])}
                          disabled={isImporting === dosir.id}
                        />
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="max-h-[400px] overflow-y-auto">
                  <Table>
                    <TableHeader className="bg-white sticky top-0 shadow-sm z-10">
                      <TableRow>
                        <TableHead className="w-[150px] pl-6">NIM</TableHead>
                        <TableHead>Nama Mahasiswa</TableHead>
                        <TableHead className="w-[100px]">Angkatan</TableHead>
                        <TableHead className="text-right pr-6 w-[80px]">Aksi</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {dosir.enrollments.length > 0 ? (
                        dosir.enrollments.map((en: any) => (
                          <TableRow key={en.id} className="bg-white">
                            <TableCell className="font-mono pl-6">{en.mahasiswa.nim}</TableCell>
                            <TableCell className="font-medium">{en.mahasiswa.nama_lengkap}</TableCell>
                            <TableCell>{en.mahasiswa.angkatan}</TableCell>
                            <TableCell className="text-right pr-6">
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                onClick={() => handleUnenroll(en.id)}
                                className="text-red-500 hover:text-red-700 hover:bg-red-50"
                              >
                                <Trash className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={4} className="text-center py-8 text-muted-foreground bg-white italic">
                            Belum ada mahasiswa yang terdaftar di kelas ini.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            )}
          </Card>
        ))}
      </div>
    </div>
  )
}

function StudentSelector({ students, onSelect }: { students: any[], onSelect: (id: string) => void }) {
  const [open, setOpen] = useState(false)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger render={<Button variant="outline" size="sm" className="flex items-center gap-2" />}>
        <UserPlus className="h-3 w-3" />
        Tambah Mahasiswa
      </PopoverTrigger>
      <PopoverContent className="w-[300px] p-0" align="start">
        <Command>
          <CommandInput placeholder="Cari NIM atau Nama..." />
          <CommandList>
            <CommandEmpty>Mahasiswa tidak ditemukan.</CommandEmpty>
            <CommandGroup>
              {students.map((student) => (
                <CommandItem
                  key={student.id}
                  value={`${student.nim} ${student.nama_lengkap}`}
                  onSelect={() => {
                    onSelect(student.id)
                    setOpen(false)
                  }}
                  className="cursor-pointer"
                >
                  <div className="flex flex-col">
                    <span className="font-semibold text-xs font-mono">{student.nim}</span>
                    <span className="text-sm">{student.nama_lengkap}</span>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
