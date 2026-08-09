import { NextRequest, NextResponse } from "next/server"

import { getCurrentSession } from "@/lib/current-session"
import { ACADEMIC_SEMESTER_COOKIE, ACADEMIC_YEAR_COOKIE, getAcademicTermContext } from "@/lib/academic-term"

export async function POST(request: NextRequest) {
  const session = await getCurrentSession()
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const body = await request.json().catch(() => null)
  if (!body?.tahun || !["1", "2"].includes(String(body.semester))) return NextResponse.json({ error: "Periode tidak valid" }, { status: 400 })

  const context = await getAcademicTermContext({ tahun: String(body.tahun), semester: String(body.semester) })
  if (!context.term || context.year !== body.tahun || String(context.semester) !== String(body.semester)) return NextResponse.json({ error: "Tahun ajaran tidak ditemukan" }, { status: 404 })

  const response = NextResponse.json({ success: true, period: context.label })
  response.cookies.set(ACADEMIC_YEAR_COOKIE, context.year, { httpOnly: true, sameSite: "lax", path: "/", maxAge: 60 * 60 * 24 * 180 })
  response.cookies.set(ACADEMIC_SEMESTER_COOKIE, String(context.semester), { httpOnly: true, sameSite: "lax", path: "/", maxAge: 60 * 60 * 24 * 180 })
  return response
}
