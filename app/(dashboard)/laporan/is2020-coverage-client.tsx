"use client"

import { useState, useEffect } from "react"
import { 
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell,
} from 'recharts'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Check, Lightbulb } from "lucide-react"
import { getIs2020Coverage } from "./actions"
import { toast } from "sonner"
import { CplAttainmentSkeleton } from "@/components/skeletons"
import { IS2020NoCurriculumEmpty, IS2020NoMappingEmpty } from "@/components/empty-states"

const COLORS = ['#2563eb', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4']

export default function Is2020CoverageClient() {
  const [data, setData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true)
      setHasError(false)
      const res = await getIs2020Coverage()
      if (res.success) {
        setData(res.data)
      } else {
        setHasError(true)
        toast.error(res.error)
      }
      setIsLoading(false)
    }
    fetchData()
  }, [])

  if (isLoading) return <CplAttainmentSkeleton />

  if (hasError || !data) return <IS2020NoCurriculumEmpty />

  // No mapping yet (matrix is empty)
  if (!data.matrix || data.matrix.length === 0) return <IS2020NoMappingEmpty />

  const gaps = data.realmSummary.filter((r: any) => r.percentage < 100)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">IS2020 Coverage Analysis</h1>
        <p className="text-muted-foreground">Kesesuaian kurikulum prodi dengan standar kurikulum internasional ACM/AIS IS2020</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Realm Coverage Bar Chart */}
        <Card className="lg:col-span-2 border-none shadow-md">
          <CardHeader>
            <CardTitle>Coverage per Realm</CardTitle>
            <CardDescription>% Knowledge Areas (KA) yang terwakili oleh Mata Kuliah</CardDescription>
          </CardHeader>
          <CardContent className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.realmSummary} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                <XAxis type="number" domain={[0, 100]} />
                <YAxis dataKey="name" type="category" width={150} tick={{ fontSize: 10 }} />
                <Tooltip />
                <Bar dataKey="percentage" radius={[0, 4, 4, 0]}>
                  {data.realmSummary.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Gap Insights */}
        <Card className="border-none shadow-md bg-amber-50">
          <CardHeader>
            <CardTitle className="text-amber-800 flex items-center gap-2">
              <Lightbulb className="h-5 w-5" /> Curriculum Gaps
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {gaps.length > 0 ? gaps.map((g: any) => (
              <div key={g.name} className="space-y-1">
                <p className="text-sm font-bold text-amber-900">{g.name}</p>
                <div className="flex justify-between items-center text-xs">
                  <span>Covered: {g.covered}/{g.total} KA</span>
                  <span className="font-mono">{g.percentage.toFixed(0)}%</span>
                </div>
                <div className="w-full h-1.5 bg-amber-200 rounded-full overflow-hidden">
                  <div className="h-full bg-amber-600" style={{ width: `${g.percentage}%` }} />
                </div>
              </div>
            )) : (
              <p className="text-sm text-green-700 italic">Kurikulum sudah meng-cover seluruh Realm IS2020!</p>
            )}
            <div className="pt-4 border-t border-amber-200">
              <p className="text-[10px] text-amber-700 font-medium">REKOMENDASI:</p>
              <p className="text-xs text-amber-800">Tingkatkan cakupan pada Realm dengan persentase rendah melalui penajaman materi RPS atau penambahan MK pilihan baru.</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Matrix Coverage Table */}
      <Card className="border-none shadow-md overflow-hidden">
        <CardHeader className="bg-gray-50 border-b">
          <CardTitle>Matrix: Knowledge Areas vs Mata Kuliah</CardTitle>
        </CardHeader>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-gray-100">
              <TableRow>
                <TableHead className="min-w-[200px] sticky left-0 bg-gray-100 z-10">Knowledge Area (ACM/AIS)</TableHead>
                {data.allMkCodes.map((code: string) => (
                  <TableHead key={code} className="text-center text-[10px] min-w-[60px]">{code}</TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.matrix.map((row: any) => (
                <TableRow key={row.kaId}>
                  <TableCell className="sticky left-0 bg-white z-10 border-r">
                    <div className="flex flex-col">
                      <span className="text-[10px] uppercase font-bold text-muted-foreground">{row.realm}</span>
                      <span className="text-xs font-medium">{row.kaName}</span>
                    </div>
                  </TableCell>
                  {data.allMkCodes.map((code: string) => (
                    <TableCell key={code} className="text-center">
                      {row[code] ? (
                        <div className="flex justify-center">
                          <div className="h-5 w-5 bg-green-100 text-green-700 rounded-full flex items-center justify-center">
                            <Check className="h-3 w-3" />
                          </div>
                        </div>
                      ) : <span className="text-gray-200">-</span>}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  )
}
