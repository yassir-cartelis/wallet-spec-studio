import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { useStorage } from '@vueuse/core'
import type { SavedProject, SpecState } from '@/types/spec'
import { DEFAULT_PROJECTS } from '@/data/defaultProjects'

function makeId() {
  return Math.random().toString(36).slice(2, 9)
}

export const useProjectsStore = defineStore('projects', () => {
  const projects = useStorage<SavedProject[]>('wallet-spec-projects', structuredClone(DEFAULT_PROJECTS))

  // ── Computed ──────────────────────────────────────────────────────────────

  const categories = computed(() => {
    const cats = new Set(projects.value.map((p) => p.category))
    return Array.from(cats).sort()
  })

  // ── Active category filter (used by WelcomeScreen) ─────────────────────
  const activeCategory = ref<string | null>(null)

  const filtered = computed(() =>
    activeCategory.value
      ? projects.value.filter((p) => p.category === activeCategory.value)
      : projects.value,
  )

  // ── Mutations ─────────────────────────────────────────────────────────────

  /**
   * Upsert a project by id.
   * If an entry with the same id exists, it gets updated. Otherwise a new one is created.
   */
  function save(project: Omit<SavedProject, 'createdAt' | 'updatedAt'> & { createdAt?: string; updatedAt?: string }) {
    const now = new Date().toISOString()
    const idx = projects.value.findIndex((p) => p.id === project.id)
    if (idx !== -1) {
      projects.value[idx] = { ...project, createdAt: projects.value[idx].createdAt, updatedAt: now } as SavedProject
    } else {
      projects.value.push({ ...project, createdAt: now, updatedAt: now } as SavedProject)
    }
  }

  /**
   * Save the current SpecState as a new or updated project.
   * Returns the saved project id (stored in spec.meta.savedId).
   */
  function saveSpec(spec: SpecState): string {
    const now = new Date().toISOString()
    const id = spec.meta.savedId || makeId()
    const existing = projects.value.find((p) => p.id === id)

    const project: SavedProject = {
      id,
      name: spec.meta.projectName || 'Sans titre',
      description: spec.meta.description || '',
      category: spec.meta.useCaseCategory || 'Autre',
      spec: structuredClone(spec),
      isDefault: false,
      createdAt: existing?.createdAt ?? now,
      updatedAt: now,
    }

    save(project)
    return id
  }

  /**
   * Duplicate a project with a custom name.
   * Returns the new project or null if original not found.
   */
  function duplicate(id: string, newName: string): SavedProject | null {
    const original = projects.value.find((p) => p.id === id)
    if (!original) return null

    const now = new Date().toISOString()
    const newId = makeId()
    const copy: SavedProject = {
      ...structuredClone(original),
      id: newId,
      name: newName,
      isDefault: false,
      createdAt: now,
      updatedAt: now,
    }
    copy.spec.meta.projectName = newName
    copy.spec.meta.savedId = newId

    projects.value.push(copy)
    return copy
  }

  /**
   * Remove a project. Default projects cannot be deleted.
   */
  function remove(id: string) {
    const project = projects.value.find((p) => p.id === id)
    if (project?.isDefault) return
    projects.value = projects.value.filter((p) => p.id !== id)
  }

  /**
   * Reset the library to factory defaults (adds missing defaults, keeps user projects).
   */
  function resetDefaults() {
    for (const def of DEFAULT_PROJECTS) {
      if (!projects.value.find((p) => p.id === def.id)) {
        projects.value.push(structuredClone(def))
      }
    }
  }

  return {
    projects,
    categories,
    activeCategory,
    filtered,
    save,
    saveSpec,
    duplicate,
    remove,
    resetDefaults,
  }
})
