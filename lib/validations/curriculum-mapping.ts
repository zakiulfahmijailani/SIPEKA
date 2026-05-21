import { z } from "zod"

export const CurriculumRowSchema = z.object({
  Kode_MK: z.string().min(1),
  Nama_MK: z.string().min(1),
  SKS_Teori: z.coerce.number().int().min(0),
  SKS_Praktik: z.coerce.number().int().min(0),
  Semester: z.coerce.number().int().min(1).max(8),
  Prasyarat: z.string().optional(),
  Bahan_Kajian: z.string().optional(),
})

// CPL columns are dynamic (CPL_01, CPL_02, etc.)
// They can be "H", "M", "L", "1", "0", or empty
export type CurriculumRow = z.infer<typeof CurriculumRowSchema>
