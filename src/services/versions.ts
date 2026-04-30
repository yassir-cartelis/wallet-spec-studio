import {
  collection,
  doc,
  addDoc,
  updateDoc,
  getDocs,
  serverTimestamp,
  query,
  orderBy,
  type Timestamp,
} from 'firebase/firestore'
import { db } from '../lib/firebase'
import type { SpecVersion, SpecVersionCreate } from '../types/version'

function toIso(val: unknown): string {
  if (!val) return new Date().toISOString()
  if (typeof val === 'string') return val
  if ((val as Timestamp).toDate) return (val as Timestamp).toDate().toISOString()
  return new Date().toISOString()
}

export async function addVersion(
  missionId: string,
  data: SpecVersionCreate,
): Promise<string> {
  const versionsCol = collection(db, 'missions', missionId, 'versions')

  const ref = await addDoc(versionsCol, {
    ...data,
    savedAt: serverTimestamp(),
  })

  await updateDoc(doc(db, 'missions', missionId), {
    currentVersion: data.versionNumber,
    updatedAt: serverTimestamp(),
  })

  return ref.id
}

export async function getVersions(missionId: string): Promise<SpecVersion[]> {
  const versionsCol = collection(db, 'missions', missionId, 'versions')
  const q = query(versionsCol, orderBy('versionNumber', 'desc'))
  const snap = await getDocs(q)

  return snap.docs.map(d => ({
    ...(d.data() as Omit<SpecVersion, 'id' | 'savedAt'>),
    id: d.id,
    savedAt: toIso(d.data().savedAt),
  }))
}
