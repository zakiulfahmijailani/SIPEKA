ALTER TYPE "public"."mk_track" ADD VALUE 'ISG';--> statement-breakpoint
ALTER TYPE "public"."mk_track" ADD VALUE 'DMS';--> statement-breakpoint
CREATE TABLE "assessment_template" (
	"id" text PRIMARY KEY NOT NULL,
	"mk_id" text NOT NULL,
	"cpmk_template_id" text,
	"sub_cpmk_template_id" text,
	"nama" text NOT NULL,
	"tipe" text NOT NULL,
	"bobot" real NOT NULL,
	"kriteria_penilaian" text,
	"urutan" integer NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "assessment_template_mk_id_urutan_unique" UNIQUE("mk_id","urutan")
);
--> statement-breakpoint
CREATE TABLE "cpmk_template" (
	"id" text PRIMARY KEY NOT NULL,
	"mk_id" text NOT NULL,
	"cpl_id" text,
	"kode" text NOT NULL,
	"deskripsi" text NOT NULL,
	"urutan" integer NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "cpmk_template_mk_id_kode_unique" UNIQUE("mk_id","kode")
);
--> statement-breakpoint
CREATE TABLE "komponen_sub_cpmk" (
	"id" text PRIMARY KEY NOT NULL,
	"komponen_id" text NOT NULL,
	"sub_cpmk_id" text NOT NULL,
	CONSTRAINT "komponen_sub_cpmk_komponen_id_sub_cpmk_id_unique" UNIQUE("komponen_id","sub_cpmk_id")
);
--> statement-breakpoint
CREATE TABLE "rubrik_kriteria" (
	"id" text PRIMARY KEY NOT NULL,
	"komponen_id" text NOT NULL,
	"kriteria" text NOT NULL,
	"bobot" real DEFAULT 100 NOT NULL,
	"sangat_baik" text,
	"baik" text,
	"cukup" text,
	"kurang" text,
	"sangat_kurang" text,
	"urutan" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "rubrik_kriteria_komponen_id_urutan_unique" UNIQUE("komponen_id","urutan")
);
--> statement-breakpoint
CREATE TABLE "sub_cpmk_template" (
	"id" text PRIMARY KEY NOT NULL,
	"cpmk_template_id" text NOT NULL,
	"kode" text NOT NULL,
	"deskripsi" text NOT NULL,
	"level_bloom" "bloom_level" DEFAULT 'C3' NOT NULL,
	"urutan" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "sub_cpmk_template_cpmk_template_id_kode_unique" UNIQUE("cpmk_template_id","kode")
);
--> statement-breakpoint
ALTER TABLE "komponen_penilaian" ALTER COLUMN "bobot" SET DATA TYPE real;--> statement-breakpoint
ALTER TABLE "profil_lulusan" ADD COLUMN "bidang_pekerjaan" text;--> statement-breakpoint
ALTER TABLE "mata_kuliah" ADD COLUMN "has_praktikum" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "mata_kuliah" ADD COLUMN "keterangan_praktikum" text;--> statement-breakpoint
ALTER TABLE "mata_kuliah" ADD COLUMN "is_pbl" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "mata_kuliah" ADD COLUMN "keterangan_pbl" text;--> statement-breakpoint
ALTER TABLE "mata_kuliah" ADD COLUMN "keterangan_semester" text;--> statement-breakpoint
ALTER TABLE "komponen_penilaian" ADD COLUMN "instruksi" text;--> statement-breakpoint
ALTER TABLE "komponen_penilaian" ADD COLUMN "bentuk" text;--> statement-breakpoint
ALTER TABLE "komponen_penilaian" ADD COLUMN "luaran" text;--> statement-breakpoint
ALTER TABLE "komponen_penilaian" ADD COLUMN "kriteria_penilaian" text;--> statement-breakpoint
ALTER TABLE "komponen_penilaian" ADD COLUMN "minggu_pemberian" integer;--> statement-breakpoint
ALTER TABLE "komponen_penilaian" ADD COLUMN "minggu_pengumpulan" integer;--> statement-breakpoint
ALTER TABLE "komponen_penilaian" ADD COLUMN "is_kelompok" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "komponen_penilaian" ADD COLUMN "updated_at" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "rps_pertemuan" ADD COLUMN "indikator" text;--> statement-breakpoint
ALTER TABLE "rps_pertemuan" ADD COLUMN "bentuk_pembelajaran" text;--> statement-breakpoint
ALTER TABLE "rps_pertemuan" ADD COLUMN "aktivitas_dosen" text;--> statement-breakpoint
ALTER TABLE "rps_pertemuan" ADD COLUMN "aktivitas_mahasiswa" text;--> statement-breakpoint
ALTER TABLE "rps_pertemuan" ADD COLUMN "kriteria_penilaian" text;--> statement-breakpoint
ALTER TABLE "assessment_template" ADD CONSTRAINT "assessment_template_mk_id_mata_kuliah_id_fk" FOREIGN KEY ("mk_id") REFERENCES "public"."mata_kuliah"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "assessment_template" ADD CONSTRAINT "assessment_template_cpmk_template_id_cpmk_template_id_fk" FOREIGN KEY ("cpmk_template_id") REFERENCES "public"."cpmk_template"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "assessment_template" ADD CONSTRAINT "assessment_template_sub_cpmk_template_id_sub_cpmk_template_id_fk" FOREIGN KEY ("sub_cpmk_template_id") REFERENCES "public"."sub_cpmk_template"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cpmk_template" ADD CONSTRAINT "cpmk_template_mk_id_mata_kuliah_id_fk" FOREIGN KEY ("mk_id") REFERENCES "public"."mata_kuliah"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cpmk_template" ADD CONSTRAINT "cpmk_template_cpl_id_cpl_id_fk" FOREIGN KEY ("cpl_id") REFERENCES "public"."cpl"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "komponen_sub_cpmk" ADD CONSTRAINT "komponen_sub_cpmk_komponen_id_komponen_penilaian_id_fk" FOREIGN KEY ("komponen_id") REFERENCES "public"."komponen_penilaian"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "komponen_sub_cpmk" ADD CONSTRAINT "komponen_sub_cpmk_sub_cpmk_id_sub_cpmk_id_fk" FOREIGN KEY ("sub_cpmk_id") REFERENCES "public"."sub_cpmk"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rubrik_kriteria" ADD CONSTRAINT "rubrik_kriteria_komponen_id_komponen_penilaian_id_fk" FOREIGN KEY ("komponen_id") REFERENCES "public"."komponen_penilaian"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sub_cpmk_template" ADD CONSTRAINT "sub_cpmk_template_cpmk_template_id_cpmk_template_id_fk" FOREIGN KEY ("cpmk_template_id") REFERENCES "public"."cpmk_template"("id") ON DELETE cascade ON UPDATE no action;