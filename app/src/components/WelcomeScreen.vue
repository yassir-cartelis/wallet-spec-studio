<script setup lang="ts">
import { ref, computed } from 'vue'
import { useProjectsStore } from '@/stores/projects'
import NameModal from '@/components/NameModal.vue'
import type { SavedProject, SpecState } from '@/types/spec'

const emit = defineEmits<{
  start: []
  openAi: []
  openImport: []
  openGuide: []
  loadProject: [spec: SpecState]
}>()

const projectsStore = useProjectsStore()

// Category filter
const activeCategory = ref<string | null>(null)

const filteredProjects = computed(() =>
  activeCategory.value
    ? projectsStore.projects.filter((p: SavedProject) => p.category === activeCategory.value)
    : projectsStore.projects,
)

const categories = computed(() => {
  const cats = new Set(projectsStore.projects.map((p: SavedProject) => p.category))
  return Array.from(cats).sort()
})

// Duplicate modal
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
  }
  duplicatingProject.value = null
}

// Load directly
function loadProject(project: SavedProject) {
  emit('loadProject', project.spec)
}

function deleteProject(project: SavedProject) {
  projectsStore.remove(project.id)
}

// Category color
const CATEGORY_COLORS: Record<string, string> = {
  'Logistique':    'bg-brand-100 text-brand-700',
  'Retail':        'bg-green-100 text-green-700',
  'Evenementiel':  'bg-purple-100 text-purple-700',
  'Commerce':      'bg-orange-100 text-orange-700',
  'Mobilite':      'bg-teal-100 text-teal-700',
  'Finance':       'bg-blue-100 text-blue-700',
  'Sante':         'bg-rose-100 text-rose-700',
  'Autre':         'bg-gray-100 text-gray-600',
}

function categoryColor(cat: string) {
  // Normalize key by removing accents for lookup
  const key = cat.normalize('NFD').replace(/[\u0300-\u036f]/g, '')
  return CATEGORY_COLORS[key] ?? 'bg-brand-100 text-brand-700'
}

// Stats
function flowCount(p: SavedProject) {
  return Object.values(p.spec.flows).filter((f) => f.enabled).length
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })
}
</script>

<template>
  <div class="min-h-screen bg-brand-200">

    <!-- Duplicate name modal -->
    <NameModal
      v-if="duplicatingProject"
      :initial="duplicatingProject.name"
      :from="duplicatingProject.name"
      @confirm="confirmDuplicate"
      @cancel="duplicatingProject = null"
    />

    <!-- Hero section -->
    <div class="flex flex-col items-center px-6 pt-14 pb-0">

      <!-- Logo -->
      <div class="flex flex-col items-center gap-3 mb-12">
        <span class="text-[11px] font-bold tracking-widest text-white bg-brand-700 px-3 py-1 rounded">CARTELIS</span>
        <div class="flex items-center gap-2">
          <span class="text-2xl font-bold text-brand-900">Wallet</span>
          <span class="text-2xl font-light text-brand-600">Spec Studio</span>
        </div>
      </div>

      <!-- AI CTA -->
      <div class="w-full max-w-2xl">
        <button
          @click="emit('openAi')"
          class="group w-full rounded-2xl bg-accent-500 hover:bg-accent-600 text-white p-8 text-left transition-all shadow-lg hover:shadow-xl"
        >
          <div class="flex items-start justify-between mb-5">
            <div class="flex items-center gap-3">
              <span class="text-3xl">✦</span>
              <span class="text-xs font-semibold tracking-widest text-accent-200 uppercase">Propulse par GPT-4o</span>
            </div>
            <span class="text-accent-300 text-lg group-hover:translate-x-1 transition-transform">→</span>
          </div>
          <h1 class="text-2xl font-bold leading-snug mb-3">
            L'IA Cartelis analyse tes documents<br />
            <span class="text-accent-200">et initialise ta spec en quelques secondes</span>
          </h1>
          <p class="text-accent-100 text-sm leading-relaxed max-w-xl">
            Depose ton brief client, un dictionnaire de donnees, ou tes notes d'atelier.
            GPT-4o extrait les informations cles et pre-remplit les 8 etapes de la spec pour toi.
          </p>
          <div class="mt-6 flex items-center gap-3">
            <span class="bg-white/20 text-white text-xs px-3 py-1.5 rounded-full font-medium">PDF</span>
            <span class="bg-white/20 text-white text-xs px-3 py-1.5 rounded-full font-medium">DOCX</span>
            <span class="bg-white/20 text-white text-xs px-3 py-1.5 rounded-full font-medium">TXT</span>
            <span class="bg-white/20 text-white text-xs px-3 py-1.5 rounded-full font-medium">MD</span>
            <span class="ml-auto bg-white text-accent-700 text-sm px-5 py-2 rounded-lg font-semibold group-hover:bg-accent-50 transition-colors">
              Deposer mes documents →
            </span>
          </div>
        </button>

        <!-- Secondary actions -->
        <div class="flex items-center gap-3 mt-4">
          <button
            @click="emit('start')"
            class="flex-1 flex items-center justify-center gap-2 px-5 py-3 rounded-xl border-2 border-white/50 bg-white/70 text-brand-900 hover:bg-white hover:border-brand-400 transition-all text-sm font-medium"
          >
            ✏️ Partir de zero
          </button>
          <button
            @click="emit('openGuide')"
            class="flex items-center gap-2 px-5 py-3 rounded-xl border-2 border-white/50 bg-white/70 text-brand-800 hover:bg-white hover:border-brand-400 transition-all text-sm"
          >
            📖 Guide Wallet
          </button>
          <button
            @click="emit('openImport')"
            class="px-4 py-3 rounded-xl border border-dashed border-brand-400 text-brand-600 hover:text-brand-800 hover:border-brand-600 transition-all text-xs"
            title="Importer un fichier JSON de spec existante"
          >
            ↑ JSON
          </button>
        </div>
      </div>
    </div>

    <!-- Library section -->
    <div class="max-w-5xl mx-auto px-6 mt-16 pb-16">

      <!-- Section header -->
      <div class="flex items-end justify-between mb-6">
        <div>
          <h2 class="text-xl font-bold text-brand-900">📚 Bibliotheque de use-cases</h2>
          <p class="text-sm text-brand-700 mt-0.5">Duplique un template, renomme-le et c'est parti.</p>
        </div>
        <span class="text-xs text-brand-600 font-medium">{{ projectsStore.projects.length }} templates</span>
      </div>

      <!-- Category filters -->
      <div class="flex items-center gap-2 mb-6 flex-wrap">
        <button
          @click="activeCategory = null"
          class="px-3 py-1.5 rounded-full text-xs font-semibold transition-colors"
          :class="activeCategory === null ? 'bg-accent-500 text-white shadow-sm' : 'bg-white/70 border border-brand-200 text-brand-700 hover:bg-white'"
        >
          Tous ({{ projectsStore.projects.length }})
        </button>
        <button
          v-for="cat in categories"
          :key="String(cat)"
          @click="activeCategory = activeCategory === cat ? null : String(cat)"
          class="px-3 py-1.5 rounded-full text-xs font-semibold transition-colors"
          :class="activeCategory === cat ? 'bg-accent-500 text-white shadow-sm' : 'bg-white/70 border border-brand-200 text-brand-700 hover:bg-white'"
        >
          {{ cat }} ({{ projectsStore.projects.filter((p: SavedProject) => p.category === cat).length }})
        </button>
      </div>

      <!-- Projects grid -->
      <div v-if="filteredProjects.length > 0" class="grid grid-cols-3 gap-4">
        <div
          v-for="project in filteredProjects"
          :key="project.id"
          class="group bg-white rounded-2xl border border-brand-100 hover:border-brand-300 hover:shadow-lg transition-all flex flex-col overflow-hidden"
        >
          <!-- Card body -->
          <div class="p-5 flex-1">
            <div class="flex items-start justify-between mb-3">
              <span
                class="text-[11px] font-bold px-2.5 py-1 rounded-full"
                :class="categoryColor(project.category)"
              >{{ project.category }}</span>
              <span v-if="project.isDefault" class="text-[10px] text-brand-400 font-medium">Cartelis ✦</span>
            </div>

            <h3 class="font-bold text-brand-900 text-sm mb-2 leading-snug">{{ project.name }}</h3>
            <p class="text-xs text-brand-600 leading-relaxed line-clamp-2">{{ project.description }}</p>

            <!-- Stats -->
            <div class="flex items-center gap-3 mt-4 pt-3 border-t border-brand-50">
              <div class="text-center">
                <p class="text-sm font-bold text-brand-800">{{ project.spec.mapping.length }}</p>
                <p class="text-[10px] text-brand-500">champs</p>
              </div>
              <div class="w-px h-6 bg-brand-100" />
              <div class="text-center">
                <p class="text-sm font-bold text-brand-800">{{ flowCount(project) }}</p>
                <p class="text-[10px] text-brand-500">flux</p>
              </div>
              <div class="w-px h-6 bg-brand-100" />
              <div class="text-center">
                <p class="text-sm font-bold text-brand-800">{{ project.spec.notifications.length }}</p>
                <p class="text-[10px] text-brand-500">notifs</p>
              </div>
              <span class="ml-auto text-[10px] text-brand-300">{{ formatDate(project.updatedAt) }}</span>
            </div>
          </div>

          <!-- Card actions -->
          <div class="border-t border-brand-50 px-4 py-3 flex items-center gap-2 bg-brand-50/50">
            <button
              @click="startDuplicate(project)"
              class="flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-lg bg-accent-500 text-white text-xs font-bold hover:bg-accent-600 transition-colors"
            >
              ⧉ Dupliquer
            </button>
            <button
              @click="loadProject(project)"
              class="px-3 py-2.5 rounded-lg border border-brand-200 text-brand-700 text-xs font-medium hover:bg-brand-100 transition-colors"
              title="Charger tel quel"
            >
              Charger
            </button>
            <button
              v-if="!project.isDefault"
              @click="deleteProject(project)"
              class="px-2 py-2 rounded-lg text-brand-300 hover:text-red-400 hover:bg-red-50 transition-colors"
              title="Supprimer"
            >
              ✕
            </button>
          </div>
        </div>
      </div>

      <div v-else class="text-center py-16 text-brand-500 text-sm">
        Aucun use-case dans cette categorie.
      </div>

    </div>
  </div>
</template>
