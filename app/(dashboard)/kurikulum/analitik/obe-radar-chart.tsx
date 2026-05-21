"use client"

import {
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip
} from "recharts"

interface ObeRadarChartProps {
  data: {
    category: string
    percentage: number
    fullMark: number
  }[]
}

export function ObeRadarChart({ data }: ObeRadarChartProps) {
  return (
    <div className="w-full h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart cx="50%" cy="50%" outerRadius="70%" data={data}>
          <PolarGrid className="stroke-muted" />
          <PolarAngleAxis 
            dataKey="category" 
            className="text-xs"
            tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
          />
          <PolarRadiusAxis 
            angle={30} 
            domain={[0, 100]} 
            tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }}
            tickFormatter={(value) => `${value}%`}
          />
          <Radar
            name="Coverage"
            dataKey="percentage"
            stroke="#0d9488"
            strokeWidth={2}
            fill="#0d9488"
            fillOpacity={0.3}
          />
          <Tooltip 
            formatter={(value: any) => [`${Number(value).toFixed(1)}%`, 'Coverage']}
            contentStyle={{ backgroundColor: 'hsl(var(--background))', borderColor: 'hsl(var(--border))', borderRadius: '8px' }}
            itemStyle={{ color: 'hsl(var(--foreground))' }}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  )
}
