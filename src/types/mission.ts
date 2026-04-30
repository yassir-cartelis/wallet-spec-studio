import type { SpecState } from './spec'

export type MissionStatus = 'draft' | 'in_progress' | 'delivered' | 'in_production'

export interface MissionConsultant {
  uid: string
  email: string
  name: string
}

export interface Mission {
  id: string
  name: string
  client: string
  consultant: MissionConsultant
  templateId?: string         // référence vers projects/{id} si créé depuis un template
  status: MissionStatus
  currentVersion: number      // numéro de la dernière version sauvegardée (0 = jamais sauvegardé)
  spec: SpecState
  createdAt: string
  updatedAt: string
}

export type MissionCreate = Omit<Mission, 'id' | 'createdAt' | 'updatedAt'>
