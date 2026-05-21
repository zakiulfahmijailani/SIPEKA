import { MOCK_SESSION } from "@/lib/mock-session"
import { Sidebar } from "@/components/layout/sidebar"
import { NotificationBell } from "@/components/layout/notification-bell"
import { PageTransition } from "@/components/layout/page-transition"


export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = MOCK_SESSION

  return (
    <div className="flex min-h-screen bg-gray-50 flex-col lg:flex-row">
      <Sidebar session={session} />
      <main className="flex-1 overflow-y-auto">
        {/* Top Header */}
        <header className="h-14 border-b bg-white flex items-center justify-end px-8 sticky top-0 z-30">
          <NotificationBell userId={session.user.id} />
        </header>
        <div className="p-4 md:p-8">
          <PageTransition>{children}</PageTransition>
        </div>
      </main>
    </div>
  )
}
