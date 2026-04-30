import type { MissionConsultant } from './mission'

export interface JournalEntry {
  id: string
  content: string
  author: MissionConsultant
  createdAt: string
}

export type JournalEntryCreate = Omit<JournalEntry, 'id' | 'createdAt'>
