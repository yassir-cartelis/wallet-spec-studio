<script setup lang="ts">
import { ref, computed } from 'vue'
import { useProjectsStore } from '@/stores/projects'
import type { SavedProject, SpecState } from '@/types/spec'

const emit = defineEmits<{
  start: []
  openAi: []
  openImport: []
  openGuide: []
  loadProject: [spec: SpecState]
}>()

const projectsStore = useProjectsStore()

// ── Category filter ───────────────────────────────────────────────────────────
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

// ── Category colors ───────────────────────────────────────────────────────────
const CATEGORY_COLORS: Record<string, string> = {
  'Logistique':    'bg-brand-100 text-brand-700',
  'Retail':        'bg-green-100 text-green-700',
  'Événementiel':  'bg-purple-100 text-purple-700',
  'Commerce':      'bg-orange-100 text-orange-700',
  'Mobilité':      'bg-teal-100 text-teal-700',
  'Finance':       'bg-blue-100 text-blue-700',
  'Santé':         'bg-rose-100 text-rose-700',
  'Autre':         'bg-gray-100 text-gray-600',
}

function categoryColor(cat: string) {
  return CATEGORY_COLORS[cat] ?? 'bg-gray-100 text-gray-600'
}

// ── Actions ───────────────────────────────────────────────────────────────────
function loadProject(project: SavedProject) {
  emit('loadProject', project.spec)
}

function duplicateAndLoad(project: SavedProject) {
  const copy = projectsStore.duplicate(project.id)
  if (copy) emit('loadProject', copy.spec)
}

function deleteProject(project: SavedProject) {
  projectsStore.remove(project.id)
}

// ── Format date ───────────────────────────────────────────────────────────────
function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })
}
</script>

<template>
  <div class="min-h-screen bg-brand-50">

    <!-- ── Hero section ─────────────────────────────────────────────────── -->
    <div class="flex flex-col items-center px-6 pt-14 pb-0">

      <!-- Logo -->
      <div class="flex flex-col items-center gap-3 mb-12">
        <span class="text-[11px] font-bold tracking-widest text-white bg-brand-700 px-3 py-1 rounded">CARTELIS</span>
        <div class="flex items-center gap-2">
          <span class="text-2xl font-bold text-brand-900">Wallet</span>
          <span class="text-2xl font-light text-gray-400">Spec Studio</span>
        </div>
      </div>

      <!-- AI hero CTA -->
      <div class="w-full max-w-2xl">
        <button
          @click="emit('openAi')"
          class="group w-full rounded-2xl bg-accent-600 hover:bg-accent-700 text-white p-8 text-left transition-all shadow-lg hover:shadow-xl"
        >
          <div class="flex items-start justify-between mb-5">
            <div class="flex items-center gap-3">
              <span class="text-3xl">✦</span>
              <span class="text-xs font-semibold tracking-widest text-accent-200 uppercase">Propulsé par GPT-4o</span>
            </div>
            <span class="text-accent-300 text-lg group-hover:translate-x-1 transition-transform">→</span>
          </div>
          <h1 class="text-2xl font-bold leading-snug mb-3">
            L'IA Cartelis analyse tes documents<br />
            <span class="text-accent-200">et initialise ta spec en quelques secondes</span>
          </h1>
          <p class="text-accent-100 text-sm leading-relaxed max-w-xl">
            Dépose ton brief client, un dictionnaire de données, ou tes notes d'atelier.
            GPT-4o extrait les informations clés et pré-remplit les 8 étapes de la spec pour toi.
          </p>
          <div class="mt-6 flex items-center gap-3">
            <span class="bg-white/20 text-white text-xs px-3 py-1.5 rounded-full font-medium">PDF</span>
            <span class="bg-white/20 text-white text-xs px-3 py-1.5 rounded-full font-medium">DOCX</span>
            <span class="bg-white/20 text-white text-xs px-3 py-1.5 rounded-full font-medium">TXT</span>
            <span class="bg-white/20 text-white text-xs px-3 py-1.5 rounded-full font-medium">MD</span>
            <span class="ml-auto bg-white text-accent-700 text-sm px-5 py-2 rounded-lg font-semibold group-hover:bg-accent-50 transition-colors">
              Déposer mes documents →
            </span>
          </div>
        </button>

        <!-- Secondary actions -->
        <div class="flex items-center gap-3 mt-4">
          <button
            @click="emit('start')"
            class="flex-1 flex items-center justify-center gap-2 px-5 py-3 rounded-xl border-2 border-gray-200 bg-white text-gray-700 hover:border-brand-300 hover:text-brand-700 transition-all text-sm font-medium"
          >
            ✏️ Partir de zéro
          </button>
          <button
            @click="emit('openGuide')"
            class="flex items-center gap-2 px-5 py-3 rounded-xl border-2 border-gray-200 bg-white text-gray-500 hover:border-brand-200 hover:text-brand-600 transition-all text-sm"
          >
            📖 Guide Wallet
          </button>
          <button
            @click="emit('openImport')"
            class="px-4 py-3 rounded-xl border border-dashed border-gray-200 text-gray-400 hover:text-gray-600 hover:border-gray-300 transition-all text-xs"
            title="Importer un fichier JSON de spec existante"
          >
            ↑ JSON
          </button>
        </div>
      </div>
    </div>

    <!-- ── Library section ───────────────────────────────────────────────── -->
    <div class="max-w-5xl mx-auto px-6 mt-16 pb-16">

      <!-- Section header -->
      <div class="flex items-center justify-between mb-5">
        <div>
          <h2 class="text-lg font-semibold text-gray-900">📚 Bibliothèque de use-cases</h2>
          <p class="text-sm text-gray-400 mt-0.5">Duplique un use-case existant pour démarrer plus vite.</p>
        </div>
        <span class="text-xs text-gray-400">{{ projectsStore.projects.length }} projets</span>
      </div>

      <!-- Category filters -->
      <div class="flex items-center gap-2 mb-6 flex-wrap">
        <button
          @click="activeCategory = null"
          class="px-3 py-1.5 rounded-full text-xs font-medium transition-colors"
          :class="activeCategory === null ? 'bg-accent-600 text-white' : 'bg-white border border-gray-200 text-gray-500 hover:border-brand-400'"
        >
          Tous ({{ projectsStore.projects.length }})
        </button>
        <button
          v-for="cat in categories"
          :key="String(cat)"
          @click="activeCategory = activeCategory === cat ? null : String(cat)"
          class="px-3 py-1.5 rounded-full text-xs font-medium transition-colors"
          :class="activeCategory === cat ? 'bg-accent-600 text-white' : 'bg-white border border-gray-200 text-gray-500 hover:border-brand-400'"
        >
          {{ cat }} ({{ projectsStore.projects.filter((p: SavedProject) => p.category === cat).length }})
        </button>
      </div>

      <!-- Projects grid -->
      <div v-if="filteredProjects.length > 0" class="grid grid-cols-3 gap-4">
        <div
          v-for="project in filteredProjects"
          :key="project.id"
          class="group bg-white rounded-xl border border-gray-200 hover:border-brand-300 hover:shadow-md transition-all flex flex-col"
        >
          <!-- Card header -->
          <div class="p-5 flex-1">
            <div class="flex items-start justify-between mb-3">
              <span
                class="text-[11px] font-semibold px-2 py-0.5 rounded-full"
                :class="categoryColor(project.category)"
              >{{ project.category }}</span>
              <span v-if="project.isDefault" class="text-[10px] text-gray-300 font-medium">Cartelis</span>
            </div>
            <h3 class="font-semibold text-gray-900 text-sm mb-2 leading-snug">{{ project.name }}</h3>
            <p class="text-xs text-gray-500 leading-relaxed line-clamp-3">{{ project.description }}</p>
          </div>

          <!-- Card meta -->
          <div class="px-5 pb-2 flex items-center gap-2 text-[11px] text-gray-300">
            <span>{{ project.spec.mapping.length }} champs</span>
            <span>·</span>
            <span>{{ project.spec.meta.accountId || '—' }}</span>
            <span class="ml-auto">{{ formatDate(project.updatedAt) }}</span>
          </div>

          <!-- Card actions -->
          <div class="border-t border-gray-100 px-4 py-3 flex items-center gap-2">
            <button
              @click="duplicateAndLoad(project)"
              class="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-accent-600 text-white text-xs font-medium hover:bg-accent-700 transition-colors"
            >
              ⧉ Dupliquer et démarrer
            </button>
            <button
              @click="loadProject(project)"
              class="px-3 py-2 rounded-lg border border-gray-200 text-gray-500 text-xs hover:border-brand-300 hover:text-brand-600 transition-colors"
              title="Charger ce projet (remplace le projet en cours)"
            >
              Charger
            </button>
            <button
              v-if="!project.isDefault"
              @click="deleteProject(project)"
              class="px-2 py-2 rounded-lg text-gray-300 hover:text-red-400 transition-colors text-xs"
              title="Supprimer ce projet"
            >
              ✕
            </button>
          </div>
        </div>
      </div>

      <!-- Empty state -->
      <div v-else class="text-center py-16 text-gray-400 text-sm">
        Aucun use-case dans cette catégorie.
      </div>

    </div>
  </div>
</template>
