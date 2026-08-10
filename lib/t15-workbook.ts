import JSZip from "jszip"

type RedT15Rows = {
  cpmkRows: Set<number>
  subCpmkRows: Set<number>
}

const xmlAttribute = (tag: string, name: string) => {
  const match = tag.match(new RegExp(`${name}="([^"]*)"`))
  return match?.[1] ?? ""
}

function xmlParts(xml: string, tagName: string) {
  return xml.match(new RegExp(`<${tagName}\\b[^>]*?(?:\\/>|>[\\s\\S]*?<\\/${tagName}>)`, "g")) ?? []
}

function isRedFont(fontXml: string) {
  return /<color\b[^>]*(?:rgb="FFFF0000"|rgb="FF0000"|indexed="10")[^>]*\/>/i.test(fontXml)
}

export async function findRedT15Rows(buffer: ArrayBuffer | Uint8Array): Promise<RedT15Rows> {
  const archive = await JSZip.loadAsync(buffer)
  const workbookXml = await archive.file("xl/workbook.xml")?.async("string")
  const relationshipsXml = await archive.file("xl/_rels/workbook.xml.rels")?.async("string")
  const stylesXml = await archive.file("xl/styles.xml")?.async("string")
  if (!workbookXml || !relationshipsXml || !stylesXml) return { cpmkRows: new Set(), subCpmkRows: new Set() }

  const sheetTag = (workbookXml.match(/<sheet\b[^>]*name="T15 MK-CPMK-SubCPMK-OK"[^>]*\/>/) ?? [""])[0]
  const relationshipId = xmlAttribute(sheetTag, "r:id")
  const relationshipTag = (relationshipsXml.match(new RegExp(`<Relationship\\b[^>]*Id="${relationshipId}"[^>]*/>`)) ?? [""])[0]
  const worksheetTarget = xmlAttribute(relationshipTag, "Target").replace(/^\//, "")
  const worksheetPath = worksheetTarget.startsWith("xl/") ? worksheetTarget : `xl/${worksheetTarget}`
  const worksheetXml = await archive.file(worksheetPath)?.async("string")
  if (!worksheetXml) return { cpmkRows: new Set(), subCpmkRows: new Set() }

  const fontsXml = (stylesXml.match(/<fonts\b[\s\S]*?<\/fonts>/) ?? [""])[0]
  const redFontIds = new Set(fontsXml.match(/<font>[\s\S]*?<\/font>/g)?.flatMap((font, index) => isRedFont(font) ? [index] : []))
  const cellXfsXml = (stylesXml.match(/<cellXfs\b[\s\S]*?<\/cellXfs>/) ?? [""])[0]
  const redStyleIds = new Set<number>()
  xmlParts(cellXfsXml, "xf").forEach((xf, index) => {
    const fontId = Number(xmlAttribute(xf, "fontId"))
    if (redFontIds.has(fontId)) redStyleIds.add(index)
  })

  const result: RedT15Rows = { cpmkRows: new Set(), subCpmkRows: new Set() }
  for (const cell of worksheetXml.match(/<c\b[^>]*?(?:\/>|>[\s\S]*?<\/c>)/g) ?? []) {
    const ref = xmlAttribute(cell, "r")
    const styleId = Number(xmlAttribute(cell, "s"))
    const row = Number(ref.match(/\d+$/)?.[0] ?? 0)
    const column = ref.match(/^[A-Z]+/)?.[0]
    if (!row || !redStyleIds.has(styleId)) continue
    if (column === "D") result.cpmkRows.add(row)
    if (column === "E" || column === "F") result.subCpmkRows.add(row)
  }
  return result
}
