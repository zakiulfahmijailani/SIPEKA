-- ============================================================
-- MIGRATION: Rename mahasiswa tracks BIS → ISG, DSA → DMS
-- Kurikulum 2026/2027 menggunakan nama peminatan baru:
--   BIS (Business Information Systems) → ISG (Information Systems & Governance)
--   DSA (Data Science & Analytics)     → DMS (Data Management Systems)
--
-- Jalankan migration ini SEBELUM menjalankan sync-curriculum-2026.ts
-- ============================================================

-- 1. Update mahasiswa track
UPDATE mahasiswa
SET track = 'ISG', updated_at = NOW()
WHERE track = 'BIS';

UPDATE mahasiswa
SET track = 'DMS', updated_at = NOW()
WHERE track = 'DSA';

-- 2. Update mata_kuliah track (safety net, seharusnya sudah benar dari sync)
UPDATE mata_kuliah
SET track = 'ISG', updated_at = NOW()
WHERE track = 'BIS';

UPDATE mata_kuliah
SET track = 'DMS', updated_at = NOW()
WHERE track = 'DSA';

-- 3. Verifikasi: pastikan tidak ada lagi data dengan track BIS/DSA
DO $$
DECLARE
  bis_count INTEGER;
  dsa_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO bis_count FROM mahasiswa WHERE track = 'BIS';
  SELECT COUNT(*) INTO dsa_count FROM mahasiswa WHERE track = 'DSA';

  IF bis_count > 0 OR dsa_count > 0 THEN
    RAISE NOTICE 'PERINGATAN: Masih ada % mahasiswa BIS dan % mahasiswa DSA', bis_count, dsa_count;
  ELSE
    RAISE NOTICE 'OK: Semua track mahasiswa sudah menggunakan ISG/DMS';
  END IF;

  SELECT COUNT(*) INTO bis_count FROM mata_kuliah WHERE track = 'BIS';
  SELECT COUNT(*) INTO dsa_count FROM mata_kuliah WHERE track = 'DSA';

  IF bis_count > 0 OR dsa_count > 0 THEN
    RAISE NOTICE 'PERINGATAN: Masih ada % MK BIS dan % MK DSA', bis_count, dsa_count;
  ELSE
    RAISE NOTICE 'OK: Semua track MK sudah menggunakan ISG/DMS';
  END IF;
END $$;
