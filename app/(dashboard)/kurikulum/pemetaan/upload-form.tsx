"use client"

import { useRef, useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { CheckCircle2, FileSpreadsheet, Loader2, UploadCloud, XCircle } from "lucide-react"

import { uploadCurriculumMapping } from "@/app/actions/curriculum"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"

type UploadState = {
  status: "idle" | "success" | "error"
  message?: string
  imported?: { courses: number; mappings: number }
  errors?: string[]
}

const ACCEPTED_EXTENSIONS = ".ods,.xlsx,.csv"

export function UploadForm() {
  const router = useRouter()
  const inputRef = useRef<HTMLInputElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [state, setState] = useState<UploadState>({ status: "idle" })
  const [isPending, startTransition] = useTransition()

  const pickFile = (file?: File) => {
    if (!file) return
    setSelectedFile(file)
    setState({ status: "idle" })
  }

  const handleAction = (formData: FormData) => {
    if (selectedFile) {
      formData.set("file", selectedFile)
    }

    startTransition(async () => {
      const result = await uploadCurriculumMapping(formData)
      if (result.success) {
        setState({
          status: "success",
          message: result.message,
          imported: result.imported,
          errors: result.errors,
        })
        setSelectedFile(null)
        if (inputRef.current) inputRef.current.value = ""
        router.refresh()
        return
      }

      setState({
        status: "error",
        message: result.message,
        errors: result.errors,
      })
    })
  }

  return (
    <Card className="rounded-lg">
      <CardHeader>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <CardTitle>Upload Pemetaan</CardTitle>
            <CardDescription>
              Import file ODS, XLSX, atau CSV berisi matriks MK x CPL.
            </CardDescription>
          </div>
          <Badge variant="outline" className="w-fit">
            .ods .xlsx .csv
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <form action={handleAction} className="space-y-4">
          <div
            onDragOver={(event) => {
              event.preventDefault()
              setIsDragging(true)
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={(event) => {
              event.preventDefault()
              setIsDragging(false)
              pickFile(event.dataTransfer.files[0])
            }}
            className={cn(
              "flex min-h-44 flex-col items-center justify-center gap-3 rounded-lg border border-dashed bg-muted/30 px-4 py-8 text-center transition-colors dark:bg-muted/10",
              isDragging && "border-primary bg-primary/5 dark:bg-primary/10",
              isPending && "pointer-events-none opacity-70"
            )}
          >
            <div className="flex size-12 items-center justify-center rounded-full bg-background ring-1 ring-border">
              {isPending ? (
                <Loader2 className="size-5 animate-spin text-muted-foreground" />
              ) : selectedFile ? (
                <FileSpreadsheet className="size-5 text-primary" />
              ) : (
                <UploadCloud className="size-5 text-muted-foreground" />
              )}
            </div>
            <div className="space-y-1">
              <p className="font-medium text-foreground">
                {isDragging ? "Lepaskan file di sini" : "Tarik file ke area ini"}
              </p>
              <p className="text-sm text-muted-foreground">
                {selectedFile ? selectedFile.name : "atau pilih file dari perangkat"}
              </p>
            </div>
            <input
              ref={inputRef}
              name="file"
              type="file"
              accept={ACCEPTED_EXTENSIONS}
              className="sr-only"
              onChange={(event) => pickFile(event.target.files?.[0])}
            />
            <Button
              type="button"
              variant="outline"
              onClick={() => inputRef.current?.click()}
              disabled={isPending}
            >
              Pilih File
            </Button>
          </div>

          {state.status === "success" && (
            <Alert variant="success">
              <CheckCircle2 className="mr-2 inline size-4" />
              <AlertTitle>{state.message ?? "Import berhasil"}</AlertTitle>
              <AlertDescription>
                {state.imported?.courses ?? 0} mata kuliah dan{" "}
                {state.imported?.mappings ?? 0} pemetaan berhasil diimport.
              </AlertDescription>
            </Alert>
          )}

          {state.status === "error" && (
            <Alert variant="destructive">
              <XCircle className="mr-2 inline size-4" />
              <AlertTitle>{state.message ?? "Import gagal"}</AlertTitle>
              {state.errors && state.errors.length > 0 && (
                <AlertDescription>
                  <ul className="mt-2 list-disc space-y-1 pl-5">
                    {state.errors.slice(0, 5).map((error) => (
                      <li key={error}>{error}</li>
                    ))}
                  </ul>
                </AlertDescription>
              )}
            </Alert>
          )}

          <div className="flex justify-end">
            <Button type="submit" disabled={!selectedFile || isPending}>
              {isPending && <Loader2 className="size-4 animate-spin" />}
              Import Pemetaan
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
