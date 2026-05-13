"use client"

import { useState } from "react"
import { toast } from "sonner"
import { resetUserPassword } from "./actions"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface ResetPasswordModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  userId: string | null
  userName: string | null
}

export function ResetPasswordModal({ open, onOpenChange, userId, userName }: ResetPasswordModalProps) {
  const [password, setPassword] = useState("")
  const [confirm, setConfirm] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleReset = async () => {
    if (!userId) return
    if (password.length < 8) {
      toast.error("Password minimal 8 karakter")
      return
    }
    if (password !== confirm) {
      toast.error("Konfirmasi password tidak cocok")
      return
    }

    setIsLoading(true)
    try {
      const res = await resetUserPassword(userId, password)
      if (res.success) {
        toast.success("Password berhasil direset")
        onOpenChange(false)
        setPassword("")
        setConfirm("")
      } else {
        toast.error(res.error)
      }
    } catch (e) {
      toast.error("Terjadi kesalahan sistem")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Reset Password</DialogTitle>
          <DialogDescription>
            Atur ulang password untuk user: <span className="font-semibold text-slate-900">{userName}</span>
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="new-password">Password Baru</Label>
            <Input 
              id="new-password" 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Minimal 8 karakter"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirm-password">Konfirmasi Password</Label>
            <Input 
              id="confirm-password" 
              type="password" 
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              placeholder="Ulangi password baru"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Batal</Button>
          <Button onClick={handleReset} disabled={isLoading} className="bg-red-600 hover:bg-red-700">
            {isLoading ? "Memproses..." : "Reset Password"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
