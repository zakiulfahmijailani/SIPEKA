-- ============================================================
-- SEED: Tabel mahasiswa (v4 - FINAL)
-- Schema : id TEXT, nim VARCHAR, nama_lengkap VARCHAR,
--          angkatan INT, track mk_track NOT NULL, is_active BOOL
-- track  : default 'UMUM' untuk semua (update manual setelah seed)
-- Total  : 126 mahasiswa unik (deduplicated by NIM)
-- Generated: 2026-05-13
-- ============================================================

INSERT INTO mahasiswa (id, nim, nama_lengkap, angkatan, track, is_active)
VALUES
  (gen_random_uuid(), '1202702002', 'Septiawati', 2020, 'UMUM', true),
  (gen_random_uuid(), '1212001011', 'Muhammad Rafly Kamaluddin', 2021, 'UMUM', true),
  (gen_random_uuid(), '1212002001', 'Muhammad Randi Daffa Nur', 2021, 'UMUM', true),
  (gen_random_uuid(), '1212002028', 'Ferdi Firmansyah Putra', 2021, 'UMUM', true),
  (gen_random_uuid(), '1222002001', 'Ilham Rachmadhani', 2022, 'UMUM', true),
  (gen_random_uuid(), '1232002004', 'Muhammad Afzaal Ghofran', 2023, 'UMUM', true),
  (gen_random_uuid(), '1232002007', 'Nazwa Anindy Khairunnisa', 2023, 'UMUM', true),
  (gen_random_uuid(), '1232002009', 'Rizka Azizah Salma', 2023, 'UMUM', true),
  (gen_random_uuid(), '1232002015', 'Muhammad Rafif Amri Rasyid', 2023, 'UMUM', true),
  (gen_random_uuid(), '1232002017', 'Zilca Alfadlika Wibowo', 2023, 'UMUM', true),
  (gen_random_uuid(), '1232002024', 'Erina Nayla Syakira Salsabila', 2023, 'UMUM', true),
  (gen_random_uuid(), '1232002028', 'Nazwa Alya Zahra Azrin', 2023, 'UMUM', true),
  (gen_random_uuid(), '1232002029', 'Muhammad Rizqy', 2023, 'UMUM', true),
  (gen_random_uuid(), '1232002030', 'Rheva Alfarera Mahfud', 2023, 'UMUM', true),
  (gen_random_uuid(), '1232002033', 'Sasqia Ananda Safira', 2023, 'UMUM', true),
  (gen_random_uuid(), '1232002036', 'Abdul Hafiz Atallah', 2023, 'UMUM', true),
  (gen_random_uuid(), '1232002037', 'Jihan Nabilah Rahman', 2023, 'UMUM', true),
  (gen_random_uuid(), '1232002038', 'Naura Latifa Ramadhani', 2023, 'UMUM', true),
  (gen_random_uuid(), '1232002042', 'Muhamad Al Ghifari', 2023, 'UMUM', true),
  (gen_random_uuid(), '1232002044', 'Sanzio Gawini', 2023, 'UMUM', true),
  (gen_random_uuid(), '1232002045', 'Syauqi Atha Prasetyo', 2023, 'UMUM', true),
  (gen_random_uuid(), '1232002047', 'Rara Kholillah', 2023, 'UMUM', true),
  (gen_random_uuid(), '1232002049', 'Alif Perdana Putra Suwartane', 2023, 'UMUM', true),
  (gen_random_uuid(), '1232002050', 'Fadel Setiawan Arifin', 2023, 'UMUM', true),
  (gen_random_uuid(), '1232002052', 'Muhamad Azriel Saputra Irawan', 2023, 'UMUM', true),
  (gen_random_uuid(), '1232002054', 'Desta Rahayu', 2023, 'UMUM', true),
  (gen_random_uuid(), '1232002055', 'Edivho Febrian Putra', 2023, 'UMUM', true),
  (gen_random_uuid(), '1232002056', 'Abshina Attar Kaur', 2023, 'UMUM', true),
  (gen_random_uuid(), '1232002059', 'Hafizhah Dea Az Zahrah', 2023, 'UMUM', true),
  (gen_random_uuid(), '1232002060', 'Desardo Yudha Mahardika', 2023, 'UMUM', true),
  (gen_random_uuid(), '1232002061', 'Nabila Khairun Nisa', 2023, 'UMUM', true),
  (gen_random_uuid(), '1232002069', 'Salsabila Putri Maharani', 2023, 'UMUM', true),
  (gen_random_uuid(), '1232002070', 'Rega Saputra', 2023, 'UMUM', true),
  (gen_random_uuid(), '1232002073', 'Shafira Nabilah Khansa', 2023, 'UMUM', true),
  (gen_random_uuid(), '1232002074', 'Wanda Tiara Lestari', 2023, 'UMUM', true),
  (gen_random_uuid(), '1232002087', 'Achmad Taufik Alfarizy', 2023, 'UMUM', true),
  (gen_random_uuid(), '1232002090', 'Najma Khonsa Tsabita', 2023, 'UMUM', true),
  (gen_random_uuid(), '1232002091', 'Ilham Fansuri Faatih', 2023, 'UMUM', true),
  (gen_random_uuid(), '1232712001', 'Mochammad Fadhilah Yanwar Kusumah', 2023, 'UMUM', true),
  (gen_random_uuid(), '1232712004', 'Daffa Pratama Putra', 2023, 'UMUM', true),
  (gen_random_uuid(), '1232922001', 'Febriyan Yoga Pratama', 2023, 'UMUM', true),
  (gen_random_uuid(), '1232922006', 'Vio Harpama', 2023, 'UMUM', true),
  (gen_random_uuid(), '1242002002', 'Muhammad Shumin', 2024, 'UMUM', true),
  (gen_random_uuid(), '1242002009', 'Muhammad Rangga Wibowo Prakoso', 2024, 'UMUM', true),
  (gen_random_uuid(), '1242002011', 'Dimas Arikumara Evendi', 2024, 'UMUM', true),
  (gen_random_uuid(), '1242002013', 'Zaky Muhamad', 2024, 'UMUM', true),
  (gen_random_uuid(), '1242002015', 'Daniel Setiawan Riva', 2024, 'UMUM', true),
  (gen_random_uuid(), '1242002020', 'Fahriansyah Ilham Sobari', 2024, 'UMUM', true),
  (gen_random_uuid(), '1242002024', 'Kamila Arumaisha', 2024, 'UMUM', true),
  (gen_random_uuid(), '1242002025', 'R. Z. Denville Teo', 2024, 'UMUM', true),
  (gen_random_uuid(), '1242002029', 'Muhammad Ridho Fadhilah', 2024, 'UMUM', true),
  (gen_random_uuid(), '1242002040', 'Raihan Agava Putra', 2024, 'UMUM', true),
  (gen_random_uuid(), '1242002041', 'Fachry Syarif Zuhairy', 2024, 'UMUM', true),
  (gen_random_uuid(), '1242002042', 'Muhammad Farel', 2024, 'UMUM', true),
  (gen_random_uuid(), '1242002043', 'Kayla Isyana', 2024, 'UMUM', true),
  (gen_random_uuid(), '1242002044', 'Rafi Dhia Nugraha', 2024, 'UMUM', true),
  (gen_random_uuid(), '1242002048', 'Kafi Putra Fafdi', 2024, 'UMUM', true),
  (gen_random_uuid(), '1242002049', 'Rinda Jesiana', 2024, 'UMUM', true),
  (gen_random_uuid(), '1242002052', 'Davina Maulidya Maghfira', 2024, 'UMUM', true),
  (gen_random_uuid(), '1242002054', 'M. Amanulah Refa Ardhi', 2024, 'UMUM', true),
  (gen_random_uuid(), '1242002059', 'Irfan Saleh', 2024, 'UMUM', true),
  (gen_random_uuid(), '1242002060', 'Muhammad Alfin Mubarok Wijaya', 2024, 'UMUM', true),
  (gen_random_uuid(), '1242002061', 'Jenar Ayutia Rathi', 2024, 'UMUM', true),
  (gen_random_uuid(), '1242002062', 'Margaretha Silalahi', 2024, 'UMUM', true),
  (gen_random_uuid(), '1242002064', 'Heiby Ali Bajri', 2024, 'UMUM', true),
  (gen_random_uuid(), '1242002067', 'Agi Ramdhan', 2024, 'UMUM', true),
  (gen_random_uuid(), '1242002070', 'Billaurita Ramadhani', 2024, 'UMUM', true),
  (gen_random_uuid(), '1242002072', 'Ammar Naufal Syahputra', 2024, 'UMUM', true),
  (gen_random_uuid(), '1242002073', 'Kalisa Andam Dewi', 2024, 'UMUM', true),
  (gen_random_uuid(), '1242002078', 'Elvira Dhea Ananda', 2024, 'UMUM', true),
  (gen_random_uuid(), '1242002080', 'Daffa Yuza Styantono', 2024, 'UMUM', true),
  (gen_random_uuid(), '1242002081', 'Raditya Tajza Indrasyah', 2024, 'UMUM', true),
  (gen_random_uuid(), '1242002083', 'Muhammad Faiz Haidar', 2024, 'UMUM', true),
  (gen_random_uuid(), '1242002086', 'Haikal Libby Alam', 2024, 'UMUM', true),
  (gen_random_uuid(), '1242002087', 'Mochammad Jibril Alfathar', 2024, 'UMUM', true),
  (gen_random_uuid(), '1242002088', 'Maudy Apriyani Barokah', 2024, 'UMUM', true),
  (gen_random_uuid(), '1242002089', 'Dina Iftinan Qotrunada', 2024, 'UMUM', true),
  (gen_random_uuid(), '1242912002', 'Ika Ayu Pratiwi', 2024, 'UMUM', true),
  (gen_random_uuid(), '1242912003', 'Ellita Eka Risma', 2024, 'UMUM', true),
  (gen_random_uuid(), '1242912005', 'Istia Enza Rendiani', 2024, 'UMUM', true),
  (gen_random_uuid(), '1242912007', 'Qoeronesya Meycyana', 2024, 'UMUM', true),
  (gen_random_uuid(), '1242912009', 'Hana Faizatul Hajar', 2024, 'UMUM', true),
  (gen_random_uuid(), '1252002001', 'Ali Hamzah', 2025, 'UMUM', true),
  (gen_random_uuid(), '1252002002', 'Robin Fuglistahler', 2025, 'UMUM', true),
  (gen_random_uuid(), '1252002003', 'Adnan Anugrah Admaja', 2025, 'UMUM', true),
  (gen_random_uuid(), '1252002004', 'Al-Marwah Iqlima', 2025, 'UMUM', true),
  (gen_random_uuid(), '1252002005', 'Muhammad Khalil Gibran', 2025, 'UMUM', true),
  (gen_random_uuid(), '1252002006', 'Yogi Wira Gustama', 2025, 'UMUM', true),
  (gen_random_uuid(), '1252002007', 'Rasya Deniasyah Muhammad', 2025, 'UMUM', true),
  (gen_random_uuid(), '1252002008', 'Haidar Fawwaz', 2025, 'UMUM', true),
  (gen_random_uuid(), '1252002009', 'Nur Akhsin', 2025, 'UMUM', true),
  (gen_random_uuid(), '1252002010', 'Matthew Daniel Rumimpunu', 2025, 'UMUM', true),
  (gen_random_uuid(), '1252002011', 'Muhammad Haikal Pratama', 2025, 'UMUM', true),
  (gen_random_uuid(), '1252002012', 'Jonathan Alvin', 2025, 'UMUM', true),
  (gen_random_uuid(), '1252002013', 'Muhammad Rafi', 2025, 'UMUM', true),
  (gen_random_uuid(), '1252002014', 'Tiarisma Chinthia Cloudia Vrenatha Sihite', 2025, 'UMUM', true),
  (gen_random_uuid(), '1252002015', 'Kanaya Savitri', 2025, 'UMUM', true),
  (gen_random_uuid(), '1252002016', 'Muhammad Mundzir', 2025, 'UMUM', true),
  (gen_random_uuid(), '1252002017', 'Fadli', 2025, 'UMUM', true),
  (gen_random_uuid(), '1252002018', 'Julian Pratisena Wicaksono', 2025, 'UMUM', true),
  (gen_random_uuid(), '1252002019', 'Wildan Putra Wardana', 2025, 'UMUM', true),
  (gen_random_uuid(), '1252002020', 'Noya Kamilia Sucahyo', 2025, 'UMUM', true),
  (gen_random_uuid(), '1252002021', 'Anastasya Akdamina Kendi', 2025, 'UMUM', true),
  (gen_random_uuid(), '1252002022', 'Muhammad Rafi Al Zakwan', 2025, 'UMUM', true),
  (gen_random_uuid(), '1252002023', 'Raisa Keyza Clarisa Siwu', 2025, 'UMUM', true),
  (gen_random_uuid(), '1252002024', 'Ervina Putri Ibrahim', 2025, 'UMUM', true),
  (gen_random_uuid(), '1252002025', 'Fauzhian Agustha Ar''rasyid', 2025, 'UMUM', true),
  (gen_random_uuid(), '1252002026', 'Faiz Muhammad Hawari', 2025, 'UMUM', true),
  (gen_random_uuid(), '1252002027', 'Muhammad Farrel Athalla Yamin', 2025, 'UMUM', true),
  (gen_random_uuid(), '1252002028', 'Nabil Firdiansyah', 2025, 'UMUM', true),
  (gen_random_uuid(), '1252002029', 'Neilil Alia Isalmi', 2025, 'UMUM', true),
  (gen_random_uuid(), '1252002030', 'Muhamad Alfath Hamonangan Silalahi', 2025, 'UMUM', true),
  (gen_random_uuid(), '1252002031', 'Muhammad Zein Alfarezel', 2025, 'UMUM', true),
  (gen_random_uuid(), '1252002032', 'Muhmmad Ali Pasha', 2025, 'UMUM', true),
  (gen_random_uuid(), '1252002033', 'Bryan Cahya Sadewa', 2025, 'UMUM', true),
  (gen_random_uuid(), '1252002034', 'Muhammad Dafa Abdillah', 2025, 'UMUM', true),
  (gen_random_uuid(), '1252002035', 'Keisha Ramadhani Nanda Hafidz', 2025, 'UMUM', true),
  (gen_random_uuid(), '1252002036', 'Raihan Maulana', 2025, 'UMUM', true),
  (gen_random_uuid(), '1252002037', 'Zharfan Rajwa Rafif', 2025, 'UMUM', true),
  (gen_random_uuid(), '1252002038', 'Jihan Sabila Cahya', 2025, 'UMUM', true),
  (gen_random_uuid(), '1252002039', 'Muhammad Fahri Alfarisi', 2025, 'UMUM', true),
  (gen_random_uuid(), '1252002040', 'Naufal Ilham Pratama', 2025, 'UMUM', true),
  (gen_random_uuid(), '1252002041', 'Gita Dwi Ningrum', 2025, 'UMUM', true),
  (gen_random_uuid(), '1252002042', 'Ghina Salsabila', 2025, 'UMUM', true),
  (gen_random_uuid(), '1252002043', 'Fifi Nurhaliza', 2025, 'UMUM', true),
  (gen_random_uuid(), '1252002044', 'Muhammad Raka Rifky Ramadhan', 2025, 'UMUM', true),
  (gen_random_uuid(), '1252002045', 'Hanif Arya Yudhistira', 2025, 'UMUM', true),
  (gen_random_uuid(), '1252002046', 'Risma Cahyanti', 2025, 'UMUM', true),
  (gen_random_uuid(), '1252002047', 'Nayara Callysta Christy', 2025, 'UMUM', true),
  (gen_random_uuid(), '1252002048', 'Maulana Malik Ibrohim', 2025, 'UMUM', true),
  (gen_random_uuid(), '1252002049', 'Zikri Wahid Fauzi', 2025, 'UMUM', true),
  (gen_random_uuid(), '1252002050', 'Raehan Putra Kamil', 2025, 'UMUM', true)
ON CONFLICT (nim) DO NOTHING;

-- ============================================================
-- Update track setelah seed: ganti 'UMUM' ke 'BIS' atau 'DSA'
-- sesuai peminatan mahasiswa yang diketahui
-- ============================================================
/*
-- Contoh update ke BIS:
UPDATE mahasiswa
SET track = 'BIS', updated_at = NOW()
WHERE nim IN (
  '1232002004',  -- Muhammad Afzaal Ghofran
  '1232002007'   -- Nazwa Anindy Khairunnisa
  -- tambahkan NIM lain...
);

-- Contoh update ke DSA:
UPDATE mahasiswa
SET track = 'DSA', updated_at = NOW()
WHERE nim IN (
  '1242002002',  -- Muhammad Shumin
  '1242002009'   -- Muhammad Rangga Wibowo Prakoso
  -- tambahkan NIM lain...
);
*/
