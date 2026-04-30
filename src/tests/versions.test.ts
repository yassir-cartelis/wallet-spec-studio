import { describe, it, expect, vi, beforeEach } from 'vitest'
import { addDoc, updateDoc, getDocs, collection, doc, orderBy } from 'firebase/firestore'

// Ce service n'existe pas encore — c'est le but du TDD
// Ces tests définissent le contrat que l'implémentation devra respecter
import { addVersion, getVersions } from '@/services/versions'
import type { SpecVersionCreate } from '@/types/version'
import type { SpecState } from '@/types/spec'

// ─── Fixtures ─────────────────────────────────────────────────────────────────

const MISSION_ID = 'mission-abc'

const CONSULTANT = {
  uid: 'u1',
  email: 'theo@cartelis.com',
  name: 'Théo Jouan',
}

// On utilise un objet vide casté — les tests du service ne valident pas la structure de SpecState
const SPEC = {} as SpecState

// ─── addVersion() ─────────────────────────────────────────────────────────────

describe('addVersion()', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(collection).mockReturnValue('mock-col' as any)
    vi.mocked(doc).mockReturnValue('mock-doc' as any)
    vi.mocked(addDoc).mockResolvedValue({ id: 'version-xyz' } as any)
    vi.mocked(updateDoc).mockResolvedValue(undefined)
  })

  it('écrit dans la sous-collection missions/{missionId}/versions', async () => {
    // Vérifie que le chemin Firestore est bien celui de la sous-collection
    const data: SpecVersionCreate = { versionNumber: 1, spec: SPEC, savedBy: CONSULTANT }
    await addVersion(MISSION_ID, data)

    expect(collection).toHaveBeenCalledWith(
      expect.anything(),
      'missions', MISSION_ID, 'versions',
    )
    expect(addDoc).toHaveBeenCalledOnce()
  })

  it('inclut versionNumber, spec, savedBy et savedAt dans le document créé', async () => {
    // Vérifie la structure exacte du document Firestore
    const data: SpecVersionCreate = { versionNumber: 3, spec: SPEC, savedBy: CONSULTANT }
    await addVersion(MISSION_ID, data)

    expect(addDoc).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        versionNumber: 3,
        spec: SPEC,
        savedBy: CONSULTANT,
        savedAt: expect.anything(), // serverTimestamp() — valeur opaque
      }),
    )
  })

  it('met à jour currentVersion sur le document mission', async () => {
    // Chaque save doit refléter le numéro de version courant sur la mission (dénormalisation)
    const data: SpecVersionCreate = { versionNumber: 2, spec: SPEC, savedBy: CONSULTANT }
    await addVersion(MISSION_ID, data)

    expect(doc).toHaveBeenCalledWith(expect.anything(), 'missions', MISSION_ID)
    expect(updateDoc).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ currentVersion: 2 }),
    )
  })

  it('retourne l\'id Firestore de la version créée', async () => {
    // L'appelant a besoin de l'id pour naviguer vers la version ou l'afficher
    const data: SpecVersionCreate = { versionNumber: 1, spec: SPEC, savedBy: CONSULTANT }
    const id = await addVersion(MISSION_ID, data)

    expect(id).toBe('version-xyz')
  })

  it('inclut le label si fourni', async () => {
    // Le label est optionnel — on vérifie qu'il est bien transmis quand présent
    const data: SpecVersionCreate = {
      versionNumber: 1,
      spec: SPEC,
      savedBy: CONSULTANT,
      label: 'Version validée client',
    }
    await addVersion(MISSION_ID, data)

    expect(addDoc).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ label: 'Version validée client' }),
    )
  })
})

// ─── getVersions() ────────────────────────────────────────────────────────────

describe('getVersions()', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(collection).mockReturnValue('mock-col' as any)
    vi.mocked(orderBy).mockReturnValue('mock-orderby' as any)
  })

  it('retourne un tableau vide si aucune version', async () => {
    vi.mocked(getDocs).mockResolvedValue({ docs: [] } as any)

    const versions = await getVersions(MISSION_ID)

    expect(versions).toEqual([])
  })

  it('convertit le Timestamp Firestore savedAt en ISO string', async () => {
    // Firestore retourne des Timestamp — le service doit les convertir pour l'UI
    const fakeDate = new Date('2026-04-17T10:00:00Z')
    vi.mocked(getDocs).mockResolvedValue({
      docs: [{
        id: 'v-1',
        data: () => ({
          versionNumber: 1,
          spec: SPEC,
          savedBy: CONSULTANT,
          savedAt: { toDate: () => fakeDate },
        }),
      }],
    } as any)

    const versions = await getVersions(MISSION_ID)

    expect(versions[0].savedAt).toBe(fakeDate.toISOString())
  })

  it('inclut l\'id Firestore sur chaque version retournée', async () => {
    vi.mocked(getDocs).mockResolvedValue({
      docs: [{
        id: 'v-abc',
        data: () => ({
          versionNumber: 1,
          spec: SPEC,
          savedBy: CONSULTANT,
          savedAt: { toDate: () => new Date() },
        }),
      }],
    } as any)

    const versions = await getVersions(MISSION_ID)

    expect(versions[0].id).toBe('v-abc')
  })

  it('requête Firestore avec orderBy versionNumber descendant', async () => {
    // On vérifie que le tri est délégué à Firestore (pas recalculé côté client)
    vi.mocked(getDocs).mockResolvedValue({ docs: [] } as any)

    await getVersions(MISSION_ID)

    expect(orderBy).toHaveBeenCalledWith('versionNumber', 'desc')
  })

  it('retourne toutes les versions avec la bonne structure', async () => {
    const date1 = new Date('2026-04-01T10:00:00Z')
    const date2 = new Date('2026-04-10T14:00:00Z')

    vi.mocked(getDocs).mockResolvedValue({
      docs: [
        {
          id: 'v-2',
          data: () => ({ versionNumber: 2, spec: SPEC, savedBy: CONSULTANT, savedAt: { toDate: () => date2 } }),
        },
        {
          id: 'v-1',
          data: () => ({ versionNumber: 1, spec: SPEC, savedBy: CONSULTANT, savedAt: { toDate: () => date1 } }),
        },
      ],
    } as any)

    const versions = await getVersions(MISSION_ID)

    expect(versions).toHaveLength(2)
    expect(versions[0]).toMatchObject({ id: 'v-2', versionNumber: 2 })
    expect(versions[1]).toMatchObject({ id: 'v-1', versionNumber: 1 })
  })
})
