import { pgTable, text, timestamp, boolean } from "drizzle-orm/pg-core"
import { createId } from "@paralleldrive/cuid2"
import { users } from "./auth"

export const programSettings = pgTable("program_settings", {
  key: text("key").primaryKey(),
  value: text("value").notNull(),
  updated_at: timestamp("updated_at").defaultNow().notNull(),
})

export const notifications = pgTable("notifications", {
  id: text("id").primaryKey().$defaultFn(() => createId()),
  user_id: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  message: text("message").notNull(),
  link: text("link"), // added for navigation
  is_read: boolean("is_read").notNull().default(false),
  created_at: timestamp("created_at").defaultNow().notNull(),
})
