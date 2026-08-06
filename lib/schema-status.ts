import "server-only"

import { getTableColumns, getTableName, is, sql } from "drizzle-orm"
import { PgTable } from "drizzle-orm/pg-core"

import { db } from "@/db"
import * as schema from "@/db/schema"

export async function getSchemaStatus() {
  const actualColumns = await db.execute(sql`
    select table_name, column_name
    from information_schema.columns
    where table_schema = 'public'
    order by table_name, ordinal_position
  `)

  const actualTables = await db.execute(sql`
    select table_name
    from information_schema.tables
    where table_schema = 'public' and table_type = 'BASE TABLE'
    order by table_name
  `)

  const expected = (Object.values(schema) as unknown[])
    .filter((value) => is(value, PgTable))
    .map((value) => value as PgTable)
    .map((table) => ({
      table: getTableName(table),
      columns: Object.values(getTableColumns(table)).map((column) => column.name),
    }))

  const tableSet = new Set(actualTables.rows.map((row) => String(row.table_name)))
  const columnSet = new Set(
    actualColumns.rows.map(
      (row) => `${String(row.table_name)}.${String(row.column_name)}`,
    ),
  )

  return {
    missingTables: expected
      .filter(({ table }) => !tableSet.has(table))
      .map(({ table }) => table),
    missingColumns: expected.flatMap(({ table, columns }) =>
      tableSet.has(table)
        ? columns
            .filter((column) => !columnSet.has(`${table}.${column}`))
            .map((column) => `${table}.${column}`)
        : [],
    ),
  }
}
