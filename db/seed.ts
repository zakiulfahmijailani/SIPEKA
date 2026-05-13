// Seed script placeholder
// Run with: npm run db:seed
// Requires DATABASE_URL in .env.local

import { db } from "./index"

async function seed() {
  console.log("🌱 Seeding database...")

  // TODO: Seed IS2020 realms and areas
  // TODO: Seed default admin user
  // TODO: Seed profil lulusan
  // TODO: Seed sample CPL data

  console.log("✅ Seeding complete!")
}

seed().catch((err) => {
  console.error("❌ Seed failed:", err)
  process.exit(1)
})
