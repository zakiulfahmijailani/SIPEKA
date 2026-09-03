// Referensi kurikulum 2026/2027 yang diturunkan dari workbook "Simulasi SIF1 R2".
// File workbook tetap lokal dan tidak diperlukan saat aplikasi dijalankan.

export type Curriculum2026Cpl = {
  kode: string
  kategori: string
  domain: "SIKAP" | "PENGETAHUAN" | "KETERAMPILAN_UMUM" | "KETERAMPILAN_KHUSUS"
  rumusan: string
  referensi: string
  urutan: number
}

export type Curriculum2026ProfilLulusan = {
  kode: string
  nama: string
  deskripsi: string
  bidang_pekerjaan: string
}

export type Curriculum2026BahanKajian = {
  kode: string
  nama: string
  deskripsi: string
  kompetensi: string
  referensi: string[]
}

export const CURRICULUM_2026_CPL: Curriculum2026Cpl[] = [
  {
    kode: "CPL01",
    kategori: "S1",
    domain: "SIKAP",
    rumusan: "Mampu mendemonstrasikan pemahaman mendalamnya mengenai konsep kepedulian dan seluruh dimensinya dalam implikasi yang etis serta penerapan praktis dalam hubungan interpersonal, profesional dan interaksi dengan masyarakat.",
    referensi: "University Value",
    urutan: 1,
  },
  {
    kode: "CPL02",
    kategori: "S2",
    domain: "SIKAP",
    rumusan: "Mampu menunjukkan sikap dan tindakan yang berintegritas dengan mengedepankan kejujuran, tanggung jawab, dan etika dalam setiap aspek akademik, dunia professional, dan interaksi sosial di tengah masyarakat.",
    referensi: "IABEE/University Value",
    urutan: 2,
  },
  {
    kode: "CPL03",
    kategori: "P1",
    domain: "PENGETAHUAN",
    rumusan: "Mampu menjelaskan konsep dasar komputasi dan sistem informasi, menganalisis permasalahan organisasi yang kompleks, memahami siklus pengelolaan data menjadi informasi/pengetahuan, serta menyusun dasar argumentasi rekomendasi pengambilan keputusan berbasis sistem informasi dalam konteks organisasi.",
    referensi: "IS2020/ACM CC 2020",
    urutan: 3,
  },
  {
    kode: "CPL04",
    kategori: "P2",
    domain: "PENGETAHUAN",
    rumusan: "Mampu menjelaskan prinsip etika profesi, tata kelola informasi dan data, privasi, keamanan, serta aspek kepatuhan dalam perancangan dan implementasi sistem informasi; termasuk memahami dampak sosial/organisasional dari pemanfaatan teknologi dan data.",
    referensi: "IS2020/IABEE/ACM CS 2023",
    urutan: 4,
  },
  {
    kode: "CPL05",
    kategori: "KU1",
    domain: "KETERAMPILAN_UMUM",
    rumusan: "Mampu menerapkan design thinking untuk memecahkan masalah secara inovatif, memahami prinsip keberlanjutan dalam lingkungan dan kehidupan sosial, serta memiliki komitmen lifelong learning untuk terus berkembang dalam pengetahuan dalam setiap aspek akademik dan kehidupan profesional mereka.",
    referensi: "IS2020/ACM CC 2020",
    urutan: 5,
  },
  {
    kode: "CPL06",
    kategori: "KU2",
    domain: "KETERAMPILAN_UMUM",
    rumusan: "Mampu menunjukkan keterampilan kolaborasi, sehingga mereka mampu bekerja secara efektif dalam tim dengan menghargai beragam perspektif dan kompetensi, berkomunikasi dengan jelas serta berkontribusi secara konstruktif dalam mencapai tujuan bersama.",
    referensi: "IABEE/University Value",
    urutan: 6,
  },
  {
    kode: "CPL07",
    kategori: "KU3",
    domain: "KETERAMPILAN_UMUM",
    rumusan: "Mampu menunjukkan sikap kritis dalam mengakses, mengevaluasi, dan memanfaatkan informasi digital dan teknologi dengan efektif dan etis dalam konteks akademik dan profesional.",
    referensi: "IS2020/IABEE/ACM CS 2023",
    urutan: 7,
  },
  {
    kode: "CPL08",
    kategori: "KK1",
    domain: "KETERAMPILAN_KHUSUS",
    rumusan: "Mampu merancang dan mengelola basis data, melakukan integrasi serta transformasi data, dan menerapkan teknik serta perangkat analisis data untuk menghasilkan informasi dan insight yang relevan bagi kebutuhan operasional maupun pengambilan keputusan.",
    referensi: "IS2020/ACM CC 2020",
    urutan: 8,
  },
  {
    kode: "CPL09",
    kategori: "KK2",
    domain: "KETERAMPILAN_KHUSUS",
    rumusan: "Mampu merencanakan, membangun/menerapkan, mengoperasikan, memelihara, mengevaluasi, dan meningkatkan sistem informasi organisasi secara berkelanjutan untuk mendukung proses bisnis dan pencapaian sasaran strategis, dengan memperhatikan kualitas, keamanan, dan kesesuaian kebutuhan pengguna/organisasi.",
    referensi: "IS2020/IABEE/ACM CS 2023",
    urutan: 9,
  },
  {
    kode: "CPL10",
    kategori: "KK3",
    domain: "KETERAMPILAN_KHUSUS",
    rumusan: "Mampu merancang, membangun, dan mengevaluasi solusi e-business berbasis teknologi informasi meliputi perumusan model bisnis, validasi pasar sederhana, strategi pemasaran digital, serta perancangan proses operasional digital untuk mendukung inovasi dan pengembangan usaha di era ekonomi digital.",
    referensi: "IABEE/University Value",
    urutan: 10,
  },
]

export const CURRICULUM_2026_PROFIL_LULUSAN: Curriculum2026ProfilLulusan[] = [
  {
    kode: "PL1",
    nama: "Technopreneur",
    deskripsi: "Lulusan mampu membangun pola pikir dan sikap mental positif, memimpin, berintegritas, berkolaborasi, komunikasi profesional, serta jiwa wirausahawan dengan mengkreasikan bisnis (e-business) secara aktif di era ekonomi digital dalam kehidupan bermasyarakat dan bernegara disertai pemanfaatkan teknologi informasi untuk melakukan inovasi usaha.",
    bidang_pekerjaan: "Founder/Co-founder Startup, Product Owner, Business Development & Partnership, Digital Marketing, IT/Business Consultant",
  },
  {
    kode: "PL2",
    nama: "Software Engineer",
    deskripsi: "Lulusan mampu melakukan rekayasa perangkat lunak secara end-to-end (analisis kebutuhan, perancangan, implementasi, pengujian, dan pemeliharaan) untuk menghasilkan sistem yang berkualitas, user-friendly, dan tepat guna sesuai profil pengguna pada segmen tertentu.",
    bidang_pekerjaan: "Project Manager, System Analyst, UI/UX Engineer, Software Engineer, Quality Assurance (QA) Engineer, IT Support",
  },
  {
    kode: "PL3",
    nama: "Knowledge Management",
    deskripsi: "Lulusan mampu memahami sistem pemerintahan serta memanfaatkan teknologi informasi sebagai solusi organisasi melalui kolaborasi untuk mendukung tata kelola pemerintahan (e-governance).",
    bidang_pekerjaan: "Knowledge Engineer, Business Analyst, IT Governance & Compliance Analyst",
  },
  {
    kode: "PL4",
    nama: "Data Analytics & Business Intelligence",
    deskripsi: "Lulusan mampu mengolah, menganalisis, dan memvisualisasikan data untuk menghasilkan insight, membangun laporan/dashboard bisnis (kecerdasan buatan) untuk pemantauan kinerja, serta menerapkan metode statistik dan machine learning dasar untuk mendukung pengambilan keputusan berbasis data.",
    bidang_pekerjaan: "Data Analyst, Data Scientist, Business Intelligence (BI) Analyst",
  },
  {
    kode: "PL5",
    nama: "Researcher",
    deskripsi: "Lulusan mampu merancang dan melaksanakan penelitian di bidang Sistem Informasi untuk mengembangkan ilmu pengetahuan dan memberi kontribusi pada pemecahan masalah organisasi/masyarakat.",
    bidang_pekerjaan: "Peneliti, Dosen, Studi Lanjut S2/S3",
  },
]

export const CURRICULUM_2026_BAHAN_KAJIAN: Curriculum2026BahanKajian[] = [
  { kode: "BK 1", nama: "Foundations of Information Systems", deskripsi: "Memahami konsep dasar SI, interaksi antara manusia, teknologi, dan proses bisnis, serta peran strategis SI dalam organisasi. Memperkenalkan konsep dasar sistem informasi (hardware, software, dan information acquisition) untuk mendukung proses bisnis transaksional, keputusan, dan kolaboratif dengan menggunakan alat dan metode pengembangan IS yang relevan dalam membuat rekomendasi analisis bisnis organisasi, dan menilai proses dan sistem.", kompetensi: "Utama", referensi: ["IS2020 (Core)", "ACM CC2020 (IS Knowledge Domain)"] },
  { kode: "BK 2", nama: "Mathematics and Statistics", deskripsi: "Membangun dasar pengetahuan matematika dan statistik yang diperlukan untuk analisis data, pemodelan, dan pengambilan keputusan yang berbasis data dalam sistem informasi.", kompetensi: "Utama", referensi: ["IABEE", "IS-2020, CC-2020, ASIIN, dan IABEE"] },
  { kode: "BK 3", nama: "Business Process Management", deskripsi: "Mempelajari proses analisis, pemodelan (BPMN), perancangan, otomatisasi, dan perbaikan proses bisnis organisasi.", kompetensi: "Utama", referensi: ["IS2020", "IABEE (Analisis & Perancangan Sistem)"] },
  { kode: "BK 4", nama: "Data/Info. Management", deskripsi: "Fokus pada arsitektur basis data, pemodelan data (konseptual/logis/fisik), dan cara mengelola data dan informasi sebagai aset bisnis, termasuk teknik penyimpanan, pengambilan, pengolahan, manajemen, dan keamanan basis data serta keterampilan melindungi informasi sensitif.", kompetensi: "Utama", referensi: ["IS2020", "ACM CS2023 (Data Management - DM)"] },
  { kode: "BK 5", nama: "Data/Business Analytics", deskripsi: "Mempelajari teknik dan alat analisis data untuk pengambilan keputusan bisnis, termasuk penggunaan big data, data mining, dan analisis prediktif untuk mendapatkan wawasan bisnis yang berharga.", kompetensi: "Utama", referensi: ["IS2020", "ACM CC2020 (Data Science & Analytics)"] },
  { kode: "BK 6", nama: "Application Development & Programming", deskripsi: "Fokus dalam pengembangan aplikasi dan pemrograman, termasuk penggunaan bahasa pemrograman, framework, dan alat pengembangan untuk menciptakan solusi perangkat lunak.", kompetensi: "Utama", referensi: ["IS2020", "ACM CS2023 (Software Development - SDF/SE)"] },
  { kode: "BK 7", nama: "Systems Analysis & Design", deskripsi: "Mempelajari proses analisis kebutuhan dan desain sistem informasi yang efektif, termasuk teknik pemodelan sistem, pengembangan diagram, dan pembuatan spesifikasi sistem yang berorientasi pada tujuan dalam semua aspek analisis dan desain sistem.", kompetensi: "Utama", referensi: ["IS2020", "IABEE (Complex Problem Solving & Design)"] },
  { kode: "BK 8", nama: "IT Infrastructure", deskripsi: "Arsitektur jaringan komputer, sistem operasi, hardware/server, cloud computing, dan data center.", kompetensi: "Pendukung", referensi: ["IS2020", "ACM CC2020 (IT/IS Architecture)"] },
  { kode: "BK 9", nama: "Secure Computing", deskripsi: "Menekankan pentingnya keamanan informasi dan sistem, termasuk konsep dasar keamanan komputer, enkripsi, pengelolaan ancaman, dan pengendalian akses dengan memprioritaskan faktor risiko terhadap aset informasi.", kompetensi: "Pendukung", referensi: ["IS2020", "ACM CS2023 (Security - SEC), ACM CC2020 (Cybersecurity)"] },
  { kode: "BK 10", nama: "Emerging Technologies", deskripsi: "Evaluasi tren teknologi masa depan (AI/Generative AI, Blockchain, IoT, Quantum Computing) dan dampak bisnisnya.", kompetensi: "Pendukung", referensi: ["IS2020", "ACM CC2020 (Emerging Trends)"] },
  { kode: "BK 11", nama: "IS Management & Strategy", deskripsi: "Penyelarasan strategi TI dengan tujuan organisasi, penganggaran TI, IT Governance, dan evaluasi ROI teknologi.", kompetensi: "Utama", referensi: ["IS2020", "ACM CC2020 (IS Management)"] },
  { kode: "BK 12", nama: "IS Practicum", deskripsi: "Penerapan praktis seluruh kompetensi SI melalui proyek nyata, studi kasus industri, Capstone Project, atau magang.", kompetensi: "Utama", referensi: ["IABEE", "IABEE (Major Design Experience / Capstone)"] },
  { kode: "BK 13", nama: "Domain of Practice", deskripsi: "Fokus pada dasar wirausaha/technopreneur untuk mendukung ekonomi digital dan penerapannya pada bidang sistem informasi.", kompetensi: "Utama", referensi: ["IS2020", "IS2020 Contextual Domain"] },
  { kode: "BK 14", nama: "IS Project Management", deskripsi: "Pembelajaran tentang metodologi dan teknik manajemen proyek untuk mengelola proyek sistem informasi, termasuk perencanaan, pengorganisasian, pengendalian, dan penutupan proyek dengan pendekatan profesional, proaktif, kolaboratif, serta terarah pada tujuan.", kompetensi: "Pendukung", referensi: ["IS2020", "IABEE (Project Management & Finance)"] },
  { kode: "BK 15", nama: "Digital Innovation", deskripsi: "Pemanfaatan teknologi digital untuk perancangan produk baru, model bisnis disruptif, dan transformasi digital.", kompetensi: "Pendukung", referensi: ["IS2020", "IS2020 Core/Innovation"] },
  { kode: "BK 16", nama: "Individual Foundational Competencies", deskripsi: "Pengembangan soft skills individu seperti critical thinking, problem-solving, komunikasi, kerja sama tim, dan kepemimpinan.", kompetensi: "University Value", referensi: ["IS2024", "ACM CC2020 (Disposition & Skills), IABEE (Teamwork & Communication)"] },
  { kode: "BK 17", nama: "Ethics, Use and Implications for Society", deskripsi: "Etika profesional TI, hukum/regulasi siber, privasi data, dampak sosial teknologi, dan prinsip Green IT/keberlanjutan.", kompetensi: "Pendukung", referensi: ["IS2020", "ACM CS2023 (Society, Ethics, Profession - SEP), IABEE (Ethics & Sustainability)"] },
]

export const CURRICULUM_2026_CPL_TO_MK: Record<string, string[]> = {
  CPL01: ["UNI104", "UNI204", "SIF210", "UNI101", "UNI102", "UNI106", "FTK151", "SIF801"],
  CPL02: ["UNI104", "UNI204", "SIF210", "UNI101", "UNI102", "UNI106", "FTK151", "SIF801"],
  CPL03: ["SIF101", "SIF107", "SIF202", "SIF212", "SIF213", "SIF214", "SIF215", "FTK161", "FTK121", "SIF319", "SIF407", "SIF408", "SIF409", "SIF901", "FTK221", "SIF503", "SIF504", "SIF911", "SIF912", "SIF611", "SIF703"],
  CPL04: ["SIF101", "SIF107", "SIF202", "SIF212", "SIF214", "SIF215", "FTK161", "FTK121", "SIF319", "SIF407", "SIF408", "SIF409", "SIF901", "SIF503", "SIF504", "SIF911", "SIF912", "SIF604", "SIF703"],
  CPL05: ["SIF101", "SIF108", "SIF109", "SIF215", "SIF311", "SIF317", "SIF318", "SIF404", "SIF405", "SIF407", "SIF409", "SIF410", "SIF901", "SIF902", "SIF504", "SIF911", "SIF912", "SIF906", "SIF604", "SIF609", "SIF908", "SIF702"],
  CPL06: ["SIF107", "SIF106", "SIF202", "SIF214", "SIF307", "SIF319", "SIF408", "SIF410", "SIF503", "SIF608", "SIF609", "SIF907", "SIF908", "SIF702", "SIF703"],
  CPL07: ["SIF108", "SIF109", "SIF106", "SIF307", "SIF311", "SIF317", "SIF318", "SIF404", "SIF405", "SIF902", "SIF913", "SIF906", "SIF604", "SIF608", "SIF609", "SIF907", "SIF908", "SIF909", "SIF910", "SIF702"],
  CPL08: ["SIF108", "SIF213", "SIF317", "SIF405", "SIF902", "FTK221", "SIF505", "SIF913", "SIF906", "SIF604", "SIF611", "SIF609", "SIF908", "SIF909", "SIF910", "SIF701", "SIF702", "SIF802"],
  CPL09: ["SIF107", "SIF202", "SIF214", "SIF319", "SIF407", "SIF408", "SIF409", "SIF503", "SIF504", "SIF505", "SIF610", "SIF701", "SIF703", "SIF802"],
  CPL10: ["SIF108", "SIF109", "SIF213", "SIF311", "SIF317", "SIF318", "SIF404", "SIF405", "SIF410", "SIF902", "FTK221", "SIF906", "SIF604", "SIF611", "SIF609", "SIF610", "SIF908", "SIF701", "SIF702", "SIF802"],
}

export const CURRICULUM_2026_PL_TO_CPL: Record<string, string[]> = {
  PL1: ["CPL01", "CPL04", "CPL06", "CPL10"],
  PL2: ["CPL02", "CPL03", "CPL05", "CPL09"],
  PL3: ["CPL01", "CPL04", "CPL06", "CPL08"],
  PL4: ["CPL02", "CPL03", "CPL07", "CPL10"],
  PL5: ["CPL02", "CPL04", "CPL05", "CPL07", "CPL10"],
}

export const CURRICULUM_2026_BK_TO_CPL: Record<string, string[]> = {
  "BK 1": ["CPL03", "CPL04", "CPL05"],
  "BK 2": ["CPL03", "CPL04"],
  "BK 3": ["CPL05", "CPL06", "CPL10"],
  "BK 4": ["CPL05", "CPL07", "CPL08", "CPL10"],
  "BK 5": ["CPL07", "CPL08"],
  "BK 6": ["CPL03", "CPL04", "CPL06", "CPL09"],
  "BK 7": ["CPL03", "CPL04", "CPL05", "CPL09"],
  "BK 8": ["CPL05", "CPL07", "CPL10"],
  "BK 9": ["CPL06", "CPL07"],
  "BK 10": ["CPL04", "CPL05", "CPL07", "CPL08", "CPL10"],
  "BK 11": ["CPL06", "CPL07"],
  "BK 12": ["CPL08", "CPL09", "CPL10"],
  "BK 13": ["CPL09", "CPL10"],
  "BK 14": ["CPL06", "CPL09"],
  "BK 15": ["CPL03", "CPL08", "CPL10"],
  "BK 16": ["CPL01", "CPL02"],
  "BK 17": ["CPL01", "CPL02"],
}

export const CURRICULUM_2026_BK_TO_MK: Record<string, string[]> = {
  "BK 1": ["SIF101", "SIF215", "SIF901", "SIF911", "SIF912"],
  "BK 2": ["SIF212", "FTK161", "FTK121"],
  "BK 3": ["SIF410"],
  "BK 4": ["SIF108", "SIF317", "SIF405", "SIF902", "SIF906"],
  "BK 5": ["SIF913", "SIF909", "SIF910"],
  "BK 6": ["SIF107", "SIF202", "SIF214", "SIF319", "SIF408", "SIF503", "SIF703"],
  "BK 7": ["SIF407", "SIF409", "SIF504"],
  "BK 8": ["SIF109", "SIF311", "SIF318", "SIF404", "SIF609", "SIF908", "SIF702"],
  "BK 9": ["SIF609", "SIF908", "SIF702"],
  "BK 10": ["SIF604"],
  "BK 11": ["SIF106", "SIF307", "SIF608", "SIF907"],
  "BK 12": ["SIF701", "SIF802"],
  "BK 13": ["SIF610"],
  "BK 14": ["SIF505"],
  "BK 15": ["SIF213", "FTK221", "SIF611"],
  "BK 16": ["UNI104", "UNI204", "SIF210", "UNI101", "UNI102", "UNI106", "FTK151"],
  "BK 17": ["SIF801"],
}

