import type { SpecState } from './spec'
import type { MissionConsultant } from './mission'

export interface SpecVersion {
  id: string
  versionNumber: number
  spec: SpecState
  savedBy: MissionConsultant
  savedAt: string
  label?: string
  notes?: string
}

export type SpecVersionCreate = Omit<SpecVersion, 'id' | 'savedAt'>
