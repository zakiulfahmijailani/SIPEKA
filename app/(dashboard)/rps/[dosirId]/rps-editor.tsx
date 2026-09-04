"use client"

import { useState, useEffect, useCallback, useRef } from "react"
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
  Send,
  CheckCircle,
  MessageSquare,
  Files,
  Save,
  Loader2,
  AlertCircle,
  RefreshCw,
} from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"

// Komponen Seksi
import { IdentitasSection } from "./sections/Identitas"
import { FormalitiesSection } from "./sections/Formalities"
import { CplSection } from "./sections/CplMapping"
import { CpmkSection } from "./sections/Cpmk"
import { AssessmentSection } from "./sections/Assessment"
import { MeetingsSection } from "./sections/Meetings"
import { ReferencesSection } from "./sections/References"
import { PreviewSection } from "./sections/Preview"
import type { RegisterRpsSectionSave, RpsSectionSave } from "./rps-save-progress"

import { 
  createOrGetRps, 
  saveRpsProgress, 
  updateRpsStatus, 
  getRpsCpmks,
  getRpsMeetings,
  getRpsAssessments,
  getRpsReferences,
  getRpsPreviewData,
  type RpsStatus 
} from "../actions"

interface RpsEditorProps {
  dosir: any
  initialRps: any | null
  mappedCpls: any[]
  currentUser: any
  initialInitializationError?: string | null
}

export type SectionType = "IDENTITAS" | "FORMALITAS" | "CPL" | "CPMK" | "ASSESSMENT" | "MEETINGS" | "REFERENCES" | "PREVIEW"

const STATUS_LABEL: Record<string, string> = {
  DRAFT:             "Draf",
  SUBMITTED:         "Menunggu Persetujuan",
  APPROVED:          "Disetujui",
  REVISION_REQUIRED: "Perlu Revisi",
}

export function RpsEditor({ dosir, initialRps, mappedCpls, currentUser, initialInitializationError = null }: RpsEditorProps) {
  const [activeSection, setActiveSection] = useState<SectionType>("IDENTITAS")
  const [rpsData, setRpsData] = useState(initialRps)
  const [isSaving, setIsSaving] = useState(false)
  const [lastSavedAt, setLastSavedAt] = useState<string | null>(null)
  const [isInitializing, setIsInitializing] = useState(false)
  const [initializationError, setInitializationError] = useState<string | null>(initialInitializationError)
  const sectionSaveRef = useRef<RpsSectionSave | null>(null)

  // Cache data per seksi (Lazy Loaded on click)
  const [cpmksData, setCpmksData] = useState<any[] | null>(initialRps?.cpmks ?? null)
  const [komponensData, setKomponensData] = useState<any[] | null>(initialRps?.komponens ?? null)
  const [meetingsData, setMeetingsData] = useState<any[] | null>(initialRps?.pertemuans ?? null)
  const [referencesData, setReferencesData] = useState<any[] | null>(initialRps?.referensis ?? null)
  const [previewData, setPreviewData] = useState<any | null>(null)

  // Status loading & error per seksi
  const [sectionLoading, setSectionLoading] = useState<Record<string, boolean>>({})
  const [sectionError, setSectionError] = useState<Record<string, string | null>>({})
  const inFlightRef = useRef<Record<string, boolean>>({})

  const registerSectionSave = useCallback<RegisterRpsSectionSave>((save) => {
    sectionSaveRef.current = save
  }, [])

  const sections = [
    { id: "IDENTITAS",  label: "Identitas MK",          icon: Book },
    { id: "FORMALITAS", label: "Deskripsi & Pengesahan", icon: FileCheck },
    { id: "CPL",        label: "CPL Dibebankan",         icon: Target },
    { id: "CPMK",       label: "CPMK & Sub-CPMK",        icon: Target },
    { id: "MEETINGS",   label: "Rencana Mingguan · 16 Minggu", icon: CalendarDays },
    { id: "ASSESSMENT", label: "RTM & Rubrik Penilaian", icon: ClipboardList },
    { id: "REFERENCES", label: "Referensi",               icon: Library },
    { id: "PREVIEW",    label: "Pratinjau & Ajukan",      icon: FileCheck },
  ]

  const initializeRps = useCallback(async () => {
    if (inFlightRef.current.INITIALIZE) return

    inFlightRef.current.INITIALIZE = true
    setIsInitializing(true)
    setInitializationError(null)
    try {
      const res = await createOrGetRps(dosir.id)
      if (res.success && res.data) {
        setRpsData(res.data)
      } else {
        setInitializationError(res.error || "Gagal menginisialisasi RPS")
      }
    } catch (error) {
      setInitializationError(error instanceof Error ? error.message : "Terjadi kesalahan jaringan saat menginisialisasi RPS")
    } finally {
      inFlightRef.current.INITIALIZE = false
      setIsInitializing(false)
    }
  }, [dosir.id])

  // Fetcher on-demand untuk setiap seksi dengan pengukuran waktu & penanganan error
  const loadCpmks = useCallback(async (force = false) => {
    if (!rpsData?.id) return
    if (!force && cpmksData !== null) return cpmksData
    if (inFlightRef.current.CPMK) return

    inFlightRef.current.CPMK = true
    setSectionLoading((prev) => ({ ...prev, CPMK: true }))
    setSectionError((prev) => ({ ...prev, CPMK: null }))
    try {
      const res = await getRpsCpmks(rpsData.id)
      if (res.success) {
        setCpmksData(res.data)
        return res.data
      } else {
        setSectionError((prev) => ({ ...prev, CPMK: res.error || "Gagal memuat CPMK" }))
        return null
      }
    } catch (err: any) {
      setSectionError((prev) => ({ ...prev, CPMK: err?.message || "Terjadi kesalahan jaringan" }))
      return null
    } finally {
      inFlightRef.current.CPMK = false
      setSectionLoading((prev) => ({ ...prev, CPMK: false }))
    }
  }, [rpsData?.id, cpmksData])

  const loadMeetings = useCallback(async (force = false) => {
    if (!rpsData?.id) return
    if (!force && meetingsData !== null) return meetingsData
    if (inFlightRef.current.MEETINGS) return

    inFlightRef.current.MEETINGS = true
    setSectionLoading((prev) => ({ ...prev, MEETINGS: true }))
    setSectionError((prev) => ({ ...prev, MEETINGS: null }))
    try {
      const [meetingsRes, cpmksRes] = await Promise.all([
        getRpsMeetings(rpsData.id),
        cpmksData === null ? getRpsCpmks(rpsData.id) : Promise.resolve({ success: true, data: cpmksData }),
      ])

      if (cpmksRes.success && cpmksRes.data) {
        setCpmksData(cpmksRes.data)
      }

      if (meetingsRes.success) {
        setMeetingsData(meetingsRes.data)
        return meetingsRes.data
      } else {
        setSectionError((prev) => ({ ...prev, MEETINGS: meetingsRes.error || "Gagal memuat rencana mingguan" }))
        return null
      }
    } catch (err: any) {
      setSectionError((prev) => ({ ...prev, MEETINGS: err?.message || "Terjadi kesalahan jaringan" }))
      return null
    } finally {
      inFlightRef.current.MEETINGS = false
      setSectionLoading((prev) => ({ ...prev, MEETINGS: false }))
    }
  }, [rpsData?.id, meetingsData, cpmksData])

  const loadAssessments = useCallback(async (force = false) => {
    if (!rpsData?.id) return
    if (!force && komponensData !== null) return komponensData
    if (inFlightRef.current.ASSESSMENT) return

    inFlightRef.current.ASSESSMENT = true
    setSectionLoading((prev) => ({ ...prev, ASSESSMENT: true }))
    setSectionError((prev) => ({ ...prev, ASSESSMENT: null }))
    try {
      const [kompRes, cpmksRes] = await Promise.all([
        getRpsAssessments(rpsData.id),
        cpmksData === null ? getRpsCpmks(rpsData.id) : Promise.resolve({ success: true, data: cpmksData }),
      ])

      if (cpmksRes.success && cpmksRes.data) {
        setCpmksData(cpmksRes.data)
      }

      if (kompRes.success) {
        setKomponensData(kompRes.data)
        return kompRes.data
      } else {
        setSectionError((prev) => ({ ...prev, ASSESSMENT: kompRes.error || "Gagal memuat asesmen & rubrik" }))
        return null
      }
    } catch (err: any) {
      setSectionError((prev) => ({ ...prev, ASSESSMENT: err?.message || "Terjadi kesalahan jaringan" }))
      return null
    } finally {
      inFlightRef.current.ASSESSMENT = false
      setSectionLoading((prev) => ({ ...prev, ASSESSMENT: false }))
    }
  }, [rpsData?.id, komponensData, cpmksData])

  const loadReferences = useCallback(async (force = false) => {
    if (!rpsData?.id) return
    if (!force && referencesData !== null) return referencesData
    if (inFlightRef.current.REFERENCES) return

    inFlightRef.current.REFERENCES = true
    setSectionLoading((prev) => ({ ...prev, REFERENCES: true }))
    setSectionError((prev) => ({ ...prev, REFERENCES: null }))
    try {
      const res = await getRpsReferences(rpsData.id)
      if (res.success) {
        setReferencesData(res.data)
        return res.data
      } else {
        setSectionError((prev) => ({ ...prev, REFERENCES: res.error || "Gagal memuat referensi" }))
        return null
      }
    } catch (err: any) {
      setSectionError((prev) => ({ ...prev, REFERENCES: err?.message || "Terjadi kesalahan jaringan" }))
      return null
    } finally {
      inFlightRef.current.REFERENCES = false
      setSectionLoading((prev) => ({ ...prev, REFERENCES: false }))
    }
  }, [rpsData?.id, referencesData])

  const loadPreview = useCallback(async (force = false) => {
    if (!rpsData?.id) return
    if (!force && previewData !== null) return previewData
    if (inFlightRef.current.PREVIEW) return

    inFlightRef.current.PREVIEW = true
    setSectionLoading((prev) => ({ ...prev, PREVIEW: true }))
    setSectionError((prev) => ({ ...prev, PREVIEW: null }))

    try {
      const res = await getRpsPreviewData(rpsData.id)
      if (res.success && res.data) {
        setPreviewData(res.data)
        setCpmksData(res.data.cpmks)
        setKomponensData(res.data.komponens)
        setMeetingsData(res.data.pertemuans)
        setReferencesData(res.data.referensis)
        return res.data
      } else {
        setSectionError((prev) => ({ ...prev, PREVIEW: res.error || "Gagal memuat data pratinjau RPS" }))
        return null
      }
    } catch (err: any) {
      setSectionError((prev) => ({ ...prev, PREVIEW: err?.message || "Terjadi kesalahan saat memuat pratinjau RPS" }))
      return null
    } finally {
      inFlightRef.current.PREVIEW = false
      setSectionLoading((prev) => ({ ...prev, PREVIEW: false }))
    }
  }, [rpsData?.id, previewData])

  // Panggil lazy load terisolasi per seksi saat tab aktif berganti
  useEffect(() => {
    if (activeSection === "CPMK" && cpmksData === null) {
      loadCpmks()
    }
  }, [activeSection, cpmksData, loadCpmks])

  useEffect(() => {
    if (activeSection === "MEETINGS" && meetingsData === null) {
      loadMeetings()
    }
  }, [activeSection, meetingsData, loadMeetings])

  useEffect(() => {
    if (activeSection === "ASSESSMENT" && komponensData === null) {
      loadAssessments()
    }
  }, [activeSection, komponensData, loadAssessments])

  useEffect(() => {
    if (activeSection === "REFERENCES" && referencesData === null) {
      loadReferences()
    }
  }, [activeSection, referencesData, loadReferences])

  useEffect(() => {
    if (activeSection === "PREVIEW" && previewData === null) {
      loadPreview()
    }
  }, [activeSection, previewData, loadPreview])

  const handleStatusChange = async (status: RpsStatus, catatan?: string) => {
    if (!rpsData) return
    setIsSaving(true)
    const res = await updateRpsStatus(rpsData.id, status, catatan)
    if (res?.success) {
      toast.success(`Status RPS diubah menjadi ${STATUS_LABEL[status] ?? status}`)
      window.location.reload()
    } else {
      toast.error(res?.error || "Gagal mengubah status")
    }
    setIsSaving(false)
  }

  const handleSaveProgress = async () => {
    if (!rpsData || isSaving) return

    setIsSaving(true)
    try {
      const sectionResult = await sectionSaveRef.current?.()
      if (sectionResult && !sectionResult.success) {
        toast.error(sectionResult.error || "Gagal menyimpan isian pada bagian ini")
        return
      }

      const result = await saveRpsProgress(rpsData.id)
      if (!result.success) {
        toast.error(result.error || "Gagal menyimpan progres RPS")
        return
      }

      setLastSavedAt(result.savedAt || new Date().toISOString())
      setPreviewData(null)
      toast.success("Progres RPS berhasil disimpan")
    } finally {
      setIsSaving(false)
    }
  }

  const renderSection = () => {
    if (!rpsData) {
      if (isInitializing) {
        return (
          <div className="flex flex-col items-center justify-center space-y-3 py-24 text-slate-500">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            <p className="text-sm font-medium">Menginisialisasi RPS...</p>
          </div>
        )
      }

      return (
        <div className="flex flex-col items-center justify-center space-y-4 rounded-2xl border border-red-200 bg-red-50/50 p-8 py-16 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-100 text-red-600">
            <AlertCircle className="h-6 w-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-semibold text-red-900">RPS Gagal Diinisialisasi</h3>
            <p className="max-w-md text-xs text-red-700">
              {initializationError || "Data RPS belum tersedia. Silakan coba kembali."}
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={initializeRps}
            className="gap-2 border-red-200 bg-white text-red-700 shadow-sm hover:bg-red-50"
          >
            <RefreshCw className="h-4 w-4" /> Coba Lagi
          </Button>
        </div>
      )
    }

    // Tampilkan Loading State jika seksi sedang mengambil data
    if (sectionLoading[activeSection]) {
      const currentLabel = sections.find((s) => s.id === activeSection)?.label || activeSection
      return (
        <div className="flex flex-col items-center justify-center py-24 text-slate-500 space-y-3">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <p className="text-sm font-medium">Memuat data {currentLabel}...</p>
          <span className="text-xs text-slate-400">Hanya mengambil data untuk tab ini</span>
        </div>
      )
    }

    // Tampilkan Error State jika terjadi kegagalan jaringan / query
    if (sectionError[activeSection]) {
      return (
        <div className="flex flex-col items-center justify-center py-16 text-center space-y-4 rounded-2xl border border-red-200 bg-red-50/50 p-8">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-100 text-red-600">
            <AlertCircle className="h-6 w-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-semibold text-red-900">Gagal Memuat Bagian Ini</h3>
            <p className="text-xs text-red-700 max-w-md">{sectionError[activeSection]}</p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              if (activeSection === "CPMK") loadCpmks(true)
              else if (activeSection === "MEETINGS") loadMeetings(true)
              else if (activeSection === "ASSESSMENT") loadAssessments(true)
              else if (activeSection === "REFERENCES") loadReferences(true)
              else if (activeSection === "PREVIEW") loadPreview(true)
            }}
            className="gap-2 border-red-200 bg-white hover:bg-red-50 text-red-700 shadow-sm"
          >
            <RefreshCw className="h-4 w-4" /> Coba Lagi
          </Button>
        </div>
      )
    }

    switch (activeSection) {
      case "IDENTITAS":
        return <IdentitasSection dosir={dosir} />
      case "FORMALITAS":
        return <FormalitiesSection rpsId={rpsData.id} initialRps={rpsData} dosir={dosir} registerSave={registerSectionSave} />
      case "CPL":
        return <CplSection cpls={mappedCpls} />
      case "CPMK":
        return <CpmkSection rpsId={rpsData.id} initialCpmks={cpmksData || []} mappedCpls={mappedCpls} registerSave={registerSectionSave} />
      case "ASSESSMENT":
        return <AssessmentSection rpsId={rpsData.id} initialKomponens={komponensData || []} cpmks={cpmksData || []} registerSave={registerSectionSave} />
      case "MEETINGS":
        return <MeetingsSection rpsId={rpsData.id} initialMeetings={meetingsData || []} cpmks={cpmksData || []} registerSave={registerSectionSave} />
      case "REFERENCES":
        return <ReferencesSection rpsId={rpsData.id} initialReferences={referencesData || []} registerSave={registerSectionSave} />
      case "PREVIEW":
        return <PreviewSection dosir={dosir} rps={previewData || rpsData} mappedCpls={mappedCpls} onStatusChange={handleStatusChange} currentUser={currentUser} />
      default:
        return null
    }
  }

  const status = rpsData?.status || "DRAFT"
  const canEdit = status === "DRAFT" || status === "REVISION_REQUIRED"

  return (
    <div className="flex flex-col h-full -m-6">
      {/* Header Atas */}
      <div className="sticky top-0 z-20 flex items-center justify-between border-b border-slate-200 bg-white/95 px-6 py-4 shadow-sm backdrop-blur">
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
          <Link href={`/rpm/${dosir.id}`} target="_blank" className={cn(buttonVariants({ variant: "outline", size: "sm" }), "hidden gap-2 lg:inline-flex")}>
            <Files className="h-4 w-4" /> Rubrik (RPM)
          </Link>
          <Link href={`/rtm/${dosir.id}`} target="_blank" className={cn(buttonVariants({ variant: "outline", size: "sm" }), "hidden gap-2 lg:inline-flex")}>
            <ClipboardList className="h-4 w-4" /> RTM
          </Link>
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
            {lastSavedAt && (
              <span className="mt-1 text-[10px] text-slate-500" aria-live="polite">
                Tersimpan {new Date(lastSavedAt).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}
              </span>
            )}
          </div>
          {canEdit ? (
            <>
              <Button type="button" variant="outline" size="sm" className="gap-2" onClick={handleSaveProgress} disabled={!rpsData || isSaving}>
                {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                {isSaving ? "Menyimpan..." : "Simpan progres"}
              </Button>
              <Button size="sm" className="gap-2" onClick={() => setActiveSection("PREVIEW")} disabled={isSaving}>
                <Send className="h-4 w-4" /> Ajukan RPS
              </Button>
            </>
          ) : currentUser.role !== "DOSEN" && status === "SUBMITTED" ? (
            <Button size="sm" className="gap-2 bg-green-600 hover:bg-green-700" onClick={() => setActiveSection("PREVIEW")}>
              <CheckCircle className="h-4 w-4" /> Tinjau & Setujui
            </Button>
          ) : null}
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Navigasi Sidebar Kiri */}
        <div className="flex w-64 flex-col space-y-1 border-r border-slate-200 bg-white p-4">
          {sections.map((s) => (
            <button
              key={s.id}
              onClick={() => setActiveSection(s.id as SectionType)}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium transition-all",
                activeSection === s.id
                  ? "bg-blue-600 text-white shadow-sm shadow-blue-200"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-950"
              )}
            >
              <s.icon className={cn("h-4 w-4", activeSection === s.id ? "text-white" : "text-slate-400")} />
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
        <div className="flex-1 overflow-y-auto bg-slate-50/70 p-6 lg:p-10">
          <div className="mx-auto max-w-5xl">
            {renderSection()}
          </div>
        </div>
      </div>
    </div>
  )
}
