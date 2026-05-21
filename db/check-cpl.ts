import { config } from "dotenv"
config({ path: ".env.local" })

import { db } from "./index"
import { cpl, mataKuliah, petaKurikulum } from "./schema"

async function check() {
  const cpls = await db.select().from(cpl);
  console.log("CPL Data:");
  console.log(cpls.map(c => `${c.kode} - ${c.slug}`).join("\n"));
  
  const mks = await db.select().from(mataKuliah).limit(5);
  console.log("\nSample Mata Kuliah:");
  console.log(mks.map(m => `${m.kode} - ${m.nama_id}`).join("\n"));
  process.exit(0);
}

check().catch(console.error);
