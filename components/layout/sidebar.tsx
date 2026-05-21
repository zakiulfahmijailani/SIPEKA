"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { 
  Home, 
  BarChart2, 
  BookOpen, 
  Database, 
  BookMarked, 
  Map, 
  GraduationCap, 
  FileText, 
  PenSquare, 
  Users, 
  ShieldAlert, 
  LogOut, 
  Menu,
  ChevronRight,
  Table2,
  Sparkles
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { signOut } from "next-auth/react"
import { Session } from "next-auth"
import { useState } from "react"

interface SidebarProps {
  session: Session
}

const ROLE_LABEL: Record<string, string> = {
  SUPER_ADMIN: "Super Admin",
  KAPRODI: "Kaprodi",
  DOSEN: "Dosen",
}

export function Sidebar({ session }: SidebarProps) {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const role = session?.user?.role

  const isSuperAdmin = role === "SUPER_ADMIN"
  const isKaprodi = role === "KAPRODI"
  const isDosen = role === "DOSEN"

  // Nav items dikelompokkan per seksi
  const navGroups = [
    {
      label: null,
      items: [
        { name: "Dashboard", href: "/dashboard", icon: Home, show: true },
        { name: "Referensi IS2020", href: "/referensi/is2020", icon: BookOpen, show: true },
      ],
    },
    {
      label: "Laporan",
      items: [
        { name: "Attainment CPL", href: "/laporan/cpl-attainment", icon: BarChart2, show: isSuperAdmin || isKaprodi },
        { name: "IS2020 Coverage", href: "/laporan/is2020-coverage", icon: Map, show: isSuperAdmin || isKaprodi },
      ],
    },
    {
      label: "Master Data",
      items: [
        { name: "Master CPL", href: "/master/cpl", icon: Database, show: isSuperAdmin || isKaprodi },
        { name: "Mata Kuliah", href: "/master/mata-kuliah", icon: BookMarked, show: isSuperAdmin || isKaprodi },
        { name: "Peta Kurikulum", href: "/master/peta-kurikulum", icon: Map, show: isSuperAdmin || isKaprodi },
        { name: "Pemetaan Kurikulum", href: "/kurikulum/pemetaan", icon: Table2, show: isSuperAdmin || isKaprodi },
        { name: "Sebaran CPL", href: "/kurikulum/sebaran-cpl", icon: Map, show: isSuperAdmin || isKaprodi },
        { name: "Analitik Kurikulum", href: "/kurikulum/analitik", icon: BarChart2, show: isSuperAdmin || isKaprodi },
        { name: "Analisis AI", href: "/kurikulum/analisis-ai", icon: Sparkles, badge: "AI", show: isSuperAdmin || isKaprodi },
        { name: "Dosir MK", href: "/master/dosir-mk", icon: GraduationCap, show: isSuperAdmin || isKaprodi },
        { name: "Tahun Akademik", href: "/master/tahun-akademik", icon: Database, show: isSuperAdmin || isKaprodi },
        { name: "Profil Lulusan", href: "/master/profil-lulusan", icon: GraduationCap, show: isSuperAdmin || isKaprodi },
        { name: "Data Mahasiswa", href: "/master/mahasiswa", icon: Users, show: isSuperAdmin || isKaprodi },
      ],
    },
    {
      label: "Perkuliahan",
      items: [
        { name: "RPS Saya", href: "/rps", icon: FileText, show: isSuperAdmin || isKaprodi || isDosen },
        { name: "Enrollment", href: "/nilai/enrollment", icon: Users, show: isSuperAdmin || isKaprodi },
        { name: "Input Nilai", href: "/nilai/input", icon: PenSquare, show: isSuperAdmin || isKaprodi || isDosen },
        { name: "Rekap Nilai", href: "/nilai/rekap", icon: BarChart2, show: true },
      ],
    },
    {
      label: "Sistem",
      items: [
        { name: "Manajemen User", href: "/master/users", icon: Users, show: isSuperAdmin },
        { name: "Audit Log", href: "/audit", icon: ShieldAlert, show: isSuperAdmin },
      ],
    },
  ]

  const NavLinks = () => (
    <nav className="space-y-4">
      {navGroups.map((group, i) => {
        const visible = group.items.filter(item => item.show)
        if (visible.length === 0) return null
        return (
          <div key={i}>
            {group.label && (
              <p className="px-3 mb-1 text-[10px] font-semibold uppercase tracking-widest text-gray-400">
                {group.label}
              </p>
            )}
            <div className="space-y-0.5">
              {visible.map((item) => {
                const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`)
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className={cn(
                      "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
                      isActive
                        ? "bg-gray-100 text-gray-900 font-semibold"
                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900 font-medium"
                    )}
                  >
                    <item.icon
                      className={cn(
                        "h-4 w-4 shrink-0",
                        isActive ? "text-gray-900" : "text-gray-400"
                      )}
                    />
                    <span className="flex-1 truncate">{item.name}</span>
                    {(item as any).badge && (
                      <span className="ml-auto mr-1 rounded-full bg-indigo-100 dark:bg-indigo-900 px-1.5 py-0.5 text-[9px] font-bold tracking-wider text-indigo-700 dark:text-indigo-400">
                        {(item as any).badge}
                      </span>
                    )}
                    {isActive && <ChevronRight className="h-3 w-3 text-gray-400" />}
                  </Link>
                )
              })}
            </div>
          </div>
        )
      })}
    </nav>
  )

  const UserProfile = () => (
    <div className="p-4 border-b border-gray-100">
      <div className="font-bold text-lg tracking-tight text-gray-900">SIPEKA</div>
      <div className="text-xs text-gray-400 mb-4">Sistem Informasi Penilaian</div>
      <div className="flex flex-col gap-0.5 p-3 rounded-lg bg-gray-50 border border-gray-100">
        <span className="text-sm font-semibold text-gray-800 truncate" title={session?.user?.name || ""}>
          {session?.user?.name}
        </span>
        <span className="text-xs text-gray-400 truncate" title={session?.user?.email || ""}>
          {session?.user?.email}
        </span>
        <Badge variant="outline" className="mt-1.5 w-fit text-xs text-gray-500 bg-white">
          {ROLE_LABEL[role as string] ?? role}
        </Badge>
      </div>
    </div>
  )

  return (
    <>
      {/* Mobile Sidebar */}
      <div className="lg:hidden flex items-center justify-between p-4 border-b bg-white">
        <div className="font-bold text-lg text-gray-900">SIPEKA</div>
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger render={<Button variant="ghost" size="icon" aria-label="Buka menu navigasi" />}>
            <Menu className="h-5 w-5" />
          </SheetTrigger>
          <SheetContent side="left" className="w-64 p-0 flex flex-col h-full">
            <UserProfile />
            <div className="flex-1 overflow-y-auto p-4">
              <NavLinks />
            </div>
            <div className="p-4 border-t mt-auto">
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start gap-2 text-gray-500 hover:text-red-600 hover:bg-red-50"
                onClick={() => signOut({ callbackUrl: "/login" })}
              >
                <LogOut className="h-4 w-4" />
                Keluar
              </Button>
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-60 bg-white border-r border-gray-100 min-h-screen">
        <UserProfile />
        <div className="flex-1 overflow-y-auto p-4">
          <NavLinks />
        </div>
        <div className="p-4 border-t border-gray-100 mt-auto">
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start gap-2 text-gray-500 hover:text-red-600 hover:bg-red-50"
            onClick={() => signOut({ callbackUrl: "/login" })}
          >
            <LogOut className="h-4 w-4" />
            Keluar
          </Button>
        </div>
      </aside>
    </>
  )
}
