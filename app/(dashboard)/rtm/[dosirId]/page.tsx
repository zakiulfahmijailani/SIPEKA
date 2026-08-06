import { notFound, redirect } from "next/navigation"

import { PrintToolbar } from "@/components/rps/print-toolbar"
import { getCurrentSession } from "@/lib/current-session"
import { getRpsDocumentData } from "@/lib/rps-documents"

export const dynamic = "force-dynamic"

export default async function RtmDocumentPage({ params }: { params: Promise<{ dosirId: string }> }) {
  const { dosirId } = await params
  const data = await getRpsDocumentData(dosirId)
  if (!data) notFound()

  const session = await getCurrentSession()
  if (!session?.user) redirect("/login")
  if (session.user.role === "DOSEN" && data.dosir.dosen_id !== session.user.id) redirect("/rtm")

  const assessments = [...(data.rps?.komponens ?? [])].sort((a, b) => a.urutan - b.urutan)
  const cpmkById = new Map((data.rps?.cpmks ?? []).map((item) => [item.id, item.kode]))

  return (
    <div className="mx-auto max-w-[960px] pb-12">
      <PrintToolbar backHref="/rtm" label="RTM" />

      {assessments.length === 0 ? (
        <div className="rounded-xl border-2 border-dashed bg-white py-20 text-center text-sm text-gray-500">
          Belum ada asesmen yang dapat dibentuk menjadi RTM.
        </div>
      ) : (
        <div className="space-y-8 print:space-y-0">
          {assessments.map((assessment, index) => (
            <article key={assessment.id} className="document-page overflow-hidden rounded-xl border bg-white shadow-sm print:break-after-page print:rounded-none print:border-0 print:shadow-none">
              <header className="border-b-4 border-teal-800 px-8 py-7 text-center">
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-teal-700">Program Studi Sistem Informasi</p>
                <h1 className="mt-2 text-2xl font-bold uppercase text-slate-950">Rencana Tugas Mahasiswa (RTM)</h1>
                <p className="mt-2 text-lg font-semibold">{assessment.nama || `Asesmen ${index + 1}`}</p>
              </header>

              <section className="grid gap-x-8 gap-y-2 border-b bg-teal-50/40 px-8 py-5 text-sm md:grid-cols-2">
                <Identity label="Mata Kuliah" value={`${data.dosir.mk.kode} — ${data.dosir.mk.nama_id}`} wide />
                <Identity label="Dosen Pengampu" value={data.dosir.dosen.nama_lengkap} wide />
                <Identity label="Semester / Kelas" value={`${data.dosir.mk.semester_rekomendasi} / ${data.dosir.kelas}`} />
                <Identity label="Tahun Akademik" value={data.dosir.tahunAkademik.kode} />
                <Identity label="Teknik Penilaian" value={assessment.tipe} />
                <Identity label="Bobot" value={`${Number(assessment.bobot).toFixed(2).replace(/\.00$/, "")}%`} />
                <Identity label="Pelaksanaan" value={`Minggu ${assessment.minggu_pemberian || "—"} sampai ${assessment.minggu_pengumpulan || "—"}`} />
                <Identity label="Bentuk Tugas" value={assessment.is_kelompok ? "Kelompok" : "Individu"} />
              </section>

              <section className="space-y-5 p-8 text-sm">
                <Block title="CPMK dan Sub-CPMK yang Diukur">
                  <div className="flex flex-wrap gap-2">
                    {assessment.cpmkMappings.map((mapping) => (
                      <span key={mapping.cpmk_id} className="rounded-md bg-blue-50 px-2 py-1 font-mono font-semibold text-blue-800">
                        {cpmkById.get(mapping.cpmk_id) || "CPMK"}
                      </span>
                    ))}
                    {assessment.subCpmkMappings.map((mapping) => (
                      <span key={mapping.sub_cpmk_id} className="rounded-md bg-teal-50 px-2 py-1 font-mono font-semibold text-teal-800">
                        {mapping.subCpmk.kode}
                      </span>
                    ))}
                    {assessment.cpmkMappings.length === 0 && assessment.subCpmkMappings.length === 0 && <span>—</span>}
                  </div>
                </Block>

                <Block title="Deskripsi dan Tujuan Tugas"><p className="whitespace-pre-wrap">{assessment.deskripsi || "—"}</p></Block>
                <Block title="Instruksi Pengerjaan"><p className="whitespace-pre-wrap">{assessment.instruksi || "—"}</p></Block>

                <div className="grid gap-5 md:grid-cols-2">
                  <Block title="Bentuk / Format Luaran"><p>{assessment.bentuk || "—"}</p></Block>
                  <Block title="Luaran yang Diharapkan"><p>{assessment.luaran || "—"}</p></Block>
                </div>

                <Block title="Kriteria Penilaian"><p className="whitespace-pre-wrap">{assessment.kriteria_penilaian || "—"}</p></Block>

                <Block title="Rubrik Penilaian">
                  {assessment.rubrikKriterias.length === 0 ? (
                    <p>Rubrik belum dilengkapi.</p>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full border-collapse text-[10px] leading-relaxed">
                        <thead>
                          <tr className="bg-slate-900 text-white">
                            <th className="border border-slate-700 p-2 text-left">Kriteria</th>
                            <th className="border border-slate-700 p-2 text-center">Bobot</th>
                            <th className="border border-slate-700 p-2 text-left">Sangat Baik<br />81–100</th>
                            <th className="border border-slate-700 p-2 text-left">Baik<br />61–80</th>
                            <th className="border border-slate-700 p-2 text-left">Cukup<br />41–60</th>
                            <th className="border border-slate-700 p-2 text-left">Kurang<br />21–40</th>
                            <th className="border border-slate-700 p-2 text-left">Sangat Kurang<br />0–20</th>
                          </tr>
                        </thead>
                        <tbody>
                          {assessment.rubrikKriterias.sort((a, b) => a.urutan - b.urutan).map((rubric) => (
                            <tr key={rubric.id} className="align-top even:bg-slate-50">
                              <td className="border p-2 font-semibold">{rubric.kriteria}</td>
                              <td className="border p-2 text-center">{Number(rubric.bobot).toFixed(2).replace(/\.00$/, "")}%</td>
                              <td className="border p-2">{rubric.sangat_baik || "—"}</td>
                              <td className="border p-2">{rubric.baik || "—"}</td>
                              <td className="border p-2">{rubric.cukup || "—"}</td>
                              <td className="border p-2">{rubric.kurang || "—"}</td>
                              <td className="border p-2">{rubric.sangat_kurang || "—"}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </Block>
              </section>

              <footer className="grid grid-cols-2 gap-16 px-12 pb-10 pt-4 text-center text-sm">
                <Signature label="Mengetahui, Ketua Program Studi" />
                <Signature label="Dosen Pengampu" name={data.dosir.dosen.nama_lengkap} />
              </footer>
            </article>
          ))}
        </div>
      )}
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

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-lg border">
      <h2 className="border-b bg-slate-50 px-4 py-2 text-xs font-bold uppercase tracking-wide text-slate-700">{title}</h2>
      <div className="px-4 py-3">{children}</div>
    </section>
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
