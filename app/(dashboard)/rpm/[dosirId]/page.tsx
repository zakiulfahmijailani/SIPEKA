import { notFound, redirect } from "next/navigation"

import { PrintToolbar } from "@/components/rps/print-toolbar"
import { getCurrentSession } from "@/lib/current-session"
import { getRpsDocumentData } from "@/lib/rps-documents"

export const dynamic = "force-dynamic"

export default async function RpmDocumentPage({ params }: { params: Promise<{ dosirId: string }> }) {
  const { dosirId } = await params
  const data = await getRpsDocumentData(dosirId)
  if (!data) notFound()

  const session = await getCurrentSession()
  if (!session?.user) redirect("/login")
  if (session.user.role === "DOSEN" && data.dosir.dosen_id !== session.user.id) redirect("/rpm")

  const meetings = [...(data.rps?.pertemuans ?? [])].sort((a, b) => a.minggu_ke - b.minggu_ke)

  return (
    <div className="mx-auto max-w-[1200px] pb-12">
      <PrintToolbar backHref="/rpm" label="RPM" />

      <article className="document-page overflow-hidden rounded-xl border bg-white shadow-sm print:rounded-none print:border-0 print:shadow-none">
        <header className="border-b-4 border-blue-900 px-8 py-7 text-center">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-700">Program Studi Sistem Informasi</p>
          <h1 className="mt-2 text-2xl font-bold uppercase text-blue-950">Rencana Pembelajaran Mingguan (RPM)</h1>
          <p className="mt-2 text-lg font-semibold">{data.dosir.mk.nama_id}</p>
        </header>

        <section className="grid gap-x-8 gap-y-2 border-b bg-blue-50/40 px-8 py-5 text-sm md:grid-cols-2">
          <Identity label="Kode Mata Kuliah" value={data.dosir.mk.kode} />
          <Identity label="Semester / Kelas" value={`${data.dosir.mk.semester_rekomendasi} / ${data.dosir.kelas}`} />
          <Identity label="SKS" value={`${data.dosir.mk.sks_teori + data.dosir.mk.sks_praktik} SKS`} />
          <Identity label="Tahun Akademik" value={data.dosir.tahunAkademik.kode} />
          <Identity label="Dosen Pengampu" value={data.dosir.dosen.nama_lengkap} wide />
        </section>

        <section className="p-6">
          {meetings.length === 0 ? (
            <div className="rounded-lg border-2 border-dashed py-16 text-center text-sm text-gray-500">
              Rencana mingguan belum diisi pada RPS.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-[11px] leading-relaxed">
                <thead>
                  <tr className="bg-blue-950 text-white">
                    <th className="border border-blue-800 p-2 text-center">Minggu</th>
                    <th className="border border-blue-800 p-2 text-left">Sub-CPMK & Indikator</th>
                    <th className="border border-blue-800 p-2 text-left">Materi</th>
                    <th className="border border-blue-800 p-2 text-left">Bentuk, Metode & Media</th>
                    <th className="border border-blue-800 p-2 text-left">Aktivitas Pembelajaran</th>
                    <th className="border border-blue-800 p-2 text-left">Penilaian</th>
                  </tr>
                </thead>
                <tbody>
                  {meetings.map((meeting) => (
                    <tr key={meeting.id} className="align-top even:bg-slate-50">
                      <td className="w-14 border p-2 text-center text-base font-bold text-blue-900">{meeting.minggu_ke}</td>
                      <td className="min-w-44 border p-2">
                        <div className="mb-1 flex flex-wrap gap-1">
                          {meeting.subCpmkMappings.map((mapping) => (
                            <span key={mapping.sub_cpmk_id} className="rounded bg-blue-100 px-1.5 py-0.5 font-mono font-bold text-blue-800">
                              {mapping.subCpmk.kode}
                            </span>
                          ))}
                        </div>
                        <p className="whitespace-pre-wrap">{meeting.indikator || "—"}</p>
                      </td>
                      <td className="min-w-48 border p-2 whitespace-pre-wrap font-medium">{meeting.materi}</td>
                      <td className="min-w-44 border p-2">
                        <p><strong>Bentuk:</strong> {meeting.bentuk_pembelajaran || "—"}</p>
                        <p><strong>Metode:</strong> {meeting.metode || "—"}</p>
                        <p><strong>Media:</strong> {meeting.media || "—"}</p>
                        <p><strong>Waktu:</strong> {meeting.estimasi_waktu || "—"}</p>
                      </td>
                      <td className="min-w-52 border p-2">
                        <p><strong>Dosen:</strong> {meeting.aktivitas_dosen || "—"}</p>
                        <p className="mt-1"><strong>Mahasiswa:</strong> {meeting.aktivitas_mahasiswa || "—"}</p>
                      </td>
                      <td className="min-w-40 border p-2 whitespace-pre-wrap">{meeting.kriteria_penilaian || "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <footer className="grid grid-cols-2 gap-16 px-12 pb-10 pt-6 text-center text-sm">
          <Signature label="Mengetahui, Ketua Program Studi" />
          <Signature label="Dosen Pengampu" name={data.dosir.dosen.nama_lengkap} />
        </footer>
      </article>
    </div>
  )
}

function Identity({ label, value, wide = false }: { label: string; value: string; wide?: boolean }) {
  return (
    <div className={wide ? "md:col-span-2" : ""}>
      <span className="inline-block w-36 text-gray-500">{label}</span>
      <span className="font-semibold text-gray-900">: {value}</span>
    </div>
  )
}

function Signature({ label, name }: { label: string; name?: string }) {
  return (
    <div>
      <p>{label}</p>
      <div className="h-20" />
      <p className="font-semibold">{name || "(........................................)"}</p>
    </div>
  )
}
