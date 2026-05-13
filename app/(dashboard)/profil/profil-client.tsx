"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { updateProfile, changePassword } from "./actions"
import { User, Lock, Save, Key } from "lucide-react"

export default function ProfilClient({ user }: { user: any }) {
  const [loading, setLoading] = useState(false)
  const [profileData, setProfileData] = useState({
    nama_lengkap: user.nama_lengkap || "",
    email: user.email || "",
    nidn: user.nidn || ""
  })

  const [passData, setPassData] = useState({
    current: "",
    new: "",
    confirm: ""
  })

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const res = await updateProfile(profileData)
    if (res.success) toast.success("Profil diperbarui")
    else toast.error(res.error)
    setLoading(false)
  }

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (passData.new !== passData.confirm) return toast.error("Konfirmasi password tidak cocok")
    if (passData.new.length < 8) return toast.error("Password minimal 8 karakter")
    
    setLoading(true)
    const res = await changePassword({ current: passData.current, new: passData.new })
    if (res.success) {
      toast.success("Password berhasil diganti")
      setPassData({ current: "", new: "", confirm: "" })
    } else toast.error(res.error)
    setLoading(false)
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20">
      <div className="flex items-center gap-6 p-6 bg-white border rounded-xl shadow-sm">
         <div className="h-20 w-20 rounded-full bg-blue-100 flex items-center justify-center text-2xl font-bold text-blue-600 border-4 border-blue-50">
            {user.nama_lengkap.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase()}
         </div>
         <div>
            <h1 className="text-2xl font-bold">{user.nama_lengkap}</h1>
            <p className="text-muted-foreground">{user.role} • {user.email}</p>
         </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Profile Info */}
        <Card className="border-none shadow-md">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <User className="h-5 w-5 text-blue-500" /> Informasi Profil
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div className="space-y-2">
                <Label>Nama Lengkap</Label>
                <Input 
                  value={profileData.nama_lengkap}
                  onChange={e => setProfileData({...profileData, nama_lengkap: e.target.value})}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input 
                  type="email"
                  value={profileData.email}
                  onChange={e => setProfileData({...profileData, email: e.target.value})}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>NIDN / NIP</Label>
                <Input 
                  value={profileData.nidn}
                  onChange={e => setProfileData({...profileData, nidn: e.target.value})}
                />
              </div>
              <Button type="submit" className="w-full gap-2" disabled={loading}>
                <Save className="h-4 w-4" /> Simpan Perubahan
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Change Password */}
        <Card className="border-none shadow-md">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Lock className="h-5 w-5 text-amber-500" /> Keamanan
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleChangePassword} className="space-y-4">
              <div className="space-y-2">
                <Label>Password Lama</Label>
                <Input 
                  type="password"
                  value={passData.current}
                  onChange={e => setPassData({...passData, current: e.target.value})}
                  required
                />
              </div>
              <Separator className="my-4" />
              <div className="space-y-2">
                <Label>Password Baru</Label>
                <Input 
                  type="password"
                  value={passData.new}
                  onChange={e => setPassData({...passData, new: e.target.value})}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Konfirmasi Password Baru</Label>
                <Input 
                  type="password"
                  value={passData.confirm}
                  onChange={e => setPassData({...passData, confirm: e.target.value})}
                  required
                />
              </div>
              <Button type="submit" variant="secondary" className="w-full gap-2" disabled={loading}>
                <Key className="h-4 w-4" /> Ganti Password
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

import { Separator } from "@/components/ui/separator"
