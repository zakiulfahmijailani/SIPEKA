import { pgTable, text, timestamp, serial, jsonb } from "drizzle-orm/pg-core"
import { users } from "./auth"

// Audit Log
export const auditLog = pgTable("audit_log", {
  id: serial("id").primaryKey(),
  user_id: text("user_id")
    .references(() => users.id, { onDelete: "set null" }),
  action: text("action").notNull(), // CREATE, UPDATE, DELETE
  entity_type: text("entity_type").notNull(), // table name
  entity_id: text("entity_id").notNull(),
  old_values: jsonb("old_values"),
  new_values: jsonb("new_values"),
  ip_address: text("ip_address"),
  created_at: timestamp("created_at", { mode: "date" }).defaultNow(),
})
