"use client"

import {
  Bar,
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"

interface SksBarChartProps {
  data: {
    semester: number
    sksWajib: number
    sksPilihanDitawarkan: number
    bebanResmi: number
  }[]
}

type TooltipPayloadItem = {
  dataKey?: string | number
  value?: string | number
}

type CustomTooltipProps = {
  active?: boolean
  payload?: TooltipPayloadItem[]
  label?: string | number
}

const CustomTooltip = ({ active, payload, label }: CustomTooltipProps) => {
  if (!active || !payload?.length) return null

  const getValue = (dataKey: string) =>
    Number(payload.find((item) => item.dataKey === dataKey)?.value ?? 0)
  const wajib = getValue("sksWajib")
  const pilihan = getValue("sksPilihanDitawarkan")
  const resmi = getValue("bebanResmi")

  return (
    <div className="rounded-lg border border-border bg-background p-3 shadow-md">
      <p className="mb-1 font-semibold text-foreground">{label}</p>
      <p className="text-sm text-teal-600">Wajib: {wajib} SKS</p>
      <p className="text-sm text-orange-600">Pilihan ditawarkan: {pilihan} SKS</p>
      <div className="my-1 border-t border-border" />
      <p className="text-sm text-muted-foreground">Total ditawarkan: {wajib + pilihan} SKS</p>
      <p className="text-sm font-medium text-blue-700">Beban resmi: {resmi} SKS</p>
    </div>
  )
}

export function SksBarChart({ data }: SksBarChartProps) {
  const enrichedData = data.map((item) => ({
    ...item,
    name: `Semester ${item.semester}`,
  }))

  return (
    <div className="h-[320px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart
          data={enrichedData}
          margin={{ top: 20, right: 30, left: -10, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" vertical={false} />
          <XAxis dataKey="name" className="fill-muted-foreground text-xs" tickLine={false} axisLine={false} />
          <YAxis className="fill-muted-foreground text-xs" tickLine={false} axisLine={false} />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: "hsl(var(--muted))", opacity: 0.2 }} />
          <Legend wrapperStyle={{ paddingTop: "20px" }} />
          <Bar dataKey="sksWajib" name="SKS Wajib" stackId="offered" fill="#0d9488" radius={[0, 0, 4, 4]} />
          <Bar dataKey="sksPilihanDitawarkan" name="Pilihan Ditawarkan" stackId="offered" fill="#ea580c" radius={[4, 4, 0, 0]} />
          <Line dataKey="bebanResmi" name="Beban Resmi" type="monotone" stroke="#2563eb" strokeWidth={2.5} dot={{ r: 3 }} />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  )
}
