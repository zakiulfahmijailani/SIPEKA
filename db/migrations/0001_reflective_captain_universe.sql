CREATE TYPE "public"."contribution_level" AS ENUM('H', 'M', 'L');--> statement-breakpoint
CREATE TYPE "public"."plo_category" AS ENUM('Sikap', 'Keterampilan Umum', 'Keterampilan Khusus', 'Pengetahuan');--> statement-breakpoint
CREATE TABLE "course_plo_mappings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"course_id" uuid NOT NULL,
	"plo_id" uuid NOT NULL,
	"contribution_level" "contribution_level",
	"contribution_value" real,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "courses" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"curriculum_id" uuid NOT NULL,
	"code" varchar(20) NOT NULL,
	"name" varchar(200) NOT NULL,
	"credits_theory" integer DEFAULT 0 NOT NULL,
	"credits_practice" integer DEFAULT 0 NOT NULL,
	"semester" integer NOT NULL,
	"is_mandatory" boolean DEFAULT true NOT NULL,
	"prerequisites" text[] DEFAULT '{}',
	"study_field" varchar(100),
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "curriculums" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(100) NOT NULL,
	"year" varchar(9) NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "plos" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"curriculum_id" uuid NOT NULL,
	"code" varchar(20) NOT NULL,
	"description" text NOT NULL,
	"category" "plo_category" NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "course_plo_mappings" ADD CONSTRAINT "course_plo_mappings_course_id_courses_id_fk" FOREIGN KEY ("course_id") REFERENCES "public"."courses"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "course_plo_mappings" ADD CONSTRAINT "course_plo_mappings_plo_id_plos_id_fk" FOREIGN KEY ("plo_id") REFERENCES "public"."plos"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "courses" ADD CONSTRAINT "courses_curriculum_id_curriculums_id_fk" FOREIGN KEY ("curriculum_id") REFERENCES "public"."curriculums"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "plos" ADD CONSTRAINT "plos_curriculum_id_curriculums_id_fk" FOREIGN KEY ("curriculum_id") REFERENCES "public"."curriculums"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "course_plo_mappings_course_id_plo_id_unique" ON "course_plo_mappings" USING btree ("course_id","plo_id");--> statement-breakpoint
CREATE INDEX "course_plo_mappings_course_id_idx" ON "course_plo_mappings" USING btree ("course_id");--> statement-breakpoint
CREATE INDEX "course_plo_mappings_plo_id_idx" ON "course_plo_mappings" USING btree ("plo_id");--> statement-breakpoint
CREATE INDEX "course_plo_mappings_course_id_plo_id_idx" ON "course_plo_mappings" USING btree ("course_id","plo_id");