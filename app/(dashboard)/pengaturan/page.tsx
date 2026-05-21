const MOCK_SESSION = { user: { id: "guest", name: "Guest", email: "guest@sipeka.local", role: "SUPER_ADMIN" as const } }

export default async function PengaturanPage() {
  const session = MOCK_SESSION

  const { PengaturanClient } = await import("./pengaturan-client")

  return <PengaturanClient user={session.user} />
}
