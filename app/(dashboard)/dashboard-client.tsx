"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Cell
} from "recharts"
import { 
  Users, BookOpen, Clock, Target, ArrowRight, CheckCircle2, 
  AlertCircle, FileText, PenSquare, History 
} from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"

export function DashboardClient({ stats, role }: { stats: any; role: string }) {
  if (role === "SUPER_ADMIN" || role === "KAPRODI") {
    return (
      <div className="space-y-8 pb-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.kpi.map((k: any) => (
            <Card key={k.label} className="border-none shadow-md overflow-hidden relative group">
              <div className={cn(
                "absolute top-0 left-0 w-1 h-full",
                k.color === "blue" ? "bg-blue-500" :
                k.color === "purple" ? "bg-purple-500" :
                k.color === "red" ? "bg-red-500" : "bg-green-500"
              )} />
              <CardHeader className="pb-2">
                <CardDescription className="text-[10px] uppercase font-bold tracking-wider">{k.label}</CardDescription>
                <CardTitle className="text-3xl font-black">
                  {k.value}
                  {k.badge && <Badge variant="destructive" className="ml-2 animate-pulse">Action Required</Badge>}
                </CardTitle>
              </CardHeader>
              <CardContent>
                 <div className="flex items-center gap-2 text-xs text-muted-foreground group-hover:text-foreground transition-colors">
                    {k.color === "blue" ? <Users className="h-4 w-4" /> :
                     k.color === "purple" ? <BookOpen className="h-4 w-4" /> :
                     k.color === "red" ? <Clock className="h-4 w-4" /> : <Target className="h-4 w-4" />}
                    <span>Update terakhir: Hari ini</span>
                 </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
           {/* Grades Distribution */}
           <Card className="border-none shadow-md">
             <CardHeader>
               <CardTitle className="text-lg">Distribusi Nilai (Grade)</CardTitle>
               <CardDescription>Seluruh mata kuliah di semester berjalan</CardDescription>
             </CardHeader>
             <CardContent className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stats.charts.grades}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="grade" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
             </CardContent>
           </Card>

           {/* CPL Radar Snapshot */}
           <Card className="border-none shadow-md">
             <CardHeader>
               <CardTitle className="text-lg">CPL Attainment Snapshot</CardTitle>
               <CardDescription>Rata-rata ketercapaian kompetensi mahasiswa</CardDescription>
             </CardHeader>
             <CardContent className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="80%" data={stats.charts.cplRadar}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="subject" />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} />
                    <Radar name="Attainment" dataKey="attainment" stroke="#2563eb" fill="#3b82f6" fillOpacity={0.6} />
                  </RadarChart>
                </ResponsiveContainer>
             </CardContent>
           </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
           {/* Pending RPS */}
           <Card className="lg:col-span-2 border-none shadow-md">
             <CardHeader className="flex flex-row items-center justify-between">
               <CardTitle className="text-lg flex items-center gap-2">
                 <FileText className="h-5 w-5 text-red-500" /> RPS Menunggu Approval
               </CardTitle>
               <Link href="/rps" className="text-xs text-blue-600 hover:underline">Lihat Semua</Link>
             </CardHeader>
             <CardContent>
                <div className="space-y-4">
                  {stats.recentRps.length > 0 ? stats.recentRps.map((r: any) => (
                    <div key={r.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition-colors">
                      <div className="flex gap-4 items-center">
                        <div className="h-10 w-10 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center font-bold">
                           {r.dosirMk.mk.kode.substring(0, 2)}
                        </div>
                        <div>
                          <p className="font-bold text-sm">{r.dosirMk.mk.nama_id}</p>
                          <p className="text-[10px] text-muted-foreground uppercase">Dosen: {r.dosirMk.dosen.nama_lengkap} • Kelas: {r.dosirMk.kelas}</p>
                        </div>
                      </div>
                      <Link 
                        href={`/rps/${r.dosir_mk_id}`}
                        className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "text-blue-600 gap-2")}
                      >
                        Review <ArrowRight className="h-4 w-4" />
                      </Link>
                    </div>
                  )) : (
                    <div className="py-10 text-center text-muted-foreground italic">Tidak ada RPS menunggu approval.</div>
                  )}
                </div>
             </CardContent>
           </Card>

           {/* Recent Activity */}
           <Card className="border-none shadow-md">
             <CardHeader>
               <CardTitle className="text-lg flex items-center gap-2">
                 <History className="h-5 w-5 text-blue-500" /> Aktivitas Terbaru
               </CardTitle>
             </CardHeader>
             <CardContent>
                <div className="space-y-6">
                  {stats.recentActivity.map((act: any) => (
                    <div key={act.id} className="flex gap-3">
                       <div className="mt-1">
                          <div className="h-2 w-2 rounded-full bg-blue-400" />
                       </div>
                       <div className="space-y-1">
                          <p className="text-xs leading-relaxed">
                            <span className="font-bold">{act.changedBy.nama_lengkap}</span> {act.description}
                          </p>
                          <p className="text-[10px] text-muted-foreground">{new Date(act.created_at).toLocaleTimeString()}</p>
                       </div>
                    </div>
                  ))}
                </div>
             </CardContent>
           </Card>
        </div>
      </div>
    )
  }

  // DOSEN DASHBOARD
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {stats.myDosirs.map((d: any) => (
          <Card key={d.id} className="border-none shadow-md hover:ring-2 ring-blue-100 transition-all">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                 <Badge variant="outline" className="mb-2">{d.kelas}</Badge>
                 {d.statusRps === "APPROVED" ? <CheckCircle2 className="h-5 w-5 text-green-500" /> : <AlertCircle className="h-5 w-5 text-amber-500" />}
              </div>
              <CardTitle className="text-xl font-bold">{d.mk}</CardTitle>
              <CardDescription className="text-xs font-mono">Status RPS: {d.statusRps}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
               <div className="space-y-1">
                  <div className="flex justify-between text-xs mb-1">
                     <span className="text-muted-foreground">Progress Input Nilai</span>
                     <span className="font-bold">{d.progress}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                     <div className="h-full bg-blue-600 transition-all duration-500" style={{ width: `${d.progress}%` }} />
                  </div>
               </div>

               <div className="flex gap-2 pt-2">
                  <Link 
                    href="/nilai/input" 
                    className={cn(buttonVariants({ variant: "outline", size: "sm" }), "flex-1 gap-2")}
                  >
                    <PenSquare className="h-4 w-4" /> Nilai
                  </Link>
                  <Link 
                    href={`/rps/${d.id}`} 
                    className={cn(buttonVariants({ variant: "default", size: "sm" }), "flex-1 gap-2")}
                  >
                    <FileText className="h-4 w-4" /> Edit RPS
                  </Link>
               </div>
            </CardContent>
          </Card>
        ))}
      </div>
      
      {stats.myDosirs.length === 0 && (
        <div className="py-20 text-center space-y-4 border-2 border-dashed rounded-xl bg-gray-50/50">
           <BookOpen className="h-12 w-12 mx-auto text-gray-300" />
           <div>
             <p className="text-xl font-bold text-gray-500">Belum ada mata kuliah</p>
             <p className="text-sm text-gray-400">Hubungi Kaprodi untuk penugasan Dosir MK semester ini.</p>
           </div>
        </div>
      )}
    </div>
  )
}
