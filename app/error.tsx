"use client"

import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { AlertTriangle, RefreshCcw } from "lucide-react"

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="h-24 w-24 bg-red-100 text-red-600 rounded-full flex items-center justify-center mb-8">
        <AlertTriangle className="h-12 w-12" />
      </div>
      <h1 className="text-2xl font-bold text-gray-800 mb-2">Terjadi Kesalahan Sistem</h1>
      <p className="text-muted-foreground text-center max-w-md mb-8">
        Sistem mengalami kendala saat memproses permintaan Anda. 
        <br/>
        <span className="text-xs font-mono bg-gray-200 px-2 py-1 rounded mt-4 inline-block">{error.message}</span>
      </p>
      <div className="flex gap-4">
        <Button variant="outline" onClick={() => window.location.href = "/dashboard"}>
          Ke Dashboard
        </Button>
        <Button onClick={() => reset()} className="gap-2">
          <RefreshCcw className="h-4 w-4" /> Coba Lagi
        </Button>
      </div>
    </div>
  )
}
