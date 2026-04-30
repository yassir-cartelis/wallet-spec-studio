import { describe, it, expect, vi, beforeEach } from 'vitest'

// On mocke les deux services que le composable va orchestrer
vi.mock('@/services/versions', () => ({ addVersion: vi.fn() }))
vi.mock('@/services/missions', () => ({ updateMission: vi.fn() }))

import { addVersion } from '@/services/versions'
import { updateMission } from '@/services/missions'

// Ce composable n'existe pas encore — c'est le but
import { useSaveSpec } from '@/composables/useSaveSpec'
import type { Mission } from '@/types/mission'
import type { SpecState } from '@/types/spec'

// ─── Fixtures ─────────────────────────────────────────────────────────────────

const MISSION: Mission = {
  id: 'mission-1',
  name: 'Colissimo',
  client: 'Colissimo',
  consultant: { uid: 'u1', email: 'theo@cartelis.com', name: 'Théo Jouan' },
  status: 'in_progress',
  currentVersion: 0,
  spec: {} as SpecState,
  createdAt: '2026-01-01T00:00:00Z',
  updatedAt: '2026-01-01T00:00:00Z',
}

const NEW_SPEC = { meta: { projectName: 'Colissimo v2' } } as SpecState

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('useSaveSpec()', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(addVersion).mockResolvedValue('version-new-id')
    vi.mocked(updateMission).mockResolvedValue(undefined)
  })

  it('calcule versionNumber = currentVersion + 1', async () => {
    // La version 1 est créée quand currentVersion vaut 0
    const { saveSpec } = useSaveSpec()
    await saveSpec(MISSION, NEW_SPEC)

    expect(addVersion).toHaveBeenCalledWith(
      MISSION.id,
      expect.objectContaining({ versionNumber: 1 }),
    )
  })

  it('incrémente correctement depuis une version existante', async () => {
    // Si on est à la version 5, la prochaine est 6
    const { saveSpec } = useSaveSpec()
    await saveSpec({ ...MISSION, currentVersion: 5 }, NEW_SPEC)

    expect(addVersion).toHaveBeenCalledWith(
      MISSION.id,
      expect.objectContaining({ versionNumber: 6 }),
    )
  })

  it('passe la spec courante à addVersion', async () => {
    const { saveSpec } = useSaveSpec()
    await saveSpec(MISSION, NEW_SPEC)

    expect(addVersion).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ spec: NEW_SPEC }),
    )
  })

  it('passe le consultant de la mission comme savedBy', async () => {
    // savedBy = qui a fait la sauvegarde, tracé dans l'historique
    const { saveSpec } = useSaveSpec()
    await saveSpec(MISSION, NEW_SPEC)

    expect(addVersion).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ savedBy: MISSION.consultant }),
    )
  })

  it('met à jour le champ spec sur la mission pour la dénormalisation', async () => {
    // Le document mission garde toujours une copie de la dernière spec
    // pour éviter de lire la sous-collection versions à chaque ouverture
    const { saveSpec } = useSaveSpec()
    await saveSpec(MISSION, NEW_SPEC)

    expect(updateMission).toHaveBeenCalledWith(
      MISSION.id,
      expect.objectContaining({ spec: NEW_SPEC }),
    )
  })

  it('retourne la mission avec currentVersion incrémenté', async () => {
    const { saveSpec } = useSaveSpec()
    const updated = await saveSpec(MISSION, NEW_SPEC)

    expect(updated.currentVersion).toBe(1)
  })

  it('retourne la mission avec la nouvelle spec', async () => {
    const { saveSpec } = useSaveSpec()
    const updated = await saveSpec(MISSION, NEW_SPEC)

    expect(updated.spec).toBe(NEW_SPEC)
  })

  it('accepte un label optionnel transmis à addVersion', async () => {
    const { saveSpec } = useSaveSpec()
    await saveSpec(MISSION, NEW_SPEC, 'Version validée client')

    expect(addVersion).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ label: 'Version validée client' }),
    )
  })
})
