import { toast as sonnerToast } from "sonner"

/**
 * Contextual toast helpers untuk SIPEKA.
 * Gunakan ini daripada sonner langsung agar pesan konsisten.
 */
export const notify = {
  // ── Nilai ──
  nilaiSimpan: (mk: string) =>
    sonnerToast.success(`Nilai ${mk} berhasil disimpan`, {
      description: "Rekap CPMK akan diperbarui otomatis.",
    }),
  nilaiGagal: () =>
    sonnerToast.error("Gagal menyimpan nilai", {
      description: "Periksa koneksi dan coba lagi.",
    }),

  // ── RPS ──
  rpsSubmit: (mk: string) =>
    sonnerToast.success(`RPS ${mk} berhasil diajukan`, {
      description: "Kaprodi akan menerima notifikasi review.",
    }),
  rpsApprove: (mk: string) =>
    sonnerToast.success(`RPS ${mk} disetujui`, {
      description: "Dosen pengampu telah diberitahu.",
    }),
  rpsReject: (mk: string) =>
    sonnerToast.error(`RPS ${mk} dikembalikan`, {
      description: "Dosen perlu merevisi sebelum resubmit.",
    }),
  rpsSave: () =>
    sonnerToast.success("Draft RPS disimpan"),

  // ── Data master ──
  simpan: (label: string) =>
    sonnerToast.success(`${label} berhasil disimpan`),
  hapus: (label: string) =>
    sonnerToast.warning(`${label} dihapus`, {
      description: "Aksi ini tidak dapat dibatalkan.",
    }),
  gagal: (label?: string) =>
    sonnerToast.error(label ?? "Terjadi kesalahan", {
      description: "Hubungi admin jika masalah berlanjut.",
    }),

  // ── Export ──
  exportBerhasil: (format: "Excel" | "PDF" | "CSV") =>
    sonnerToast.success(`${format} berhasil diunduh`),
  exportGagal: (format: "Excel" | "PDF" | "CSV") =>
    sonnerToast.error(`Gagal mengekspor ${format}`, {
      description: "Coba lagi beberapa saat.",
    }),

  // ── Auth ──
  sessionExpired: () =>
    sonnerToast.error("Sesi berakhir", {
      description: "Silakan login kembali.",
    }),
}
