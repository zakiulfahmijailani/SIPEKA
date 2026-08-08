"use client"

import { useState } from "react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Loader2, LockKeyhole, Mail } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export function LoginForm() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [isGoogleLoading, setIsGoogleLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (formData: FormData) => {
    setIsLoading(true)
    setError("")
    const result = await signIn("credentials", {
      email: String(formData.get("email") || ""),
      password: String(formData.get("password") || ""),
      redirect: false,
    })

    if (result?.error) {
      setError("Email atau kata sandi tidak sesuai.")
      setIsLoading(false)
      return
    }

    router.push("/dashboard")
    router.refresh()
  }

  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true)
    setError("")
    await signIn("google", { callbackUrl: "/dashboard" })
  }

  return (
    <form action={handleSubmit} className="space-y-5 px-8 py-7">
      <div className="space-y-2">
        <Label htmlFor="email">Email institusi</Label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input id="email" name="email" type="email" required autoComplete="email" className="pl-9" placeholder="nama@bakrie.ac.id" />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">Kata sandi</Label>
        <div className="relative">
          <LockKeyhole className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input id="password" name="password" type="password" required autoComplete="current-password" className="pl-9" />
        </div>
      </div>
      {error && <p className="rounded-lg border border-red-100 bg-red-50 p-3 text-sm text-red-700">{error}</p>}
      <Button type="submit" disabled={isLoading} className="h-10 w-full gap-2">
        {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
        Masuk ke SIPEKA
      </Button>
      <div className="relative py-1">
        <div className="absolute inset-0 flex items-center" aria-hidden="true">
          <div className="w-full border-t border-gray-200" />
        </div>
        <div className="relative flex justify-center text-xs">
          <span className="bg-white px-3 text-gray-400">atau</span>
        </div>
      </div>
      <Button
        type="button"
        variant="outline"
        disabled={isLoading || isGoogleLoading}
        onClick={handleGoogleSignIn}
        className="h-10 w-full gap-2"
      >
        {isGoogleLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <span className="text-base font-semibold">G</span>}
        Masuk dengan Google
      </Button>
    </form>
  )
}
