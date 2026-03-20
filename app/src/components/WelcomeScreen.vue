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

function loadProject(project: SavedProject) {
  emit('loadProject', project.spec)
}

function deleteProject(project: SavedProject) {
  projectsStore.remove(project.id)
}

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
  const key = cat.normalize('NFD').replace(/[\u0300-\u036f]/g, '')
  return CATEGORY_COLORS[key] ?? 'bg-brand-100 text-brand-700'
}

function flowCount(p: SavedProject) {
  return Object.values(p.spec.flows).filter((f) => f.enabled).length
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })
}

const valueProps = [
  {
    icon: '🗂️',
    title: 'Spec structurée en 8 étapes',
    desc: "Scope, mapping, flux, sécurité, notifications, erreurs — tout dans l'ordre, rien d'oublié.",
  },
  {
    icon: '♻️',
    title: 'Bibliothèque de use-cases',
    desc: 'Duplique un projet existant (suivi colis, fidélité, billet…) et adapte-le en quelques minutes.',
  },
  {
    icon: '📤',
    title: 'Export prêt pour les devs',
    desc: 'JSON structuré ou Markdown lisible — directement transmissible à l\'équipe technique.',
  },
]
</script>

<template>
  <div class="min-h-screen bg-brand-200">

    <NameModal
      v-if="duplicatingProject"
      :initial="duplicatingProject.name"
      :from="duplicatingProject.name"
      @confirm="confirmDuplicate"
      @cancel="duplicatingProject = null"
    />

    <!-- HERO -->
    <div class="flex flex-col items-center px-6 pt-14 pb-0">

      <!-- Brand -->
      <div class="flex flex-col items-center gap-2 mb-8">
        <span class="text-[11px] font-bold tracking-widest text-white bg-brand-700 px-3 py-1 rounded">CARTELIS</span>
        <h1 class="text-4xl font-bold text-brand-900">Wallet Studio</h1>
        <p class="text-base text-brand-600 font-medium">L'outil de cadrage pour vos intégrations Brevo Wallet</p>
      </div>

      <!-- Value props -->
      <div class="w-full max-w-3xl grid grid-cols-3 gap-3 mb-10">
        <div
          v-for="vp in valueProps"
          :key="vp.title"
          class="bg-white/70 border border-white rounded-2xl px-5 py-4"
        >
          <div class="text-2xl mb-2">{{ vp.icon }}</div>
          <p class="text-sm font-bold text-brand-900 mb-1">{{ vp.title }}</p>
          <p class="text-xs text-brand-600 leading-relaxed">{{ vp.desc }}</p>
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
              <span class="text-xs font-semibold tracking-widest text-accent-200 uppercase">Propulsé par GPT-4o</span>
            </div>
            <span class="text-accent-300 text-lg group-hover:translate-x-1 transition-transform">→</span>
          </div>
          <h2 class="text-2xl font-bold leading-snug mb-3">
            L'IA Cartelis analyse tes documents<br />
            <span class="text-accent-200">et initialise ta spec en quelques secondes</span>
          </h2>
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
            class="flex-1 flex items-center justify-center gap-2 px-5 py-3 rounded-xl border-2 border-white/50 bg-white/70 text-brand-900 hover:bg-white hover:border-brand-400 transition-all text-sm font-medium"
          >
            ✏️ Partir de zéro
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

    <!-- LIBRARY -->
    <div class="max-w-5xl mx-auto px-6 mt-16 pb-16">

      <div class="flex items-end justify-between mb-6">
        <div>
          <h2 class="text-xl font-bold text-brand-900">📚 Bibliothèque de use-cases</h2>
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
          <div class="p-5 flex-1">
            <div class="flex items-start justify-between mb-3">
              <span class="text-[11px] font-bold px-2.5 py-1 rounded-full" :class="categoryColor(project.category)">{{ project.category }}</span>
              <span v-if="project.isDefault" class="text-[10px] text-brand-400 font-medium">Cartelis ✦</span>
            </div>
            <h3 class="font-bold text-brand-900 text-sm mb-2 leading-snug">{{ project.name }}</h3>
            <p class="text-xs text-brand-600 leading-relaxed line-clamp-2">{{ project.description }}</p>
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
          <div class="border-t border-brand-50 px-4 py-3 flex items-center gap-2 bg-brand-50/50">
            <button @click="startDuplicate(project)" class="flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-lg bg-accent-500 text-white text-xs font-bold hover:bg-accent-600 transition-colors">⧉ Dupliquer</button>
            <button @click="loadProject(project)" class="px-3 py-2.5 rounded-lg border border-brand-200 text-brand-700 text-xs font-medium hover:bg-brand-100 transition-colors" title="Charger tel quel">Charger</button>
            <button v-if="!project.isDefault" @click="deleteProject(project)" class="px-2 py-2 rounded-lg text-brand-300 hover:text-red-400 hover:bg-red-50 transition-colors" title="Supprimer">✕</button>
          </div>
        </div>
      </div>

      <div v-else class="text-center py-16 text-brand-500 text-sm">
        Aucun use-case dans cette catégorie.
      </div>

    </div>
  </div>
</template>
