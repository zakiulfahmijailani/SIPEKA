ALTER TABLE "cpmk" ADD COLUMN IF NOT EXISTS "metode_pencapaian" text;--> statement-breakpoint
ALTER TABLE "komponen_penilaian" ADD COLUMN IF NOT EXISTS "referensi_tugas" text;--> statement-breakpoint
ALTER TABLE "komponen_penilaian" ADD COLUMN IF NOT EXISTS "lain_lain" text;--> statement-breakpoint
ALTER TABLE "rps" ADD COLUMN IF NOT EXISTS "deskripsi_mk" text;--> statement-breakpoint
ALTER TABLE "rps" ADD COLUMN IF NOT EXISTS "metode_pembelajaran" text;--> statement-breakpoint
ALTER TABLE "rps" ADD COLUMN IF NOT EXISTS "persyaratan_kehadiran" text;--> statement-breakpoint
ALTER TABLE "rps" ADD COLUMN IF NOT EXISTS "status_revisi" text DEFAULT 'R-1' NOT NULL;--> statement-breakpoint
ALTER TABLE "rps" ADD COLUMN IF NOT EXISTS "tanggal_penyusunan" date;--> statement-breakpoint
ALTER TABLE "rps" ADD COLUMN IF NOT EXISTS "nama_penyetuju" text;--> statement-breakpoint
ALTER TABLE "rps" ADD COLUMN IF NOT EXISTS "jabatan_penyetuju" text DEFAULT 'Ketua Program Studi' NOT NULL;--> statement-breakpoint
ALTER TABLE "rps" ADD COLUMN IF NOT EXISTS "tanggal_pengesahan" date;--> statement-breakpoint
ALTER TABLE "rps_pertemuan" ADD COLUMN IF NOT EXISTS "referensi" text;
