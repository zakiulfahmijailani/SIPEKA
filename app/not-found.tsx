"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Search } from "lucide-react"

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="h-24 w-24 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-8">
        <Search className="h-12 w-12" />
      </div>
      <h1 className="text-6xl font-black text-blue-900 mb-4">404</h1>
      <h2 className="text-2xl font-bold text-gray-800 mb-2">Halaman Tidak Ditemukan</h2>
      <p className="text-muted-foreground text-center max-w-md mb-8">
        Maaf, halaman yang Anda cari tidak ada atau telah dipindahkan.
      </p>
      <Link href="/dashboard">
        <Button size="lg" className="px-10">Kembali ke Dashboard</Button>
      </Link>
    </div>
  )
}
