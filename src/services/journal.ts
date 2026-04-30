import {
  collection,
  addDoc,
  getDocs,
  serverTimestamp,
  query,
  orderBy,
  type Timestamp,
} from 'firebase/firestore'
import { db } from '../lib/firebase'
import type { JournalEntry, JournalEntryCreate } from '../types/journal'

function toIso(val: unknown): string {
  if (!val) return new Date().toISOString()
  if (typeof val === 'string') return val
  if ((val as Timestamp).toDate) return (val as Timestamp).toDate().toISOString()
  return new Date().toISOString()
}

export async function addJournalEntry(
  missionId: string,
  data: JournalEntryCreate,
): Promise<string> {
  const col = collection(db, 'missions', missionId, 'journal')
  const ref = await addDoc(col, { ...data, createdAt: serverTimestamp() })
  return ref.id
}

export async function getJournalEntries(missionId: string): Promise<JournalEntry[]> {
  const col = collection(db, 'missions', missionId, 'journal')
  const q = query(col, orderBy('createdAt', 'desc'))
  const snap = await getDocs(q)

  return snap.docs.map(d => ({
    ...(d.data() as Omit<JournalEntry, 'id' | 'createdAt'>),
    id: d.id,
    createdAt: toIso(d.data().createdAt),
  }))
}
