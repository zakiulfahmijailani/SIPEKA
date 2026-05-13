import { pgTable, text, timestamp, numeric, pgEnum, unique } from "drizzle-orm/pg-core"
import { createId } from "@paralleldrive/cuid2"
import { cpmk } from "./rps"
import { cpl } from "./kurikulum"
import { mahasiswa, enrollment } from "./nilai"
import { dosirMk } from "./dosir"

export const attainmentStatusEnum = pgEnum("attainment_status", [
  "TERCAPAI", "BELUM_TERCAPAI", "DALAM_PROSES"
])

export const cpmkAttainment = pgTable("cpmk_attainment", {
  id: text("id").primaryKey().$defaultFn(() => createId()),
  enrollment_id: text("enrollment_id").notNull().references(() => enrollment.id, { onDelete: "cascade" }),
  cpmk_id: text("cpmk_id").notNull().references(() => cpmk.id),
  nilai_akhir: numeric("nilai_akhir", { precision: 5, scale: 2 }),
  status: attainmentStatusEnum("status"),
  calculated_at: timestamp("calculated_at").defaultNow(),
}, (t) => [unique().on(t.enrollment_id, t.cpmk_id)])

export const cplAttainment = pgTable("cpl_attainment", {
  id: text("id").primaryKey().$defaultFn(() => createId()),
  mahasiswa_id: text("mahasiswa_id").notNull().references(() => mahasiswa.id, { onDelete: "cascade" }),
  cpl_id: text("cpl_id").notNull().references(() => cpl.id),
  dosir_mk_id: text("dosir_mk_id").notNull().references(() => dosirMk.id),
  nilai_attainment: numeric("nilai_attainment", { precision: 5, scale: 2 }),
  status: attainmentStatusEnum("status"),
  calculated_at: timestamp("calculated_at").defaultNow(),
}, (t) => [unique().on(t.mahasiswa_id, t.cpl_id, t.dosir_mk_id)])
