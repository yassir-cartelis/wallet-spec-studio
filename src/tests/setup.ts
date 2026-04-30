import { vi } from 'vitest'

// Mock Firebase globalement — aucun test ne touche la vraie Firestore
vi.mock('@/lib/firebase', () => ({
  db: {},
  auth: {},
  googleProvider: {},
}))

vi.mock('firebase/firestore', () => ({
  collection: vi.fn(),
  doc: vi.fn(),
  getDocs: vi.fn(),
  getDoc: vi.fn(),
  addDoc: vi.fn(),
  updateDoc: vi.fn(),
  deleteDoc: vi.fn(),
  serverTimestamp: vi.fn(() => ({ _type: 'serverTimestamp' })),
  query: vi.fn(),
  orderBy: vi.fn(),
  runTransaction: vi.fn(),
  increment: vi.fn(),
}))
