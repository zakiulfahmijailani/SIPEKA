// Seed script
// Run with: npm run db:seed
// Requires DATABASE_URL in .env.local

import { db } from "./index"
import { users } from "./schema"
import { eq } from "drizzle-orm"
import bcrypt from "bcryptjs"

const DEFAULT_PASSWORD = "Bakrie@2025"

const dosenData = [
  {
    email: "hoga.saragih@bakrie.ac.id",
    nama_lengkap: "Prof. Dr. Hoga Saragih, ST., MT.",
    nidn: null,
    role: "DOSEN" as const,
    is_active: true,
  },
  {
    email: "siti.rohajawati@bakrie.ac.id",
    nama_lengkap: "Prof. Dr. Siti Rohajawati, S.Kom., M.Kom., CISDV",
    nidn: null,
    role: "DOSEN" as const,
    is_active: true,
  },
  {
    email: "kenny.lubis@bakrie.ac.id",
    nama_lengkap: "Ir. Kenny Badjora Lubis, M.Kom.",
    nidn: null,
    role: "DOSEN" as const,
    is_active: true,
  },
  {
    email: "zakiul.jailani@bakrie.ac.id",
    nama_lengkap: "Zakiul Fahmi Jailani, S.Kom., MSc.",
    nidn: null,
    role: "DOSEN" as const,
    is_active: true,
  },
  {
    email: "shidiq.alhakim@bakrie.ac.id",
    nama_lengkap: "Dr. Shidiq Al Hakim, S.Kom., M.Eng.",
    nidn: null,
    role: "DOSEN" as const,
    is_active: true,
  },
  {
    email: "dita.nurmadewi@bakrie.ac.id",
    nama_lengkap: "Dita Nurmadewi, S.Kom., M.Kom.",
    nidn: null,
    role: "DOSEN" as const,
    is_active: true,
  },
  {
    email: "elin.cahyaningsih@bakrie.ac.id",
    nama_lengkap: "Dr. Elin Cahyaningsih, S.Kom., MMSI",
    nidn: null,
    role: "DOSEN" as const,
    is_active: true,
  },
  {
    email: "haris.rafi@bakrie.ac.id",
    nama_lengkap: "Haris Rafi, S.Kom., M.Kom.",
    nidn: null,
    role: "DOSEN" as const,
    is_active: true,
  },
]

async function seed() {
  console.log("🌱 Seeding database...")

  const hashedPassword = await bcrypt.hash(DEFAULT_PASSWORD, 12)
  let inserted = 0
  let skipped = 0

  for (const dosen of dosenData) {
    const existing = await db.query.users.findFirst({
      where: eq(users.email, dosen.email),
    })

    if (existing) {
      console.log(`⏭️  Skip (sudah ada): ${dosen.nama_lengkap}`)
      skipped++
      continue
    }

    await db.insert(users).values({
      ...dosen,
      password: hashedPassword,
    })
    console.log(`✅ Inserted: ${dosen.nama_lengkap}`)
    inserted++
  }

  console.log(`\n📊 Selesai: ${inserted} dosen ditambahkan, ${skipped} dilewati.`)
  console.log(`🔑 Password default: ${DEFAULT_PASSWORD}`)
  process.exit(0)
}

seed().catch((err) => {
  console.error("❌ Seed gagal:", err)
  process.exit(1)
})
