import "server-only"

import { cookies } from "next/headers"
import { desc } from "drizzle-orm"

import { db } from "@/db"
import { tahunAkademik } from "@/db/schema"

export const ACADEMIC_YEAR_COOKIE = "sipeka_academic_year"
export const ACADEMIC_SEMESTER_COOKIE = "sipeka_academic_semester"

type RequestedPeriod = { tahun?: string; semester?: string }

export async function getAcademicTermContext(requested: RequestedPeriod = {}) {
  const [cookieStore, allTerms] = await Promise.all([
    cookies(),
    db.query.tahunAkademik.findMany({ orderBy: [desc(tahunAkademik.tahun_mulai), desc(tahunAkademik.semester)] }),
  ])
  const active = allTerms.find((term) => term.is_active) ?? allTerms[0] ?? null
  const year = requested.tahun || cookieStore.get(ACADEMIC_YEAR_COOKIE)?.value
  const semester = requested.semester || cookieStore.get(ACADEMIC_SEMESTER_COOKIE)?.value
  const term = allTerms.find((item) => `${item.tahun_mulai}/${item.tahun_mulai + 1}` === year && String(item.semester) === semester) ?? active

  return {
    term,
    year: term ? `${term.tahun_mulai}/${term.tahun_mulai + 1}` : "-",
    semester: term?.semester ?? null,
    semesterLabel: term?.semester === 1 ? "Ganjil" : term?.semester === 2 ? "Genap" : "-",
    label: term ? `${term.tahun_mulai}/${term.tahun_mulai + 1} · ${term.semester === 1 ? "Ganjil" : "Genap"}` : "Periode belum dipilih",
  }
}
