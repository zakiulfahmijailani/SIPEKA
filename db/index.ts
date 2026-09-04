import { neon } from "@neondatabase/serverless"
import { drizzle } from "drizzle-orm/neon-http"
import * as schema from "./schema"

const connectionString = (process.env.DATABASE_URL || "").replace(/^["']|["']$/g, "").trim()
const sql = neon(connectionString || "postgresql://placeholder:placeholder@localhost:5432/placeholder")
export const db = drizzle(sql, { schema })
export type DB = typeof db
