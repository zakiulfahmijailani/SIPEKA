-- The current RPS editor classifies references by source type
-- (Buku, Jurnal, Web, or Lainnya). This legacy constraint only allowed
-- UTAMA/TAMBAHAN and prevented every value offered by the editor from saving.
ALTER TABLE "rps_referensi"
  DROP CONSTRAINT IF EXISTS "rps_referensi_jenis_check";
