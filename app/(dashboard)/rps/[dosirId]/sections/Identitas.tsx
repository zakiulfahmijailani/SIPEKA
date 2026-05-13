"use client"

import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"

export function IdentitasSection({ dosir }: { dosir: any }) {
  const mk = dosir.mk

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold">Identitas Mata Kuliah</h2>
        <p className="text-sm text-muted-foreground">Informasi dasar mata kuliah (Auto-isi dari Penugasan Dosen)</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 border rounded-lg bg-gray-50/50">
        <div className="space-y-2">
          <Label className="text-gray-500 uppercase text-[10px] tracking-wider">Nama Mata Kuliah</Label>
          <p className="font-semibold text-lg">{mk.nama_id}</p>
        </div>
        <div className="space-y-2">
          <Label className="text-gray-500 uppercase text-[10px] tracking-wider">Kode MK</Label>
          <p className="font-semibold">{mk.kode}</p>
        </div>
        <div className="space-y-2">
          <Label className="text-gray-500 uppercase text-[10px] tracking-wider">SKS (Teori / Prak)</Label>
          <p className="font-semibold">{mk.sks_teori} / {mk.sks_praktik}</p>
        </div>
        <div className="space-y-2">
          <Label className="text-gray-500 uppercase text-[10px] tracking-wider">Semester / Kelas</Label>
          <p className="font-semibold">{mk.semester_rekomendasi} / {dosir.kelas}</p>
        </div>
        <div className="space-y-2">
          <Label className="text-gray-500 uppercase text-[10px] tracking-wider">Dosen Pengampu</Label>
          <p className="font-semibold">{dosir.dosen.nama_lengkap}</p>
        </div>
        <div className="space-y-2">
          <Label className="text-gray-500 uppercase text-[10px] tracking-wider">Tahun Akademik</Label>
          <p className="font-semibold">{dosir.tahunAkademik.kode}</p>
        </div>
      </div>
    </div>
  )
}
