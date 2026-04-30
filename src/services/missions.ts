import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  query,
  orderBy,
  type Timestamp,
} from 'firebase/firestore'
import { db } from '../lib/firebase'
import type { Mission, MissionCreate } from '../types/mission'

const COL = 'missions'

function toIso(val: unknown): string {
  if (!val) return new Date().toISOString()
  if (typeof val === 'string') return val
  if ((val as Timestamp).toDate) return (val as Timestamp).toDate().toISOString()
  return new Date().toISOString()
}

function docToMission(id: string, data: Record<string, unknown>): Mission {
  return {
    ...(data as Omit<Mission, 'id' | 'createdAt' | 'updatedAt'>),
    id,
    createdAt: toIso(data.createdAt),
    updatedAt: toIso(data.updatedAt),
  }
}

export async function getMissions(): Promise<Mission[]> {
  const q = query(collection(db, COL), orderBy('updatedAt', 'desc'))
  const snap = await getDocs(q)
  return snap.docs.map(d => docToMission(d.id, d.data() as Record<string, unknown>))
}

export async function getMission(id: string): Promise<Mission | null> {
  const snap = await getDoc(doc(db, COL, id))
  if (!snap.exists()) return null
  return docToMission(snap.id, snap.data() as Record<string, unknown>)
}

export async function createMission(data: MissionCreate): Promise<string> {
  const ref = await addDoc(collection(db, COL), {
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })
  return ref.id
}

export async function updateMission(id: string, data: Partial<MissionCreate>): Promise<void> {
  await updateDoc(doc(db, COL, id), {
    ...data,
    updatedAt: serverTimestamp(),
  })
}

export async function deleteMission(id: string): Promise<void> {
  await deleteDoc(doc(db, COL, id))
}
