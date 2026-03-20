<script setup lang="ts">
import { ref, computed } from 'vue'
import { useProjectsStore } from '@/stores/projects'
import NameModal from '@/components/NameModal.vue'
import type { SavedProject, SpecState } from '@/types/spec'

const emit = defineEmits<{
  close: []
  loadProject: [spec: SpecState]
}>()

const projectsStore = useProjectsStore()

// ── Category filter ────────────────────────────────────────────────────────
const activeCategory = ref<string | null>(null)

const categories = computed(() => {
  const cats = new Set(projectsStore.projects.map((p: SavedProject) => p.category))
  return Array.from(cats).sort()
})

const filteredProjects = computed(() =>
  activeCategory.value
    ? projectsStore.projects.filter((p: SavedProject) => p.category === activeCategory.value)
    : projectsStore.projects,
)

// ── Duplicate modal ────────────────────────────────────────────────────────
const duplicatingProject = ref<SavedProject | null>(null)

function startDuplicate(project: SavedProject) {
  duplicatingProject.value = project
}

function confirmDuplicate(newName: string) {
  if (!duplicatingProject.value) return
  const copy = projectsStore.duplicate(duplicatingProject.value.id, newName)
  if (copy) {
    copy.spec.meta.savedId = copy.id
    emit('loadProject', copy.spec)
    emit('close')
  }
  duplicatingProject.value = null
}

// ── Load directly ──────────────────────────────────────────────────────────
function loadProject(project: SavedProject) {
  emit('loadProject', project.spec)
  emit('close')
}

function deleteProject(project: SavedProject) {
  projectsStore.remove(project.id)
}

// ── Helpers ────────────────────────────────────────────────────────────────
const CATEGORY_COLORS: Record<string, string> = {
  'Logistique':   'bg-brand-100 text-brand-700',
  'Retail':       'bg-green-100 text-green-700',
  'Evenementiel': 'bg-purple-100 text-purple-700',
  'Commerce':     'bg-orange-100 text-orange-700',
  'Mobilite':     'bg-teal-100 text-teal-700',
  'Finance':      'bg-blue-100 text-blue-700',
  'Sante':        'bg-rose-100 text-rose-700',
  'Autre':        'bg-gray-100 text-gray-600',
}

function categoryColor(cat: string) {
  const key = cat.normalize('NFD').replace(/[\u0300-\u036f]/g, '')
  return CATEGORY_COLORS[key] ?? 'bg-brand-100 text-brand-700'
}

function flowCount(p: SavedProject) {
  return Object.values(p.spec.flows).filter((f) => f.enabled).length
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })
}
</script>

<template>
  <!-- Backdrop -->
  <div
    class="fixed inset-0 z-40 bg-brand-900/20 backdrop-blur-[2px]"
    @click="emit('close')"
  />

  <!-- Name modal (duplicate) -->
  <NameModal
    v-if="duplicatingProject"
    :initial="duplicatingProject.name"
    :from="duplicatingProject.name"
    @confirm="confirmDuplicate"
    @cancel="duplicatingProject = null"
  />

  <!-- Panel -->
  <aside class="fixed right-0 top-0 bottom-0 z-50 w-[600px] bg-white shadow-2xl flex flex-col border-l border-brand-200">

    <!-- Header -->
    <div class="flex items-center gap-3 px-6 py-4 border-b border-brand-100 shrink-0">
      <span class="text-lg">📚</span>
      <div class="flex-1">
        <h2 class="text-sm font-bold text-brand-900">Bibliothèque de use-cases</h2>
        <p class="text-[11px] text-brand-500">{{ projectsStore.projects.length }} projets · Duplique pour repartir d'une base</p>
      </div>
      <button @click="emit('close')" class="text-brand-400 hover:text-brand-700 text-lg leading-none">×</button>
    </div>

    <!-- Category filters -->
    <div class="px-6 py-3 border-b border-brand-100 flex items-center gap-2 flex-wrap shrink-0 bg-brand-50">
      <button
        @click="activeCategory = null"
        class="px-3 py-1.5 rounded-full text-xs font-semibold transition-colors"
        :class="activeCategory === null ? 'bg-accent-500 text-white shadow-sm' : 'bg-white border border-brand-200 text-brand-700 hover:bg-brand-50'"
      >Tous ({{ projectsStore.projects.length }})</button>
      <button
        v-for="cat in categories"
        :key="String(cat)"
        @click="activeCategory = activeCategory === cat ? null : String(cat)"
        class="px-3 py-1.5 rounded-full text-xs font-semibold transition-colors"
        :class="activeCategory === cat ? 'bg-accent-500 text-white shadow-sm' : 'bg-white border border-brand-200 text-brand-700 hover:bg-brand-50'"
      >{{ cat }} ({{ projectsStore.projects.filter((p: SavedProject) => p.category === cat).length }})</button>
    </div>

    <!-- Project list -->
    <div class="flex-1 overflow-y-auto px-6 py-5">
      <div v-if="filteredProjects.length === 0" class="text-center py-16 text-brand-400 text-sm">
        Aucun use-case dans cette catégorie.
      </div>

      <div class="grid grid-cols-2 gap-4">
        <div
          v-for="project in filteredProjects"
          :key="project.id"
          class="group bg-white rounded-2xl border border-brand-100 hover:border-brand-300 hover:shadow-md transition-all flex flex-col overflow-hidden"
        >
          <!-- Card body -->
          <div class="p-4 flex-1">
            <div class="flex items-start justify-between mb-2.5">
              <span
                class="text-[11px] font-bold px-2.5 py-1 rounded-full"
                :class="categoryColor(project.category)"
              >{{ project.category }}</span>
              <span v-if="project.isDefault" class="text-[10px] text-brand-400 font-medium">Cartelis ✦</span>
            </div>

            <h3 class="font-bold text-brand-900 text-sm mb-1.5 leading-snug">{{ project.name }}</h3>
            <p class="text-xs text-brand-600 leading-relaxed line-clamp-2">{{ project.description }}</p>

            <!-- Stats -->
            <div class="flex items-center gap-3 mt-3 pt-3 border-t border-brand-50">
              <div class="text-center">
                <p class="text-sm font-bold text-brand-800">{{ project.spec.mapping.length }}</p>
                <p class="text-[10px] text-brand-500">champs</p>
              </div>
              <div class="w-px h-5 bg-brand-100" />
              <div class="text-center">
                <p class="text-sm font-bold text-brand-800">{{ flowCount(project) }}</p>
                <p class="text-[10px] text-brand-500">flux</p>
              </div>
              <div class="w-px h-5 bg-brand-100" />
              <div class="text-center">
                <p class="text-sm font-bold text-brand-800">{{ project.spec.notifications.length }}</p>
                <p class="text-[10px] text-brand-500">notifs</p>
              </div>
              <span class="ml-auto text-[10px] text-brand-300">{{ formatDate(project.updatedAt) }}</span>
            </div>
          </div>

          <!-- Card actions -->
          <div class="border-t border-brand-50 px-3 py-2.5 flex items-center gap-2 bg-brand-50/50">
            <button
              @click="startDuplicate(project)"
              class="flex-1 flex items-center justify-center gap-1 px-3 py-2 rounded-lg bg-accent-500 text-white text-xs font-bold hover:bg-accent-600 transition-colors"
            >⧉ Dupliquer</button>
            <button
              @click="loadProject(project)"
              class="px-3 py-2 rounded-lg border border-brand-200 text-brand-700 text-xs font-medium hover:bg-brand-100 transition-colors"
              title="Charger tel quel"
            >Charger</button>
            <button
              v-if="!project.isDefault"
              @click="deleteProject(project)"
              class="px-2 py-2 rounded-lg text-brand-300 hover:text-red-400 hover:bg-red-50 transition-colors"
              title="Supprimer"
            >✕</button>
          </div>
        </div>
      </div>
    </div>
  </aside>
</template>
