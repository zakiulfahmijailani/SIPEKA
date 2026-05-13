"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { updateProgramSettings } from "../profil/actions"
import { Building2, GraduationCap, Target, Save, Loader2 } from "lucide-react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export default function PengaturanClient({ initialSettings }: { initialSettings: any[] }) {
  const [loading, setLoading] = useState(false)
  const [settings, setSettings] = useState<Record<string, string>>(() => {
    const s: Record<string, string> = {
      univ_name: "Universitas XYZ",
      fakultas_name: "Fakultas Teknologi Informasi",
      prodi_name: "Sistem Informasi",
      jenjang: "S1",
      akreditasi: "Unggul",
      kurikulum_year: "2023",
      target_attainment: "75",
      logo_url: ""
    }
    initialSettings.forEach(item => {
      s[item.key] = item.value
    })
    return s
  })

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const res = await updateProgramSettings(settings)
    if (res.success) toast.success("Pengaturan prodi disimpan")
    else toast.error(res.error)
    setLoading(false)
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20">
      <form onSubmit={handleSave} className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Institution Info */}
          <Card className="border-none shadow-md">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Building2 className="h-5 w-5 text-blue-500" /> Identitas Institusi
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Nama Universitas</Label>
                <Input 
                  value={settings.univ_name}
                  onChange={e => setSettings({...settings, univ_name: e.target.value})}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Nama Fakultas</Label>
                <Input 
                  value={settings.fakultas_name}
                  onChange={e => setSettings({...settings, fakultas_name: e.target.value})}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Nama Program Studi</Label>
                <Input 
                  value={settings.prodi_name}
                  onChange={e => setSettings({...settings, prodi_name: e.target.value})}
                  required
                />
              </div>
            </CardContent>
          </Card>

          {/* Academic Info */}
          <Card className="border-none shadow-md">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <GraduationCap className="h-5 w-5 text-purple-500" /> Standar Akademik
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Jenjang</Label>
                  <Select value={settings.jenjang} onValueChange={v => setSettings({...settings, jenjang: v || "S1"})}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="S1">S1</SelectItem>
                      <SelectItem value="S2">S2</SelectItem>
                      <SelectItem value="S3">S3</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Akreditasi</Label>
                  <Select value={settings.akreditasi} onValueChange={v => setSettings({...settings, akreditasi: v || "Unggul"})}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Unggul">Unggul</SelectItem>
                      <SelectItem value="A">A</SelectItem>
                      <SelectItem value="Baik Sekali">Baik Sekali</SelectItem>
                      <SelectItem value="B">B</SelectItem>
                      <SelectItem value="Baik">Baik</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Tahun Kurikulum</Label>
                <Input 
                  value={settings.kurikulum_year}
                  onChange={e => setSettings({...settings, kurikulum_year: e.target.value})}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  Target CPL Attainment (%) <Target className="h-3 w-3 text-red-500" />
                </Label>
                <Input 
                  type="number"
                  value={settings.target_attainment}
                  onChange={e => setSettings({...settings, target_attainment: e.target.value})}
                  required
                />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-end">
          <Button type="submit" size="lg" className="px-10 gap-2 shadow-lg" disabled={loading}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Simpan Pengaturan
          </Button>
        </div>
      </form>
    </div>
  )
}
