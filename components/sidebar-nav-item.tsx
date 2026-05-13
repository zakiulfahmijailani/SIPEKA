"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { LucideIcon } from "lucide-react"

interface SidebarNavItemProps {
  href: string
  label: string
  icon: LucideIcon
  exactMatch?: boolean // aktif hanya jika path persis sama
}

/**
 * SidebarNavItem — nav item sidebar dengan active state otomatis.
 * Gunakan sebagai pengganti <Link> manual di sidebar.
 *
 * Active state: background abu muda + teks hitam + icon lebih gelap.
 * Hover state: background abu sangat muda.
 * Inactive: teks abu, icon abu.
 *
 * @example
 * <SidebarNavItem href="/dashboard" label="Dashboard" icon={LayoutDashboard} exactMatch />
 * <SidebarNavItem href="/rps" label="RPS" icon={FileText} />
 */
export function SidebarNavItem({ href, label, icon: Icon, exactMatch = false }: SidebarNavItemProps) {
  const pathname = usePathname()
  const isActive = exactMatch ? pathname === href : pathname.startsWith(href)

  return (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all duration-150",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-900/20",
        isActive
          ? "bg-gray-100 text-gray-900 font-medium"
          : "text-gray-500 hover:bg-gray-50 hover:text-gray-800"
      )}
      aria-current={isActive ? "page" : undefined}
    >
      <Icon
        className={cn(
          "h-4 w-4 shrink-0 transition-colors",
          isActive ? "text-gray-700" : "text-gray-400"
        )}
        strokeWidth={isActive ? 2 : 1.75}
      />
      <span className="truncate">{label}</span>
      {isActive && (
        <span className="ml-auto h-1.5 w-1.5 rounded-full bg-gray-700 shrink-0" aria-hidden />
      )}
    </Link>
  )
}
