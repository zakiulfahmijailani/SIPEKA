import { NextRequest, NextResponse } from "next/server"
import { uploadCurriculumMapping } from "@/app/actions/curriculum"

export async function POST(req: NextRequest) {
  const formData = await req.formData()
  const result = await uploadCurriculumMapping(formData)
  return NextResponse.json(result)
}
