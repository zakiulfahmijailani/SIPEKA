"use client"

import { useState, useEffect } from "react"
import { Bell, Check, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { useRouter } from "next/navigation"

export function NotificationBell({ userId }: { userId: string }) {
  const [notifications, setNotifications] = useState<any[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const router = useRouter()

  const fetchNotifications = async () => {
    const res = await fetch(`/api/notifications?userId=${userId}`)
    const data = await res.json()
    if (data.success) {
      setNotifications(data.data)
      setUnreadCount(data.data.filter((n: any) => !n.is_read).length)
    }
  }

  useEffect(() => {
    fetchNotifications()
    // Poll every 30 seconds
    const interval = setInterval(fetchNotifications, 30000)
    return () => clearInterval(interval)
  }, [userId])

  const markAsRead = async (id: string) => {
    await fetch(`/api/notifications/${id}/read`, { method: "POST" })
    fetchNotifications()
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger render={<Button variant="ghost" size="icon" className="relative" />}>
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-red-500 border-2 border-white">
            {unreadCount}
          </Badge>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-80" align="end">
        <DropdownMenuLabel className="flex justify-between items-center">
          Notifikasi
          {unreadCount > 0 && <span className="text-[10px] text-blue-600 font-normal">Baru ({unreadCount})</span>}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <div className="max-h-[300px] overflow-y-auto">
          {notifications.length > 0 ? (
            notifications.map((n) => (
              <DropdownMenuItem 
                key={n.id} 
                className={cn(
                  "flex flex-col items-start gap-1 p-3 cursor-pointer",
                  !n.is_read ? "bg-blue-50/50" : ""
                )}
                onClick={() => {
                  if (!n.is_read) markAsRead(n.id)
                  if (n.link) router.push(n.link)
                }}
              >
                <p className="text-xs leading-tight">{n.message}</p>
                <div className="flex justify-between w-full items-center">
                  <span className="text-[10px] text-muted-foreground">
                    {new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                  {!n.is_read && <Check className="h-3 w-3 text-blue-500" />}
                </div>
              </DropdownMenuItem>
            ))
          ) : (
            <div className="py-8 text-center text-xs text-muted-foreground italic">
              Tidak ada notifikasi.
            </div>
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

import { cn } from "@/lib/utils"
