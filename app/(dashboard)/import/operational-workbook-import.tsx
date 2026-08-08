"use client"

import { useState, useTransition } from "react"
import { AlertCircle, CheckCircle2, Database, FileSpreadsheet, Loader2, Upload } from "lucide-react"

import {
  importOperationalWorkbook,
  type OperationalImportResult,
} from "@/app/actions/import-operational-workbook"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"

const SUMMARY_LABELS: Record<string, string> = {
  cpls: "CPL",
  courses: "Mata kuliah",
  courseCpmks: "Pemetaan MK–CPMK",
  subCpmks: "Sub-CPMK",
  assessments: "Komponen penilaian",
}

export function OperationalWorkbookImport() {
  const [file, setFile] = useState<File | null>(null)
  const [scope, setScope] = useState<"templates" | "full">("templates")
  const [result, setResult] = useState<OperationalImportResult | null>(null)
  const [hasPreview, setHasPreview] = useState(false)
  const [isPending, startTransition] = useTransition()

  function runImport(mode: "preview" | "commit") {
    if (!file) {
      setResult({ success: false, message: "Pilih file workbook Excel terlebih dahulu." })
      return
    }

    startTransition(async () => {
      const formData = new FormData()
      formData.set("file", file)
      formData.set("mode", mode)
      formData.set("scope", scope)
      const nextResult = await importOperationalWorkbook(formData)
      setResult(nextResult)
      if (mode === "preview") setHasPreview(nextResult.success)
      if (mode === "commit" && nextResult.success) setHasPreview(false)
    })
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5 text-emerald-600" />
            Workbook kurikulum operasional
          </CardTitle>
          <CardDescription>
            Unggah workbook sumber untuk memperbarui master CPL, mata kuliah, CPMK, Sub-CPMK,
            dan template asesmen yang digunakan dosen saat membuat RPS, RPM, dan RTM.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <label className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-200 bg-gray-50 px-6 py-10 text-center transition hover:border-emerald-300 hover:bg-emerald-50/40">
            <Upload className="mb-3 h-8 w-8 text-gray-400" />
            <span className="font-medium text-gray-800">
              {file ? file.name : "Pilih workbook .xlsx"}
            </span>
            <span className="mt-1 text-xs text-gray-500">
              Data belum disimpan sebelum tombol Impor ditekan.
            </span>
            <Input
              className="sr-only"
              type="file"
              accept=".xlsx,.xls"
              disabled={isPending}
              onChange={(event) => {
                setFile(event.target.files?.[0] ?? null)
                setResult(null)
                setHasPreview(false)
              }}
            />
          </label>

          <div className="rounded-xl border border-blue-100 bg-blue-50/50 p-4">
            <label className="text-sm font-semibold text-blue-950" htmlFor="import-scope">Cakupan impor</label>
            <select
              id="import-scope"
              value={scope}
              onChange={(event) => setScope(event.target.value as "templates" | "full")}
              disabled={isPending}
              className="mt-2 h-10 w-full rounded-lg border border-blue-200 bg-white px-3 text-sm text-slate-800 outline-none focus:ring-2 focus:ring-blue-500/20"
            >
              <option value="templates">Template CPMK & Sub-CPMK saja (disarankan)</option>
              <option value="full">Kurikulum operasional lengkap</option>
            </select>
            <p className="mt-2 text-xs leading-5 text-blue-800">
              Mode disarankan hanya memperbarui template CPMK/Sub-CPMK dan tidak mengubah master mata kuliah maupun CPL yang sudah diselaraskan dengan SK 2026.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button
              type="button"
              variant="outline"
              disabled={!file || isPending}
              onClick={() => runImport("preview")}
            >
              {isPending ? <Loader2 className="animate-spin" /> : <FileSpreadsheet />}
              Periksa workbook
            </Button>
            <Button
              type="button"
              disabled={!file || !hasPreview || isPending}
              onClick={() => runImport("commit")}
            >
              {isPending ? <Loader2 className="animate-spin" /> : <Database />}
              Impor ke SIPEKA
            </Button>
          </div>
        </CardContent>
      </Card>

      {result && (
        <Alert variant={result.success ? "success" : "destructive"}>
          {result.success ? (
            <CheckCircle2 className="absolute left-4 top-3.5 h-4 w-4" />
          ) : (
            <AlertCircle className="absolute left-4 top-3.5 h-4 w-4" />
          )}
          <div className="pl-6">
            <AlertTitle>{result.success ? "Workbook siap" : "Workbook belum dapat diproses"}</AlertTitle>
            <AlertDescription>{result.message}</AlertDescription>
          </div>
        </Alert>
      )}

      {result?.summary && (
        <Card>
          <CardHeader>
            <CardTitle>Ringkasan data terbaca</CardTitle>
            <CardDescription>
              Angka ini berasal dari sheet sumber dan dapat diperiksa sebelum disimpan.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
              {Object.entries(result.summary).map(([key, value]) => (
                <div key={key} className="rounded-lg border bg-gray-50 p-4">
                  <div className="text-2xl font-semibold text-gray-900">{value}</div>
                  <div className="mt-1 text-xs text-gray-500">{SUMMARY_LABELS[key] ?? key}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {result?.warnings && result.warnings.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <CardTitle>Catatan validasi</CardTitle>
              <Badge variant="outline">{result.warnings.length}</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-amber-900">
              {result.warnings.map((warning) => (
                <li key={warning} className="rounded-lg bg-amber-50 px-3 py-2">
                  {warning}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
