"use client"

import { useState, useEffect, useCallback } from "react"
import { cn } from "@/lib/utils"
import { Button, buttonVariants } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  Book, 
  Target, 
  ClipboardList, 
  CalendarDays, 
  Library, 
  FileCheck, 
  ArrowLeft,
  Save,
  Send,
  CheckCircle,
  MessageSquare
} from "lucide-react"
import Link from "next/link"
import { debounce } from "lodash"
import { toast } from "sonner"

// Komponen Seksi
import { IdentitasSection } from "./sections/Identitas"
import { CplSection } from "./sections/CplMapping"
import { CpmkSection } from "./sections/Cpmk"
import { AssessmentSection } from "./sections/Assessment"
import { MeetingsSection } from "./sections/Meetings"
import { ReferencesSection } from "./sections/References"
import { PreviewSection } from "./sections/Preview"

import { createOrGetRps, updateRpsStatus } from "../actions"

interface RpsEditorProps {
  dosir: any
  initialRps: any | null
  mappedCpls: any[]
  currentUser: any
}

export type SectionType = "IDENTITAS" | "CPL" | "CPMK" | "ASSESSMENT" | "MEETINGS" | "REFERENCES" | "PREVIEW"

const STATUS_LABEL: Record<string, string> = {
  DRAFT:             "Draf",
  SUBMITTED:         "Menunggu Persetujuan",
  APPROVED:          "Disetujui",
  REVISION_REQUIRED: "Perlu Revisi",
}

export function RpsEditor({ dosir, initialRps, mappedCpls, currentUser }: RpsEditorProps) {
  const [activeSection, setActiveSection] = useState<SectionType>("IDENTITAS")
  const [rpsData, setRpsData] = useState(initialRps)
  const [isSaving, setIsSaving] = useState(false)

  const sections = [
    { id: "IDENTITAS",  label: "Identitas MK",          icon: Book },
    { id: "CPL",        label: "CPL Dibebankan",         icon: Target },
    { id: "CPMK",       label: "CPMK & Sub-CPMK",        icon: Target },
    { id: "ASSESSMENT", label: "Komponen Penilaian",     icon: ClipboardList },
    { id: "MEETINGS",   label: "Rencana Pertemuan",      icon: CalendarDays },
    { id: "REFERENCES", label: "Referensi",               icon: Library },
    { id: "PREVIEW",    label: "Pratinjau & Ajukan",      icon: FileCheck },
  ]

  // Inisialisasi RPS jika belum ada
  useEffect(() => {
    if (!initialRps) {
      const init = async () => {
        const res = await createOrGetRps(dosir.id)
        if (res.success) setRpsData(res.data)
      }
      init()
    }
  }, [initialRps, dosir.id])

  const handleStatusChange = async (status: string, catatan?: string) => {
    if (!rpsData) return
    setIsSaving(true)
    const res = await updateRpsStatus(rpsData.id, status, catatan)
    if (res.success) {
      toast.success(`Status RPS diubah menjadi ${STATUS_LABEL[status] ?? status}`)
      window.location.reload()
    } else {
      toast.error(res.error || "Gagal mengubah status")
    }
    setIsSaving(false)
  }

  const renderSection = () => {
    if (!rpsData) return <div className="p-8 text-center">Menginisialisasi RPS...</div>

    switch (activeSection) {
      case "IDENTITAS":  return <IdentitasSection dosir={dosir} />
      case "CPL":        return <CplSection cpls={mappedCpls} />
      case "CPMK":       return <CpmkSection rpsId={rpsData.id} initialCpmks={rpsData.cpmks || []} mappedCpls={mappedCpls} />
      case "ASSESSMENT": return <AssessmentSection rpsId={rpsData.id} initialKomponens={rpsData.komponens || []} cpmks={rpsData.cpmks || []} />
      case "MEETINGS":   return <MeetingsSection rpsId={rpsData.id} initialMeetings={rpsData.pertemuans || []} />
      case "REFERENCES": return <ReferencesSection rpsId={rpsData.id} initialReferences={rpsData.referensis || []} />
      case "PREVIEW":    return <PreviewSection dosir={dosir} rps={rpsData} mappedCpls={mappedCpls} onStatusChange={handleStatusChange} currentUser={currentUser} />
      default:           return null
    }
  }

  const status = rpsData?.status || "DRAFT"

  return (
    <div className="flex flex-col h-full -m-6">
      {/* Header Atas */}
      <div className="bg-white border-b px-6 py-4 flex items-center justify-between sticky top-0 z-20">
        <div className="flex items-center gap-4">
          <Link
            href="/rps"
            className={cn(buttonVariants({ variant: "ghost", size: "icon" }))}
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="font-bold text-lg leading-none">{dosir.mk.nama_id}</h1>
            <p className="text-xs text-muted-foreground mt-1">
              Editor RPS • Versi {rpsData?.version || 1} • {dosir.tahunAkademik.kode}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex flex-col items-end mr-2">
            <Badge className={cn(
              "text-[10px]",
              status === "APPROVED"          ? "bg-green-600" :
              status === "SUBMITTED"         ? "bg-yellow-600" :
              status === "REVISION_REQUIRED" ? "bg-red-600" :
                                              "bg-gray-600"
            )}>
              {STATUS_LABEL[status] ?? status}
            </Badge>
          </div>
          {status === "DRAFT" || status === "REVISION_REQUIRED" ? (
            <Button size="sm" className="gap-2" onClick={() => setActiveSection("PREVIEW")}>
              <Send className="h-4 w-4" /> Ajukan RPS
            </Button>
          ) : currentUser.role !== "DOSEN" && status === "SUBMITTED" ? (
            <Button size="sm" className="gap-2 bg-green-600 hover:bg-green-700" onClick={() => setActiveSection("PREVIEW")}>
              <CheckCircle className="h-4 w-4" /> Tinjau & Setujui
            </Button>
          ) : null}
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Navigasi Sidebar Kiri */}
        <div className="w-64 border-r bg-gray-50/50 flex flex-col p-4 space-y-1">
          {sections.map((s) => (
            <button
              key={s.id}
              onClick={() => setActiveSection(s.id as SectionType)}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-all text-left",
                activeSection === s.id
                  ? "bg-blue-600 text-white shadow-sm"
                  : "text-gray-600 hover:bg-gray-100"
              )}
            >
              <s.icon className={cn("h-4 w-4", activeSection === s.id ? "text-white" : "text-gray-400")} />
              {s.label}
            </button>
          ))}

          {rpsData?.catatan_reviewer && (
            <div className="mt-8 p-3 bg-red-50 border border-red-100 rounded-md">
              <p className="text-[10px] font-bold text-red-600 flex items-center gap-1 mb-1 uppercase">
                <MessageSquare className="h-3 w-3" /> Catatan Tinjauan
              </p>
              <p className="text-xs text-red-800 italic">"{rpsData.catatan_reviewer}"</p>
            </div>
          )}
        </div>

        {/* Area Konten Utama */}
        <div className="flex-1 overflow-y-auto p-8 bg-white">
          <div className="max-w-4xl mx-auto">
            {renderSection()}
          </div>
        </div>
      </div>
    </div>
  )
}
