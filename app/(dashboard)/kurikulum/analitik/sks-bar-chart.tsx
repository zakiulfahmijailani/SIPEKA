"use client"

import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  TooltipProps
} from "recharts"

interface SksBarChartProps {
  data: {
    semester: number
    sksTeori: number
    sksPraktik: number
  }[]
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const teori = payload.find((p: any) => p.dataKey === 'sksTeori')?.value || 0;
    const praktik = payload.find((p: any) => p.dataKey === 'sksPraktik')?.value || 0;
    const total = teori + praktik;

    return (
      <div className="bg-background border border-border p-3 rounded-lg shadow-md">
        <p className="font-semibold text-foreground mb-1">{label}</p>
        <p className="text-sm" style={{ color: '#0d9488' }}>Teori: {teori} SKS</p>
        <p className="text-sm" style={{ color: '#ea580c' }}>Praktik: {praktik} SKS</p>
        <div className="my-1 border-t border-border" />
        <p className="text-sm font-medium text-foreground">Total: {total} SKS</p>
      </div>
    );
  }
  return null;
};

export function SksBarChart({ data }: SksBarChartProps) {
  const enrichedData = data.map(d => ({
    ...d,
    name: `Semester ${d.semester}`
  }))

  return (
    <div className="w-full h-[320px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={enrichedData}
          margin={{
            top: 20,
            right: 30,
            left: -10,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" vertical={false} />
          <XAxis 
            dataKey="name" 
            className="text-xs fill-muted-foreground"
            tickLine={false}
            axisLine={false}
          />
          <YAxis 
            className="text-xs fill-muted-foreground"
            tickLine={false}
            axisLine={false}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'hsl(var(--muted))', opacity: 0.2 }} />
          <Legend wrapperStyle={{ paddingTop: '20px' }} />
          <ReferenceLine 
            y={22} 
            stroke="#ef4444" 
            strokeDasharray="3 3" 
            label={{ position: 'top', value: 'Batas Ideal', fill: '#ef4444', fontSize: 12 }} 
          />
          <Bar dataKey="sksTeori" name="SKS Teori" fill="#0d9488" radius={[4, 4, 0, 0]} />
          <Bar dataKey="sksPraktik" name="SKS Praktik" fill="#ea580c" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
