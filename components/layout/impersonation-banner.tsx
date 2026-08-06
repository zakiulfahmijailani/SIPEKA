"use client"

import { useTransition } from "react"
import { ArrowLeft, Eye, Loader2 } from "lucide-react"

import { stopDosenImpersonation } from "@/app/actions/impersonation"
import { Button } from "@/components/ui/button"

export function ImpersonationBanner({
  dosenName,
  administratorName,
}: {
  dosenName: string
  administratorName: string
}) {
  const [isPending, startTransition] = useTransition()

  function returnToAdministrator() {
    startTransition(async () => {
      await stopDosenImpersonation()
      window.location.assign("/master/users")
    })
  }

  return (
    <div className="no-print flex flex-col gap-3 border-b border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-950 sm:flex-row sm:items-center sm:justify-between lg:px-8">
      <div className="flex items-start gap-3 sm:items-center">
        <span className="mt-0.5 rounded-full bg-amber-200 p-1.5 sm:mt-0">
          <Eye className="h-4 w-4" />
        </span>
        <div>
          <p className="font-semibold">Sedang masuk sebagai {dosenName}</p>
          <p className="text-xs text-amber-800">Akses dibatasi seperti akun dosen. Administrator: {administratorName}</p>
        </div>
      </div>
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="border-amber-400 bg-white hover:bg-amber-100"
        disabled={isPending}
        onClick={returnToAdministrator}
      >
        {isPending ? <Loader2 className="animate-spin" /> : <ArrowLeft />}
        Kembali ke Super Admin
      </Button>
    </div>
  )
}
