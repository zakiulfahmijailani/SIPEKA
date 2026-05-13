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
  Menu
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

export function Sidebar({ session }: SidebarProps) {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const role = session?.user?.role

  const isSuperAdmin = role === "SUPER_ADMIN"
  const isKaprodi = role === "KAPRODI"
  const isDosen = role === "DOSEN"

  const navItems = [
    // SEMUA ROLE
    { name: "Dashboard", href: "/dashboard", icon: Home, show: true },
    { name: "Laporan", href: "/laporan", icon: BarChart2, show: true },
    { name: "Referensi IS2020", href: "/referensi/is2020", icon: BookOpen, show: true },
    
    // KAPRODI + SUPER_ADMIN
    { name: "Master CPL", href: "/master/cpl", icon: Database, show: isSuperAdmin || isKaprodi },
    { name: "Mata Kuliah", href: "/master/mata-kuliah", icon: BookMarked, show: isSuperAdmin || isKaprodi },
    { name: "Peta Kurikulum", href: "/master/peta-kurikulum", icon: Map, show: isSuperAdmin || isKaprodi },
    { name: "Dosir MK", href: "/master/dosir-mk", icon: GraduationCap, show: isSuperAdmin || isKaprodi },
    { name: "Tahun Akademik", href: "/master/tahun-akademik", icon: Database, show: isSuperAdmin || isKaprodi },
    { name: "Profil Lulusan", href: "/master/profil-lulusan", icon: GraduationCap, show: isSuperAdmin || isKaprodi },
    { name: "Data Mahasiswa", href: "/master/mahasiswa", icon: Users, show: isSuperAdmin || isKaprodi },
    
    // DOSEN + KAPRODI + SUPER_ADMIN
    { name: "RPS Saya", href: "/rps", icon: FileText, show: isSuperAdmin || isKaprodi || isDosen },
    { name: "Enrollment", href: "/nilai/enrollment", icon: Users, show: isSuperAdmin || isKaprodi },
    { name: "Input Nilai", href: "/nilai/input", icon: PenSquare, show: isSuperAdmin || isKaprodi || isDosen },
    { name: "Rekap Nilai", href: "/nilai/rekap", icon: BarChart2, show: true },
    
    // SUPER_ADMIN only
    { name: "Manajemen User", href: "/master/users", icon: Users, show: isSuperAdmin },
    { name: "Audit Log", href: "/audit", icon: ShieldAlert, show: isSuperAdmin },
  ].filter(item => item.show)

  const NavLinks = () => (
    <nav className="space-y-1">
      {navItems.map((item) => {
        const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`)
        return (
          <Link
            key={item.name}
            href={item.href}
            onClick={() => setOpen(false)}
            className={cn(
              "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
              isActive 
                ? "bg-blue-50 text-blue-700" 
                : "text-gray-700 hover:bg-gray-100"
            )}
          >
            <item.icon className={cn("h-5 w-5", isActive ? "text-blue-700" : "text-gray-500")} />
            {item.name}
          </Link>
        )
      })}
    </nav>
  )

  const UserProfile = () => (
    <div className="flex flex-col gap-1 p-4 border-b border-gray-200">
      <div className="font-bold text-xl tracking-tight text-blue-900">SIPEKA</div>
      <div className="text-sm font-medium text-gray-500 mb-4">Sistem Informasi</div>
      
      <div className="mt-2 flex flex-col gap-1 bg-gray-50 p-3 rounded-lg border border-gray-100">
        <span className="text-sm font-semibold truncate" title={session?.user?.name || ""}>
          {session?.user?.name}
        </span>
        <span className="text-xs text-gray-500 truncate" title={session?.user?.email || ""}>
          {session?.user?.email}
        </span>
        <Badge variant="outline" className="mt-1 w-fit bg-white text-xs">
          {role}
        </Badge>
      </div>
    </div>
  )

  return (
    <>
      {/* Mobile Sidebar */}
      <div className="lg:hidden flex items-center justify-between p-4 border-b bg-white">
        <div className="font-bold text-xl text-blue-900">SIPEKA</div>
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger render={<Button variant="ghost" size="icon" />}>
            <Menu className="h-6 w-6" />
          </SheetTrigger>
          <SheetContent side="left" className="w-64 p-0 flex flex-col h-full">
            <UserProfile />
            <div className="flex-1 overflow-y-auto p-4">
              <NavLinks />
            </div>
            <div className="p-4 border-t mt-auto">
              <Button 
                variant="outline" 
                className="w-full flex items-center gap-2 text-red-600 hover:text-red-700 hover:bg-red-50"
                onClick={() => signOut({ callbackUrl: "/login" })}
              >
                <LogOut className="h-4 w-4" />
                Logout
              </Button>
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 bg-white border-r min-h-screen">
        <UserProfile />
        <div className="flex-1 overflow-y-auto p-4">
          <NavLinks />
        </div>
        <div className="p-4 border-t mt-auto">
          <Button 
            variant="outline" 
            className="w-full flex items-center gap-2 text-red-600 hover:text-red-700 hover:bg-red-50"
            onClick={() => signOut({ callbackUrl: "/login" })}
          >
            <LogOut className="h-4 w-4" />
            Logout
          </Button>
        </div>
      </aside>
    </>
  )
}
