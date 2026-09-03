// Referensi Kanonis Capaian Pembelajaran Mata Kuliah (CPMK) dan Sub-CPMK Kurikulum 2026
// Sumber: Simulasi SIF1 R2.xlsx (T12b CPL-CPMK-MK) & PIVOT CPL-CPMK.xlsx (Master)

export type Curriculum2026Cpmk = {
  kode: string
  cpl_kode: string
  rumusan: string
}

export type Curriculum2026SubCpmk = {
  cpmk_kode: string
  sub_kode: string
  uraian: string
}

export type Curriculum2026MkCpmkMapping = {
  kode_mk: string
  cpl_kode: string
  cpmk_kode: string
  sub_kode: string
  uraian: string
}

export const CURRICULUM_2026_CPMK: Curriculum2026Cpmk[] = [
  {
    "kode": "CPMK1",
    "cpl_kode": "CPL01",
    "rumusan": "Mampu menjelaskan konsep kepedulian dan seluruh dimensinya secara mendalam dalam konteks kehidupan interpersonal, profesional, dan sosial."
  },
  {
    "kode": "CPMK2",
    "cpl_kode": "CPL01",
    "rumusan": "Mampu menerapkan nilai-nilai kepedulian secara etis dan praktis dalam hubungan interpersonal, profesional, serta interaksi dengan masyarakat."
  },
  {
    "kode": "CPMK3",
    "cpl_kode": "CPL01",
    "rumusan": "Mampu menginternalisasi nilai-nilai ketakwaan kepada Tuhan Yang Maha Esa dalam kehidupan bermasyarakat dan bernegara sesuai nilai agama, etika, aturan, norma hukum, dan tanggung jawab sosial."
  },
  {
    "kode": "CPMK4",
    "cpl_kode": "CPL02",
    "rumusan": "Mampu menjelaskan dan menerapkan nilai integritas, kejujuran, tanggung jawab, dan etika dalam kehidupan akademik, profesional, dan sosial."
  },
  {
    "kode": "CPMK5",
    "cpl_kode": "CPL02",
    "rumusan": "Mampu menunjukkan sikap profesional dan bertanggung jawab melalui kepatuhan terhadap etika profesi."
  },
  {
    "kode": "CPMK6",
    "cpl_kode": "CPL03",
    "rumusan": "Mampu menjelaskan konsep dasar komputasi, cara kerja sistem komputer, dan sistem informasi dalam konteks organisasi."
  },
  {
    "kode": "CPMK7",
    "cpl_kode": "CPL03",
    "rumusan": "Mampu menganalisis permasalahan organisasi dan menerapkan berbagai metode atau algoritma untuk memecahkan masalah dalam domain computing berdasarkan perspektif sistem informasi."
  },
  {
    "kode": "CPMK8",
    "cpl_kode": "CPL03",
    "rumusan": "Mampu menjelaskan pengelolaan data menjadi informasi atau pengetahuan serta menyusun argumentasi rekomendasi pengambilan keputusan berbasis sistem informasi."
  },
  {
    "kode": "CPMK9",
    "cpl_kode": "CPL03",
    "rumusan": "Mampu menguasai konsep teoretis bidang Sistem Informasi dalam merancang, mensimulasikan, dan mengembangkan aplikasi teknologi multi-platform yang relevan dengan kebutuhan industri dan masyarakat."
  },
  {
    "kode": "CPMK10",
    "cpl_kode": "CPL04",
    "rumusan": "Mampu menjelaskan prinsip etika profesi dalam perancangan dan implementasi sistem informasi."
  },
  {
    "kode": "CPMK11",
    "cpl_kode": "CPL04",
    "rumusan": "Mampu menjelaskan tata kelola informasi dan data, termasuk aspek privasi, keamanan, serta kepatuhan dalam sistem informasi."
  },
  {
    "kode": "CPMK12",
    "cpl_kode": "CPL04",
    "rumusan": "Mampu menjelaskan dampak sosial dan organisasional dari pemanfaatan teknologi dan data."
  },
  {
    "kode": "CPMK13",
    "cpl_kode": "CPL05",
    "rumusan": "Mampu menerapkan pendekatan design thinking untuk memecahkan masalah secara inovatif."
  },
  {
    "kode": "CPMK14",
    "cpl_kode": "CPL05",
    "rumusan": "Mampu menyusun, menjelaskan, dan menyajikan gagasan prinsip keberlanjutan dalam konteks lingkungan, sosial, dan pengembangan teknologi."
  },
  {
    "kode": "CPMK15",
    "cpl_kode": "CPL05",
    "rumusan": "Mampu menunjukkan komitmen pembelajaran berkelanjutan dalam merespons perkembangan ilmu pengetahuan, teknologi, dan kebutuhan profesional."
  },
  {
    "kode": "CPMK16",
    "cpl_kode": "CPL06",
    "rumusan": "Mampu bekerja secara efektif dalam tim multidisiplin dengan menghargai beragam perspektif dan kompetensi."
  },
  {
    "kode": "CPMK17",
    "cpl_kode": "CPL06",
    "rumusan": "Mampu berkomunikasi dengan jelas dan memberikan kontribusi konstruktif dalam mencapai tujuan bersama."
  },
  {
    "kode": "CPMK18",
    "cpl_kode": "CPL06",
    "rumusan": "Mampu menganalisis studi kasus proyek teknologi nyata untuk memahami tantangan, solusi, dan penerapannya dalam berbagai disiplin ilmu."
  },
  {
    "kode": "CPMK19",
    "cpl_kode": "CPL07",
    "rumusan": "Mampu mengakses, mengevaluasi, dan memanfaatkan informasi digital serta teknologi secara kritis, efektif, dan etis dalam konteks akademik maupun profesional."
  },
  {
    "kode": "CPMK20",
    "cpl_kode": "CPL07",
    "rumusan": "Mampu menyusun deskripsi saintifik hasil kajian, pengembangan, atau implementasi ilmu pengetahuan dan teknologi dalam bentuk laporan tugas akhir, skripsi, atau artikel ilmiah."
  },
  {
    "kode": "CPMK21",
    "cpl_kode": "CPL07",
    "rumusan": "Mampu mengevaluasi solusi berbasis computing multi-platform, user interface, dan aplikasi interaktif berdasarkan kebutuhan pengguna, kualitas interaksi, dan kesesuaian fungsional."
  },
  {
    "kode": "CPMK22",
    "cpl_kode": "CPL08",
    "rumusan": "Mampu merancang dan mengelola basis data sesuai dengan kebutuhan sistem informasi organisasi."
  },
  {
    "kode": "CPMK23",
    "cpl_kode": "CPL08",
    "rumusan": "Mampu melakukan integrasi dan transformasi data dari berbagai sumber untuk mendukung kebutuhan operasional dan pengambilan keputusan organisasi."
  },
  {
    "kode": "CPMK24",
    "cpl_kode": "CPL08",
    "rumusan": "Mampu menerapkan teknik dan perangkat analisis data untuk menghasilkan informasi yang relevan."
  },
  {
    "kode": "CPMK25",
    "cpl_kode": "CPL09",
    "rumusan": "Mampu merencanakan sistem informasi organisasi sesuai kebutuhan proses bisnis dan sasaran strategis."
  },
  {
    "kode": "CPMK26",
    "cpl_kode": "CPL09",
    "rumusan": "Mampu menganalisis dan mendesain user interface serta aplikasi interaktif dengan mempertimbangkan kebutuhan pengguna dan perkembangan ilmu transdisiplin."
  },
  {
    "kode": "CPMK27",
    "cpl_kode": "CPL09",
    "rumusan": "Mampu membangun atau menerapkan sistem informasi untuk memenuhi kebutuhan pengguna, organisasi, dan proses bisnis."
  },
  {
    "kode": "CPMK28",
    "cpl_kode": "CPL09",
    "rumusan": "Mampu mengevaluasi dan meningkatkan sistem informasi secara berkelanjutan dengan memperhatikan kualitas, keamanan, dan kesesuaian kebutuhan pengguna atau organisasi."
  },
  {
    "kode": "CPMK29",
    "cpl_kode": "CPL09",
    "rumusan": "Mampu mengoperasikan dan memelihara sistem informasi untuk mendukung keberlangsungan proses bisnis."
  },
  {
    "kode": "CPMK30",
    "cpl_kode": "CPL09",
    "rumusan": "Mampu mendesain dan mengimplementasikan solusi berbasis computing multi-platform yang memenuhi kebutuhan organisasi."
  },
  {
    "kode": "CPMK31",
    "cpl_kode": "CPL10",
    "rumusan": "Mampu merumuskan model bisnis digital, melakukan validasi pasar sederhana, serta merancang strategi pemasaran digital dan proses operasional digital."
  },
  {
    "kode": "CPMK32",
    "cpl_kode": "CPL10",
    "rumusan": "Mampu mengidentifikasi solusi yang efektif dan efisien untuk pengelolaan proyek teknologi serta mengembangkan strategi penerapannya dalam kehidupan nyata."
  },
  {
    "kode": "CPMK33",
    "cpl_kode": "CPL10",
    "rumusan": "Mampu menganalisis, mendesain, dan mengevaluasi kebutuhan computing sesuai kebutuhan pengguna, organisasi, atau konteks bisnis secara efektif dan efisien."
  },
  {
    "kode": "CPMK34",
    "cpl_kode": "CPL10",
    "rumusan": "Mampu membangun user interface dan aplikasi interaktif sebagai solusi e-business berbasis teknologi informasi sesuai kebutuhan pengguna."
  }
];

export const CURRICULUM_2026_SUB_CPMK: Curriculum2026SubCpmk[] = [
  {
    "cpmk_kode": "CPMK1",
    "sub_kode": "1.1",
    "uraian": "Mampu mendefinisikan konsep dasar kepedulian dan seluruh dimensinya."
  },
  {
    "cpmk_kode": "CPMK1",
    "sub_kode": "1.2",
    "uraian": "Mampu menjelaskan implikasi etis dari konsep kepedulian."
  },
  {
    "cpmk_kode": "CPMK1",
    "sub_kode": "1.3",
    "uraian": "Mampu menjelaskan penerapan konsep kepedulian dalam kehidupan interpersonal, profesional, dan sosial."
  },
  {
    "cpmk_kode": "CPMK10",
    "sub_kode": "10.1",
    "uraian": "Mampu mengidentifikasi isu etika dalam perancangan sistem informasi."
  },
  {
    "cpmk_kode": "CPMK10",
    "sub_kode": "10.2",
    "uraian": "Mampu menerapkan prinsip etika profesi dalam implementasi sistem informasi."
  },
  {
    "cpmk_kode": "CPMK11",
    "sub_kode": "11.1",
    "uraian": "Mampu menjelaskan konsep tata kelola informasi dan data."
  },
  {
    "cpmk_kode": "CPMK11",
    "sub_kode": "11.2",
    "uraian": "Mampu menjelaskan aspek privasi dan keamanan data."
  },
  {
    "cpmk_kode": "CPMK11",
    "sub_kode": "11.3",
    "uraian": "Mampu menjelaskan aspek kepatuhan (compliance) dalam sistem informasi."
  },
  {
    "cpmk_kode": "CPMK11",
    "sub_kode": "11.4",
    "uraian": "Menginterpretasikan dimensi, karakteristik, dan nilai informasi yang berkualitas"
  },
  {
    "cpmk_kode": "CPMK12",
    "sub_kode": "12.1",
    "uraian": "Mampu mengidentifikasi dampak sosial dari pemanfaatan teknologi dan data."
  },
  {
    "cpmk_kode": "CPMK12",
    "sub_kode": "12.2",
    "uraian": "Mampu menganalisis dampak organisasional dari pemanfaatan teknologi dan data."
  },
  {
    "cpmk_kode": "CPMK12",
    "sub_kode": "12.3",
    "uraian": "Mengembangkan strategi penyimpanan data menggunakan tipe data primitif pada memori volatil komputer"
  },
  {
    "cpmk_kode": "CPMK13",
    "sub_kode": "13.1",
    "uraian": "Mampu menjelaskan tahapan-tahapan design thinking."
  },
  {
    "cpmk_kode": "CPMK13",
    "sub_kode": "13.2",
    "uraian": "Mampu menerapkan tahapan design thinking untuk mengidentifikasi akar masalah."
  },
  {
    "cpmk_kode": "CPMK13",
    "sub_kode": "13.3",
    "uraian": "Mampu menghasilkan solusi inovatif menggunakan pendekatan design thinking."
  },
  {
    "cpmk_kode": "CPMK13",
    "sub_kode": "13.4",
    "uraian": "Menerapkan teknologi baru dalam skenario kerja tim"
  },
  {
    "cpmk_kode": "CPMK14",
    "sub_kode": "14.1",
    "uraian": "Mampu menjelaskan prinsip keberlanjutan dalam konteks lingkungan dan sosial."
  },
  {
    "cpmk_kode": "CPMK14",
    "sub_kode": "14.2",
    "uraian": "Mampu menyajikan gagasan keberlanjutan secara sistematis dan komunikatif."
  },
  {
    "cpmk_kode": "CPMK14",
    "sub_kode": "14.3",
    "uraian": "Mampu bekerja secara efektif dalam lingkungan tim"
  },
  {
    "cpmk_kode": "CPMK15",
    "sub_kode": "15.1",
    "uraian": "Mampu mengidentifikasi kebutuhan pengembangan diri sesuai perkembangan ilmu pengetahuan dan teknologi."
  },
  {
    "cpmk_kode": "CPMK15",
    "sub_kode": "15.2",
    "uraian": "Mampu menunjukkan strategi belajar mandiri dan berkelanjutan (lifelong learning) untuk kebutuhan profesional."
  },
  {
    "cpmk_kode": "CPMK15",
    "sub_kode": "15.3",
    "uraian": "Menjelaskan peran, tanggung jawab, dan karakteristik profesional SI"
  },
  {
    "cpmk_kode": "CPMK15",
    "sub_kode": "15.4",
    "uraian": "Menunjukkan fase dan aktivitas SDLC"
  },
  {
    "cpmk_kode": "CPMK16",
    "sub_kode": "16.1",
    "uraian": "Mampu menjelaskan prinsip kerja sama dalam tim multidisiplin."
  },
  {
    "cpmk_kode": "CPMK16",
    "sub_kode": "16.2",
    "uraian": "Mampu berperan aktif dan efektif dalam kerja tim."
  },
  {
    "cpmk_kode": "CPMK16",
    "sub_kode": "16.3",
    "uraian": "Mampu menghargai perspektif dan kompetensi anggota tim yang beragam."
  },
  {
    "cpmk_kode": "CPMK16",
    "sub_kode": "16.4",
    "uraian": "Menjelaskan karakteristik suatu proses dan berbagai perspektif model proses"
  },
  {
    "cpmk_kode": "CPMK17",
    "sub_kode": "17.1",
    "uraian": "Mampu memberikan kontribusi konstruktif dalam mencapai tujuan bersama."
  },
  {
    "cpmk_kode": "CPMK17",
    "sub_kode": "17.2",
    "uraian": "Melakukan analisis kebutuhan secara sistematis untuk menentukan fakta dasar yang digunakan dalam mengarahkan upaya pemrograman guna memecahkan masalah atau mencapai tujuan"
  },
  {
    "cpmk_kode": "CPMK18",
    "sub_kode": "18.1",
    "uraian": "Mampu mengidentifikasi tantangan dalam studi kasus proyek teknologi nyata."
  },
  {
    "cpmk_kode": "CPMK18",
    "sub_kode": "18.2",
    "uraian": "Mampu menganalisis solusi yang diterapkan dalam studi kasus tersebut."
  },
  {
    "cpmk_kode": "CPMK18",
    "sub_kode": "18.3",
    "uraian": "Mampu mengaitkan penerapan solusi dengan berbagai disiplin ilmu."
  },
  {
    "cpmk_kode": "CPMK18",
    "sub_kode": "18.4",
    "uraian": "Memilih metodologi manajemen proyek yang sesuai berdasarkan karakteristik proyek"
  },
  {
    "cpmk_kode": "CPMK18",
    "sub_kode": "18.5",
    "uraian": "Membuat kebijakan pengadaan TI serta memahami dan menegosiasikan kontrak TI"
  },
  {
    "cpmk_kode": "CPMK19",
    "sub_kode": "19.1",
    "uraian": "Mampu mengakses sumber informasi digital secara efektif."
  },
  {
    "cpmk_kode": "CPMK19",
    "sub_kode": "19.2",
    "uraian": "Mampu mengevaluasi kredibilitas dan relevansi informasi digital secara kritis."
  },
  {
    "cpmk_kode": "CPMK19",
    "sub_kode": "19.3",
    "uraian": "Mampu memanfaatkan informasi digital dan teknologi secara etis."
  },
  {
    "cpmk_kode": "CPMK2",
    "sub_kode": "2.1",
    "uraian": "Mampu mengidentifikasi nilai-nilai kepedulian yang relevan secara etis."
  },
  {
    "cpmk_kode": "CPMK2",
    "sub_kode": "2.2",
    "uraian": "Mampu menerapkan nilai kepedulian dalam hubungan interpersonal dan profesional."
  },
  {
    "cpmk_kode": "CPMK2",
    "sub_kode": "2.3",
    "uraian": "Mengevaluasi kode etik praktik dan implikasinya bagi masyarakat"
  },
  {
    "cpmk_kode": "CPMK2",
    "sub_kode": "2.4",
    "uraian": "Mengkategorikan pemangku kepentingan etis dan pentingnya bagi Sistem Informasi"
  },
  {
    "cpmk_kode": "CPMK20",
    "sub_kode": "20.1",
    "uraian": "Mampu menyusun kerangka penulisan karya ilmiah sesuai kaidah saintifik."
  },
  {
    "cpmk_kode": "CPMK20",
    "sub_kode": "20.2",
    "uraian": "Mampu mendeskripsikan hasil kajian, pengembangan, atau implementasi IPTEK secara sistematis."
  },
  {
    "cpmk_kode": "CPMK20",
    "sub_kode": "20.3",
    "uraian": "Mampu menyusun laporan tugas akhir, skripsi, atau artikel ilmiah sesuai standar penulisan."
  },
  {
    "cpmk_kode": "CPMK20",
    "sub_kode": "20.4",
    "uraian": "Mengembangkan rencana pengembangan tenaga kerja, pelatihan, akuisisi talenta, dan retensi karyawan"
  },
  {
    "cpmk_kode": "CPMK20",
    "sub_kode": "20.5",
    "uraian": "Menjelaskan prinsip inti di balik berbagai tugas analitik seperti klasifikasi, clustering, optimisasi, rekomendasi"
  },
  {
    "cpmk_kode": "CPMK21",
    "sub_kode": "21.1",
    "uraian": "Mampu mengidentifikasi kebutuhan pengguna terhadap solusi computing dan user interface."
  },
  {
    "cpmk_kode": "CPMK21",
    "sub_kode": "21.2",
    "uraian": "Mampu mengevaluasi kualitas interaksi pada aplikasi interaktif."
  },
  {
    "cpmk_kode": "CPMK22",
    "sub_kode": "22.1",
    "uraian": "Mampu menganalisis kebutuhan basis data sistem informasi organisasi."
  },
  {
    "cpmk_kode": "CPMK22",
    "sub_kode": "22.2",
    "uraian": "Mampu merancang basis data sesuai kebutuhan organisasi."
  },
  {
    "cpmk_kode": "CPMK22",
    "sub_kode": "22.3",
    "uraian": "Mampu mengelola (membuat, memperbarui, memelihara) basis data."
  },
  {
    "cpmk_kode": "CPMK22",
    "sub_kode": "22.4",
    "uraian": "Mengamankan basis data"
  },
  {
    "cpmk_kode": "CPMK22",
    "sub_kode": "22.5",
    "uraian": "Memrogram sistem basis data menggunakan fungsi dan trigger"
  },
  {
    "cpmk_kode": "CPMK23",
    "sub_kode": "23.1",
    "uraian": "Mampu mengidentifikasi sumber data yang relevan bagi organisasi."
  },
  {
    "cpmk_kode": "CPMK23",
    "sub_kode": "23.2",
    "uraian": "Mampu melakukan integrasi data dari berbagai sumber."
  },
  {
    "cpmk_kode": "CPMK23",
    "sub_kode": "23.3",
    "uraian": "Mampu melakukan transformasi data untuk mendukung kebutuhan operasional dan pengambilan keputusan."
  },
  {
    "cpmk_kode": "CPMK23",
    "sub_kode": "23.4",
    "uraian": "Memanfaatkan alat untuk pengujian (unit, integrasi, penerimaan)"
  },
  {
    "cpmk_kode": "CPMK23",
    "sub_kode": "23.5",
    "uraian": "Melakukan query pada model relasional"
  },
  {
    "cpmk_kode": "CPMK24",
    "sub_kode": "24.1",
    "uraian": "Mampu memilih teknik analisis data yang sesuai kebutuhan."
  },
  {
    "cpmk_kode": "CPMK24",
    "sub_kode": "24.2",
    "uraian": "Mampu menggunakan perangkat analisis data."
  },
  {
    "cpmk_kode": "CPMK24",
    "sub_kode": "24.3",
    "uraian": "Mampu menginterpretasikan hasil analisis data menjadi informasi yang relevan."
  },
  {
    "cpmk_kode": "CPMK24",
    "sub_kode": "24.4",
    "uraian": "Menerapkan prinsip Berorientasi Objek dalam desain dan implementasi sistem/perangkat lunak"
  },
  {
    "cpmk_kode": "CPMK24",
    "sub_kode": "24.5",
    "uraian": "Memanfaatkan alat untuk manajemen proses perangkat lunak"
  },
  {
    "cpmk_kode": "CPMK25",
    "sub_kode": "25.1",
    "uraian": "Mampu menganalisis kebutuhan proses bisnis dan sasaran strategis organisasi."
  },
  {
    "cpmk_kode": "CPMK25",
    "sub_kode": "25.2",
    "uraian": "Mampu menyusun perencanaan sistem informasi yang selaras dengan kebutuhan organisasi."
  },
  {
    "cpmk_kode": "CPMK26",
    "sub_kode": "26.1",
    "uraian": "Mampu menganalisis kebutuhan pengguna terhadap user interface dan aplikasi interaktif."
  },
  {
    "cpmk_kode": "CPMK26",
    "sub_kode": "26.2",
    "uraian": "Mampu mendesain user interface berdasarkan prinsip usability."
  },
  {
    "cpmk_kode": "CPMK26",
    "sub_kode": "26.3",
    "uraian": "Mampu mendesain aplikasi interaktif dengan mempertimbangkan perkembangan ilmu transdisiplin."
  },
  {
    "cpmk_kode": "CPMK27",
    "sub_kode": "27.1",
    "uraian": "Mampu mengimplementasikan rancangan sistem informasi ke dalam aplikasi."
  },
  {
    "cpmk_kode": "CPMK27",
    "sub_kode": "27.2",
    "uraian": "Mampu menerapkan sistem informasi sesuai kebutuhan pengguna dan proses bisnis organisasi."
  },
  {
    "cpmk_kode": "CPMK27",
    "sub_kode": "27.3",
    "uraian": "Menerapkan proses pengembangan Scrum"
  },
  {
    "cpmk_kode": "CPMK28",
    "sub_kode": "28.1",
    "uraian": "Mampu mengevaluasi kualitas dan keamanan sistem informasi."
  },
  {
    "cpmk_kode": "CPMK28",
    "sub_kode": "28.2",
    "uraian": "Mampu mengidentifikasi peluang peningkatan (improvement) sistem informasi."
  },
  {
    "cpmk_kode": "CPMK28",
    "sub_kode": "28.3",
    "uraian": "Mampu melakukan peningkatan sistem informasi secara berkelanjutan."
  },
  {
    "cpmk_kode": "CPMK28",
    "sub_kode": "28.4",
    "uraian": "Memanfaatkan proses kontrol perubahan untuk menjaga dan mengendalikan kualitas"
  },
  {
    "cpmk_kode": "CPMK28",
    "sub_kode": "28.5",
    "uraian": "Menguji seluruh komponen kode program yang dikembangkan untuk memastikan keandalan, konsistensi, dan kesesuaian"
  },
  {
    "cpmk_kode": "CPMK29",
    "sub_kode": "29.1",
    "uraian": "Mampu mengoperasikan sistem informasi sesuai prosedur."
  },
  {
    "cpmk_kode": "CPMK29",
    "sub_kode": "29.2",
    "uraian": "Mampu melakukan pemeliharaan (maintenance) sistem informasi untuk mendukung keberlangsungan proses bisnis."
  },
  {
    "cpmk_kode": "CPMK3",
    "sub_kode": "3.1",
    "uraian": "Mampu menjelaskan nilai-nilai ketakwaan kepada Tuhan Yang Maha Esa sesuai ajaran agama."
  },
  {
    "cpmk_kode": "CPMK3",
    "sub_kode": "3.2",
    "uraian": "Mampu menunjukkan perilaku yang sesuai etika, aturan, dan norma hukum dalam kehidupan bermasyarakat."
  },
  {
    "cpmk_kode": "CPMK3",
    "sub_kode": "3.3",
    "uraian": "Mampu menunjukkan tanggung jawab sosial sebagai warga negara."
  },
  {
    "cpmk_kode": "CPMK30",
    "sub_kode": "30.1",
    "uraian": "Mampu mendesain solusi computing multi-platform sesuai kebutuhan organisasi."
  },
  {
    "cpmk_kode": "CPMK30",
    "sub_kode": "30.2",
    "uraian": "Mampu mengimplementasikan solusi computing multi-platform."
  },
  {
    "cpmk_kode": "CPMK31",
    "sub_kode": "31.1",
    "uraian": "Mampu merumuskan model bisnis digital."
  },
  {
    "cpmk_kode": "CPMK31",
    "sub_kode": "31.2",
    "uraian": "Mampu melakukan validasi pasar secara sederhana."
  },
  {
    "cpmk_kode": "CPMK31",
    "sub_kode": "31.3",
    "uraian": "Mampu merancang strategi pemasaran digital dan proses operasional digital."
  },
  {
    "cpmk_kode": "CPMK31",
    "sub_kode": "31.4",
    "uraian": "Mengidentifikasi dan menghimpun sumber daya, proses, dan mitra yang diperlukan untuk mewujudkan model bisnis digital"
  },
  {
    "cpmk_kode": "CPMK31",
    "sub_kode": "31.5",
    "uraian": "Menggunakan alat BPM untuk merancang dan menerapkan model proses bisnis"
  },
  {
    "cpmk_kode": "CPMK32",
    "sub_kode": "32.1",
    "uraian": "Mampu mengidentifikasi permasalahan dalam pengelolaan proyek teknologi."
  },
  {
    "cpmk_kode": "CPMK32",
    "sub_kode": "32.2",
    "uraian": "Mampu merumuskan solusi yang efektif dan efisien untuk pengelolaan proyek teknologi."
  },
  {
    "cpmk_kode": "CPMK33",
    "sub_kode": "33.1",
    "uraian": "Mampu menganalisis kebutuhan computing sesuai konteks pengguna, organisasi, atau bisnis."
  },
  {
    "cpmk_kode": "CPMK33",
    "sub_kode": "33.2",
    "uraian": "Memeriksa dan mengkritisi infrastruktur TI untuk organisasi"
  },
  {
    "cpmk_kode": "CPMK34",
    "sub_kode": "34.1",
    "uraian": "Mampu merancang user interface untuk solusi e-business."
  },
  {
    "cpmk_kode": "CPMK34",
    "sub_kode": "34.2",
    "uraian": "Mampu membangun aplikasi interaktif sebagai solusi e-business sesuai kebutuhan pengguna."
  },
  {
    "cpmk_kode": "CPMK34",
    "sub_kode": "34.3",
    "uraian": "Memeriksa dan mengkritisi arsitektur server TI (baik fisik maupun berbasis cloud)"
  },
  {
    "cpmk_kode": "CPMK4",
    "sub_kode": "4.1",
    "uraian": "Mampu menjelaskan konsep integritas, kejujuran, tanggung jawab, dan etika."
  },
  {
    "cpmk_kode": "CPMK4",
    "sub_kode": "4.2",
    "uraian": "Mampu menerapkan nilai integritas dan kejujuran dalam kehidupan akademik."
  },
  {
    "cpmk_kode": "CPMK4",
    "sub_kode": "4.3",
    "uraian": "Mampu menerapkan nilai tanggung jawab dan etika dalam kehidupan profesional dan sosial."
  },
  {
    "cpmk_kode": "CPMK5",
    "sub_kode": "5.1",
    "uraian": "Mampu menjelaskan kode etik dan etika profesi bidang sistem informasi."
  },
  {
    "cpmk_kode": "CPMK5",
    "sub_kode": "5.2",
    "uraian": "Mampu menunjukkan sikap profesional dalam pelaksanaan tugas."
  },
  {
    "cpmk_kode": "CPMK5",
    "sub_kode": "5.3",
    "uraian": "Mampu mematuhi etika profesi dalam pengambilan keputusan."
  },
  {
    "cpmk_kode": "CPMK6",
    "sub_kode": "6.1",
    "uraian": "Mampu menjelaskan konsep dasar komputasi."
  },
  {
    "cpmk_kode": "CPMK6",
    "sub_kode": "6.2",
    "uraian": "Mampu menjelaskan cara kerja sistem komputer."
  },
  {
    "cpmk_kode": "CPMK6",
    "sub_kode": "6.3",
    "uraian": "Mampu menjelaskan peran sistem informasi dalam konteks organisasi."
  },
  {
    "cpmk_kode": "CPMK6",
    "sub_kode": "7.1",
    "uraian": "Mampu menganalisis permasalahan organisasi dalam domain computing."
  },
  {
    "cpmk_kode": "CPMK7",
    "sub_kode": "7.1",
    "uraian": "Mampu menganalisis permasalahan organisasi dalam domain computing."
  },
  {
    "cpmk_kode": "CPMK7",
    "sub_kode": "7.2",
    "uraian": "Mampu memilih metode atau algoritma yang sesuai untuk pemecahan masalah."
  },
  {
    "cpmk_kode": "CPMK7",
    "sub_kode": "7.3",
    "uraian": "Mampu menerapkan metode/algoritma untuk memecahkan masalah organisasi berdasarkan perspektif sistem informasi."
  },
  {
    "cpmk_kode": "CPMK7",
    "sub_kode": "7.4",
    "uraian": "Menganalisis studi kasus bisnis dan mengkritisi solusi SI yang sesuai untuk masalah bisnis umum, berdasarkan komponen, elemen, jenis, dan tingkatan SI yang berbeda"
  },
  {
    "cpmk_kode": "CPMK8",
    "sub_kode": "8.1",
    "uraian": "Mampu menjelaskan siklus pengelolaan data menjadi informasi dan pengetahuan."
  },
  {
    "cpmk_kode": "CPMK8",
    "sub_kode": "8.2",
    "uraian": "Mampu menganalisis kebutuhan informasi untuk pengambilan keputusan."
  },
  {
    "cpmk_kode": "CPMK8",
    "sub_kode": "8.3",
    "uraian": "Mampu menyusun argumentasi rekomendasi keputusan berbasis sistem informasi."
  },
  {
    "cpmk_kode": "CPMK8",
    "sub_kode": "8.4",
    "uraian": "Merekomendasikan teknik penggunaan informasi dan pengetahuan untuk pengambilan keputusan bisnis dan nilai strategis"
  },
  {
    "cpmk_kode": "CPMK9",
    "sub_kode": "9.1",
    "uraian": "Mampu menjelaskan konsep teoretis bidang Sistem Informasi."
  },
  {
    "cpmk_kode": "CPMK9",
    "sub_kode": "9.2",
    "uraian": "Mampu merancang dan mensimulasikan aplikasi teknologi multi-platform."
  },
  {
    "cpmk_kode": "CPMK9",
    "sub_kode": "9.3",
    "uraian": "Mampu mengembangkan aplikasi teknologi multi-platform sesuai kebutuhan industri dan masyarakat."
  },
  {
    "cpmk_kode": "CPMK9",
    "sub_kode": "9.4",
    "uraian": "Menerapkan konsep berorientasi objek dalam pengorganisasian dan penyusunan program untuk manajemen perilaku dan konsep"
  }
];

export const CURRICULUM_2026_MK_CPMK_MAPPINGS: Curriculum2026MkCpmkMapping[] = [
  {
    "kode_mk": "SIF210",
    "cpl_kode": "CPL01",
    "cpmk_kode": "CPMK1",
    "sub_kode": "1.1",
    "uraian": "Mampu mendefinisikan konsep dasar kepedulian dan seluruh dimensinya."
  },
  {
    "kode_mk": "UNI106",
    "cpl_kode": "CPL01",
    "cpmk_kode": "CPMK1",
    "sub_kode": "1.1",
    "uraian": "Mampu mendefinisikan konsep dasar kepedulian dan seluruh dimensinya."
  },
  {
    "kode_mk": "SIF801",
    "cpl_kode": "CPL01",
    "cpmk_kode": "CPMK1",
    "sub_kode": "1.1",
    "uraian": "Mampu mendefinisikan konsep dasar kepedulian dan seluruh dimensinya."
  },
  {
    "kode_mk": "SIF210",
    "cpl_kode": "CPL01",
    "cpmk_kode": "CPMK1",
    "sub_kode": "1.2",
    "uraian": "Mampu menjelaskan implikasi etis dari konsep kepedulian."
  },
  {
    "kode_mk": "UNI106",
    "cpl_kode": "CPL01",
    "cpmk_kode": "CPMK1",
    "sub_kode": "1.2",
    "uraian": "Mampu menjelaskan implikasi etis dari konsep kepedulian."
  },
  {
    "kode_mk": "SIF801",
    "cpl_kode": "CPL01",
    "cpmk_kode": "CPMK1",
    "sub_kode": "1.2",
    "uraian": "Mampu menjelaskan implikasi etis dari konsep kepedulian."
  },
  {
    "kode_mk": "SIF210",
    "cpl_kode": "CPL01",
    "cpmk_kode": "CPMK1",
    "sub_kode": "1.3",
    "uraian": "Mampu menjelaskan penerapan konsep kepedulian dalam kehidupan interpersonal, profesional, dan sosial."
  },
  {
    "kode_mk": "UNI106",
    "cpl_kode": "CPL01",
    "cpmk_kode": "CPMK1",
    "sub_kode": "1.3",
    "uraian": "Mampu menjelaskan penerapan konsep kepedulian dalam kehidupan interpersonal, profesional, dan sosial."
  },
  {
    "kode_mk": "SIF801",
    "cpl_kode": "CPL01",
    "cpmk_kode": "CPMK1",
    "sub_kode": "1.3",
    "uraian": "Mampu menjelaskan penerapan konsep kepedulian dalam kehidupan interpersonal, profesional, dan sosial."
  },
  {
    "kode_mk": "SIF407",
    "cpl_kode": "CPL04",
    "cpmk_kode": "CPMK10",
    "sub_kode": "10.1",
    "uraian": "Mampu mengidentifikasi isu etika dalam perancangan sistem informasi."
  },
  {
    "kode_mk": "SIF801",
    "cpl_kode": "CPL04",
    "cpmk_kode": "CPMK10",
    "sub_kode": "10.1",
    "uraian": "Mampu mengidentifikasi isu etika dalam perancangan sistem informasi."
  },
  {
    "kode_mk": "SIF407",
    "cpl_kode": "CPL04",
    "cpmk_kode": "CPMK10",
    "sub_kode": "10.2",
    "uraian": "Mampu menerapkan prinsip etika profesi dalam implementasi sistem informasi."
  },
  {
    "kode_mk": "SIF801",
    "cpl_kode": "CPL04",
    "cpmk_kode": "CPMK10",
    "sub_kode": "10.2",
    "uraian": "Mampu menerapkan prinsip etika profesi dalam implementasi sistem informasi."
  },
  {
    "kode_mk": "SIF609",
    "cpl_kode": "CPL04",
    "cpmk_kode": "CPMK11",
    "sub_kode": "11.1",
    "uraian": "Mampu menjelaskan konsep tata kelola informasi dan data."
  },
  {
    "kode_mk": "SIF907",
    "cpl_kode": "CPL04",
    "cpmk_kode": "CPMK11",
    "sub_kode": "11.1",
    "uraian": "Mampu menjelaskan konsep tata kelola informasi dan data."
  },
  {
    "kode_mk": "SIF908",
    "cpl_kode": "CPL04",
    "cpmk_kode": "CPMK11",
    "sub_kode": "11.1",
    "uraian": "Mampu menjelaskan konsep tata kelola informasi dan data."
  },
  {
    "kode_mk": "SIF702",
    "cpl_kode": "CPL04",
    "cpmk_kode": "CPMK11",
    "sub_kode": "11.1",
    "uraian": "Mampu menjelaskan konsep tata kelola informasi dan data."
  },
  {
    "kode_mk": "SIF609",
    "cpl_kode": "CPL04",
    "cpmk_kode": "CPMK11",
    "sub_kode": "11.2",
    "uraian": "Mampu menjelaskan aspek privasi dan keamanan data."
  },
  {
    "kode_mk": "SIF907",
    "cpl_kode": "CPL04",
    "cpmk_kode": "CPMK11",
    "sub_kode": "11.2",
    "uraian": "Mampu menjelaskan aspek privasi dan keamanan data."
  },
  {
    "kode_mk": "SIF908",
    "cpl_kode": "CPL04",
    "cpmk_kode": "CPMK11",
    "sub_kode": "11.2",
    "uraian": "Mampu menjelaskan aspek privasi dan keamanan data."
  },
  {
    "kode_mk": "SIF702",
    "cpl_kode": "CPL04",
    "cpmk_kode": "CPMK11",
    "sub_kode": "11.2",
    "uraian": "Mampu menjelaskan aspek privasi dan keamanan data."
  },
  {
    "kode_mk": "SIF609",
    "cpl_kode": "CPL04",
    "cpmk_kode": "CPMK11",
    "sub_kode": "11.3",
    "uraian": "Mampu menjelaskan aspek kepatuhan (compliance) dalam sistem informasi."
  },
  {
    "kode_mk": "SIF907",
    "cpl_kode": "CPL04",
    "cpmk_kode": "CPMK11",
    "sub_kode": "11.3",
    "uraian": "Mampu menjelaskan aspek kepatuhan (compliance) dalam sistem informasi."
  },
  {
    "kode_mk": "SIF908",
    "cpl_kode": "CPL04",
    "cpmk_kode": "CPMK11",
    "sub_kode": "11.3",
    "uraian": "Mampu menjelaskan aspek kepatuhan (compliance) dalam sistem informasi."
  },
  {
    "kode_mk": "SIF702",
    "cpl_kode": "CPL04",
    "cpmk_kode": "CPMK11",
    "sub_kode": "11.3",
    "uraian": "Mampu menjelaskan aspek kepatuhan (compliance) dalam sistem informasi."
  },
  {
    "kode_mk": "SIF609",
    "cpl_kode": "CPL04",
    "cpmk_kode": "CPMK11",
    "sub_kode": "11.4",
    "uraian": "Menginterpretasikan dimensi, karakteristik, dan nilai informasi yang berkualitas"
  },
  {
    "kode_mk": "SIF907",
    "cpl_kode": "CPL04",
    "cpmk_kode": "CPMK11",
    "sub_kode": "11.4",
    "uraian": "Menginterpretasikan dimensi, karakteristik, dan nilai informasi yang berkualitas"
  },
  {
    "kode_mk": "SIF908",
    "cpl_kode": "CPL04",
    "cpmk_kode": "CPMK11",
    "sub_kode": "11.4",
    "uraian": "Menginterpretasikan dimensi, karakteristik, dan nilai informasi yang berkualitas"
  },
  {
    "kode_mk": "SIF702",
    "cpl_kode": "CPL04",
    "cpmk_kode": "CPMK11",
    "sub_kode": "11.4",
    "uraian": "Menginterpretasikan dimensi, karakteristik, dan nilai informasi yang berkualitas"
  },
  {
    "kode_mk": "SIF106",
    "cpl_kode": "CPL04",
    "cpmk_kode": "CPMK12",
    "sub_kode": "12.1",
    "uraian": "Mampu mengidentifikasi dampak sosial dari pemanfaatan teknologi dan data."
  },
  {
    "kode_mk": "SIF608",
    "cpl_kode": "CPL04",
    "cpmk_kode": "CPMK12",
    "sub_kode": "12.1",
    "uraian": "Mampu mengidentifikasi dampak sosial dari pemanfaatan teknologi dan data."
  },
  {
    "kode_mk": "SIF907",
    "cpl_kode": "CPL04",
    "cpmk_kode": "CPMK12",
    "sub_kode": "12.1",
    "uraian": "Mampu mengidentifikasi dampak sosial dari pemanfaatan teknologi dan data."
  },
  {
    "kode_mk": "SIF106",
    "cpl_kode": "CPL04",
    "cpmk_kode": "CPMK12",
    "sub_kode": "12.2",
    "uraian": "Mampu menganalisis dampak organisasional dari pemanfaatan teknologi dan data."
  },
  {
    "kode_mk": "SIF608",
    "cpl_kode": "CPL04",
    "cpmk_kode": "CPMK12",
    "sub_kode": "12.2",
    "uraian": "Mampu menganalisis dampak organisasional dari pemanfaatan teknologi dan data."
  },
  {
    "kode_mk": "SIF907",
    "cpl_kode": "CPL04",
    "cpmk_kode": "CPMK12",
    "sub_kode": "12.2",
    "uraian": "Mampu menganalisis dampak organisasional dari pemanfaatan teknologi dan data."
  },
  {
    "kode_mk": "SIF608",
    "cpl_kode": "CPL04",
    "cpmk_kode": "CPMK12",
    "sub_kode": "12.3",
    "uraian": "Mengembangkan strategi penyimpanan data menggunakan tipe data primitif pada memori volatil komputer"
  },
  {
    "kode_mk": "SIF801",
    "cpl_kode": "CPL04",
    "cpmk_kode": "CPMK12",
    "sub_kode": "12.3",
    "uraian": "Mengembangkan strategi penyimpanan data menggunakan tipe data primitif pada memori volatil komputer"
  },
  {
    "kode_mk": "SIF213",
    "cpl_kode": "CPL05",
    "cpmk_kode": "CPMK13",
    "sub_kode": "13.1",
    "uraian": "Mampu menjelaskan tahapan-tahapan design thinking."
  },
  {
    "kode_mk": "SIF409",
    "cpl_kode": "CPL05",
    "cpmk_kode": "CPMK13",
    "sub_kode": "13.1",
    "uraian": "Mampu menjelaskan tahapan-tahapan design thinking."
  },
  {
    "kode_mk": "FTK221",
    "cpl_kode": "CPL05",
    "cpmk_kode": "CPMK13",
    "sub_kode": "13.1",
    "uraian": "Mampu menjelaskan tahapan-tahapan design thinking."
  },
  {
    "kode_mk": "SIF610",
    "cpl_kode": "CPL05",
    "cpmk_kode": "CPMK13",
    "sub_kode": "13.1",
    "uraian": "Mampu menjelaskan tahapan-tahapan design thinking."
  },
  {
    "kode_mk": "SIF213",
    "cpl_kode": "CPL05",
    "cpmk_kode": "CPMK13",
    "sub_kode": "13.2",
    "uraian": "Mampu menerapkan tahapan design thinking untuk mengidentifikasi akar masalah."
  },
  {
    "kode_mk": "SIF409",
    "cpl_kode": "CPL05",
    "cpmk_kode": "CPMK13",
    "sub_kode": "13.2",
    "uraian": "Mampu menerapkan tahapan design thinking untuk mengidentifikasi akar masalah."
  },
  {
    "kode_mk": "FTK221",
    "cpl_kode": "CPL05",
    "cpmk_kode": "CPMK13",
    "sub_kode": "13.2",
    "uraian": "Mampu menerapkan tahapan design thinking untuk mengidentifikasi akar masalah."
  },
  {
    "kode_mk": "SIF610",
    "cpl_kode": "CPL05",
    "cpmk_kode": "CPMK13",
    "sub_kode": "13.2",
    "uraian": "Mampu menerapkan tahapan design thinking untuk mengidentifikasi akar masalah."
  },
  {
    "kode_mk": "SIF213",
    "cpl_kode": "CPL05",
    "cpmk_kode": "CPMK13",
    "sub_kode": "13.3",
    "uraian": "Mampu menghasilkan solusi inovatif menggunakan pendekatan design thinking."
  },
  {
    "kode_mk": "SIF409",
    "cpl_kode": "CPL05",
    "cpmk_kode": "CPMK13",
    "sub_kode": "13.3",
    "uraian": "Mampu menghasilkan solusi inovatif menggunakan pendekatan design thinking."
  },
  {
    "kode_mk": "FTK221",
    "cpl_kode": "CPL05",
    "cpmk_kode": "CPMK13",
    "sub_kode": "13.3",
    "uraian": "Mampu menghasilkan solusi inovatif menggunakan pendekatan design thinking."
  },
  {
    "kode_mk": "SIF610",
    "cpl_kode": "CPL05",
    "cpmk_kode": "CPMK13",
    "sub_kode": "13.3",
    "uraian": "Mampu menghasilkan solusi inovatif menggunakan pendekatan design thinking."
  },
  {
    "kode_mk": "SIF213",
    "cpl_kode": "CPL05",
    "cpmk_kode": "CPMK13",
    "sub_kode": "13.4",
    "uraian": "Menerapkan teknologi baru dalam skenario kerja tim"
  },
  {
    "kode_mk": "SIF409",
    "cpl_kode": "CPL05",
    "cpmk_kode": "CPMK13",
    "sub_kode": "13.4",
    "uraian": "Menerapkan teknologi baru dalam skenario kerja tim"
  },
  {
    "kode_mk": "FTK221",
    "cpl_kode": "CPL05",
    "cpmk_kode": "CPMK13",
    "sub_kode": "13.4",
    "uraian": "Menerapkan teknologi baru dalam skenario kerja tim"
  },
  {
    "kode_mk": "SIF610",
    "cpl_kode": "CPL05",
    "cpmk_kode": "CPMK13",
    "sub_kode": "13.4",
    "uraian": "Menerapkan teknologi baru dalam skenario kerja tim"
  },
  {
    "kode_mk": "SIF106",
    "cpl_kode": "CPL05",
    "cpmk_kode": "CPMK14",
    "sub_kode": "14.1",
    "uraian": "Mampu menjelaskan prinsip keberlanjutan dalam konteks lingkungan dan sosial."
  },
  {
    "kode_mk": "SIF213",
    "cpl_kode": "CPL05",
    "cpmk_kode": "CPMK14",
    "sub_kode": "14.1",
    "uraian": "Mampu menjelaskan prinsip keberlanjutan dalam konteks lingkungan dan sosial."
  },
  {
    "kode_mk": "FTK221",
    "cpl_kode": "CPL05",
    "cpmk_kode": "CPMK14",
    "sub_kode": "14.1",
    "uraian": "Mampu menjelaskan prinsip keberlanjutan dalam konteks lingkungan dan sosial."
  },
  {
    "kode_mk": "SIF608",
    "cpl_kode": "CPL05",
    "cpmk_kode": "CPMK14",
    "sub_kode": "14.1",
    "uraian": "Mampu menjelaskan prinsip keberlanjutan dalam konteks lingkungan dan sosial."
  },
  {
    "kode_mk": "SIF106",
    "cpl_kode": "CPL05",
    "cpmk_kode": "CPMK14",
    "sub_kode": "14.2",
    "uraian": "Mampu menyajikan gagasan keberlanjutan secara sistematis dan komunikatif."
  },
  {
    "kode_mk": "SIF213",
    "cpl_kode": "CPL05",
    "cpmk_kode": "CPMK14",
    "sub_kode": "14.2",
    "uraian": "Mampu menyajikan gagasan keberlanjutan secara sistematis dan komunikatif."
  },
  {
    "kode_mk": "FTK221",
    "cpl_kode": "CPL05",
    "cpmk_kode": "CPMK14",
    "sub_kode": "14.2",
    "uraian": "Mampu menyajikan gagasan keberlanjutan secara sistematis dan komunikatif."
  },
  {
    "kode_mk": "SIF608",
    "cpl_kode": "CPL05",
    "cpmk_kode": "CPMK14",
    "sub_kode": "14.2",
    "uraian": "Mampu menyajikan gagasan keberlanjutan secara sistematis dan komunikatif."
  },
  {
    "kode_mk": "SIF106",
    "cpl_kode": "CPL05",
    "cpmk_kode": "CPMK14",
    "sub_kode": "14.3",
    "uraian": "Mampu bekerja secara efektif dalam lingkungan tim"
  },
  {
    "kode_mk": "SIF213",
    "cpl_kode": "CPL05",
    "cpmk_kode": "CPMK14",
    "sub_kode": "14.3",
    "uraian": "Mampu Bekerja secara efektif dalam lingkungan tim"
  },
  {
    "kode_mk": "SIF608",
    "cpl_kode": "CPL05",
    "cpmk_kode": "CPMK14",
    "sub_kode": "14.3",
    "uraian": "Bekerja secara efektif dalam lingkungan tim"
  },
  {
    "kode_mk": "SIF407",
    "cpl_kode": "CPL05",
    "cpmk_kode": "CPMK15",
    "sub_kode": "15.1",
    "uraian": "Mampu mengidentifikasi kebutuhan pengembangan diri sesuai perkembangan ilmu pengetahuan dan teknologi."
  },
  {
    "kode_mk": "SIF610",
    "cpl_kode": "CPL05",
    "cpmk_kode": "CPMK15",
    "sub_kode": "15.1",
    "uraian": "Mampu mengidentifikasi kebutuhan pengembangan diri sesuai perkembangan ilmu pengetahuan dan teknologi."
  },
  {
    "kode_mk": "FTK151",
    "cpl_kode": "CPL05",
    "cpmk_kode": "CPMK15",
    "sub_kode": "15.1",
    "uraian": "Mampu mengidentifikasi kebutuhan pengembangan diri sesuai perkembangan ilmu pengetahuan dan teknologi."
  },
  {
    "kode_mk": "SIF407",
    "cpl_kode": "CPL05",
    "cpmk_kode": "CPMK15",
    "sub_kode": "15.2",
    "uraian": "Mampu menunjukkan strategi belajar mandiri dan berkelanjutan (lifelong learning) untuk kebutuhan profesional."
  },
  {
    "kode_mk": "FTK151",
    "cpl_kode": "CPL05",
    "cpmk_kode": "CPMK15",
    "sub_kode": "15.2",
    "uraian": "Mampu menunjukkan strategi belajar mandiri dan berkelanjutan (lifelong learning) untuk kebutuhan profesional."
  },
  {
    "kode_mk": "SIF407",
    "cpl_kode": "CPL05",
    "cpmk_kode": "CPMK15",
    "sub_kode": "15.3",
    "uraian": "Menjelaskan peran, tanggung jawab, dan karakteristik profesional SI"
  },
  {
    "kode_mk": "FTK151",
    "cpl_kode": "CPL05",
    "cpmk_kode": "CPMK15",
    "sub_kode": "15.3",
    "uraian": "Menjelaskan peran, tanggung jawab, dan karakteristik profesional SI"
  },
  {
    "kode_mk": "SIF407",
    "cpl_kode": "CPL05",
    "cpmk_kode": "CPMK15",
    "sub_kode": "15.4",
    "uraian": "Menunjukkan fase dan aktivitas SDLC"
  },
  {
    "kode_mk": "SIF107",
    "cpl_kode": "CPL06",
    "cpmk_kode": "CPMK16",
    "sub_kode": "16.1",
    "uraian": "Mampu menjelaskan prinsip kerja sama dalam tim multidisiplin."
  },
  {
    "kode_mk": "SIF108",
    "cpl_kode": "CPL06",
    "cpmk_kode": "CPMK16",
    "sub_kode": "16.1",
    "uraian": "Mampu menjelaskan prinsip kerja sama dalam tim multidisiplin."
  },
  {
    "kode_mk": "SIF210",
    "cpl_kode": "CPL06",
    "cpmk_kode": "CPMK16",
    "sub_kode": "16.1",
    "uraian": "Mampu menjelaskan prinsip kerja sama dalam tim multidisiplin."
  },
  {
    "kode_mk": "SIF213",
    "cpl_kode": "CPL06",
    "cpmk_kode": "CPMK16",
    "sub_kode": "16.1",
    "uraian": "Mampu menjelaskan prinsip kerja sama dalam tim multidisiplin."
  },
  {
    "kode_mk": "SIF214",
    "cpl_kode": "CPL06",
    "cpmk_kode": "CPMK16",
    "sub_kode": "16.1",
    "uraian": "Mampu menjelaskan prinsip kerja sama dalam tim multidisiplin."
  },
  {
    "kode_mk": "SIF319",
    "cpl_kode": "CPL06",
    "cpmk_kode": "CPMK16",
    "sub_kode": "16.1",
    "uraian": "Mampu menjelaskan prinsip kerja sama dalam tim multidisiplin."
  },
  {
    "kode_mk": "SIF408",
    "cpl_kode": "CPL06",
    "cpmk_kode": "CPMK16",
    "sub_kode": "16.1",
    "uraian": "Mampu menjelaskan prinsip kerja sama dalam tim multidisiplin."
  },
  {
    "kode_mk": "SIF503",
    "cpl_kode": "CPL06",
    "cpmk_kode": "CPMK16",
    "sub_kode": "16.1",
    "uraian": "Mampu menjelaskan prinsip kerja sama dalam tim multidisiplin."
  },
  {
    "kode_mk": "SIF505",
    "cpl_kode": "CPL06",
    "cpmk_kode": "CPMK16",
    "sub_kode": "16.1",
    "uraian": "Mampu menjelaskan prinsip kerja sama dalam tim multidisiplin."
  },
  {
    "kode_mk": "SIF107",
    "cpl_kode": "CPL06",
    "cpmk_kode": "CPMK16",
    "sub_kode": "16.2",
    "uraian": "Mampu berperan aktif dan efektif dalam kerja tim."
  },
  {
    "kode_mk": "SIF108",
    "cpl_kode": "CPL06",
    "cpmk_kode": "CPMK16",
    "sub_kode": "16.2",
    "uraian": "Mampu berperan aktif dan efektif dalam kerja tim."
  },
  {
    "kode_mk": "SIF210",
    "cpl_kode": "CPL06",
    "cpmk_kode": "CPMK16",
    "sub_kode": "16.2",
    "uraian": "Mampu berperan aktif dan efektif dalam kerja tim."
  },
  {
    "kode_mk": "SIF213",
    "cpl_kode": "CPL06",
    "cpmk_kode": "CPMK16",
    "sub_kode": "16.2",
    "uraian": "Mampu berperan aktif dan efektif dalam kerja tim."
  },
  {
    "kode_mk": "SIF214",
    "cpl_kode": "CPL06",
    "cpmk_kode": "CPMK16",
    "sub_kode": "16.2",
    "uraian": "Mampu berperan aktif dan efektif dalam kerja tim."
  },
  {
    "kode_mk": "SIF319",
    "cpl_kode": "CPL06",
    "cpmk_kode": "CPMK16",
    "sub_kode": "16.2",
    "uraian": "Mampu berperan aktif dan efektif dalam kerja tim."
  },
  {
    "kode_mk": "SIF404",
    "cpl_kode": "CPL06",
    "cpmk_kode": "CPMK16",
    "sub_kode": "16.2",
    "uraian": "Mampu berperan aktif dan efektif dalam kerja tim."
  },
  {
    "kode_mk": "SIF408",
    "cpl_kode": "CPL06",
    "cpmk_kode": "CPMK16",
    "sub_kode": "16.2",
    "uraian": "Mampu berperan aktif dan efektif dalam kerja tim."
  },
  {
    "kode_mk": "SIF503",
    "cpl_kode": "CPL06",
    "cpmk_kode": "CPMK16",
    "sub_kode": "16.2",
    "uraian": "Mampu berperan aktif dan efektif dalam kerja tim."
  },
  {
    "kode_mk": "SIF505",
    "cpl_kode": "CPL06",
    "cpmk_kode": "CPMK16",
    "sub_kode": "16.2",
    "uraian": "Mampu berperan aktif dan efektif dalam kerja tim."
  },
  {
    "kode_mk": "SIF107",
    "cpl_kode": "CPL06",
    "cpmk_kode": "CPMK16",
    "sub_kode": "16.3",
    "uraian": "Mampu menghargai perspektif dan kompetensi anggota tim yang beragam."
  },
  {
    "kode_mk": "SIF108",
    "cpl_kode": "CPL06",
    "cpmk_kode": "CPMK16",
    "sub_kode": "16.3",
    "uraian": "Mampu menghargai perspektif dan kompetensi anggota tim yang beragam."
  },
  {
    "kode_mk": "SIF210",
    "cpl_kode": "CPL06",
    "cpmk_kode": "CPMK16",
    "sub_kode": "16.3",
    "uraian": "Mampu menghargai perspektif dan kompetensi anggota tim yang beragam."
  },
  {
    "kode_mk": "SIF213",
    "cpl_kode": "CPL06",
    "cpmk_kode": "CPMK16",
    "sub_kode": "16.3",
    "uraian": "Mampu menghargai perspektif dan kompetensi anggota tim yang beragam."
  },
  {
    "kode_mk": "SIF214",
    "cpl_kode": "CPL06",
    "cpmk_kode": "CPMK16",
    "sub_kode": "16.3",
    "uraian": "Mampu menghargai perspektif dan kompetensi anggota tim yang beragam."
  },
  {
    "kode_mk": "SIF319",
    "cpl_kode": "CPL06",
    "cpmk_kode": "CPMK16",
    "sub_kode": "16.3",
    "uraian": "Mampu menghargai perspektif dan kompetensi anggota tim yang beragam."
  },
  {
    "kode_mk": "SIF404",
    "cpl_kode": "CPL06",
    "cpmk_kode": "CPMK16",
    "sub_kode": "16.3",
    "uraian": "Mampu menghargai perspektif dan kompetensi anggota tim yang beragam."
  },
  {
    "kode_mk": "SIF408",
    "cpl_kode": "CPL06",
    "cpmk_kode": "CPMK16",
    "sub_kode": "16.3",
    "uraian": "Mampu menghargai perspektif dan kompetensi anggota tim yang beragam."
  },
  {
    "kode_mk": "SIF409",
    "cpl_kode": "CPL06",
    "cpmk_kode": "CPMK16",
    "sub_kode": "16.3",
    "uraian": "Mampu menghargai perspektif dan kompetensi anggota tim yang beragam."
  },
  {
    "kode_mk": "SIF503",
    "cpl_kode": "CPL06",
    "cpmk_kode": "CPMK16",
    "sub_kode": "16.3",
    "uraian": "Mampu menghargai perspektif dan kompetensi anggota tim yang beragam."
  },
  {
    "kode_mk": "SIF107",
    "cpl_kode": "CPL06",
    "cpmk_kode": "CPMK16",
    "sub_kode": "16.4",
    "uraian": "Menjelaskan karakteristik suatu proses dan berbagai perspektif model proses"
  },
  {
    "kode_mk": "SIF108",
    "cpl_kode": "CPL06",
    "cpmk_kode": "CPMK16",
    "sub_kode": "16.4",
    "uraian": "Menjelaskan karakteristik suatu proses dan berbagai perspektif model proses"
  },
  {
    "kode_mk": "SIF213",
    "cpl_kode": "CPL06",
    "cpmk_kode": "CPMK16",
    "sub_kode": "16.4",
    "uraian": "Menjelaskan karakteristik suatu proses dan berbagai perspektif model proses"
  },
  {
    "kode_mk": "SIF214",
    "cpl_kode": "CPL06",
    "cpmk_kode": "CPMK16",
    "sub_kode": "16.4",
    "uraian": "Menjelaskan karakteristik suatu proses dan berbagai perspektif model proses"
  },
  {
    "kode_mk": "SIF408",
    "cpl_kode": "CPL06",
    "cpmk_kode": "CPMK16",
    "sub_kode": "16.4",
    "uraian": "Menjelaskan karakteristik suatu proses dan berbagai perspektif model proses"
  },
  {
    "kode_mk": "SIF409",
    "cpl_kode": "CPL06",
    "cpmk_kode": "CPMK16",
    "sub_kode": "16.4",
    "uraian": "Menjelaskan karakteristik suatu proses dan berbagai perspektif model proses"
  },
  {
    "kode_mk": "SIF503",
    "cpl_kode": "CPL06",
    "cpmk_kode": "CPMK16",
    "sub_kode": "16.4",
    "uraian": "Menjelaskan karakteristik suatu proses dan berbagai perspektif model proses"
  },
  {
    "kode_mk": "UNI104",
    "cpl_kode": "CPL06",
    "cpmk_kode": "CPMK17",
    "sub_kode": "17.1",
    "uraian": "Mampu memberikan kontribusi konstruktif dalam mencapai tujuan bersama."
  },
  {
    "kode_mk": "SIF210",
    "cpl_kode": "CPL06",
    "cpmk_kode": "CPMK17",
    "sub_kode": "17.1",
    "uraian": "Mampu memberikan kontribusi konstruktif dalam mencapai tujuan bersama."
  },
  {
    "kode_mk": "UNI204",
    "cpl_kode": "CPL06",
    "cpmk_kode": "CPMK17",
    "sub_kode": "17.1",
    "uraian": "Mampu memberikan kontribusi konstruktif dalam mencapai tujuan bersama."
  },
  {
    "kode_mk": "UNI101",
    "cpl_kode": "CPL06",
    "cpmk_kode": "CPMK17",
    "sub_kode": "17.1",
    "uraian": "Mampu memberikan kontribusi konstruktif dalam mencapai tujuan bersama."
  },
  {
    "kode_mk": "FTK151",
    "cpl_kode": "CPL06",
    "cpmk_kode": "CPMK17",
    "sub_kode": "17.1",
    "uraian": "Mampu memberikan kontribusi konstruktif dalam mencapai tujuan bersama."
  },
  {
    "kode_mk": "FTK151",
    "cpl_kode": "CPL06",
    "cpmk_kode": "CPMK17",
    "sub_kode": "17.2",
    "uraian": "Melakukan analisis kebutuhan secara sistematis untuk menentukan fakta dasar yang digunakan dalam mengarahkan upaya pemrograman guna memecahkan masalah atau mencapai tujuan"
  },
  {
    "kode_mk": "SIF409",
    "cpl_kode": "CPL06",
    "cpmk_kode": "CPMK18",
    "sub_kode": "18.1",
    "uraian": "Mampu mengidentifikasi tantangan dalam studi kasus proyek teknologi nyata."
  },
  {
    "kode_mk": "SIF503",
    "cpl_kode": "CPL06",
    "cpmk_kode": "CPMK18",
    "sub_kode": "18.1",
    "uraian": "Mampu mengidentifikasi tantangan dalam studi kasus proyek teknologi nyata."
  },
  {
    "kode_mk": "SIF505",
    "cpl_kode": "CPL06",
    "cpmk_kode": "CPMK18",
    "sub_kode": "18.1",
    "uraian": "Mampu mengidentifikasi tantangan dalam studi kasus proyek teknologi nyata."
  },
  {
    "kode_mk": "SIF610",
    "cpl_kode": "CPL06",
    "cpmk_kode": "CPMK18",
    "sub_kode": "18.1",
    "uraian": "Mampu mengidentifikasi tantangan dalam studi kasus proyek teknologi nyata."
  },
  {
    "kode_mk": "SIF908",
    "cpl_kode": "CPL06",
    "cpmk_kode": "CPMK18",
    "sub_kode": "18.1",
    "uraian": "Mampu mengidentifikasi tantangan dalam studi kasus proyek teknologi nyata."
  },
  {
    "kode_mk": "SIF409",
    "cpl_kode": "CPL06",
    "cpmk_kode": "CPMK18",
    "sub_kode": "18.2",
    "uraian": "Mampu menganalisis solusi yang diterapkan dalam studi kasus tersebut."
  },
  {
    "kode_mk": "SIF503",
    "cpl_kode": "CPL06",
    "cpmk_kode": "CPMK18",
    "sub_kode": "18.2",
    "uraian": "Mampu menganalisis solusi yang diterapkan dalam studi kasus tersebut."
  },
  {
    "kode_mk": "SIF505",
    "cpl_kode": "CPL06",
    "cpmk_kode": "CPMK18",
    "sub_kode": "18.2",
    "uraian": "Mampu menganalisis solusi yang diterapkan dalam studi kasus tersebut."
  },
  {
    "kode_mk": "SIF610",
    "cpl_kode": "CPL06",
    "cpmk_kode": "CPMK18",
    "sub_kode": "18.2",
    "uraian": "Mampu menganalisis solusi yang diterapkan dalam studi kasus tersebut."
  },
  {
    "kode_mk": "SIF908",
    "cpl_kode": "CPL06",
    "cpmk_kode": "CPMK18",
    "sub_kode": "18.2",
    "uraian": "Mampu menganalisis solusi yang diterapkan dalam studi kasus tersebut."
  },
  {
    "kode_mk": "SIF409",
    "cpl_kode": "CPL06",
    "cpmk_kode": "CPMK18",
    "sub_kode": "18.3",
    "uraian": "Mampu mengaitkan penerapan solusi dengan berbagai disiplin ilmu."
  },
  {
    "kode_mk": "SIF505",
    "cpl_kode": "CPL06",
    "cpmk_kode": "CPMK18",
    "sub_kode": "18.3",
    "uraian": "Mampu mengaitkan penerapan solusi dengan berbagai disiplin ilmu."
  },
  {
    "kode_mk": "SIF610",
    "cpl_kode": "CPL06",
    "cpmk_kode": "CPMK18",
    "sub_kode": "18.3",
    "uraian": "Mampu mengaitkan penerapan solusi dengan berbagai disiplin ilmu."
  },
  {
    "kode_mk": "SIF908",
    "cpl_kode": "CPL06",
    "cpmk_kode": "CPMK18",
    "sub_kode": "18.3",
    "uraian": "Mampu mengaitkan penerapan solusi dengan berbagai disiplin ilmu."
  },
  {
    "kode_mk": "SIF505",
    "cpl_kode": "CPL06",
    "cpmk_kode": "CPMK18",
    "sub_kode": "18.4",
    "uraian": "Memilih metodologi manajemen proyek yang sesuai berdasarkan karakteristik proyek"
  },
  {
    "kode_mk": "SIF610",
    "cpl_kode": "CPL06",
    "cpmk_kode": "CPMK18",
    "sub_kode": "18.4",
    "uraian": "Memilih metodologi manajemen proyek yang sesuai berdasarkan karakteristik proyek"
  },
  {
    "kode_mk": "SIF505",
    "cpl_kode": "CPL06",
    "cpmk_kode": "CPMK18",
    "sub_kode": "18.5",
    "uraian": "Membuat kebijakan pengadaan TI serta memahami dan menegosiasikan kontrak TI"
  },
  {
    "kode_mk": "SIF101",
    "cpl_kode": "CPL07",
    "cpmk_kode": "CPMK19",
    "sub_kode": "19.1",
    "uraian": "Mampu mengakses sumber informasi digital secara efektif."
  },
  {
    "kode_mk": "SIF604",
    "cpl_kode": "CPL07",
    "cpmk_kode": "CPMK19",
    "sub_kode": "19.1",
    "uraian": "Mampu mengakses sumber informasi digital secara efektif."
  },
  {
    "kode_mk": "SIF610",
    "cpl_kode": "CPL07",
    "cpmk_kode": "CPMK19",
    "sub_kode": "19.1",
    "uraian": "Mampu mengakses sumber informasi digital secara efektif."
  },
  {
    "kode_mk": "SIF604",
    "cpl_kode": "CPL07",
    "cpmk_kode": "CPMK19",
    "sub_kode": "19.2",
    "uraian": "Mampu mengevaluasi kredibilitas dan relevansi informasi digital secara kritis."
  },
  {
    "kode_mk": "SIF610",
    "cpl_kode": "CPL07",
    "cpmk_kode": "CPMK19",
    "sub_kode": "19.2",
    "uraian": "Mampu mengevaluasi kredibilitas dan relevansi informasi digital secara kritis."
  },
  {
    "kode_mk": "SIF101",
    "cpl_kode": "CPL07",
    "cpmk_kode": "CPMK19",
    "sub_kode": "19.3",
    "uraian": "Mampu memanfaatkan informasi digital dan teknologi secara etis."
  },
  {
    "kode_mk": "SIF604",
    "cpl_kode": "CPL07",
    "cpmk_kode": "CPMK19",
    "sub_kode": "19.3",
    "uraian": "Mampu memanfaatkan informasi digital dan teknologi secara etis."
  },
  {
    "kode_mk": "SIF610",
    "cpl_kode": "CPL07",
    "cpmk_kode": "CPMK19",
    "sub_kode": "19.3",
    "uraian": "Mampu memanfaatkan informasi digital dan teknologi secara etis."
  },
  {
    "kode_mk": "SIF210",
    "cpl_kode": "CPL01",
    "cpmk_kode": "CPMK2",
    "sub_kode": "2.1",
    "uraian": "Mampu mengidentifikasi nilai-nilai kepedulian yang relevan secara etis."
  },
  {
    "kode_mk": "UNI106",
    "cpl_kode": "CPL01",
    "cpmk_kode": "CPMK2",
    "sub_kode": "2.1",
    "uraian": "Mampu mengidentifikasi nilai-nilai kepedulian yang relevan secara etis."
  },
  {
    "kode_mk": "SIF801",
    "cpl_kode": "CPL01",
    "cpmk_kode": "CPMK2",
    "sub_kode": "2.1",
    "uraian": "Mampu mengidentifikasi nilai-nilai kepedulian yang relevan secara etis."
  },
  {
    "kode_mk": "SIF802",
    "cpl_kode": "CPL01",
    "cpmk_kode": "CPMK2",
    "sub_kode": "2.1",
    "uraian": "Mampu mengidentifikasi nilai-nilai kepedulian yang relevan secara etis."
  },
  {
    "kode_mk": "SIF210",
    "cpl_kode": "CPL01",
    "cpmk_kode": "CPMK2",
    "sub_kode": "2.2",
    "uraian": "Mampu menerapkan nilai kepedulian dalam hubungan interpersonal dan profesional."
  },
  {
    "kode_mk": "UNI106",
    "cpl_kode": "CPL01",
    "cpmk_kode": "CPMK2",
    "sub_kode": "2.2",
    "uraian": "Mampu menerapkan nilai kepedulian dalam hubungan interpersonal dan profesional."
  },
  {
    "kode_mk": "SIF801",
    "cpl_kode": "CPL01",
    "cpmk_kode": "CPMK2",
    "sub_kode": "2.2",
    "uraian": "Mampu menerapkan nilai kepedulian dalam hubungan interpersonal dan profesional."
  },
  {
    "kode_mk": "SIF802",
    "cpl_kode": "CPL01",
    "cpmk_kode": "CPMK2",
    "sub_kode": "2.2",
    "uraian": "Mampu menerapkan nilai kepedulian dalam hubungan interpersonal dan profesional."
  },
  {
    "kode_mk": "SIF210",
    "cpl_kode": "CPL01",
    "cpmk_kode": "CPMK2",
    "sub_kode": "2.3",
    "uraian": "Mengevaluasi kode etik praktik dan implikasinya bagi masyarakat"
  },
  {
    "kode_mk": "UNI106",
    "cpl_kode": "CPL01",
    "cpmk_kode": "CPMK2",
    "sub_kode": "2.3",
    "uraian": "Mengevaluasi kode etik praktik dan implikasinya bagi masyarakat"
  },
  {
    "kode_mk": "SIF801",
    "cpl_kode": "CPL01",
    "cpmk_kode": "CPMK2",
    "sub_kode": "2.3",
    "uraian": "Mengevaluasi kode etik praktik dan implikasinya bagi masyarakat"
  },
  {
    "kode_mk": "SIF802",
    "cpl_kode": "CPL01",
    "cpmk_kode": "CPMK2",
    "sub_kode": "2.3",
    "uraian": "Mengevaluasi kode etik praktik dan implikasinya bagi masyarakat"
  },
  {
    "kode_mk": "SIF210",
    "cpl_kode": "CPL01",
    "cpmk_kode": "CPMK2",
    "sub_kode": "2.4",
    "uraian": "Mengkategorikan pemangku kepentingan etis dan pentingnya bagi Sistem Informasi"
  },
  {
    "kode_mk": "UNI106",
    "cpl_kode": "CPL01",
    "cpmk_kode": "CPMK2",
    "sub_kode": "2.4",
    "uraian": "Mengkategorikan pemangku kepentingan etis dan pentingnya bagi Sistem Informasi"
  },
  {
    "kode_mk": "SIF801",
    "cpl_kode": "CPL01",
    "cpmk_kode": "CPMK2",
    "sub_kode": "2.4",
    "uraian": "Mengkategorikan pemangku kepentingan etis dan pentingnya bagi Sistem Informasi"
  },
  {
    "kode_mk": "SIF802",
    "cpl_kode": "CPL01",
    "cpmk_kode": "CPMK2",
    "sub_kode": "2.4",
    "uraian": "Mengkategorikan pemangku kepentingan etis dan pentingnya bagi Sistem Informasi"
  },
  {
    "kode_mk": "FTK161",
    "cpl_kode": "CPL07",
    "cpmk_kode": "CPMK20",
    "sub_kode": "20.1",
    "uraian": "Mampu menyusun kerangka penulisan karya ilmiah sesuai kaidah saintifik."
  },
  {
    "kode_mk": "UNI101",
    "cpl_kode": "CPL07",
    "cpmk_kode": "CPMK20",
    "sub_kode": "20.1",
    "uraian": "Mampu menyusun kerangka penulisan karya ilmiah sesuai kaidah saintifik."
  },
  {
    "kode_mk": "FTK151",
    "cpl_kode": "CPL07",
    "cpmk_kode": "CPMK20",
    "sub_kode": "20.1",
    "uraian": "Mampu menyusun kerangka penulisan karya ilmiah sesuai kaidah saintifik."
  },
  {
    "kode_mk": "SIF802",
    "cpl_kode": "CPL07",
    "cpmk_kode": "CPMK20",
    "sub_kode": "20.1",
    "uraian": "Mampu menyusun kerangka penulisan karya ilmiah sesuai kaidah saintifik."
  },
  {
    "kode_mk": "FTK161",
    "cpl_kode": "CPL07",
    "cpmk_kode": "CPMK20",
    "sub_kode": "20.2",
    "uraian": "Mampu mendeskripsikan hasil kajian, pengembangan, atau implementasi IPTEK secara sistematis."
  },
  {
    "kode_mk": "UNI101",
    "cpl_kode": "CPL07",
    "cpmk_kode": "CPMK20",
    "sub_kode": "20.2",
    "uraian": "Mampu mendeskripsikan hasil kajian, pengembangan, atau implementasi IPTEK secara sistematis."
  },
  {
    "kode_mk": "FTK151",
    "cpl_kode": "CPL07",
    "cpmk_kode": "CPMK20",
    "sub_kode": "20.2",
    "uraian": "Mampu mendeskripsikan hasil kajian, pengembangan, atau implementasi IPTEK secara sistematis."
  },
  {
    "kode_mk": "SIF802",
    "cpl_kode": "CPL07",
    "cpmk_kode": "CPMK20",
    "sub_kode": "20.2",
    "uraian": "Mampu mendeskripsikan hasil kajian, pengembangan, atau implementasi IPTEK secara sistematis."
  },
  {
    "kode_mk": "FTK161",
    "cpl_kode": "CPL07",
    "cpmk_kode": "CPMK20",
    "sub_kode": "20.3",
    "uraian": "Mampu menyusun laporan tugas akhir, skripsi, atau artikel ilmiah sesuai standar penulisan."
  },
  {
    "kode_mk": "UNI101",
    "cpl_kode": "CPL07",
    "cpmk_kode": "CPMK20",
    "sub_kode": "20.3",
    "uraian": "Mampu menyusun laporan tugas akhir, skripsi, atau artikel ilmiah sesuai standar penulisan."
  },
  {
    "kode_mk": "FTK151",
    "cpl_kode": "CPL07",
    "cpmk_kode": "CPMK20",
    "sub_kode": "20.3",
    "uraian": "Mampu menyusun laporan tugas akhir, skripsi, atau artikel ilmiah sesuai standar penulisan."
  },
  {
    "kode_mk": "SIF802",
    "cpl_kode": "CPL07",
    "cpmk_kode": "CPMK20",
    "sub_kode": "20.3",
    "uraian": "Mampu menyusun laporan tugas akhir, skripsi, atau artikel ilmiah sesuai standar penulisan."
  },
  {
    "kode_mk": "SIF802",
    "cpl_kode": "CPL07",
    "cpmk_kode": "CPMK20",
    "sub_kode": "20.4",
    "uraian": "Mengembangkan rencana pengembangan tenaga kerja, pelatihan, akuisisi talenta, dan retensi karyawan"
  },
  {
    "kode_mk": "SIF910",
    "cpl_kode": "CPL07",
    "cpmk_kode": "CPMK20",
    "sub_kode": "20.5",
    "uraian": "Menjelaskan prinsip inti di balik berbagai tugas analitik seperti klasifikasi, clustering, optimisasi, rekomendasi"
  },
  {
    "kode_mk": "FTK151",
    "cpl_kode": "CPL07",
    "cpmk_kode": "CPMK20",
    "sub_kode": "20.5",
    "uraian": "Menjelaskan prinsip inti di balik berbagai tugas analitik seperti klasifikasi, clustering, optimisasi, rekomendasi"
  },
  {
    "kode_mk": "SIF802",
    "cpl_kode": "CPL07",
    "cpmk_kode": "CPMK20",
    "sub_kode": "20.5",
    "uraian": "Menjelaskan prinsip inti di balik berbagai tugas analitik seperti klasifikasi, clustering, optimisasi, rekomendasi"
  },
  {
    "kode_mk": "SIF318",
    "cpl_kode": "CPL07",
    "cpmk_kode": "CPMK21",
    "sub_kode": "21.1",
    "uraian": "Mampu mengidentifikasi kebutuhan pengguna terhadap solusi computing dan user interface."
  },
  {
    "kode_mk": "SIF703",
    "cpl_kode": "CPL07",
    "cpmk_kode": "CPMK21",
    "sub_kode": "21.1",
    "uraian": "Mampu mengidentifikasi kebutuhan pengguna terhadap solusi computing dan user interface."
  },
  {
    "kode_mk": "SIF703",
    "cpl_kode": "CPL07",
    "cpmk_kode": "CPMK21",
    "sub_kode": "21.2",
    "uraian": "Mampu mengevaluasi kualitas interaksi pada aplikasi interaktif."
  },
  {
    "kode_mk": "SIF108",
    "cpl_kode": "CPL08",
    "cpmk_kode": "CPMK22",
    "sub_kode": "22.1",
    "uraian": "Mampu menganalisis kebutuhan basis data sistem informasi organisasi."
  },
  {
    "kode_mk": "SIF202",
    "cpl_kode": "CPL08",
    "cpmk_kode": "CPMK22",
    "sub_kode": "22.1",
    "uraian": "Mampu menganalisis kebutuhan basis data sistem informasi organisasi."
  },
  {
    "kode_mk": "SIF317",
    "cpl_kode": "CPL08",
    "cpmk_kode": "CPMK22",
    "sub_kode": "22.1",
    "uraian": "Mampu menganalisis kebutuhan basis data sistem informasi organisasi."
  },
  {
    "kode_mk": "SIF902",
    "cpl_kode": "CPL08",
    "cpmk_kode": "CPMK22",
    "sub_kode": "22.1",
    "uraian": "Mampu menganalisis kebutuhan basis data sistem informasi organisasi."
  },
  {
    "kode_mk": "SIF108",
    "cpl_kode": "CPL08",
    "cpmk_kode": "CPMK22",
    "sub_kode": "22.2",
    "uraian": "Mampu merancang basis data sesuai kebutuhan organisasi."
  },
  {
    "kode_mk": "SIF202",
    "cpl_kode": "CPL08",
    "cpmk_kode": "CPMK22",
    "sub_kode": "22.2",
    "uraian": "Mampu merancang basis data sesuai kebutuhan organisasi."
  },
  {
    "kode_mk": "SIF317",
    "cpl_kode": "CPL08",
    "cpmk_kode": "CPMK22",
    "sub_kode": "22.2",
    "uraian": "Mampu merancang basis data sesuai kebutuhan organisasi."
  },
  {
    "kode_mk": "SIF902",
    "cpl_kode": "CPL08",
    "cpmk_kode": "CPMK22",
    "sub_kode": "22.2",
    "uraian": "Mampu merancang basis data sesuai kebutuhan organisasi."
  },
  {
    "kode_mk": "SIF108",
    "cpl_kode": "CPL08",
    "cpmk_kode": "CPMK22",
    "sub_kode": "22.3",
    "uraian": "Mampu mengelola (membuat, memperbarui, memelihara) basis data."
  },
  {
    "kode_mk": "SIF902",
    "cpl_kode": "CPL08",
    "cpmk_kode": "CPMK22",
    "sub_kode": "22.3",
    "uraian": "Mampu mengelola (membuat, memperbarui, memelihara) basis data."
  },
  {
    "kode_mk": "SIF108",
    "cpl_kode": "CPL08",
    "cpmk_kode": "CPMK22",
    "sub_kode": "22.4",
    "uraian": "Mengamankan basis data"
  },
  {
    "kode_mk": "SIF902",
    "cpl_kode": "CPL08",
    "cpmk_kode": "CPMK22",
    "sub_kode": "22.4",
    "uraian": "Mengamankan basis data"
  },
  {
    "kode_mk": "SIF902",
    "cpl_kode": "CPL08",
    "cpmk_kode": "CPMK22",
    "sub_kode": "22.5",
    "uraian": "Memrogram sistem basis data menggunakan fungsi dan trigger"
  },
  {
    "kode_mk": "SIF902",
    "cpl_kode": "CPL08",
    "cpmk_kode": "CPMK23",
    "sub_kode": "23.1",
    "uraian": "Mampu mengidentifikasi sumber data yang relevan bagi organisasi."
  },
  {
    "kode_mk": "SIF913",
    "cpl_kode": "CPL08",
    "cpmk_kode": "CPMK23",
    "sub_kode": "23.1",
    "uraian": "Mampu mengidentifikasi sumber data yang relevan bagi organisasi."
  },
  {
    "kode_mk": "SIF909",
    "cpl_kode": "CPL08",
    "cpmk_kode": "CPMK23",
    "sub_kode": "23.1",
    "uraian": "Mampu mengidentifikasi sumber data yang relevan bagi organisasi."
  },
  {
    "kode_mk": "SIF910",
    "cpl_kode": "CPL08",
    "cpmk_kode": "CPMK23",
    "sub_kode": "23.1",
    "uraian": "Mampu mengidentifikasi sumber data yang relevan bagi organisasi."
  },
  {
    "kode_mk": "SIF902",
    "cpl_kode": "CPL08",
    "cpmk_kode": "CPMK23",
    "sub_kode": "23.2",
    "uraian": "Mampu melakukan integrasi data dari berbagai sumber."
  },
  {
    "kode_mk": "SIF913",
    "cpl_kode": "CPL08",
    "cpmk_kode": "CPMK23",
    "sub_kode": "23.2",
    "uraian": "Mampu melakukan integrasi data dari berbagai sumber."
  },
  {
    "kode_mk": "SIF909",
    "cpl_kode": "CPL08",
    "cpmk_kode": "CPMK23",
    "sub_kode": "23.2",
    "uraian": "Mampu melakukan integrasi data dari berbagai sumber."
  },
  {
    "kode_mk": "SIF910",
    "cpl_kode": "CPL08",
    "cpmk_kode": "CPMK23",
    "sub_kode": "23.2",
    "uraian": "Mampu melakukan integrasi data dari berbagai sumber."
  },
  {
    "kode_mk": "SIF902",
    "cpl_kode": "CPL08",
    "cpmk_kode": "CPMK23",
    "sub_kode": "23.3",
    "uraian": "Mampu melakukan transformasi data untuk mendukung kebutuhan operasional dan pengambilan keputusan."
  },
  {
    "kode_mk": "SIF913",
    "cpl_kode": "CPL08",
    "cpmk_kode": "CPMK23",
    "sub_kode": "23.3",
    "uraian": "Mampu melakukan transformasi data untuk mendukung kebutuhan operasional dan pengambilan keputusan."
  },
  {
    "kode_mk": "SIF909",
    "cpl_kode": "CPL08",
    "cpmk_kode": "CPMK23",
    "sub_kode": "23.3",
    "uraian": "Mampu melakukan transformasi data untuk mendukung kebutuhan operasional dan pengambilan keputusan."
  },
  {
    "kode_mk": "SIF910",
    "cpl_kode": "CPL08",
    "cpmk_kode": "CPMK23",
    "sub_kode": "23.3",
    "uraian": "Mampu melakukan transformasi data untuk mendukung kebutuhan operasional dan pengambilan keputusan."
  },
  {
    "kode_mk": "SIF902",
    "cpl_kode": "CPL08",
    "cpmk_kode": "CPMK23",
    "sub_kode": "23.4",
    "uraian": "Memanfaatkan alat untuk pengujian (unit, integrasi, penerimaan)"
  },
  {
    "kode_mk": "SIF913",
    "cpl_kode": "CPL08",
    "cpmk_kode": "CPMK23",
    "sub_kode": "23.4",
    "uraian": "Memanfaatkan alat untuk pengujian (unit, integrasi, penerimaan)"
  },
  {
    "kode_mk": "SIF909",
    "cpl_kode": "CPL08",
    "cpmk_kode": "CPMK23",
    "sub_kode": "23.4",
    "uraian": "Memanfaatkan alat untuk pengujian (unit, integrasi, penerimaan)"
  },
  {
    "kode_mk": "SIF902",
    "cpl_kode": "CPL08",
    "cpmk_kode": "CPMK23",
    "sub_kode": "23.5",
    "uraian": "Melakukan query pada model relasional"
  },
  {
    "kode_mk": "SIF913",
    "cpl_kode": "CPL08",
    "cpmk_kode": "CPMK23",
    "sub_kode": "23.5",
    "uraian": "Melakukan query pada model relasional"
  },
  {
    "kode_mk": "SIF909",
    "cpl_kode": "CPL08",
    "cpmk_kode": "CPMK23",
    "sub_kode": "23.5",
    "uraian": "Melakukan query pada model relasional"
  },
  {
    "kode_mk": "SIF212",
    "cpl_kode": "CPL08",
    "cpmk_kode": "CPMK24",
    "sub_kode": "24.1",
    "uraian": "Mampu memilih teknik analisis data yang sesuai kebutuhan."
  },
  {
    "kode_mk": "FTK121",
    "cpl_kode": "CPL08",
    "cpmk_kode": "CPMK24",
    "sub_kode": "24.1",
    "uraian": "Mampu memilih teknik analisis data yang sesuai kebutuhan."
  },
  {
    "kode_mk": "FTK161",
    "cpl_kode": "CPL08",
    "cpmk_kode": "CPMK24",
    "sub_kode": "24.1",
    "uraian": "Mampu memilih teknik analisis data yang sesuai kebutuhan."
  },
  {
    "kode_mk": "SIF910",
    "cpl_kode": "CPL08",
    "cpmk_kode": "CPMK24",
    "sub_kode": "24.1",
    "uraian": "Mampu memilih teknik analisis data yang sesuai kebutuhan."
  },
  {
    "kode_mk": "SIF212",
    "cpl_kode": "CPL08",
    "cpmk_kode": "CPMK24",
    "sub_kode": "24.2",
    "uraian": "Mampu menggunakan perangkat analisis data."
  },
  {
    "kode_mk": "FTK121",
    "cpl_kode": "CPL08",
    "cpmk_kode": "CPMK24",
    "sub_kode": "24.2",
    "uraian": "Mampu menggunakan perangkat analisis data."
  },
  {
    "kode_mk": "FTK161",
    "cpl_kode": "CPL08",
    "cpmk_kode": "CPMK24",
    "sub_kode": "24.2",
    "uraian": "Mampu menggunakan perangkat analisis data."
  },
  {
    "kode_mk": "SIF910",
    "cpl_kode": "CPL08",
    "cpmk_kode": "CPMK24",
    "sub_kode": "24.2",
    "uraian": "Mampu menggunakan perangkat analisis data."
  },
  {
    "kode_mk": "SIF212",
    "cpl_kode": "CPL08",
    "cpmk_kode": "CPMK24",
    "sub_kode": "24.3",
    "uraian": "Mampu menginterpretasikan hasil analisis data menjadi informasi yang relevan."
  },
  {
    "kode_mk": "FTK121",
    "cpl_kode": "CPL08",
    "cpmk_kode": "CPMK24",
    "sub_kode": "24.3",
    "uraian": "Mampu menginterpretasikan hasil analisis data menjadi informasi yang relevan."
  },
  {
    "kode_mk": "FTK161",
    "cpl_kode": "CPL08",
    "cpmk_kode": "CPMK24",
    "sub_kode": "24.3",
    "uraian": "Mampu menginterpretasikan hasil analisis data menjadi informasi yang relevan."
  },
  {
    "kode_mk": "SIF910",
    "cpl_kode": "CPL08",
    "cpmk_kode": "CPMK24",
    "sub_kode": "24.3",
    "uraian": "Mampu menginterpretasikan hasil analisis data menjadi informasi yang relevan."
  },
  {
    "kode_mk": "SIF408",
    "cpl_kode": "CPL08",
    "cpmk_kode": "CPMK24",
    "sub_kode": "24.4",
    "uraian": "Menerapkan prinsip Berorientasi Objek dalam desain dan implementasi sistem/perangkat lunak"
  },
  {
    "kode_mk": "SIF408",
    "cpl_kode": "CPL08",
    "cpmk_kode": "CPMK24",
    "sub_kode": "24.5",
    "uraian": "Memanfaatkan alat untuk manajemen proses perangkat lunak"
  },
  {
    "kode_mk": "SIF215",
    "cpl_kode": "CPL09",
    "cpmk_kode": "CPMK25",
    "sub_kode": "25.1",
    "uraian": "Mampu menganalisis kebutuhan proses bisnis dan sasaran strategis organisasi."
  },
  {
    "kode_mk": "SIF307",
    "cpl_kode": "CPL09",
    "cpmk_kode": "CPMK25",
    "sub_kode": "25.1",
    "uraian": "Mampu menganalisis kebutuhan proses bisnis dan sasaran strategis organisasi."
  },
  {
    "kode_mk": "SIF410",
    "cpl_kode": "CPL09",
    "cpmk_kode": "CPMK25",
    "sub_kode": "25.1",
    "uraian": "Mampu menganalisis kebutuhan proses bisnis dan sasaran strategis organisasi."
  },
  {
    "kode_mk": "SIF901",
    "cpl_kode": "CPL09",
    "cpmk_kode": "CPMK25",
    "sub_kode": "25.1",
    "uraian": "Mampu menganalisis kebutuhan proses bisnis dan sasaran strategis organisasi."
  },
  {
    "kode_mk": "SIF504",
    "cpl_kode": "CPL09",
    "cpmk_kode": "CPMK25",
    "sub_kode": "25.1",
    "uraian": "Mampu menganalisis kebutuhan proses bisnis dan sasaran strategis organisasi."
  },
  {
    "kode_mk": "SIF215",
    "cpl_kode": "CPL09",
    "cpmk_kode": "CPMK25",
    "sub_kode": "25.2",
    "uraian": "Mampu menyusun perencanaan sistem informasi yang selaras dengan kebutuhan organisasi."
  },
  {
    "kode_mk": "SIF307",
    "cpl_kode": "CPL09",
    "cpmk_kode": "CPMK25",
    "sub_kode": "25.2",
    "uraian": "Mampu menyusun perencanaan sistem informasi yang selaras dengan kebutuhan organisasi."
  },
  {
    "kode_mk": "SIF410",
    "cpl_kode": "CPL09",
    "cpmk_kode": "CPMK25",
    "sub_kode": "25.2",
    "uraian": "Mampu menyusun perencanaan sistem informasi yang selaras dengan kebutuhan organisasi."
  },
  {
    "kode_mk": "SIF901",
    "cpl_kode": "CPL09",
    "cpmk_kode": "CPMK25",
    "sub_kode": "25.2",
    "uraian": "Mampu menyusun perencanaan sistem informasi yang selaras dengan kebutuhan organisasi."
  },
  {
    "kode_mk": "SIF504",
    "cpl_kode": "CPL09",
    "cpmk_kode": "CPMK25",
    "sub_kode": "25.2",
    "uraian": "Mampu menyusun perencanaan sistem informasi yang selaras dengan kebutuhan organisasi."
  },
  {
    "kode_mk": "SIF214",
    "cpl_kode": "CPL09",
    "cpmk_kode": "CPMK26",
    "sub_kode": "26.1",
    "uraian": "Mampu menganalisis kebutuhan pengguna terhadap user interface dan aplikasi interaktif."
  },
  {
    "kode_mk": "SIF409",
    "cpl_kode": "CPL09",
    "cpmk_kode": "CPMK26",
    "sub_kode": "26.1",
    "uraian": "Mampu menganalisis kebutuhan pengguna terhadap user interface dan aplikasi interaktif."
  },
  {
    "kode_mk": "SIF703",
    "cpl_kode": "CPL09",
    "cpmk_kode": "CPMK26",
    "sub_kode": "26.1",
    "uraian": "Mampu menganalisis kebutuhan pengguna terhadap user interface dan aplikasi interaktif."
  },
  {
    "kode_mk": "SIF214",
    "cpl_kode": "CPL09",
    "cpmk_kode": "CPMK26",
    "sub_kode": "26.2",
    "uraian": "Mampu mendesain user interface berdasarkan prinsip usability."
  },
  {
    "kode_mk": "SIF409",
    "cpl_kode": "CPL09",
    "cpmk_kode": "CPMK26",
    "sub_kode": "26.2",
    "uraian": "Mampu mendesain user interface berdasarkan prinsip usability."
  },
  {
    "kode_mk": "SIF703",
    "cpl_kode": "CPL09",
    "cpmk_kode": "CPMK26",
    "sub_kode": "26.2",
    "uraian": "Mampu mendesain user interface berdasarkan prinsip usability."
  },
  {
    "kode_mk": "SIF214",
    "cpl_kode": "CPL09",
    "cpmk_kode": "CPMK26",
    "sub_kode": "26.3",
    "uraian": "Mampu mendesain aplikasi interaktif dengan mempertimbangkan perkembangan ilmu transdisiplin."
  },
  {
    "kode_mk": "SIF409",
    "cpl_kode": "CPL09",
    "cpmk_kode": "CPMK26",
    "sub_kode": "26.3",
    "uraian": "Mampu mendesain aplikasi interaktif dengan mempertimbangkan perkembangan ilmu transdisiplin."
  },
  {
    "kode_mk": "SIF703",
    "cpl_kode": "CPL09",
    "cpmk_kode": "CPMK26",
    "sub_kode": "26.3",
    "uraian": "Mampu mendesain aplikasi interaktif dengan mempertimbangkan perkembangan ilmu transdisiplin."
  },
  {
    "kode_mk": "SIF214",
    "cpl_kode": "CPL09",
    "cpmk_kode": "CPMK27",
    "sub_kode": "27.1",
    "uraian": "Mampu mengimplementasikan rancangan sistem informasi ke dalam aplikasi."
  },
  {
    "kode_mk": "SIF319",
    "cpl_kode": "CPL09",
    "cpmk_kode": "CPMK27",
    "sub_kode": "27.1",
    "uraian": "Mampu mengimplementasikan rancangan sistem informasi ke dalam aplikasi."
  },
  {
    "kode_mk": "SIF408",
    "cpl_kode": "CPL09",
    "cpmk_kode": "CPMK27",
    "sub_kode": "27.1",
    "uraian": "Mampu mengimplementasikan rancangan sistem informasi ke dalam aplikasi."
  },
  {
    "kode_mk": "SIF214",
    "cpl_kode": "CPL09",
    "cpmk_kode": "CPMK27",
    "sub_kode": "27.2",
    "uraian": "Mampu menerapkan sistem informasi sesuai kebutuhan pengguna dan proses bisnis organisasi."
  },
  {
    "kode_mk": "SIF319",
    "cpl_kode": "CPL09",
    "cpmk_kode": "CPMK27",
    "sub_kode": "27.2",
    "uraian": "Mampu menerapkan sistem informasi sesuai kebutuhan pengguna dan proses bisnis organisasi."
  },
  {
    "kode_mk": "SIF407",
    "cpl_kode": "CPL09",
    "cpmk_kode": "CPMK27",
    "sub_kode": "27.2",
    "uraian": "Mampu menerapkan sistem informasi sesuai kebutuhan pengguna dan proses bisnis organisasi."
  },
  {
    "kode_mk": "SIF408",
    "cpl_kode": "CPL09",
    "cpmk_kode": "CPMK27",
    "sub_kode": "27.2",
    "uraian": "Mampu menerapkan sistem informasi sesuai kebutuhan pengguna dan proses bisnis organisasi."
  },
  {
    "kode_mk": "SIF408",
    "cpl_kode": "CPL09",
    "cpmk_kode": "CPMK27",
    "sub_kode": "27.3",
    "uraian": "Menerapkan proses pengembangan Scrum"
  },
  {
    "kode_mk": "SIF318",
    "cpl_kode": "CPL09",
    "cpmk_kode": "CPMK28",
    "sub_kode": "28.1",
    "uraian": "Mampu mengevaluasi kualitas dan keamanan sistem informasi."
  },
  {
    "kode_mk": "SIF503",
    "cpl_kode": "CPL09",
    "cpmk_kode": "CPMK28",
    "sub_kode": "28.1",
    "uraian": "Mampu mengevaluasi kualitas dan keamanan sistem informasi."
  },
  {
    "kode_mk": "SIF609",
    "cpl_kode": "CPL09",
    "cpmk_kode": "CPMK28",
    "sub_kode": "28.1",
    "uraian": "Mampu mengevaluasi kualitas dan keamanan sistem informasi."
  },
  {
    "kode_mk": "SIF907",
    "cpl_kode": "CPL09",
    "cpmk_kode": "CPMK28",
    "sub_kode": "28.1",
    "uraian": "Mampu mengevaluasi kualitas dan keamanan sistem informasi."
  },
  {
    "kode_mk": "SIF908",
    "cpl_kode": "CPL09",
    "cpmk_kode": "CPMK28",
    "sub_kode": "28.1",
    "uraian": "Mampu mengevaluasi kualitas dan keamanan sistem informasi."
  },
  {
    "kode_mk": "SIF702",
    "cpl_kode": "CPL09",
    "cpmk_kode": "CPMK28",
    "sub_kode": "28.1",
    "uraian": "Mampu mengevaluasi kualitas dan keamanan sistem informasi."
  },
  {
    "kode_mk": "SIF318",
    "cpl_kode": "CPL09",
    "cpmk_kode": "CPMK28",
    "sub_kode": "28.2",
    "uraian": "Mampu mengidentifikasi peluang peningkatan (improvement) sistem informasi."
  },
  {
    "kode_mk": "SIF407",
    "cpl_kode": "CPL09",
    "cpmk_kode": "CPMK28",
    "sub_kode": "28.2",
    "uraian": "Mampu mengidentifikasi peluang peningkatan (improvement) sistem informasi."
  },
  {
    "kode_mk": "SIF503",
    "cpl_kode": "CPL09",
    "cpmk_kode": "CPMK28",
    "sub_kode": "28.2",
    "uraian": "Mampu mengidentifikasi peluang peningkatan (improvement) sistem informasi."
  },
  {
    "kode_mk": "SIF609",
    "cpl_kode": "CPL09",
    "cpmk_kode": "CPMK28",
    "sub_kode": "28.2",
    "uraian": "Mampu mengidentifikasi peluang peningkatan (improvement) sistem informasi."
  },
  {
    "kode_mk": "SIF907",
    "cpl_kode": "CPL09",
    "cpmk_kode": "CPMK28",
    "sub_kode": "28.2",
    "uraian": "Mampu mengidentifikasi peluang peningkatan (improvement) sistem informasi."
  },
  {
    "kode_mk": "SIF908",
    "cpl_kode": "CPL09",
    "cpmk_kode": "CPMK28",
    "sub_kode": "28.2",
    "uraian": "Mampu mengidentifikasi peluang peningkatan (improvement) sistem informasi."
  },
  {
    "kode_mk": "SIF702",
    "cpl_kode": "CPL09",
    "cpmk_kode": "CPMK28",
    "sub_kode": "28.2",
    "uraian": "Mampu mengidentifikasi peluang peningkatan (improvement) sistem informasi."
  },
  {
    "kode_mk": "SIF318",
    "cpl_kode": "CPL09",
    "cpmk_kode": "CPMK28",
    "sub_kode": "28.3",
    "uraian": "Mampu melakukan peningkatan sistem informasi secara berkelanjutan."
  },
  {
    "kode_mk": "SIF407",
    "cpl_kode": "CPL09",
    "cpmk_kode": "CPMK28",
    "sub_kode": "28.3",
    "uraian": "Mampu melakukan peningkatan sistem informasi secara berkelanjutan."
  },
  {
    "kode_mk": "SIF503",
    "cpl_kode": "CPL09",
    "cpmk_kode": "CPMK28",
    "sub_kode": "28.3",
    "uraian": "Mampu melakukan peningkatan sistem informasi secara berkelanjutan."
  },
  {
    "kode_mk": "SIF609",
    "cpl_kode": "CPL09",
    "cpmk_kode": "CPMK28",
    "sub_kode": "28.3",
    "uraian": "Mampu melakukan peningkatan sistem informasi secara berkelanjutan."
  },
  {
    "kode_mk": "SIF907",
    "cpl_kode": "CPL09",
    "cpmk_kode": "CPMK28",
    "sub_kode": "28.3",
    "uraian": "Mampu melakukan peningkatan sistem informasi secara berkelanjutan."
  },
  {
    "kode_mk": "SIF908",
    "cpl_kode": "CPL09",
    "cpmk_kode": "CPMK28",
    "sub_kode": "28.3",
    "uraian": "Mampu melakukan peningkatan sistem informasi secara berkelanjutan."
  },
  {
    "kode_mk": "SIF702",
    "cpl_kode": "CPL09",
    "cpmk_kode": "CPMK28",
    "sub_kode": "28.3",
    "uraian": "Mampu melakukan peningkatan sistem informasi secara berkelanjutan."
  },
  {
    "kode_mk": "SIF318",
    "cpl_kode": "CPL09",
    "cpmk_kode": "CPMK28",
    "sub_kode": "28.4",
    "uraian": "Memanfaatkan proses kontrol perubahan untuk menjaga dan mengendalikan kualitas"
  },
  {
    "kode_mk": "SIF407",
    "cpl_kode": "CPL09",
    "cpmk_kode": "CPMK28",
    "sub_kode": "28.4",
    "uraian": "Memanfaatkan proses kontrol perubahan untuk menjaga dan mengendalikan kualitas"
  },
  {
    "kode_mk": "SIF503",
    "cpl_kode": "CPL09",
    "cpmk_kode": "CPMK28",
    "sub_kode": "28.4",
    "uraian": "Memanfaatkan proses kontrol perubahan untuk menjaga dan mengendalikan kualitas"
  },
  {
    "kode_mk": "SIF609",
    "cpl_kode": "CPL09",
    "cpmk_kode": "CPMK28",
    "sub_kode": "28.4",
    "uraian": "Memanfaatkan proses kontrol perubahan untuk menjaga dan mengendalikan kualitas"
  },
  {
    "kode_mk": "SIF907",
    "cpl_kode": "CPL09",
    "cpmk_kode": "CPMK28",
    "sub_kode": "28.4",
    "uraian": "Memanfaatkan proses kontrol perubahan untuk menjaga dan mengendalikan kualitas"
  },
  {
    "kode_mk": "SIF908",
    "cpl_kode": "CPL09",
    "cpmk_kode": "CPMK28",
    "sub_kode": "28.4",
    "uraian": "Memanfaatkan proses kontrol perubahan untuk menjaga dan mengendalikan kualitas"
  },
  {
    "kode_mk": "SIF702",
    "cpl_kode": "CPL09",
    "cpmk_kode": "CPMK28",
    "sub_kode": "28.4",
    "uraian": "Memanfaatkan proses kontrol perubahan untuk menjaga dan mengendalikan kualitas"
  },
  {
    "kode_mk": "SIF503",
    "cpl_kode": "CPL09",
    "cpmk_kode": "CPMK28",
    "sub_kode": "28.5",
    "uraian": "Menguji seluruh komponen kode program yang dikembangkan untuk memastikan keandalan, konsistensi, dan kesesuaian"
  },
  {
    "kode_mk": "SIF609",
    "cpl_kode": "CPL09",
    "cpmk_kode": "CPMK28",
    "sub_kode": "28.5",
    "uraian": "Menguji seluruh komponen kode program yang dikembangkan untuk memastikan keandalan, konsistensi, dan kesesuaian"
  },
  {
    "kode_mk": "SIF702",
    "cpl_kode": "CPL09",
    "cpmk_kode": "CPMK28",
    "sub_kode": "28.5",
    "uraian": "Menguji seluruh komponen kode program yang dikembangkan untuk memastikan keandalan, konsistensi, dan kesesuaian"
  },
  {
    "kode_mk": "SIF109",
    "cpl_kode": "CPL09",
    "cpmk_kode": "CPMK29",
    "sub_kode": "29.1",
    "uraian": "Mampu mengoperasikan sistem informasi sesuai prosedur."
  },
  {
    "kode_mk": "SIF311",
    "cpl_kode": "CPL09",
    "cpmk_kode": "CPMK29",
    "sub_kode": "29.1",
    "uraian": "Mampu mengoperasikan sistem informasi sesuai prosedur."
  },
  {
    "kode_mk": "SIF404",
    "cpl_kode": "CPL09",
    "cpmk_kode": "CPMK29",
    "sub_kode": "29.1",
    "uraian": "Mampu mengoperasikan sistem informasi sesuai prosedur."
  },
  {
    "kode_mk": "SIF901",
    "cpl_kode": "CPL09",
    "cpmk_kode": "CPMK29",
    "sub_kode": "29.1",
    "uraian": "Mampu mengoperasikan sistem informasi sesuai prosedur."
  },
  {
    "kode_mk": "SIF702",
    "cpl_kode": "CPL09",
    "cpmk_kode": "CPMK29",
    "sub_kode": "29.1",
    "uraian": "Mampu mengoperasikan sistem informasi sesuai prosedur."
  },
  {
    "kode_mk": "SIF109",
    "cpl_kode": "CPL09",
    "cpmk_kode": "CPMK29",
    "sub_kode": "29.2",
    "uraian": "Mampu melakukan pemeliharaan (maintenance) sistem informasi untuk mendukung keberlangsungan proses bisnis."
  },
  {
    "kode_mk": "SIF311",
    "cpl_kode": "CPL09",
    "cpmk_kode": "CPMK29",
    "sub_kode": "29.2",
    "uraian": "Mampu melakukan pemeliharaan (maintenance) sistem informasi untuk mendukung keberlangsungan proses bisnis."
  },
  {
    "kode_mk": "SIF318",
    "cpl_kode": "CPL09",
    "cpmk_kode": "CPMK29",
    "sub_kode": "29.2",
    "uraian": "Mampu melakukan pemeliharaan (maintenance) sistem informasi untuk mendukung keberlangsungan proses bisnis."
  },
  {
    "kode_mk": "SIF404",
    "cpl_kode": "CPL09",
    "cpmk_kode": "CPMK29",
    "sub_kode": "29.2",
    "uraian": "Mampu melakukan pemeliharaan (maintenance) sistem informasi untuk mendukung keberlangsungan proses bisnis."
  },
  {
    "kode_mk": "SIF901",
    "cpl_kode": "CPL09",
    "cpmk_kode": "CPMK29",
    "sub_kode": "29.2",
    "uraian": "Mampu melakukan pemeliharaan (maintenance) sistem informasi untuk mendukung keberlangsungan proses bisnis."
  },
  {
    "kode_mk": "SIF504",
    "cpl_kode": "CPL09",
    "cpmk_kode": "CPMK29",
    "sub_kode": "29.2",
    "uraian": "Mampu melakukan pemeliharaan (maintenance) sistem informasi untuk mendukung keberlangsungan proses bisnis."
  },
  {
    "kode_mk": "SIF702",
    "cpl_kode": "CPL09",
    "cpmk_kode": "CPMK29",
    "sub_kode": "29.2",
    "uraian": "Mampu melakukan pemeliharaan (maintenance) sistem informasi untuk mendukung keberlangsungan proses bisnis."
  },
  {
    "kode_mk": "UNI106",
    "cpl_kode": "CPL01",
    "cpmk_kode": "CPMK3",
    "sub_kode": "3.1",
    "uraian": "Mampu menjelaskan nilai-nilai ketakwaan kepada Tuhan Yang Maha Esa sesuai ajaran agama."
  },
  {
    "kode_mk": "UNI106",
    "cpl_kode": "CPL01",
    "cpmk_kode": "CPMK3",
    "sub_kode": "3.2",
    "uraian": "Mampu menunjukkan perilaku yang sesuai etika, aturan, dan norma hukum dalam kehidupan bermasyarakat."
  },
  {
    "kode_mk": "UNI106",
    "cpl_kode": "CPL01",
    "cpmk_kode": "CPMK3",
    "sub_kode": "3.3",
    "uraian": "Mampu menunjukkan tanggung jawab sosial sebagai warga negara."
  },
  {
    "kode_mk": "SIF107",
    "cpl_kode": "CPL09",
    "cpmk_kode": "CPMK30",
    "sub_kode": "30.1",
    "uraian": "Mampu mendesain solusi computing multi-platform sesuai kebutuhan organisasi."
  },
  {
    "kode_mk": "SIF214",
    "cpl_kode": "CPL09",
    "cpmk_kode": "CPMK30",
    "sub_kode": "30.1",
    "uraian": "Mampu mendesain solusi computing multi-platform sesuai kebutuhan organisasi."
  },
  {
    "kode_mk": "SIF319",
    "cpl_kode": "CPL09",
    "cpmk_kode": "CPMK30",
    "sub_kode": "30.1",
    "uraian": "Mampu mendesain solusi computing multi-platform sesuai kebutuhan organisasi."
  },
  {
    "kode_mk": "SIF408",
    "cpl_kode": "CPL09",
    "cpmk_kode": "CPMK30",
    "sub_kode": "30.1",
    "uraian": "Mampu mendesain solusi computing multi-platform sesuai kebutuhan organisasi."
  },
  {
    "kode_mk": "SIF604",
    "cpl_kode": "CPL09",
    "cpmk_kode": "CPMK30",
    "sub_kode": "30.1",
    "uraian": "Mampu mendesain solusi computing multi-platform sesuai kebutuhan organisasi."
  },
  {
    "kode_mk": "SIF214",
    "cpl_kode": "CPL09",
    "cpmk_kode": "CPMK30",
    "sub_kode": "30.2",
    "uraian": "Mampu mengimplementasikan solusi computing multi-platform."
  },
  {
    "kode_mk": "SIF319",
    "cpl_kode": "CPL09",
    "cpmk_kode": "CPMK30",
    "sub_kode": "30.2",
    "uraian": "Mampu mengimplementasikan solusi computing multi-platform."
  },
  {
    "kode_mk": "SIF408",
    "cpl_kode": "CPL09",
    "cpmk_kode": "CPMK30",
    "sub_kode": "30.2",
    "uraian": "Mampu mengimplementasikan solusi computing multi-platform."
  },
  {
    "kode_mk": "SIF604",
    "cpl_kode": "CPL09",
    "cpmk_kode": "CPMK30",
    "sub_kode": "30.2",
    "uraian": "Mampu mengimplementasikan solusi computing multi-platform."
  },
  {
    "kode_mk": "SIF106",
    "cpl_kode": "CPL10",
    "cpmk_kode": "CPMK31",
    "sub_kode": "31.1",
    "uraian": "Mampu merumuskan model bisnis digital."
  },
  {
    "kode_mk": "FTK221",
    "cpl_kode": "CPL10",
    "cpmk_kode": "CPMK31",
    "sub_kode": "31.1",
    "uraian": "Mampu merumuskan model bisnis digital."
  },
  {
    "kode_mk": "SIF608",
    "cpl_kode": "CPL10",
    "cpmk_kode": "CPMK31",
    "sub_kode": "31.1",
    "uraian": "Mampu merumuskan model bisnis digital."
  },
  {
    "kode_mk": "FTK221",
    "cpl_kode": "CPL10",
    "cpmk_kode": "CPMK31",
    "sub_kode": "31.2",
    "uraian": "Mampu melakukan validasi pasar secara sederhana."
  },
  {
    "kode_mk": "SIF608",
    "cpl_kode": "CPL10",
    "cpmk_kode": "CPMK31",
    "sub_kode": "31.2",
    "uraian": "Mampu melakukan validasi pasar secara sederhana."
  },
  {
    "kode_mk": "SIF106",
    "cpl_kode": "CPL10",
    "cpmk_kode": "CPMK31",
    "sub_kode": "31.3",
    "uraian": "Mampu merancang strategi pemasaran digital dan proses operasional digital."
  },
  {
    "kode_mk": "FTK221",
    "cpl_kode": "CPL10",
    "cpmk_kode": "CPMK31",
    "sub_kode": "31.3",
    "uraian": "Mampu merancang strategi pemasaran digital dan proses operasional digital."
  },
  {
    "kode_mk": "SIF608",
    "cpl_kode": "CPL10",
    "cpmk_kode": "CPMK31",
    "sub_kode": "31.3",
    "uraian": "Mampu merancang strategi pemasaran digital dan proses operasional digital."
  },
  {
    "kode_mk": "SIF106",
    "cpl_kode": "CPL10",
    "cpmk_kode": "CPMK31",
    "sub_kode": "31.4",
    "uraian": "Mengidentifikasi dan menghimpun sumber daya, proses, dan mitra yang diperlukan untuk mewujudkan model bisnis digital"
  },
  {
    "kode_mk": "SIF410",
    "cpl_kode": "CPL10",
    "cpmk_kode": "CPMK31",
    "sub_kode": "31.4",
    "uraian": "Mengidentifikasi dan menghimpun sumber daya, proses, dan mitra yang diperlukan untuk mewujudkan model bisnis digital"
  },
  {
    "kode_mk": "FTK221",
    "cpl_kode": "CPL10",
    "cpmk_kode": "CPMK31",
    "sub_kode": "31.4",
    "uraian": "Mengidentifikasi dan menghimpun sumber daya, proses, dan mitra yang diperlukan untuk mewujudkan model bisnis digital"
  },
  {
    "kode_mk": "SIF608",
    "cpl_kode": "CPL10",
    "cpmk_kode": "CPMK31",
    "sub_kode": "31.4",
    "uraian": "Mengidentifikasi dan menghimpun sumber daya, proses, dan mitra yang diperlukan untuk mewujudkan model bisnis digital"
  },
  {
    "kode_mk": "SIF410",
    "cpl_kode": "CPL10",
    "cpmk_kode": "CPMK31",
    "sub_kode": "31.5",
    "uraian": "Menggunakan alat BPM untuk merancang dan menerapkan model proses bisnis"
  },
  {
    "kode_mk": "SIF505",
    "cpl_kode": "CPL10",
    "cpmk_kode": "CPMK32",
    "sub_kode": "32.1",
    "uraian": "Mampu mengidentifikasi permasalahan dalam pengelolaan proyek teknologi."
  },
  {
    "kode_mk": "SIF505",
    "cpl_kode": "CPL10",
    "cpmk_kode": "CPMK32",
    "sub_kode": "32.2",
    "uraian": "Mampu merumuskan solusi yang efektif dan efisien untuk pengelolaan proyek teknologi."
  },
  {
    "kode_mk": "SIF504",
    "cpl_kode": "CPL10",
    "cpmk_kode": "CPMK33",
    "sub_kode": "33.1",
    "uraian": "Mampu menganalisis kebutuhan computing sesuai konteks pengguna, organisasi, atau bisnis."
  },
  {
    "kode_mk": "SIF610",
    "cpl_kode": "CPL10",
    "cpmk_kode": "CPMK33",
    "sub_kode": "33.1",
    "uraian": "Mampu menganalisis kebutuhan computing sesuai konteks pengguna, organisasi, atau bisnis."
  },
  {
    "kode_mk": "SIF703",
    "cpl_kode": "CPL10",
    "cpmk_kode": "CPMK33",
    "sub_kode": "33.1",
    "uraian": "Mampu menganalisis kebutuhan computing sesuai konteks pengguna, organisasi, atau bisnis."
  },
  {
    "kode_mk": "SIF504",
    "cpl_kode": "CPL10",
    "cpmk_kode": "CPMK33",
    "sub_kode": "33.2",
    "uraian": "Memeriksa dan mengkritisi infrastruktur TI untuk organisasi"
  },
  {
    "kode_mk": "FTK221",
    "cpl_kode": "CPL10",
    "cpmk_kode": "CPMK34",
    "sub_kode": "34.1",
    "uraian": "Mampu merancang user interface untuk solusi e-business."
  },
  {
    "kode_mk": "SIF703",
    "cpl_kode": "CPL10",
    "cpmk_kode": "CPMK34",
    "sub_kode": "34.1",
    "uraian": "Mampu merancang user interface untuk solusi e-business."
  },
  {
    "kode_mk": "SIF319",
    "cpl_kode": "CPL10",
    "cpmk_kode": "CPMK34",
    "sub_kode": "34.2",
    "uraian": "Mampu membangun aplikasi interaktif sebagai solusi e-business sesuai kebutuhan pengguna."
  },
  {
    "kode_mk": "FTK221",
    "cpl_kode": "CPL10",
    "cpmk_kode": "CPMK34",
    "sub_kode": "34.2",
    "uraian": "Mampu membangun aplikasi interaktif sebagai solusi e-business sesuai kebutuhan pengguna."
  },
  {
    "kode_mk": "SIF604",
    "cpl_kode": "CPL10",
    "cpmk_kode": "CPMK34",
    "sub_kode": "34.3",
    "uraian": "Memeriksa dan mengkritisi arsitektur server TI (baik fisik maupun berbasis cloud)"
  },
  {
    "kode_mk": "UNI104",
    "cpl_kode": "CPL02",
    "cpmk_kode": "CPMK4",
    "sub_kode": "4.1",
    "uraian": "Mampu menjelaskan konsep integritas, kejujuran, tanggung jawab, dan etika."
  },
  {
    "kode_mk": "UNI204",
    "cpl_kode": "CPL02",
    "cpmk_kode": "CPMK4",
    "sub_kode": "4.1",
    "uraian": "Mampu menjelaskan konsep integritas, kejujuran, tanggung jawab, dan etika."
  },
  {
    "kode_mk": "UNI101",
    "cpl_kode": "CPL02",
    "cpmk_kode": "CPMK4",
    "sub_kode": "4.1",
    "uraian": "Mampu menjelaskan konsep integritas, kejujuran, tanggung jawab, dan etika."
  },
  {
    "kode_mk": "SIF802",
    "cpl_kode": "CPL02",
    "cpmk_kode": "CPMK4",
    "sub_kode": "4.1",
    "uraian": "Mampu menjelaskan konsep integritas, kejujuran, tanggung jawab, dan etika."
  },
  {
    "kode_mk": "UNI104",
    "cpl_kode": "CPL02",
    "cpmk_kode": "CPMK4",
    "sub_kode": "4.2",
    "uraian": "Mampu menerapkan nilai integritas dan kejujuran dalam kehidupan akademik."
  },
  {
    "kode_mk": "UNI204",
    "cpl_kode": "CPL02",
    "cpmk_kode": "CPMK4",
    "sub_kode": "4.2",
    "uraian": "Mampu menerapkan nilai integritas dan kejujuran dalam kehidupan akademik."
  },
  {
    "kode_mk": "UNI101",
    "cpl_kode": "CPL02",
    "cpmk_kode": "CPMK4",
    "sub_kode": "4.2",
    "uraian": "Mampu menerapkan nilai integritas dan kejujuran dalam kehidupan akademik."
  },
  {
    "kode_mk": "SIF802",
    "cpl_kode": "CPL02",
    "cpmk_kode": "CPMK4",
    "sub_kode": "4.2",
    "uraian": "Mampu menerapkan nilai integritas dan kejujuran dalam kehidupan akademik."
  },
  {
    "kode_mk": "UNI104",
    "cpl_kode": "CPL02",
    "cpmk_kode": "CPMK4",
    "sub_kode": "4.3",
    "uraian": "Mampu menerapkan nilai tanggung jawab dan etika dalam kehidupan profesional dan sosial."
  },
  {
    "kode_mk": "UNI204",
    "cpl_kode": "CPL02",
    "cpmk_kode": "CPMK4",
    "sub_kode": "4.3",
    "uraian": "Mampu menerapkan nilai tanggung jawab dan etika dalam kehidupan profesional dan sosial."
  },
  {
    "kode_mk": "UNI101",
    "cpl_kode": "CPL02",
    "cpmk_kode": "CPMK4",
    "sub_kode": "4.3",
    "uraian": "Mampu menerapkan nilai tanggung jawab dan etika dalam kehidupan profesional dan sosial."
  },
  {
    "kode_mk": "SIF802",
    "cpl_kode": "CPL02",
    "cpmk_kode": "CPMK4",
    "sub_kode": "4.3",
    "uraian": "Mampu menerapkan nilai tanggung jawab dan etika dalam kehidupan profesional dan sosial."
  },
  {
    "kode_mk": "SIF505",
    "cpl_kode": "CPL02",
    "cpmk_kode": "CPMK5",
    "sub_kode": "5.1",
    "uraian": "Mampu menjelaskan kode etik dan etika profesi bidang sistem informasi."
  },
  {
    "kode_mk": "SIF609",
    "cpl_kode": "CPL02",
    "cpmk_kode": "CPMK5",
    "sub_kode": "5.1",
    "uraian": "Mampu menjelaskan kode etik dan etika profesi bidang sistem informasi."
  },
  {
    "kode_mk": "SIF907",
    "cpl_kode": "CPL02",
    "cpmk_kode": "CPMK5",
    "sub_kode": "5.1",
    "uraian": "Mampu menjelaskan kode etik dan etika profesi bidang sistem informasi."
  },
  {
    "kode_mk": "SIF801",
    "cpl_kode": "CPL02",
    "cpmk_kode": "CPMK5",
    "sub_kode": "5.1",
    "uraian": "Mampu menjelaskan kode etik dan etika profesi bidang sistem informasi."
  },
  {
    "kode_mk": "SIF505",
    "cpl_kode": "CPL02",
    "cpmk_kode": "CPMK5",
    "sub_kode": "5.2",
    "uraian": "Mampu menunjukkan sikap profesional dalam pelaksanaan tugas."
  },
  {
    "kode_mk": "SIF609",
    "cpl_kode": "CPL02",
    "cpmk_kode": "CPMK5",
    "sub_kode": "5.2",
    "uraian": "Mampu menunjukkan sikap profesional dalam pelaksanaan tugas."
  },
  {
    "kode_mk": "SIF801",
    "cpl_kode": "CPL02",
    "cpmk_kode": "CPMK5",
    "sub_kode": "5.2",
    "uraian": "Mampu menunjukkan sikap profesional dalam pelaksanaan tugas."
  },
  {
    "kode_mk": "SIF505",
    "cpl_kode": "CPL02",
    "cpmk_kode": "CPMK5",
    "sub_kode": "5.3",
    "uraian": "Mampu mematuhi etika profesi dalam pengambilan keputusan."
  },
  {
    "kode_mk": "SIF609",
    "cpl_kode": "CPL02",
    "cpmk_kode": "CPMK5",
    "sub_kode": "5.3",
    "uraian": "Mampu mematuhi etika profesi dalam pengambilan keputusan."
  },
  {
    "kode_mk": "SIF907",
    "cpl_kode": "CPL02",
    "cpmk_kode": "CPMK5",
    "sub_kode": "5.3",
    "uraian": "Mampu mematuhi etika profesi dalam pengambilan keputusan."
  },
  {
    "kode_mk": "SIF801",
    "cpl_kode": "CPL02",
    "cpmk_kode": "CPMK5",
    "sub_kode": "5.3",
    "uraian": "Mampu mematuhi etika profesi dalam pengambilan keputusan."
  },
  {
    "kode_mk": "SIF101",
    "cpl_kode": "CPL03",
    "cpmk_kode": "CPMK6",
    "sub_kode": "6.1",
    "uraian": "Mampu menjelaskan konsep dasar komputasi."
  },
  {
    "kode_mk": "SIF107",
    "cpl_kode": "CPL03",
    "cpmk_kode": "CPMK6",
    "sub_kode": "6.1",
    "uraian": "Mampu menjelaskan konsep dasar komputasi."
  },
  {
    "kode_mk": "SIF109",
    "cpl_kode": "CPL03",
    "cpmk_kode": "CPMK6",
    "sub_kode": "6.1",
    "uraian": "Mampu menjelaskan konsep dasar komputasi."
  },
  {
    "kode_mk": "SIF215",
    "cpl_kode": "CPL03",
    "cpmk_kode": "CPMK6",
    "sub_kode": "6.1",
    "uraian": "Mampu menjelaskan konsep dasar komputasi."
  },
  {
    "kode_mk": "SIF307",
    "cpl_kode": "CPL03",
    "cpmk_kode": "CPMK6",
    "sub_kode": "6.1",
    "uraian": "Mampu menjelaskan konsep dasar komputasi."
  },
  {
    "kode_mk": "SIF311",
    "cpl_kode": "CPL03",
    "cpmk_kode": "CPMK6",
    "sub_kode": "6.1",
    "uraian": "Mampu menjelaskan konsep dasar komputasi."
  },
  {
    "kode_mk": "SIF101",
    "cpl_kode": "CPL03",
    "cpmk_kode": "CPMK6",
    "sub_kode": "6.2",
    "uraian": "Mampu menjelaskan cara kerja sistem komputer."
  },
  {
    "kode_mk": "SIF107",
    "cpl_kode": "CPL03",
    "cpmk_kode": "CPMK6",
    "sub_kode": "6.2",
    "uraian": "Mampu menjelaskan cara kerja sistem komputer."
  },
  {
    "kode_mk": "SIF109",
    "cpl_kode": "CPL03",
    "cpmk_kode": "CPMK6",
    "sub_kode": "6.2",
    "uraian": "Mampu menjelaskan cara kerja sistem komputer."
  },
  {
    "kode_mk": "SIF215",
    "cpl_kode": "CPL03",
    "cpmk_kode": "CPMK6",
    "sub_kode": "6.2",
    "uraian": "Mampu menjelaskan cara kerja sistem komputer."
  },
  {
    "kode_mk": "SIF307",
    "cpl_kode": "CPL03",
    "cpmk_kode": "CPMK6",
    "sub_kode": "6.2",
    "uraian": "Mampu menjelaskan cara kerja sistem komputer."
  },
  {
    "kode_mk": "SIF311",
    "cpl_kode": "CPL03",
    "cpmk_kode": "CPMK6",
    "sub_kode": "6.2",
    "uraian": "Mampu menjelaskan cara kerja sistem komputer."
  },
  {
    "kode_mk": "SIF101",
    "cpl_kode": "CPL03",
    "cpmk_kode": "CPMK6",
    "sub_kode": "6.3",
    "uraian": "Mampu menjelaskan peran sistem informasi dalam konteks organisasi."
  },
  {
    "kode_mk": "SIF109",
    "cpl_kode": "CPL03",
    "cpmk_kode": "CPMK6",
    "sub_kode": "6.3",
    "uraian": "Mampu menjelaskan peran sistem informasi dalam konteks organisasi."
  },
  {
    "kode_mk": "SIF215",
    "cpl_kode": "CPL03",
    "cpmk_kode": "CPMK6",
    "sub_kode": "6.3",
    "uraian": "Mampu menjelaskan peran sistem informasi dalam konteks organisasi."
  },
  {
    "kode_mk": "SIF307",
    "cpl_kode": "CPL03",
    "cpmk_kode": "CPMK6",
    "sub_kode": "6.3",
    "uraian": "Mampu menjelaskan peran sistem informasi dalam konteks organisasi."
  },
  {
    "kode_mk": "SIF311",
    "cpl_kode": "CPL03",
    "cpmk_kode": "CPMK6",
    "sub_kode": "6.3",
    "uraian": "Mampu menjelaskan peran sistem informasi dalam konteks organisasi."
  },
  {
    "kode_mk": "SIF107",
    "cpl_kode": "CPL03",
    "cpmk_kode": "CPMK6",
    "sub_kode": "7.1",
    "uraian": "Mampu menganalisis permasalahan organisasi dalam domain computing."
  },
  {
    "kode_mk": "SIF202",
    "cpl_kode": "CPL03",
    "cpmk_kode": "CPMK7",
    "sub_kode": "7.1",
    "uraian": "Mampu menganalisis permasalahan organisasi dalam domain computing."
  },
  {
    "kode_mk": "SIF212",
    "cpl_kode": "CPL03",
    "cpmk_kode": "CPMK7",
    "sub_kode": "7.1",
    "uraian": "Mampu menganalisis permasalahan organisasi dalam domain computing."
  },
  {
    "kode_mk": "FTK121",
    "cpl_kode": "CPL03",
    "cpmk_kode": "CPMK7",
    "sub_kode": "7.1",
    "uraian": "Mampu menganalisis permasalahan organisasi dalam domain computing."
  },
  {
    "kode_mk": "FTK161",
    "cpl_kode": "CPL03",
    "cpmk_kode": "CPMK7",
    "sub_kode": "7.1",
    "uraian": "Mampu menganalisis permasalahan organisasi dalam domain computing."
  },
  {
    "kode_mk": "SIF913",
    "cpl_kode": "CPL03",
    "cpmk_kode": "CPMK7",
    "sub_kode": "7.1",
    "uraian": "Mampu menganalisis permasalahan organisasi dalam domain computing."
  },
  {
    "kode_mk": "SIF910",
    "cpl_kode": "CPL03",
    "cpmk_kode": "CPMK7",
    "sub_kode": "7.1",
    "uraian": "Mampu menganalisis permasalahan organisasi dalam domain computing."
  },
  {
    "kode_mk": "SIF107",
    "cpl_kode": "CPL03",
    "cpmk_kode": "CPMK7",
    "sub_kode": "7.2",
    "uraian": "Mampu memilih metode atau algoritma yang sesuai untuk pemecahan masalah."
  },
  {
    "kode_mk": "SIF202",
    "cpl_kode": "CPL03",
    "cpmk_kode": "CPMK7",
    "sub_kode": "7.2",
    "uraian": "Mampu memilih metode atau algoritma yang sesuai untuk pemecahan masalah."
  },
  {
    "kode_mk": "SIF212",
    "cpl_kode": "CPL03",
    "cpmk_kode": "CPMK7",
    "sub_kode": "7.2",
    "uraian": "Mampu memilih metode atau algoritma yang sesuai untuk pemecahan masalah."
  },
  {
    "kode_mk": "FTK121",
    "cpl_kode": "CPL03",
    "cpmk_kode": "CPMK7",
    "sub_kode": "7.2",
    "uraian": "Mampu memilih metode atau algoritma yang sesuai untuk pemecahan masalah."
  },
  {
    "kode_mk": "FTK161",
    "cpl_kode": "CPL03",
    "cpmk_kode": "CPMK7",
    "sub_kode": "7.2",
    "uraian": "Mampu memilih metode atau algoritma yang sesuai untuk pemecahan masalah."
  },
  {
    "kode_mk": "SIF913",
    "cpl_kode": "CPL03",
    "cpmk_kode": "CPMK7",
    "sub_kode": "7.2",
    "uraian": "Mampu memilih metode atau algoritma yang sesuai untuk pemecahan masalah."
  },
  {
    "kode_mk": "SIF910",
    "cpl_kode": "CPL03",
    "cpmk_kode": "CPMK7",
    "sub_kode": "7.2",
    "uraian": "Mampu memilih metode atau algoritma yang sesuai untuk pemecahan masalah."
  },
  {
    "kode_mk": "SIF107",
    "cpl_kode": "CPL03",
    "cpmk_kode": "CPMK7",
    "sub_kode": "7.3",
    "uraian": "Mampu menerapkan metode/algoritma untuk memecahkan masalah organisasi berdasarkan perspektif sistem informasi."
  },
  {
    "kode_mk": "SIF202",
    "cpl_kode": "CPL03",
    "cpmk_kode": "CPMK7",
    "sub_kode": "7.3",
    "uraian": "Mampu menerapkan metode/algoritma untuk memecahkan masalah organisasi berdasarkan perspektif sistem informasi."
  },
  {
    "kode_mk": "FTK121",
    "cpl_kode": "CPL03",
    "cpmk_kode": "CPMK7",
    "sub_kode": "7.3",
    "uraian": "Mampu menerapkan metode/algoritma untuk memecahkan masalah organisasi berdasarkan perspektif sistem informasi."
  },
  {
    "kode_mk": "FTK161",
    "cpl_kode": "CPL03",
    "cpmk_kode": "CPMK7",
    "sub_kode": "7.3",
    "uraian": "Mampu menerapkan metode/algoritma untuk memecahkan masalah organisasi berdasarkan perspektif sistem informasi."
  },
  {
    "kode_mk": "SIF405",
    "cpl_kode": "CPL03",
    "cpmk_kode": "CPMK7",
    "sub_kode": "7.3",
    "uraian": "Mampu menerapkan metode/algoritma untuk memecahkan masalah organisasi berdasarkan perspektif sistem informasi."
  },
  {
    "kode_mk": "SIF913",
    "cpl_kode": "CPL03",
    "cpmk_kode": "CPMK7",
    "sub_kode": "7.3",
    "uraian": "Mampu menerapkan metode/algoritma untuk memecahkan masalah organisasi berdasarkan perspektif sistem informasi."
  },
  {
    "kode_mk": "SIF910",
    "cpl_kode": "CPL03",
    "cpmk_kode": "CPMK7",
    "sub_kode": "7.3",
    "uraian": "Mampu menerapkan metode/algoritma untuk memecahkan masalah organisasi berdasarkan perspektif sistem informasi."
  },
  {
    "kode_mk": "SIF202",
    "cpl_kode": "CPL03",
    "cpmk_kode": "CPMK7",
    "sub_kode": "7.4",
    "uraian": "Menganalisis studi kasus bisnis dan mengkritisi solusi SI yang sesuai untuk masalah bisnis umum, berdasarkan komponen, elemen, jenis, dan tingkatan SI yang berbeda"
  },
  {
    "kode_mk": "SIF212",
    "cpl_kode": "CPL03",
    "cpmk_kode": "CPMK7",
    "sub_kode": "7.4",
    "uraian": "Menganalisis studi kasus bisnis dan mengkritisi solusi SI yang sesuai untuk masalah bisnis umum, berdasarkan komponen, elemen, jenis, dan tingkatan SI yang berbeda"
  },
  {
    "kode_mk": "SIF215",
    "cpl_kode": "CPL03",
    "cpmk_kode": "CPMK7",
    "sub_kode": "7.4",
    "uraian": "Menganalisis studi kasus bisnis dan mengkritisi solusi SI yang sesuai untuk masalah bisnis umum, berdasarkan komponen, elemen, jenis, dan tingkatan SI yang berbeda"
  },
  {
    "kode_mk": "FTK121",
    "cpl_kode": "CPL03",
    "cpmk_kode": "CPMK7",
    "sub_kode": "7.4",
    "uraian": "Menganalisis studi kasus bisnis dan mengkritisi solusi SI yang sesuai untuk masalah bisnis umum, berdasarkan komponen, elemen, jenis, dan tingkatan SI yang berbeda"
  },
  {
    "kode_mk": "FTK161",
    "cpl_kode": "CPL03",
    "cpmk_kode": "CPMK7",
    "sub_kode": "7.4",
    "uraian": "Menganalisis studi kasus bisnis dan mengkritisi solusi SI yang sesuai untuk masalah bisnis umum, berdasarkan komponen, elemen, jenis, dan tingkatan SI yang berbeda"
  },
  {
    "kode_mk": "SIF405",
    "cpl_kode": "CPL03",
    "cpmk_kode": "CPMK7",
    "sub_kode": "7.4",
    "uraian": "Menganalisis studi kasus bisnis dan mengkritisi solusi SI yang sesuai untuk masalah bisnis umum, berdasarkan komponen, elemen, jenis, dan tingkatan SI yang berbeda"
  },
  {
    "kode_mk": "SIF913",
    "cpl_kode": "CPL03",
    "cpmk_kode": "CPMK7",
    "sub_kode": "7.4",
    "uraian": "Menganalisis studi kasus bisnis dan mengkritisi solusi SI yang sesuai untuk masalah bisnis umum, berdasarkan komponen, elemen, jenis, dan tingkatan SI yang berbeda"
  },
  {
    "kode_mk": "SIF108",
    "cpl_kode": "CPL03",
    "cpmk_kode": "CPMK8",
    "sub_kode": "8.1",
    "uraian": "Mampu menjelaskan siklus pengelolaan data menjadi informasi dan pengetahuan."
  },
  {
    "kode_mk": "SIF212",
    "cpl_kode": "CPL03",
    "cpmk_kode": "CPMK8",
    "sub_kode": "8.1",
    "uraian": "Mampu menjelaskan siklus pengelolaan data menjadi informasi dan pengetahuan."
  },
  {
    "kode_mk": "FTK161",
    "cpl_kode": "CPL03",
    "cpmk_kode": "CPMK8",
    "sub_kode": "8.1",
    "uraian": "Mampu menjelaskan siklus pengelolaan data menjadi informasi dan pengetahuan."
  },
  {
    "kode_mk": "SIF307",
    "cpl_kode": "CPL03",
    "cpmk_kode": "CPMK8",
    "sub_kode": "8.1",
    "uraian": "Mampu menjelaskan siklus pengelolaan data menjadi informasi dan pengetahuan."
  },
  {
    "kode_mk": "SIF317",
    "cpl_kode": "CPL03",
    "cpmk_kode": "CPMK8",
    "sub_kode": "8.1",
    "uraian": "Mampu menjelaskan siklus pengelolaan data menjadi informasi dan pengetahuan."
  },
  {
    "kode_mk": "SIF405",
    "cpl_kode": "CPL03",
    "cpmk_kode": "CPMK8",
    "sub_kode": "8.1",
    "uraian": "Mampu menjelaskan siklus pengelolaan data menjadi informasi dan pengetahuan."
  },
  {
    "kode_mk": "SIF913",
    "cpl_kode": "CPL03",
    "cpmk_kode": "CPMK8",
    "sub_kode": "8.1",
    "uraian": "Mampu menjelaskan siklus pengelolaan data menjadi informasi dan pengetahuan."
  },
  {
    "kode_mk": "SIF909",
    "cpl_kode": "CPL03",
    "cpmk_kode": "CPMK8",
    "sub_kode": "8.1",
    "uraian": "Mampu menjelaskan siklus pengelolaan data menjadi informasi dan pengetahuan."
  },
  {
    "kode_mk": "SIF910",
    "cpl_kode": "CPL03",
    "cpmk_kode": "CPMK8",
    "sub_kode": "8.1",
    "uraian": "Mampu menjelaskan siklus pengelolaan data menjadi informasi dan pengetahuan."
  },
  {
    "kode_mk": "SIF108",
    "cpl_kode": "CPL03",
    "cpmk_kode": "CPMK8",
    "sub_kode": "8.2",
    "uraian": "Mampu menganalisis kebutuhan informasi untuk pengambilan keputusan."
  },
  {
    "kode_mk": "SIF212",
    "cpl_kode": "CPL03",
    "cpmk_kode": "CPMK8",
    "sub_kode": "8.2",
    "uraian": "Mampu menganalisis kebutuhan informasi untuk pengambilan keputusan."
  },
  {
    "kode_mk": "FTK161",
    "cpl_kode": "CPL03",
    "cpmk_kode": "CPMK8",
    "sub_kode": "8.2",
    "uraian": "Mampu menganalisis kebutuhan informasi untuk pengambilan keputusan."
  },
  {
    "kode_mk": "SIF307",
    "cpl_kode": "CPL03",
    "cpmk_kode": "CPMK8",
    "sub_kode": "8.2",
    "uraian": "Mampu menganalisis kebutuhan informasi untuk pengambilan keputusan."
  },
  {
    "kode_mk": "SIF317",
    "cpl_kode": "CPL03",
    "cpmk_kode": "CPMK8",
    "sub_kode": "8.2",
    "uraian": "Mampu menganalisis kebutuhan informasi untuk pengambilan keputusan."
  },
  {
    "kode_mk": "SIF405",
    "cpl_kode": "CPL03",
    "cpmk_kode": "CPMK8",
    "sub_kode": "8.2",
    "uraian": "Mampu menganalisis kebutuhan informasi untuk pengambilan keputusan."
  },
  {
    "kode_mk": "SIF913",
    "cpl_kode": "CPL03",
    "cpmk_kode": "CPMK8",
    "sub_kode": "8.2",
    "uraian": "Mampu menganalisis kebutuhan informasi untuk pengambilan keputusan."
  },
  {
    "kode_mk": "SIF909",
    "cpl_kode": "CPL03",
    "cpmk_kode": "CPMK8",
    "sub_kode": "8.2",
    "uraian": "Mampu menganalisis kebutuhan informasi untuk pengambilan keputusan."
  },
  {
    "kode_mk": "SIF910",
    "cpl_kode": "CPL03",
    "cpmk_kode": "CPMK8",
    "sub_kode": "8.2",
    "uraian": "Mampu menganalisis kebutuhan informasi untuk pengambilan keputusan."
  },
  {
    "kode_mk": "SIF108",
    "cpl_kode": "CPL03",
    "cpmk_kode": "CPMK8",
    "sub_kode": "8.3",
    "uraian": "Mampu menyusun argumentasi rekomendasi keputusan berbasis sistem informasi."
  },
  {
    "kode_mk": "SIF212",
    "cpl_kode": "CPL03",
    "cpmk_kode": "CPMK8",
    "sub_kode": "8.3",
    "uraian": "Mampu menyusun argumentasi rekomendasi keputusan berbasis sistem informasi."
  },
  {
    "kode_mk": "FTK161",
    "cpl_kode": "CPL03",
    "cpmk_kode": "CPMK8",
    "sub_kode": "8.3",
    "uraian": "Mampu menyusun argumentasi rekomendasi keputusan berbasis sistem informasi."
  },
  {
    "kode_mk": "SIF307",
    "cpl_kode": "CPL03",
    "cpmk_kode": "CPMK8",
    "sub_kode": "8.3",
    "uraian": "Mampu menyusun argumentasi rekomendasi keputusan berbasis sistem informasi."
  },
  {
    "kode_mk": "SIF317",
    "cpl_kode": "CPL03",
    "cpmk_kode": "CPMK8",
    "sub_kode": "8.3",
    "uraian": "Mampu menyusun argumentasi rekomendasi keputusan berbasis sistem informasi."
  },
  {
    "kode_mk": "SIF405",
    "cpl_kode": "CPL03",
    "cpmk_kode": "CPMK8",
    "sub_kode": "8.3",
    "uraian": "Mampu menyusun argumentasi rekomendasi keputusan berbasis sistem informasi."
  },
  {
    "kode_mk": "SIF913",
    "cpl_kode": "CPL03",
    "cpmk_kode": "CPMK8",
    "sub_kode": "8.3",
    "uraian": "Mampu menyusun argumentasi rekomendasi keputusan berbasis sistem informasi."
  },
  {
    "kode_mk": "SIF909",
    "cpl_kode": "CPL03",
    "cpmk_kode": "CPMK8",
    "sub_kode": "8.3",
    "uraian": "Mampu menyusun argumentasi rekomendasi keputusan berbasis sistem informasi."
  },
  {
    "kode_mk": "SIF910",
    "cpl_kode": "CPL03",
    "cpmk_kode": "CPMK8",
    "sub_kode": "8.3",
    "uraian": "Mampu menyusun argumentasi rekomendasi keputusan berbasis sistem informasi."
  },
  {
    "kode_mk": "SIF212",
    "cpl_kode": "CPL03",
    "cpmk_kode": "CPMK8",
    "sub_kode": "8.4",
    "uraian": "Merekomendasikan teknik penggunaan informasi dan pengetahuan untuk pengambilan keputusan bisnis dan nilai strategis"
  },
  {
    "kode_mk": "FTK161",
    "cpl_kode": "CPL03",
    "cpmk_kode": "CPMK8",
    "sub_kode": "8.4",
    "uraian": "Merekomendasikan teknik penggunaan informasi dan pengetahuan untuk pengambilan keputusan bisnis dan nilai strategis"
  },
  {
    "kode_mk": "SIF307",
    "cpl_kode": "CPL03",
    "cpmk_kode": "CPMK8",
    "sub_kode": "8.4",
    "uraian": "Merekomendasikan teknik penggunaan informasi dan pengetahuan untuk pengambilan keputusan bisnis dan nilai strategis"
  },
  {
    "kode_mk": "SIF317",
    "cpl_kode": "CPL03",
    "cpmk_kode": "CPMK8",
    "sub_kode": "8.4",
    "uraian": "Merekomendasikan teknik penggunaan informasi dan pengetahuan untuk pengambilan keputusan bisnis dan nilai strategis"
  },
  {
    "kode_mk": "SIF405",
    "cpl_kode": "CPL03",
    "cpmk_kode": "CPMK8",
    "sub_kode": "8.4",
    "uraian": "Merekomendasikan teknik penggunaan informasi dan pengetahuan untuk pengambilan keputusan bisnis dan nilai strategis"
  },
  {
    "kode_mk": "SIF913",
    "cpl_kode": "CPL03",
    "cpmk_kode": "CPMK8",
    "sub_kode": "8.4",
    "uraian": "Merekomendasikan teknik penggunaan informasi dan pengetahuan untuk pengambilan keputusan bisnis dan nilai strategis"
  },
  {
    "kode_mk": "SIF909",
    "cpl_kode": "CPL03",
    "cpmk_kode": "CPMK8",
    "sub_kode": "8.4",
    "uraian": "Merekomendasikan teknik penggunaan informasi dan pengetahuan untuk pengambilan keputusan bisnis dan nilai strategis"
  },
  {
    "kode_mk": "SIF910",
    "cpl_kode": "CPL03",
    "cpmk_kode": "CPMK8",
    "sub_kode": "8.4",
    "uraian": "Merekomendasikan teknik penggunaan informasi dan pengetahuan untuk pengambilan keputusan bisnis dan nilai strategis"
  },
  {
    "kode_mk": "SIF214",
    "cpl_kode": "CPL03",
    "cpmk_kode": "CPMK9",
    "sub_kode": "9.1",
    "uraian": "Mampu menjelaskan konsep teoretis bidang Sistem Informasi."
  },
  {
    "kode_mk": "SIF307",
    "cpl_kode": "CPL03",
    "cpmk_kode": "CPMK9",
    "sub_kode": "9.1",
    "uraian": "Mampu menjelaskan konsep teoretis bidang Sistem Informasi."
  },
  {
    "kode_mk": "SIF214",
    "cpl_kode": "CPL03",
    "cpmk_kode": "CPMK9",
    "sub_kode": "9.2",
    "uraian": "Mampu merancang dan mensimulasikan aplikasi teknologi multi-platform."
  },
  {
    "kode_mk": "SIF319",
    "cpl_kode": "CPL03",
    "cpmk_kode": "CPMK9",
    "sub_kode": "9.2",
    "uraian": "Mampu merancang dan mensimulasikan aplikasi teknologi multi-platform."
  },
  {
    "kode_mk": "SIF214",
    "cpl_kode": "CPL03",
    "cpmk_kode": "CPMK9",
    "sub_kode": "9.3",
    "uraian": "Mampu mengembangkan aplikasi teknologi multi-platform sesuai kebutuhan industri dan masyarakat."
  },
  {
    "kode_mk": "SIF319",
    "cpl_kode": "CPL03",
    "cpmk_kode": "CPMK9",
    "sub_kode": "9.3",
    "uraian": "Mampu mengembangkan aplikasi teknologi multi-platform sesuai kebutuhan industri dan masyarakat."
  },
  {
    "kode_mk": "SIF408",
    "cpl_kode": "CPL03",
    "cpmk_kode": "CPMK9",
    "sub_kode": "9.3",
    "uraian": "Mampu mengembangkan aplikasi teknologi multi-platform sesuai kebutuhan industri dan masyarakat."
  },
  {
    "kode_mk": "SIF408",
    "cpl_kode": "CPL03",
    "cpmk_kode": "CPMK9",
    "sub_kode": "9.4",
    "uraian": "Menerapkan konsep berorientasi objek dalam pengorganisasian dan penyusunan program untuk manajemen perilaku dan konsep"
  }
];

// Helper: Matrix aggregat jumlah Sub-CPMK / CPMK per (Mata Kuliah x CPL)
export function getCpmkMatrixSummary() {
  const summary: Record<string, Record<string, { cpmkCount: number; subCount: number; cpmks: string[] }>> = {}

  for (const m of CURRICULUM_2026_MK_CPMK_MAPPINGS) {
    if (!summary[m.kode_mk]) summary[m.kode_mk] = {}
    if (!summary[m.kode_mk][m.cpl_kode]) {
      summary[m.kode_mk][m.cpl_kode] = { cpmkCount: 0, subCount: 0, cpmks: [] }
    }
    const entry = summary[m.kode_mk][m.cpl_kode]
    entry.subCount += 1
    if (!entry.cpmks.includes(m.cpmk_kode)) {
      entry.cpmks.push(m.cpmk_kode)
      entry.cpmkCount += 1
    }
  }

  return summary
}
