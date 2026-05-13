import { pgTable, text, timestamp, json, pgEnum } from "drizzle-orm/pg-core"
import { createId } from "@paralleldrive/cuid2"
import { users } from "./auth"

export const auditActionEnum = pgEnum("audit_action", [
  "CREATE", "UPDATE", "DELETE", "STATUS_CHANGE"
])

export const auditLog = pgTable("audit_log", {
  id: text("id").primaryKey().$defaultFn(() => createId()),
  entity_type: text("entity_type").notNull(),
  entity_id: text("entity_id").notNull(),
  action: auditActionEnum("action").notNull(),
  changed_by: text("changed_by").references(() => users.id),
  old_values: json("old_values"),
  new_values: json("new_values"),
  created_at: timestamp("created_at").defaultNow().notNull(),
})
