const MOCK_SESSION = { user: { id: "guest", name: "Guest", email: "guest@sipeka.local", role: "SUPER_ADMIN" as const } }

export default async function ProfilPage() {
  const session = MOCK_SESSION

  const { ProfilClient } = await import("./profil-client")

  return <ProfilClient user={session.user} />
}
