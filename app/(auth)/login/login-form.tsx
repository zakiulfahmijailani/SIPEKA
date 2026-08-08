"use client"

import { useState } from "react"
import { signIn } from "next-auth/react"
import { Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"

export function LoginForm() {
  const [isGoogleLoading, setIsGoogleLoading] = useState(false)
  const [error, setError] = useState("")

  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true)
    setError("")
    await signIn("google", { callbackUrl: "/dashboard" })
  }

  return (
    <div className="space-y-5 px-8 py-7">
      <p className="text-center text-sm leading-6 text-slate-600">
        Gunakan akun Google yang emailnya sudah terdaftar sebagai pengguna SIPEKA.
      </p>
      {error && <p className="rounded-lg border border-red-100 bg-red-50 p-3 text-sm text-red-700">{error}</p>}
      <Button
        type="button"
        disabled={isGoogleLoading}
        onClick={handleGoogleSignIn}
        className="h-11 w-full gap-2"
      >
        {isGoogleLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <span className="text-base font-semibold">G</span>}
        Masuk dengan Google
      </Button>
    </div>
  )
}
