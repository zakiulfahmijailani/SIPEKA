// --------------------------------------
// Barrel re-export — semua skeleton tersedia dari @/components/skeletons
// Source of truth: components/skeletons/index.ts
// --------------------------------------
export * from "./skeletons/index"

// --------------------------------------------------------
// Legacy aliases (agar import lama tidak breaking)
// --------------------------------------------------------
import { cn } from "@/lib/utils"
import React from "react"

function ShimmerBlock({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <div className={cn("relative overflow-hidden bg-gray-100 rounded-lg", className)} style={style}>
      <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/60 to-transparent" />
    </div>
  )
}

export function CplAttainmentSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="space-y-2">
          <ShimmerBlock className="h-7 w-48" />
          <ShimmerBlock className="h-4 w-64" />
        </div>
        <div className="flex gap-2">
          <ShimmerBlock className="h-9 w-28" />
          <ShimmerBlock className="h-9 w-16" />
        </div>
      </div>
      <div className="grid grid-cols-3 gap-3">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="border border-gray-100 rounded-lg px-5 py-4 space-y-2">
            <ShimmerBlock className="h-3 w-16" />
            <ShimmerBlock className="h-8 w-12" />
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="border border-gray-100 rounded-lg p-5 space-y-3">
          <ShimmerBlock className="h-4 w-32" />
          <ShimmerBlock className="h-[280px] w-full" />
        </div>
        <div className="border border-gray-100 rounded-lg p-5 space-y-3">
          <ShimmerBlock className="h-4 w-40" />
          <ShimmerBlock className="h-[280px] w-full" />
        </div>
      </div>
    </div>
  )
}

export function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <ShimmerBlock className="h-7 w-48" />
        <ShimmerBlock className="h-4 w-72" />
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="border border-gray-100 rounded-xl p-5 space-y-3">
            <ShimmerBlock className="h-3 w-24" />
            <ShimmerBlock className="h-8 w-20" />
          </div>
        ))}
      </div>
    </div>
  )
}

export function ListPageSkeleton() {
  return <TableSkeletonLegacy cols={4} rows={8} />
}

export function FormPageSkeleton() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <ShimmerBlock className="h-6 w-40" />
        <ShimmerBlock className="h-4 w-64" />
      </div>
      <div className="border border-gray-100 rounded-xl p-6 space-y-5">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="space-y-2">
            <ShimmerBlock className="h-3.5 w-24" />
            <ShimmerBlock className="h-10 w-full rounded-md" />
          </div>
        ))}
      </div>
    </div>
  )
}

export function DetailPageSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div className="space-y-2">
          <ShimmerBlock className="h-7 w-56" />
          <ShimmerBlock className="h-4 w-80" />
        </div>
      </div>
      <div className="border border-gray-100 rounded-xl p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-5">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="space-y-1.5">
              <ShimmerBlock className="h-3.5 w-24" />
              <ShimmerBlock className="h-5 w-32" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export function CardGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <ShimmerBlock className="h-6 w-48" />
        <ShimmerBlock className="h-9 w-32 rounded-lg" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(count)].map((_, i) => (
          <div key={i} className="border border-gray-100 rounded-xl p-5 space-y-3">
            <ShimmerBlock className="h-4 w-32" />
            <ShimmerBlock className="h-3 w-full" />
          </div>
        ))}
      </div>
    </div>
  )
}

export function StatCardSkeleton() {
  return (
    <div className="border border-gray-100 rounded-xl p-5 space-y-3">
      <div className="flex justify-between items-center">
        <ShimmerBlock className="h-3.5 w-28" />
        <ShimmerBlock className="h-8 w-8 rounded-lg" />
      </div>
      <ShimmerBlock className="h-8 w-20" />
      <ShimmerBlock className="h-3 w-36" />
    </div>
  )
}

export function InputNilaiSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="space-y-2">
          <ShimmerBlock className="h-7 w-40" />
          <ShimmerBlock className="h-4 w-64" />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="md:col-span-1 border border-gray-100 rounded-xl p-4 space-y-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="p-3 border border-gray-100 rounded-lg space-y-2">
              <ShimmerBlock className="h-4 w-full" />
            </div>
          ))}
        </div>
        <div className="md:col-span-3 border border-gray-100 rounded-xl overflow-hidden">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="px-5 py-3 flex items-center gap-6 border-b border-gray-50">
              <ShimmerBlock className="h-4 w-16" />
              <ShimmerBlock className="h-4 w-36" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function TableSkeletonLegacy({ cols = 4, rows = 6 }: { cols?: number; rows?: number }) {
  return (
    <div className="space-y-4">
      <div className="border border-gray-100 rounded-xl overflow-hidden">
        <div
          className="bg-gray-50 px-5 py-3.5 grid gap-4 border-b border-gray-100"
          style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}
        >
          {[...Array(cols)].map((_, i) => (
            <ShimmerBlock key={i} className="h-3.5" style={{ width: `${50 + (i % 3) * 20}px` }} />
          ))}
        </div>
        {[...Array(rows)].map((_, i) => (
          <div
            key={i}
            className="px-5 py-3.5 grid gap-4 items-center border-b border-gray-50 last:border-0"
            style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}
          >
            {[...Array(cols)].map((_, j) => (
              <ShimmerBlock key={j} className="h-4" style={{ width: `${40 + (j % 4) * 15}px` }} />
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}
