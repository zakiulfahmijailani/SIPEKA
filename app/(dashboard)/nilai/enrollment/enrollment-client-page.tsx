"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Upload, Users, BookOpen, CheckCircle2, AlertCircle } from "lucide-react"
import { importEnrollmentCSV } from "./actions"
import { toast } from "sonner"

interface Student {
  id: string
  nim: string
  nama: string
  is_active: boolean
  [key: string]: unknown
}

interface EnrollmentClientPageProps {
  dosirs: any[]
  allStudents: Student[]
}

export function EnrollmentClientPage({ dosirs, allStudents }: EnrollmentClientPageProps) {
  const [isImporting, setIsImporting] = useState<string | null>(null)

  const handleImportCSV = async (dosirId: string, file: File) => {
    if (!file.name.endsWith('.csv')) {
      toast.error('File harus berformat CSV')
      return
    }

    setIsImporting(dosirId)
    const formData = new FormData()
    formData.append('file', file)

    try {
      const result = await importEnrollmentCSV(dosirId, formData)
      if (result.success) {
        toast.success(result.message)
      } else {
        toast.error(result.error || 'Import gagal')
      }
    } catch (error) {
      toast.error('Terjadi kesalahan saat import')
    } finally {
      setIsImporting(null)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Pendaftaran Kelas Mahasiswa</h1>
        <p className="text-muted-foreground">Import data KRS mahasiswa per kelas dari file CSV</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-none shadow-sm bg-blue-50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-blue-600 flex items-center gap-2">
              <BookOpen className="h-4 w-4" /> Total Kelas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-900">{dosirs.length}</div>
          </CardContent>
        </Card>
        
        <Card className="border-none shadow-sm bg-green-50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-green-600 flex items-center gap-2">
              <Users className="h-4 w-4" /> Total Mahasiswa
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-900">
              {dosirs.reduce((acc, curr) => acc + (curr.enrollments?.length ?? 0), 0)}
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm bg-purple-50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-purple-600 flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4" /> Kelas Terisi
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-900">
              {dosirs.filter(d => (d.enrollments?.length ?? 0) > 0).length}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="bg-white rounded-md border shadow-sm">
        <Table>
          <TableHeader className="bg-gray-50">
            <TableRow>
              <TableHead>Mata Kuliah</TableHead>
              <TableHead>Kelas</TableHead>
              <TableHead>Tahun Akademik</TableHead>
              <TableHead className="text-center">Jumlah Mahasiswa</TableHead>
              <TableHead className="text-center">Status</TableHead>
              <TableHead className="text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {dosirs.length > 0 ? (
              dosirs.map((dosir) => (
                <TableRow key={dosir.id}>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-medium">{dosir.mk.nama_id}</span>
                      <span className="text-xs text-muted-foreground">{dosir.mk.kode}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{dosir.kelas}</Badge>
                  </TableCell>
                  <TableCell>{dosir.tahunAkademik.kode}</TableCell>
                  <TableCell className="text-center font-medium">
                    {dosir.enrollments?.length ?? 0}
                  </TableCell>
                  <TableCell className="text-center">
                    {(dosir.enrollments?.length ?? 0) > 0
                      ? <Badge className="bg-green-100 text-green-800 hover:bg-green-100 border-none">Terisi</Badge>
                      : <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-100 border-none">Kosong</Badge>
                    }
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button variant="outline" size="sm" className="flex items-center gap-2 relative overflow-hidden">
                        <Upload className="h-4 w-4" />
                        {isImporting === dosir.id ? 'Mengimpor...' : 'Impor CSV NIM'}
                        <Input
                          type="file"
                          accept=".csv"
                          className="absolute inset-0 opacity-0 cursor-pointer"
                          onChange={(e) => e.target.files?.[0] && handleImportCSV(dosir.id, e.target.files[0])}
                          disabled={isImporting === dosir.id}
                        />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  Belum ada kelas dosir yang tersedia.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <Card className="border-amber-200 bg-amber-50">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2 text-amber-800">
            <AlertCircle className="h-4 w-4" /> Panduan Format CSV
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-amber-700 space-y-2">
          <p>File CSV harus memiliki kolom: <code className="bg-white px-1 py-0.5 rounded">nim</code></p>
          <p>Header wajib ada di baris pertama.</p>
          <p>Setiap baris akan di-match ke mahasiswa berdasarkan NIM.</p>
          <p>Jika mahasiswa belum ada di master, data akan di-skip.</p>
        </CardContent>
      </Card>
    </div>
  )
}
