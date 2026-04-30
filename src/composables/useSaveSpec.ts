import { addVersion } from '../services/versions'
import { updateMission } from '../services/missions'
import type { Mission } from '../types/mission'
import type { SpecState } from '../types/spec'

export function useSaveSpec() {
  async function saveSpec(
    mission: Mission,
    spec: SpecState,
    label?: string,
    notes?: string,
  ): Promise<Mission> {
    const versionNumber = mission.currentVersion + 1

    await addVersion(mission.id, {
      versionNumber,
      spec,
      savedBy: mission.consultant,
      ...(label ? { label } : {}),
      ...(notes ? { notes } : {}),
    })

    await updateMission(mission.id, { spec })

    return {
      ...mission,
      spec,
      currentVersion: versionNumber,
    }
  }

  return { saveSpec }
}
