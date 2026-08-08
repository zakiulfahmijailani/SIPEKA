import { redirect } from "next/navigation"

import { getCurrentSession } from "@/lib/current-session"

import { LoginForm } from "../../login/login-form"

export default async function SuperAdminLoginPage() {
  const session = await getCurrentSession()
  if (session?.user) {
    if (session.user.role === "SUPER_ADMIN") redirect("/dashboard")
    redirect("/login")
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 px-4 py-12">
      <div className="w-full max-w-md overflow-hidden rounded-2xl border border-white/10 bg-white shadow-2xl">
        <div className="bg-slate-900 px-8 py-7 text-white">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-300">SIPEKA</p>
          <h1 className="mt-2 text-2xl font-bold">Portal Super Admin</h1>
          <p className="mt-1 text-sm text-slate-300">Khusus administrator utama pengelola sistem.</p>
        </div>
        <LoginForm callbackUrl="/super-admin/continue" />
      </div>
    </main>
  )
}
