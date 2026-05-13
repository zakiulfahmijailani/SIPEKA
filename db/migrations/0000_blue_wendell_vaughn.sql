CREATE TYPE "public"."user_role" AS ENUM('SUPER_ADMIN', 'KAPRODI', 'DOSEN', 'VIEWER');--> statement-breakpoint
CREATE TYPE "public"."is2020_status" AS ENUM('REQUIRED', 'ELECTIVE');--> statement-breakpoint
CREATE TYPE "public"."cpl_domain" AS ENUM('SIKAP', 'PENGETAHUAN', 'KETERAMPILAN_UMUM', 'KETERAMPILAN_KHUSUS');--> statement-breakpoint
CREATE TYPE "public"."mk_status" AS ENUM('WAJIB', 'PILIHAN');--> statement-breakpoint
CREATE TYPE "public"."mk_track" AS ENUM('UMUM', 'BIS', 'DSA');--> statement-breakpoint
CREATE TYPE "public"."tipe_aktivitas" AS ENUM('TEORI', 'PRAKTIKUM', 'TEORI_PRAKTIKUM', 'SEMINAR', 'PROYEK');--> statement-breakpoint
CREATE TYPE "public"."bloom_level" AS ENUM('C1', 'C2', 'C3', 'C4', 'C5', 'C6');--> statement-breakpoint
CREATE TYPE "public"."rps_status" AS ENUM('DRAFT', 'SUBMITTED', 'APPROVED', 'REVISION_REQUIRED', 'ARCHIVED');--> statement-breakpoint
CREATE TYPE "public"."mahasiswa_status" AS ENUM('AKTIF', 'CUTI', 'LULUS', 'DO');--> statement-breakpoint
CREATE TYPE "public"."attainment_status" AS ENUM('TERCAPAI', 'BELUM_TERCAPAI', 'DALAM_PROSES');--> statement-breakpoint
CREATE TYPE "public"."audit_action" AS ENUM('CREATE', 'UPDATE', 'DELETE', 'STATUS_CHANGE');--> statement-breakpoint
CREATE TABLE "accounts" (
	"id" text PRIMARY KEY NOT NULL,
	"userId" text NOT NULL,
	"type" text NOT NULL,
	"provider" text NOT NULL,
	"providerAccountId" text NOT NULL,
	"refresh_token" text,
	"access_token" text,
	"expires_at" text,
	"token_type" text,
	"scope" text,
	"id_token" text,
	"session_state" text
);
--> statement-breakpoint
CREATE TABLE "sessions" (
	"id" text PRIMARY KEY NOT NULL,
	"sessionToken" text NOT NULL,
	"userId" text NOT NULL,
	"expires" timestamp NOT NULL,
	CONSTRAINT "sessions_sessionToken_unique" UNIQUE("sessionToken")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" text PRIMARY KEY NOT NULL,
	"email" text NOT NULL,
	"password" text,
	"nama_lengkap" text NOT NULL,
	"nidn" text,
	"role" "user_role" DEFAULT 'DOSEN' NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "verification_tokens" (
	"identifier" text NOT NULL,
	"token" text NOT NULL,
	"expires" timestamp NOT NULL,
	CONSTRAINT "verification_tokens_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "is2020_area" (
	"id" text PRIMARY KEY NOT NULL,
	"realm_id" text NOT NULL,
	"kode" text NOT NULL,
	"nama" text NOT NULL,
	"deskripsi" text,
	"status" "is2020_status" DEFAULT 'REQUIRED' NOT NULL,
	"urutan" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "is2020_area_kode_unique" UNIQUE("kode")
);
--> statement-breakpoint
CREATE TABLE "is2020_realm" (
	"id" text PRIMARY KEY NOT NULL,
	"kode" text NOT NULL,
	"nama" text NOT NULL,
	"deskripsi" text,
	"urutan" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "is2020_realm_kode_unique" UNIQUE("kode")
);
--> statement-breakpoint
CREATE TABLE "profil_lulusan" (
	"id" text PRIMARY KEY NOT NULL,
	"kode" text NOT NULL,
	"nama" text NOT NULL,
	"deskripsi" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "profil_lulusan_kode_unique" UNIQUE("kode")
);
--> statement-breakpoint
CREATE TABLE "cpl" (
	"id" text PRIMARY KEY NOT NULL,
	"kode" text NOT NULL,
	"slug" text NOT NULL,
	"domain" "cpl_domain" NOT NULL,
	"rumusan" text NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"urutan" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "cpl_kode_unique" UNIQUE("kode"),
	CONSTRAINT "cpl_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "cpl_is2020_area" (
	"id" text PRIMARY KEY NOT NULL,
	"cpl_id" text NOT NULL,
	"is2020_area_id" text NOT NULL,
	CONSTRAINT "cpl_is2020_area_cpl_id_is2020_area_id_unique" UNIQUE("cpl_id","is2020_area_id")
);
--> statement-breakpoint
CREATE TABLE "cpl_profil_lulusan" (
	"id" text PRIMARY KEY NOT NULL,
	"cpl_id" text NOT NULL,
	"profil_lulusan_id" text NOT NULL,
	CONSTRAINT "cpl_profil_lulusan_cpl_id_profil_lulusan_id_unique" UNIQUE("cpl_id","profil_lulusan_id")
);
--> statement-breakpoint
CREATE TABLE "mata_kuliah" (
	"id" text PRIMARY KEY NOT NULL,
	"kode" text NOT NULL,
	"nama_id" text NOT NULL,
	"nama_en" text,
	"sks_teori" integer DEFAULT 2 NOT NULL,
	"sks_praktik" integer DEFAULT 0 NOT NULL,
	"semester_rekomendasi" integer NOT NULL,
	"status" "mk_status" DEFAULT 'WAJIB' NOT NULL,
	"track" "mk_track" DEFAULT 'UMUM' NOT NULL,
	"tipe_aktivitas" "tipe_aktivitas" DEFAULT 'TEORI' NOT NULL,
	"deskripsi" text,
	"bahasa" text DEFAULT 'Indonesia',
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "mata_kuliah_kode_unique" UNIQUE("kode")
);
--> statement-breakpoint
CREATE TABLE "mk_is2020_area" (
	"id" text PRIMARY KEY NOT NULL,
	"mk_id" text NOT NULL,
	"is2020_area_id" text NOT NULL,
	"is_primary" boolean DEFAULT false NOT NULL,
	CONSTRAINT "mk_is2020_area_mk_id_is2020_area_id_unique" UNIQUE("mk_id","is2020_area_id")
);
--> statement-breakpoint
CREATE TABLE "mk_prasyarat" (
	"id" text PRIMARY KEY NOT NULL,
	"mk_id" text NOT NULL,
	"prasyarat_mk_id" text NOT NULL,
	CONSTRAINT "mk_prasyarat_mk_id_prasyarat_mk_id_unique" UNIQUE("mk_id","prasyarat_mk_id")
);
--> statement-breakpoint
CREATE TABLE "peta_kurikulum" (
	"id" text PRIMARY KEY NOT NULL,
	"mk_id" text NOT NULL,
	"cpl_id" text NOT NULL,
	"bobot" integer DEFAULT 1 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "peta_kurikulum_mk_id_cpl_id_unique" UNIQUE("mk_id","cpl_id")
);
--> statement-breakpoint
CREATE TABLE "dosir_mk" (
	"id" text PRIMARY KEY NOT NULL,
	"mk_id" text NOT NULL,
	"dosen_id" text NOT NULL,
	"tahun_akademik_id" text NOT NULL,
	"kelas" text DEFAULT 'A' NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "dosir_mk_mk_id_dosen_id_tahun_akademik_id_kelas_unique" UNIQUE("mk_id","dosen_id","tahun_akademik_id","kelas")
);
--> statement-breakpoint
CREATE TABLE "tahun_akademik" (
	"id" text PRIMARY KEY NOT NULL,
	"kode" text NOT NULL,
	"nama" text NOT NULL,
	"semester" integer NOT NULL,
	"tahun_mulai" integer NOT NULL,
	"is_active" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "tahun_akademik_kode_unique" UNIQUE("kode")
);
--> statement-breakpoint
CREATE TABLE "cpmk" (
	"id" text PRIMARY KEY NOT NULL,
	"rps_id" text NOT NULL,
	"kode" text NOT NULL,
	"deskripsi" text NOT NULL,
	"urutan" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "cpmk_rps_id_kode_unique" UNIQUE("rps_id","kode")
);
--> statement-breakpoint
CREATE TABLE "cpmk_cpl" (
	"id" text PRIMARY KEY NOT NULL,
	"cpmk_id" text NOT NULL,
	"cpl_id" text NOT NULL,
	CONSTRAINT "cpmk_cpl_cpmk_id_cpl_id_unique" UNIQUE("cpmk_id","cpl_id")
);
--> statement-breakpoint
CREATE TABLE "komponen_cpmk" (
	"id" text PRIMARY KEY NOT NULL,
	"komponen_id" text NOT NULL,
	"cpmk_id" text NOT NULL,
	CONSTRAINT "komponen_cpmk_komponen_id_cpmk_id_unique" UNIQUE("komponen_id","cpmk_id")
);
--> statement-breakpoint
CREATE TABLE "komponen_penilaian" (
	"id" text PRIMARY KEY NOT NULL,
	"rps_id" text NOT NULL,
	"nama" text NOT NULL,
	"tipe" text NOT NULL,
	"bobot" integer NOT NULL,
	"deskripsi" text,
	"urutan" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "pertemuan_sub_cpmk" (
	"id" text PRIMARY KEY NOT NULL,
	"pertemuan_id" text NOT NULL,
	"sub_cpmk_id" text NOT NULL,
	CONSTRAINT "pertemuan_sub_cpmk_pertemuan_id_sub_cpmk_id_unique" UNIQUE("pertemuan_id","sub_cpmk_id")
);
--> statement-breakpoint
CREATE TABLE "rps" (
	"id" text PRIMARY KEY NOT NULL,
	"dosir_mk_id" text NOT NULL,
	"version" integer DEFAULT 1 NOT NULL,
	"status" "rps_status" DEFAULT 'DRAFT' NOT NULL,
	"catatan_reviewer" text,
	"submitted_at" timestamp,
	"approved_at" timestamp,
	"approved_by" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "rps_dosir_mk_id_version_unique" UNIQUE("dosir_mk_id","version")
);
--> statement-breakpoint
CREATE TABLE "rps_pertemuan" (
	"id" text PRIMARY KEY NOT NULL,
	"rps_id" text NOT NULL,
	"minggu_ke" integer NOT NULL,
	"materi" text NOT NULL,
	"metode" text,
	"media" text,
	"estimasi_waktu" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "rps_pertemuan_rps_id_minggu_ke_unique" UNIQUE("rps_id","minggu_ke")
);
--> statement-breakpoint
CREATE TABLE "rps_referensi" (
	"id" text PRIMARY KEY NOT NULL,
	"rps_id" text NOT NULL,
	"jenis" text NOT NULL,
	"teks" text NOT NULL,
	"urutan" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "rps_status_log" (
	"id" text PRIMARY KEY NOT NULL,
	"rps_id" text NOT NULL,
	"status_from" "rps_status",
	"status_to" "rps_status" NOT NULL,
	"changed_by" text NOT NULL,
	"catatan" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sub_cpmk" (
	"id" text PRIMARY KEY NOT NULL,
	"cpmk_id" text NOT NULL,
	"kode" text NOT NULL,
	"deskripsi" text NOT NULL,
	"level_bloom" "bloom_level" NOT NULL,
	"urutan" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "sub_cpmk_cpmk_id_kode_unique" UNIQUE("cpmk_id","kode")
);
--> statement-breakpoint
CREATE TABLE "enrollment" (
	"id" text PRIMARY KEY NOT NULL,
	"mahasiswa_id" text NOT NULL,
	"dosir_mk_id" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "enrollment_mahasiswa_id_dosir_mk_id_unique" UNIQUE("mahasiswa_id","dosir_mk_id")
);
--> statement-breakpoint
CREATE TABLE "mahasiswa" (
	"id" text PRIMARY KEY NOT NULL,
	"nim" text NOT NULL,
	"nama_lengkap" text NOT NULL,
	"angkatan" integer NOT NULL,
	"track" "mk_track" DEFAULT 'UMUM' NOT NULL,
	"status" "mahasiswa_status" DEFAULT 'AKTIF' NOT NULL,
	"email" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "mahasiswa_nim_unique" UNIQUE("nim")
);
--> statement-breakpoint
CREATE TABLE "nilai" (
	"id" text PRIMARY KEY NOT NULL,
	"enrollment_id" text NOT NULL,
	"komponen_id" text NOT NULL,
	"nilai" numeric(5, 2),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "nilai_enrollment_id_komponen_id_unique" UNIQUE("enrollment_id","komponen_id")
);
--> statement-breakpoint
CREATE TABLE "cpl_attainment" (
	"id" text PRIMARY KEY NOT NULL,
	"mahasiswa_id" text NOT NULL,
	"cpl_id" text NOT NULL,
	"dosir_mk_id" text NOT NULL,
	"nilai_attainment" numeric(5, 2),
	"status" "attainment_status",
	"calculated_at" timestamp DEFAULT now(),
	CONSTRAINT "cpl_attainment_mahasiswa_id_cpl_id_dosir_mk_id_unique" UNIQUE("mahasiswa_id","cpl_id","dosir_mk_id")
);
--> statement-breakpoint
CREATE TABLE "cpmk_attainment" (
	"id" text PRIMARY KEY NOT NULL,
	"enrollment_id" text NOT NULL,
	"cpmk_id" text NOT NULL,
	"nilai_akhir" numeric(5, 2),
	"status" "attainment_status",
	"calculated_at" timestamp DEFAULT now(),
	CONSTRAINT "cpmk_attainment_enrollment_id_cpmk_id_unique" UNIQUE("enrollment_id","cpmk_id")
);
--> statement-breakpoint
CREATE TABLE "audit_log" (
	"id" text PRIMARY KEY NOT NULL,
	"entity_type" text NOT NULL,
	"entity_id" text NOT NULL,
	"action" "audit_action" NOT NULL,
	"changed_by" text,
	"old_values" json,
	"new_values" json,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "notifications" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"message" text NOT NULL,
	"link" text,
	"is_read" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "program_settings" (
	"key" text PRIMARY KEY NOT NULL,
	"value" text NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "is2020_area" ADD CONSTRAINT "is2020_area_realm_id_is2020_realm_id_fk" FOREIGN KEY ("realm_id") REFERENCES "public"."is2020_realm"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cpl_is2020_area" ADD CONSTRAINT "cpl_is2020_area_cpl_id_cpl_id_fk" FOREIGN KEY ("cpl_id") REFERENCES "public"."cpl"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cpl_is2020_area" ADD CONSTRAINT "cpl_is2020_area_is2020_area_id_is2020_area_id_fk" FOREIGN KEY ("is2020_area_id") REFERENCES "public"."is2020_area"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cpl_profil_lulusan" ADD CONSTRAINT "cpl_profil_lulusan_cpl_id_cpl_id_fk" FOREIGN KEY ("cpl_id") REFERENCES "public"."cpl"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cpl_profil_lulusan" ADD CONSTRAINT "cpl_profil_lulusan_profil_lulusan_id_profil_lulusan_id_fk" FOREIGN KEY ("profil_lulusan_id") REFERENCES "public"."profil_lulusan"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mk_is2020_area" ADD CONSTRAINT "mk_is2020_area_mk_id_mata_kuliah_id_fk" FOREIGN KEY ("mk_id") REFERENCES "public"."mata_kuliah"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mk_is2020_area" ADD CONSTRAINT "mk_is2020_area_is2020_area_id_is2020_area_id_fk" FOREIGN KEY ("is2020_area_id") REFERENCES "public"."is2020_area"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mk_prasyarat" ADD CONSTRAINT "mk_prasyarat_mk_id_mata_kuliah_id_fk" FOREIGN KEY ("mk_id") REFERENCES "public"."mata_kuliah"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mk_prasyarat" ADD CONSTRAINT "mk_prasyarat_prasyarat_mk_id_mata_kuliah_id_fk" FOREIGN KEY ("prasyarat_mk_id") REFERENCES "public"."mata_kuliah"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "peta_kurikulum" ADD CONSTRAINT "peta_kurikulum_mk_id_mata_kuliah_id_fk" FOREIGN KEY ("mk_id") REFERENCES "public"."mata_kuliah"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "peta_kurikulum" ADD CONSTRAINT "peta_kurikulum_cpl_id_cpl_id_fk" FOREIGN KEY ("cpl_id") REFERENCES "public"."cpl"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "dosir_mk" ADD CONSTRAINT "dosir_mk_mk_id_mata_kuliah_id_fk" FOREIGN KEY ("mk_id") REFERENCES "public"."mata_kuliah"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "dosir_mk" ADD CONSTRAINT "dosir_mk_dosen_id_users_id_fk" FOREIGN KEY ("dosen_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "dosir_mk" ADD CONSTRAINT "dosir_mk_tahun_akademik_id_tahun_akademik_id_fk" FOREIGN KEY ("tahun_akademik_id") REFERENCES "public"."tahun_akademik"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cpmk" ADD CONSTRAINT "cpmk_rps_id_rps_id_fk" FOREIGN KEY ("rps_id") REFERENCES "public"."rps"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cpmk_cpl" ADD CONSTRAINT "cpmk_cpl_cpmk_id_cpmk_id_fk" FOREIGN KEY ("cpmk_id") REFERENCES "public"."cpmk"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cpmk_cpl" ADD CONSTRAINT "cpmk_cpl_cpl_id_cpl_id_fk" FOREIGN KEY ("cpl_id") REFERENCES "public"."cpl"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "komponen_cpmk" ADD CONSTRAINT "komponen_cpmk_komponen_id_komponen_penilaian_id_fk" FOREIGN KEY ("komponen_id") REFERENCES "public"."komponen_penilaian"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "komponen_cpmk" ADD CONSTRAINT "komponen_cpmk_cpmk_id_cpmk_id_fk" FOREIGN KEY ("cpmk_id") REFERENCES "public"."cpmk"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "komponen_penilaian" ADD CONSTRAINT "komponen_penilaian_rps_id_rps_id_fk" FOREIGN KEY ("rps_id") REFERENCES "public"."rps"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pertemuan_sub_cpmk" ADD CONSTRAINT "pertemuan_sub_cpmk_pertemuan_id_rps_pertemuan_id_fk" FOREIGN KEY ("pertemuan_id") REFERENCES "public"."rps_pertemuan"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pertemuan_sub_cpmk" ADD CONSTRAINT "pertemuan_sub_cpmk_sub_cpmk_id_sub_cpmk_id_fk" FOREIGN KEY ("sub_cpmk_id") REFERENCES "public"."sub_cpmk"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rps" ADD CONSTRAINT "rps_dosir_mk_id_dosir_mk_id_fk" FOREIGN KEY ("dosir_mk_id") REFERENCES "public"."dosir_mk"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rps" ADD CONSTRAINT "rps_approved_by_users_id_fk" FOREIGN KEY ("approved_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rps_pertemuan" ADD CONSTRAINT "rps_pertemuan_rps_id_rps_id_fk" FOREIGN KEY ("rps_id") REFERENCES "public"."rps"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rps_referensi" ADD CONSTRAINT "rps_referensi_rps_id_rps_id_fk" FOREIGN KEY ("rps_id") REFERENCES "public"."rps"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rps_status_log" ADD CONSTRAINT "rps_status_log_rps_id_rps_id_fk" FOREIGN KEY ("rps_id") REFERENCES "public"."rps"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rps_status_log" ADD CONSTRAINT "rps_status_log_changed_by_users_id_fk" FOREIGN KEY ("changed_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sub_cpmk" ADD CONSTRAINT "sub_cpmk_cpmk_id_cpmk_id_fk" FOREIGN KEY ("cpmk_id") REFERENCES "public"."cpmk"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "enrollment" ADD CONSTRAINT "enrollment_mahasiswa_id_mahasiswa_id_fk" FOREIGN KEY ("mahasiswa_id") REFERENCES "public"."mahasiswa"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "enrollment" ADD CONSTRAINT "enrollment_dosir_mk_id_dosir_mk_id_fk" FOREIGN KEY ("dosir_mk_id") REFERENCES "public"."dosir_mk"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "nilai" ADD CONSTRAINT "nilai_enrollment_id_enrollment_id_fk" FOREIGN KEY ("enrollment_id") REFERENCES "public"."enrollment"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "nilai" ADD CONSTRAINT "nilai_komponen_id_komponen_penilaian_id_fk" FOREIGN KEY ("komponen_id") REFERENCES "public"."komponen_penilaian"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cpl_attainment" ADD CONSTRAINT "cpl_attainment_mahasiswa_id_mahasiswa_id_fk" FOREIGN KEY ("mahasiswa_id") REFERENCES "public"."mahasiswa"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cpl_attainment" ADD CONSTRAINT "cpl_attainment_cpl_id_cpl_id_fk" FOREIGN KEY ("cpl_id") REFERENCES "public"."cpl"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cpl_attainment" ADD CONSTRAINT "cpl_attainment_dosir_mk_id_dosir_mk_id_fk" FOREIGN KEY ("dosir_mk_id") REFERENCES "public"."dosir_mk"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cpmk_attainment" ADD CONSTRAINT "cpmk_attainment_enrollment_id_enrollment_id_fk" FOREIGN KEY ("enrollment_id") REFERENCES "public"."enrollment"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cpmk_attainment" ADD CONSTRAINT "cpmk_attainment_cpmk_id_cpmk_id_fk" FOREIGN KEY ("cpmk_id") REFERENCES "public"."cpmk"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "audit_log" ADD CONSTRAINT "audit_log_changed_by_users_id_fk" FOREIGN KEY ("changed_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;