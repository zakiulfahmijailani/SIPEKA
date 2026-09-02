export type RpsSaveResult = {
  success: boolean
  error?: string
}

export type RpsSectionSave = () => Promise<RpsSaveResult>

export type RegisterRpsSectionSave = (save: RpsSectionSave | null) => void
