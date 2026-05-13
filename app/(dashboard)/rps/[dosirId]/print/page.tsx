import { db } from "@/db"
import { dosirMk, rps, petaKurikulum } from "@/db/schema"
import { eq, desc } from "drizzle-orm"
import { notFound } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

export default async function RpsPrintPage(props: {
  params: Promise<{ dosirId: string }>
}) {
  const params = await props.params
  const dosirId = params.dosirId

  const dosir = await db.query.dosirMk.findFirst({
    where: eq(dosirMk.id, dosirId),
    with: {
      mk: true,
      dosen: true,
      tahunAkademik: true,
    }
  })

  if (!dosir) notFound()

  const rpsData = await db.query.rps.findFirst({
    where: eq(rps.dosir_mk_id, dosirId),
    orderBy: [desc(rps.version)],
    with: {
      cpmks: {
        with: {
          cplMappings: { with: { cpl: true } }
        }
      },
      komponens: {
        with: {
          cpmkMappings: true
        }
      },
      pertemuans: true,
      referensis: true,
    }
  })

  if (!rpsData) return <div className="p-20 text-center">RPS belum tersedia untuk dicetak.</div>

  const mappedCpls = await db.query.petaKurikulum.findMany({
    where: eq(petaKurikulum.mk_id, dosir.mk_id),
    with: { cpl: true }
  })

  const totalBobot = rpsData.komponens?.reduce((sum: number, k: any) => sum + (k.bobot || 0), 0) || 0

  return (
    <div className="bg-white min-h-screen p-8 md:p-12 font-serif text-[12pt] leading-normal print:p-0">
      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          @page { size: A4; margin: 2cm; }
          body { -webkit-print-color-adjust: exact; }
          .no-print { display: none !important; }
        }
        table { border-collapse: collapse; width: 100%; }
        th, td { border: 1px solid black; padding: 6px; }
        .header-table td { border: none; padding: 2px; }
      `}} />

      <div className="no-print mb-8 flex justify-between items-center bg-gray-50 p-4 rounded-lg border">
        <p className="text-sm text-gray-600 font-sans italic">Halaman pratinjau cetak. Gunakan tombol Cetak untuk menyimpan sebagai PDF.</p>
        <button 
          onClick={() => window.print()}
          className="bg-blue-600 text-white px-4 py-2 rounded-md font-sans text-sm font-bold hover:bg-blue-700 transition-colors"
        >
          Cetak ke PDF
        </button>
      </div>

      <div className="max-w-[21cm] mx-auto border-2 border-black p-8 space-y-8">
        {/* Header Section */}
        <div className="flex items-center gap-6 border-b-2 border-black pb-4">
          <div className="h-20 w-20 bg-gray-200 flex items-center justify-center text-[8pt] text-gray-500 font-sans text-center">LOGO UNIV</div>
          <div className="flex-1 text-center space-y-1">
            <h1 className="text-xl font-bold uppercase">Rencana Pembelajaran Semester (RPS)</h1>
            <p className="text-lg font-bold">Program Studi Sistem Informasi</p>
            <p className="text-sm">Fakultas Teknologi Informasi - Universitas XYZ</p>
          </div>
        </div>

        {/* 1. Identitas */}
        <section className="space-y-2">
           <h3 className="font-bold border-b border-black">I. IDENTITAS MATA KULIAH</h3>
           <table className="header-table w-full">
             <tbody>
               <tr><td className="w-48">Nama Mata Kuliah</td><td className="w-4">:</td><td className="font-bold">{dosir.mk.nama_id}</td></tr>
               <tr><td>Kode MK</td><td>:</td><td className="font-mono">{dosir.mk.kode}</td></tr>
               <tr><td>SKS</td><td>:</td><td>{dosir.mk.sks_teori + dosir.mk.sks_praktik} SKS</td></tr>
               <tr><td>Semester / Kelas</td><td>:</td><td>{dosir.mk.semester_rekomendasi} / {dosir.kelas}</td></tr>
               <tr><td>Tahun Akademik</td><td>:</td><td>{dosir.tahunAkademik.kode}</td></tr>
               <tr><td>Dosen Pengampu</td><td>:</td><td>{dosir.dosen.nama_lengkap}</td></tr>
             </tbody>
           </table>
        </section>

        {/* 2. CPL */}
        <section className="space-y-2">
           <h3 className="font-bold border-b border-black uppercase">II. Capaian Pembelajaran Lulusan (CPL)</h3>
           <div className="space-y-2">
             {mappedCpls.map(m => (
               <div key={m.cpl_id} className="flex gap-4 items-start">
                 <span className="font-bold min-w-[60px]">{m.cpl.kode}</span>
                 <span className="text-justify">{m.cpl.rumusan}</span>
               </div>
             ))}
           </div>
        </section>

        {/* 3. CPMK */}
        <section className="space-y-2">
           <h3 className="font-bold border-b border-black uppercase">III. Capaian Pembelajaran Mata Kuliah (CPMK)</h3>
           <div className="space-y-2">
             {rpsData.cpmks?.map((c: any) => (
               <div key={c.id} className="flex gap-4 items-start">
                 <span className="font-bold min-w-[60px]">{c.kode}</span>
                 <div className="space-y-1">
                   <p className="text-justify">{c.deskripsi}</p>
                   <p className="text-[9pt] italic text-gray-600">Mendukung: {c.cplMappings?.[0]?.cpl?.kode || 'N/A'}</p>
                 </div>
               </div>
             ))}
           </div>
        </section>

        {/* 4. Assessment */}
        <section className="space-y-2">
           <h3 className="font-bold border-b border-black uppercase">IV. KOMPONEN PENILAIAN</h3>
           <table className="w-full">
             <thead>
               <tr className="bg-gray-100">
                 <th className="w-10">No</th>
                 <th>Komponen</th>
                 <th className="w-32">CPMK Terukur</th>
                 <th className="w-24">Bobot (%)</th>
               </tr>
             </thead>
             <tbody>
               {rpsData.komponens?.map((k: any, i: number) => (
                 <tr key={k.id}>
                   <td className="text-center">{i+1}</td>
                   <td className="font-bold">{k.nama}</td>
                   <td className="text-center">
                      {k.cpmkMappings?.map((m: any) => rpsData.cpmks.find((cx:any) => cx.id === m.cpmk_id)?.kode).join(', ')}
                   </td>
                   <td className="text-right">{k.bobot}%</td>
                 </tr>
               ))}
               <tr className="bg-gray-50 font-bold">
                 <td colSpan={3} className="text-right">TOTAL</td>
                 <td className="text-right">{totalBobot}%</td>
               </tr>
             </tbody>
           </table>
        </section>

        {/* 5. Meetings */}
        <section className="space-y-2 break-inside-avoid">
           <h3 className="font-bold border-b border-black uppercase">V. RENCANA PERTEMUAN</h3>
           <table className="w-full text-[9pt] leading-tight">
             <thead>
               <tr className="bg-gray-100">
                 <th className="w-8">Mng</th>
                 <th>Materi / Topik Pembelajaran</th>
                 <th className="w-48">Metode & Media</th>
                 <th className="w-16">Waktu</th>
               </tr>
             </thead>
             <tbody>
               {rpsData.pertemuans?.sort((a:any, b:any) => a.minggu_ke - b.minggu_ke).map((m: any) => (
                 <tr key={m.id}>
                   <td className="text-center font-bold">{m.minggu_ke}</td>
                   <td className="whitespace-pre-wrap">{m.materi}</td>
                   <td>
                      <p className="font-bold">{m.metode}</p>
                      <p className="italic text-gray-600">{m.media}</p>
                   </td>
                   <td className="text-center">{m.estimasi_waktu}</td>
                 </tr>
               ))}
             </tbody>
           </table>
        </section>

        {/* 6. References */}
        <section className="space-y-2">
           <h3 className="font-bold border-b border-black uppercase">VI. REFERENSI</h3>
           <ul className="list-decimal list-inside space-y-1">
             {rpsData.referensis?.sort((a:any, b:any) => a.urutan - b.urutan).map((r: any) => (
               <li key={r.id} className="text-justify"><strong>[{r.jenis}]</strong> {r.teks}</li>
             ))}
           </ul>
        </section>

        {/* 7. Signatures */}
        <section className="pt-12 grid grid-cols-2 gap-20">
           <div className="text-center space-y-20">
              <p>Mengetahui,<br/>Ketua Program Studi</p>
              <div className="border-b border-black w-48 mx-auto" />
              <p>( Nama Kaprodi )</p>
           </div>
           <div className="text-center space-y-20">
              <p>Dosen Pengampu,</p>
              <div className="border-b border-black w-48 mx-auto" />
              <p>{dosir.dosen.nama_lengkap}</p>
           </div>
        </section>
      </div>
    </div>
  )
}
