import { redirect } from "next/navigation"

import { getCurrentSession } from "@/lib/current-session"

import { LoginForm } from "./login-form"

export default async function LoginPage() {
  const session = await getCurrentSession()
  if (session?.user) redirect("/dashboard")

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 px-4 py-12">
      <div className="w-full max-w-md overflow-hidden rounded-2xl border border-white/10 bg-white shadow-2xl">
        <div className="bg-blue-700 px-8 py-7 text-white">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-blue-100">SIPEKA</p>
          <h1 className="mt-2 text-2xl font-bold">Portal Dosen</h1>
          <p className="mt-1 text-sm text-blue-100">Kelola RPS, RPM, RTM, dan rubrik dari satu sumber data.</p>
        </div>
        <LoginForm />
      </div>
    </main>
  )
}
