import { NextRequest, NextResponse } from "next/server"

import { getCurrentSession } from "@/lib/current-session"
import { createDocxExport, createPdfExport, type ExportDocumentType } from "@/lib/rps-export"
import { getOfficialRpsExportData, generateOfficialRpsDocx, generateOfficialRpsPdf } from "@/lib/rps-export-official"
import { getRpsDocumentData } from "@/lib/rps-documents"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

const validTypes = new Set<ExportDocumentType>(["rps", "rtm", "rpm"])

export async function GET(request: NextRequest, { params }: { params: Promise<{ type: string; dosirId: string }> }) {
  const session = await getCurrentSession()
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { type, dosirId } = await params
  if (!validTypes.has(type as ExportDocumentType)) return NextResponse.json({ error: "Jenis dokumen tidak valid" }, { status: 400 })

  const format = request.nextUrl.searchParams.get("format")
  if (format !== "docx" && format !== "pdf") return NextResponse.json({ error: "Format harus DOCX atau PDF" }, { status: 400 })

  if (type === "rps") {
    const officialData = await getOfficialRpsExportData(dosirId)
    if (!officialData) return NextResponse.json({ error: "Dokumen tidak ditemukan" }, { status: 404 })

    // Check permissions: Admin, Kaprodi, or assigned lecturer (including team teaching)
    if (session.user.role === "DOSEN") {
      const isAssigned =
        officialData.dosir.dosen_id === session.user.id ||
        (session.user.name && officialData.dosenList.includes(session.user.name))
      if (!isAssigned) return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const mkKode = (officialData.mk.kode || "MK").trim().replace(/[^a-zA-Z0-9_-]/g, "_")
    const mkNama = (officialData.mk.nama_id || officialData.mk.nama_en || "Mata_Kuliah")
      .trim()
      .replace(/\s+/g, "_")
      .replace(/[^a-zA-Z0-9_-]/g, "")
    const taKode = (officialData.tahunAkademik.kode || officialData.tahunAkademik.nama || "TA")
      .trim()
      .replace(/\s+/g, "_")
      .replace(/[^a-zA-Z0-9_-]/g, "")
    const kelas = (officialData.dosir.kelas || "A").trim().replace(/\s+/g, "_").replace(/[^a-zA-Z0-9_-]/g, "")

    const filename = `RPS_${mkKode}_${mkNama}_${taKode}_${kelas}.${format}`

    const content = format === "docx"
      ? await generateOfficialRpsDocx(officialData)
      : await generateOfficialRpsPdf(officialData)

    const mime = format === "docx"
      ? "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
      : "application/pdf"

    return new NextResponse(new Uint8Array(content), {
      headers: {
        "Content-Type": mime,
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "no-store",
      },
    })
  }

  // Fallback for RTM and RPM
  const data = await getRpsDocumentData(dosirId)
  if (!data) return NextResponse.json({ error: "Dokumen tidak ditemukan" }, { status: 404 })
  if (session.user.role === "DOSEN" && data.dosir.dosen_id !== session.user.id) return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  const filePrefix = `${type.toUpperCase()}-${data.dosir.mk.kode}-${data.dosir.tahunAkademik.kode}`.replace(/[^a-zA-Z0-9._-]/g, "_")
  const content = format === "docx" ? await createDocxExport(type as ExportDocumentType, data) : await createPdfExport(type as ExportDocumentType, data)
  const mime = format === "docx" ? "application/vnd.openxmlformats-officedocument.wordprocessingml.document" : "application/pdf"
  return new NextResponse(new Uint8Array(content), {
    headers: {
      "Content-Type": mime,
      "Content-Disposition": `attachment; filename="${filePrefix}.${format}"`,
      "Cache-Control": "no-store",
    },
  })
}

