# AG Agents Spec Pack — Sistem Manajemen Kurikulum OBE

## Isi Paket Ini

| File | Deskripsi |
|------|-----------|
| `CLAUDE.md` | **Baca ini PERTAMA.** Panduan agent behavior, build order, coding standards, seed data. |
| `prd-kurikulum-si-is2020.md` | Product Requirements Document — fitur lengkap, seed data CPL/MK, scope v1. |
| `domain-model-kurikulum-si.md` | Database schema (TypeScript interfaces) + business logic kalkulasi CPL attainment. |
| `agents-spec-kurikulum-si.md` | Task breakdown per sub-agent, routing, API endpoint reference, UX rules. |
| `claude-prompts-kurikulum-si.md` | Prompt templates untuk 5 fitur AI assist (CPMK generator, IS2020 mapper, dsb.) |

## Konteks Proyek

Sistem ini untuk **Program Studi S1 Sistem Informasi** yang membangun kurikulum OBE
berbasis standar **ACM/AIS IS2020**. Data awal (CPL dan peta kurikulum) tersedia di file
`Matriks_CPL_20260311.xlsx` yang harus digunakan sebagai seed data.

## Referensi Standar

- IS2020 full document: `is2020.pdf` (Appendix 2 & 3 untuk competency detail)
- Regulasi lokal: SN-DIKTI / Permendikbud 53/2023, KKNI Level 6

## Prioritas Build

**Fungsional > Estetika.** Sistem harus bisa digunakan untuk rapat kurikulum nyata.
Tampilan cukup clean dan tidak membingungkan, tidak perlu fancy.

## Stack

Next.js + TypeScript + Supabase (PostgreSQL + Auth) + Vercel

