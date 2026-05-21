import { MOCK_SESSION } from "@/lib/mock-session"

export const dynamic = "force-dynamic"

export default async function ProfilPage() {
  const session = MOCK_SESSION

  const ProfilClient = (await import("./profil-client")).default

  const user = {
    id: session.user.id,
    email: session.user.email,
    password: null,
    nama_lengkap: session.user.name,
    nidn: null,
    role: session.user.role,
    is_active: true,
    created_at: new Date(),
    updated_at: new Date(),
  }

  return <ProfilClient user={user} />
}
