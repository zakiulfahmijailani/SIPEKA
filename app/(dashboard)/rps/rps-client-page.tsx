"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Button, buttonVariants } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { FileEdit, CheckCircle2, Clock, RotateCcw, Filter, Search } from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"

export function RpsClientPage({ dosirs }: { dosirs: any[] }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [searchTerm, setSearchTerm] = useState(searchParams.get("q") || "")

  const currentStatus = searchParams.get("status") || "ALL"

  const handleFilter = (status: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (status === "ALL") params.delete("status")
    else params.set("status", status)
    router.push(`?${params.toString()}`)
  }

  const handleSearch = () => {
    const params = new URLSearchParams(searchParams.toString())
    if (searchTerm) params.set("q", searchTerm)
    else params.delete("q")
    router.push(`?${params.toString()}`)
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "DRAFT":             return <Badge variant="secondary" className="flex items-center gap-1"><Clock className="h-3 w-3" /> Draf</Badge>
      case "SUBMITTED":         return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100 flex items-center gap-1 border-none"><Clock className="h-3 w-3" /> Menunggu Persetujuan</Badge>
      case "APPROVED":          return <Badge className="bg-green-100 text-green-800 hover:bg-green-100 flex items-center gap-1 border-none"><CheckCircle2 className="h-3 w-3" /> Disetujui</Badge>
      case "REVISION_REQUIRED": return <Badge variant="destructive" className="flex items-center gap-1"><RotateCcw className="h-3 w-3" /> Perlu Revisi</Badge>
      default:                  return <Badge variant="outline">Tidak Diketahui</Badge>
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Pengelola RPS</h1>
          <p className="text-muted-foreground">Kelola Rencana Pembelajaran Semester untuk mata kuliah Anda</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-3 py-2">
        <div className="flex gap-2 flex-1 min-w-[300px]">
          <Input
            placeholder="Cari Mata Kuliah..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            className="max-w-sm"
          />
          <Button variant="secondary" onClick={handleSearch}>
            <Search className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex gap-2">
          <select
            className="h-9 w-[180px] rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
            value={currentStatus}
            onChange={(e) => handleFilter(e.target.value)}
          >
            <option value="ALL">Semua Status</option>
            <option value="DRAFT">Draf</option>
            <option value="SUBMITTED">Menunggu Persetujuan</option>
            <option value="APPROVED">Disetujui</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-md border">
        <Table>
          <TableHeader className="bg-gray-50">
            <TableRow>
              <TableHead>Mata Kuliah</TableHead>
              <TableHead>Dosen</TableHead>
              <TableHead className="w-[100px] text-center">Kelas</TableHead>
              <TableHead className="w-[120px]">Tahun Akademik</TableHead>
              <TableHead className="w-[180px]">Status RPS</TableHead>
              <TableHead className="text-right w-[150px]">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {dosirs.length > 0 ? (
              dosirs.map((dosir) => {
                const latestRps = dosir.rps?.[0]
                const status = latestRps?.status || "DRAFT"

                return (
                  <TableRow key={dosir.id}>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-bold text-sm">{dosir.mk.nama_id}</span>
                        <span className="text-xs text-muted-foreground font-mono">{dosir.mk.kode}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm">{dosir.dosen.nama_lengkap}</TableCell>
                    <TableCell className="text-center">
                      <Badge variant="outline">{dosir.kelas}</Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">{dosir.tahunAkademik.kode}</TableCell>
                    <TableCell>{getStatusBadge(status)}</TableCell>
                    <TableCell className="text-right">
                      <Link
                        href={`/rps/${dosir.id}`}
                        className={cn(buttonVariants({ variant: "outline", size: "sm" }), "gap-2")}
                      >
                        <FileEdit className="h-4 w-4" />
                        {status === "APPROVED" ? "Lihat RPS" : "Edit RPS"}
                      </Link>
                    </TableCell>
                  </TableRow>
                )
              })
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  Data mata kuliah tidak ditemukan.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
