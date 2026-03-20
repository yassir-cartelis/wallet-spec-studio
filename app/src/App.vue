<script setup lang="ts">
import { ref, computed } from 'vue'
import { useSpecStore } from '@/stores/spec'
import { useProjectsStore } from '@/stores/projects'
import { useValidation } from '@/composables/useValidation'
import { STEPS } from '@/config/steps'
import type { StepId, SpecState } from '@/types/spec'

// Step components
import StepScope from '@/steps/StepScope.vue'
import StepIdentity from '@/steps/StepIdentity.vue'
import StepSecurity from '@/steps/StepSecurity.vue'
import StepMapping from '@/steps/StepMapping.vue'
import StepFlows from '@/steps/StepFlows.vue'
import StepNotifications from '@/steps/StepNotifications.vue'
import StepErrors from '@/steps/StepErrors.vue'
import StepExport from '@/steps/StepExport.vue'
import AiImportModal from '@/components/AiImportModal.vue'
import WelcomeScreen from '@/components/WelcomeScreen.vue'
import WalletGuide from '@/components/WalletGuide.vue'
import FeedbackPanel from '@/components/FeedbackPanel.vue'
import LibraryPanel from '@/components/LibraryPanel.vue'
import { useTicketsStore } from '@/stores/tickets'

const STEP_COMPONENTS: Record<StepId, unknown> = {
  scope: StepScope,
  identity: StepIdentity,
  security: StepSecurity,
  mapping: StepMapping,
  flows: StepFlows,
  notifications: StepNotifications,
  errors: StepErrors,
  export: StepExport,
}

const store = useSpecStore()
const projectsStore = useProjectsStore()
const ticketsStore = useTicketsStore()
const { score } = useValidation()
const currentStep = ref<StepId>('scope')
const showFeedback = ref(false)
const showLibrary = ref(false)
const showMobileNav = ref(false)

// ── Welcome / guide state ─────────────────────────────────────────────────────
const hasProject = computed(() => !!store.state.meta.projectName || store.state.mapping.length > 0)
const showWelcome = ref(!hasProject.value)
const showGuide = ref(false)

function enterApp() {
  showWelcome.value = false
}

function onWelcomeStart() {
  enterApp()
  goTo('scope')
}

function onWelcomeAi() {
  enterApp()
  showAiModal.value = true
}

function onWelcomeImport() {
  enterApp()
  triggerImport()
}

function onLoadProject(spec: SpecState) {
  store.importSpec(spec)
  enterApp()
  goTo('scope')
  showToast(`✓ Projet chargé — ${spec.meta.projectName}`, 'success')
}

// ── AI import modal ───────────────────────────────────────────────────────────
const showAiModal = ref(false)

function onAiImported(projectName: string) {
  showAiModal.value = false
  showToast(`✓ Spec générée — ${projectName}`, 'success')
  goTo('scope')
}

// ── Toast ─────────────────────────────────────────────────────────────────────
type Toast = { message: string; type: 'success' | 'error' }
const toast = ref<Toast | null>(null)
let toastTimer: ReturnType<typeof setTimeout>

function showToast(message: string, type: Toast['type']) {
  clearTimeout(toastTimer)
  toast.value = { message, type }
  toastTimer = setTimeout(() => (toast.value = null), 3000)
}

// ── Save current spec to library ──────────────────────────────────────────────
const justSaved = ref(false)
let savedTimer: ReturnType<typeof setTimeout>

function saveCurrentSpec() {
  const savedId = projectsStore.saveSpec(store.state)
  store.state.meta.savedId = savedId
  store.markClean()
  clearTimeout(savedTimer)
  justSaved.value = true
  savedTimer = setTimeout(() => (justSaved.value = false), 2500)
}

// ── JSON import (hidden — accessible via welcome screen or sidebar) ───────────
const fileInput = ref<HTMLInputElement | null>(null)

function triggerImport() {
  fileInput.value?.click()
}

function onFileSelected(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (!fileInput.value) return
  fileInput.value.value = ''
  if (!file) return
  const reader = new FileReader()
  reader.onload = (ev) => {
    try {
      const raw = JSON.parse(ev.target?.result as string)
      const result = store.importSpec(raw)
      if (result.ok) {
        showToast(`✓ Spec importée — ${store.state.meta.projectName || file.name}`, 'success')
        goTo('scope')
      } else {
        showToast(result.error ?? 'Erreur inconnue', 'error')
      }
    } catch {
      showToast('Fichier JSON invalide ou corrompu.', 'error')
    }
  }
  reader.readAsText(file)
}

// ── Navigation ────────────────────────────────────────────────────────────────
const currentStepIndex = computed(() => STEPS.findIndex((s) => s.id === currentStep.value))
const currentComponent = computed(() => STEP_COMPONENTS[currentStep.value])

function goTo(id: StepId) {
  currentStep.value = id
  showMobileNav.value = false
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

function prev() {
  if (currentStepIndex.value > 0) goTo(STEPS[currentStepIndex.value - 1].id)
}

function next() {
  if (currentStepIndex.value < STEPS.length - 1) goTo(STEPS[currentStepIndex.value + 1].id)
}

const scoreColor = computed(() => {
  if (score.value >= 80) return 'bg-green-500'
  if (score.value >= 50) return 'bg-yellow-400'
  return 'bg-red-400'
})
</script>

<template>
  <div class="min-h-screen bg-brand-200 flex flex-col">

    <!-- Modals -->
    <AiImportModal v-if="showAiModal" @close="showAiModal = false" @imported="onAiImported" />
    <WalletGuide v-if="showGuide" @close="showGuide = false" />
    <FeedbackPanel
      v-if="showFeedback"
      :current-step="showWelcome ? undefined : currentStep"
      @close="showFeedback = false"
    />
    <LibraryPanel
      v-if="showLibrary"
      @close="showLibrary = false"
      @load-project="onLoadProject"
    />

    <!-- Toast -->
    <transition name="toast">
      <div
        v-if="toast"
        class="fixed bottom-5 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 rounded-lg shadow-lg text-sm font-medium pointer-events-none"
        :class="toast.type === 'success' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'"
      >
        {{ toast.message }}
      </div>
    </transition>

    <!-- Hidden file input (JSON import) -->
    <input ref="fileInput" type="file" accept=".json,application/json" class="hidden" @change="onFileSelected" />

    <!-- Welcome screen -->
    <template v-if="showWelcome">
      <WelcomeScreen
        @start="onWelcomeStart"
        @open-ai="onWelcomeAi"
        @open-import="onWelcomeImport"
        @open-guide="showGuide = true"
        @load-project="onLoadProject"
      />
    </template>

    <!-- Main app -->
    <template v-else>

      <!-- Top bar -->
      <header class="sticky top-0 z-20 bg-white/90 backdrop-blur-sm border-b border-brand-200 px-4 md:px-6 py-3 flex items-center gap-3">
        <!-- Hamburger (mobile only) -->
        <button
          @click="showMobileNav = !showMobileNav"
          class="md:hidden flex items-center justify-center w-8 h-8 rounded-lg text-brand-700 hover:bg-brand-100 transition-colors shrink-0"
        >
          <span class="text-lg leading-none">☰</span>
        </button>

        <!-- Logo -->
        <button @click="showWelcome = true" class="flex items-center gap-2 hover:opacity-70 transition-opacity shrink-0">
          <span class="text-[11px] font-bold tracking-widest text-white bg-brand-700 px-2 py-0.5 rounded">CARTELIS</span>
          <span class="hidden sm:inline text-sm font-semibold text-brand-900">Wallet Studio</span>
        </button>

        <div class="flex-1" />

        <span v-if="store.state.meta.projectName" class="hidden md:inline text-sm text-gray-500 truncate max-w-[180px]">
          {{ store.state.meta.projectName }}
        </span>

        <!-- Completeness bar -->
        <div class="flex items-center gap-2">
          <div class="w-16 md:w-24 h-1.5 rounded-full bg-gray-200 overflow-hidden">
            <div class="h-full rounded-full transition-all duration-500" :class="scoreColor" :style="{ width: score + '%' }" />
          </div>
          <span class="text-xs font-medium text-gray-500">{{ score }}%</span>
        </div>

        <!-- AI import -->
        <button
          @click="showAiModal = true"
          class="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-md bg-accent-500 text-white hover:bg-accent-600 transition-colors font-medium"
        >✦ IA</button>

        <!-- Save (hidden on mobile) -->
        <button
          @click="saveCurrentSpec"
          :disabled="!store.state.meta.projectName || justSaved"
          class="hidden md:flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-md border transition-colors disabled:cursor-not-allowed"
          :class="justSaved ? 'border-brand-400 text-brand-700 bg-brand-50' : 'border-gray-200 text-gray-600 hover:border-brand-400 hover:text-brand-600 disabled:opacity-30'"
        >{{ justSaved ? '✓ Sauvegardé !' : '💾 Sauvegarder' }}</button>

        <button
          @click="store.reset(); showWelcome = true"
          class="hidden md:inline text-xs text-gray-400 hover:text-red-400 transition-colors"
        >↺ Reset</button>
      </header>

      <div class="flex flex-1 relative">

        <!-- Mobile nav overlay -->
        <div
          v-if="showMobileNav"
          class="fixed inset-0 z-30 bg-black/40 md:hidden"
          @click="showMobileNav = false"
        />

        <!-- Sidebar nav -->
        <nav
          class="fixed top-0 left-0 h-full z-40 w-72 md:w-56 overflow-y-auto flex flex-col py-4
                 border-r border-brand-300 bg-white backdrop-blur-sm
                 transition-transform duration-300
                 md:sticky md:top-[53px] md:h-[calc(100vh-53px)] md:translate-x-0"
          :class="showMobileNav ? 'translate-x-0 shadow-2xl' : '-translate-x-full md:translate-x-0'"
        >
          <!-- Close button (mobile only) -->
          <div class="md:hidden flex items-center justify-between px-4 pb-3 border-b border-brand-100 mb-3">
            <span class="text-sm font-bold text-brand-900">Navigation</span>
            <button @click="showMobileNav = false" class="text-brand-400 text-xl">×</button>
          </div>

          <!-- Mobile: save + reset actions -->
          <div class="md:hidden px-3 mb-3 flex gap-2">
            <button
              @click="saveCurrentSpec"
              :disabled="!store.state.meta.projectName || justSaved"
              class="flex-1 text-xs px-3 py-2 rounded-lg border transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              :class="justSaved ? 'border-brand-400 text-brand-700 bg-brand-50' : 'border-gray-200 text-gray-600'"
            >{{ justSaved ? '✓ Sauvegardé' : '💾 Sauvegarder' }}</button>
            <button
              @click="store.reset(); showWelcome = true; showMobileNav = false"
              class="text-xs px-3 py-2 rounded-lg border border-gray-200 text-gray-400"
            >↺</button>
          </div>

          <!-- Guide CTA -->
          <div class="px-3 mb-3">
            <button
              @click="showGuide = true; showMobileNav = false"
              class="w-full rounded-xl bg-brand-700 hover:bg-brand-600 text-white text-left px-4 py-3 transition-colors group"
            >
              <div class="flex items-center justify-between mb-1">
                <span class="text-lg">📖</span>
                <span class="text-brand-300 text-xs group-hover:translate-x-0.5 transition-transform">→</span>
              </div>
              <p class="text-xs font-semibold leading-snug">Premier projet Wallet ?</p>
              <p class="text-[11px] text-brand-300 mt-0.5">Guide + schéma des flux</p>
            </button>
          </div>

          <!-- Library CTA -->
          <div class="px-3 mb-3">
            <button
              @click="showLibrary = true; showMobileNav = false"
              class="w-full rounded-xl bg-white border border-brand-200 hover:border-brand-400 text-left px-4 py-3 transition-colors group"
            >
              <div class="flex items-center justify-between mb-1">
                <span class="text-lg">📚</span>
                <span class="text-brand-300 text-xs group-hover:translate-x-0.5 transition-transform">→</span>
              </div>
              <p class="text-xs font-semibold text-brand-800 leading-snug">Bibliothèque</p>
              <p class="text-[11px] text-brand-500 mt-0.5">{{ projectsStore.projects.length }} use-cases</p>
            </button>
          </div>

          <div class="border-t border-gray-100 mb-2" />

          <ul class="space-y-0.5 px-3 flex-1">
            <li v-for="step in STEPS" :key="step.id">
              <button
                @click="goTo(step.id)"
                class="w-full flex items-center gap-3 px-3 py-2.5 md:py-2 rounded-lg text-left transition-colors text-sm"
                :class="currentStep === step.id ? 'bg-brand-50 text-brand-700 font-medium' : 'text-gray-600 hover:bg-gray-50'"
              >
                <span class="text-base w-5 text-center">{{ step.icon }}</span>
                <span class="flex-1 truncate">{{ step.label }}</span>
                <span v-if="currentStep === step.id" class="w-1.5 h-1.5 rounded-full bg-brand-500" />
              </button>
            </li>
          </ul>

          <div class="px-3 pt-3 border-t border-gray-100 mt-2">
            <button
              @click="triggerImport()"
              class="w-full text-xs text-gray-300 hover:text-gray-500 text-left px-2 py-1 transition-colors"
            >↑ Importer un JSON…</button>
          </div>
        </nav>

        <!-- Main content -->
        <main class="flex-1 px-4 py-5 md:px-8 md:py-8 max-w-3xl min-h-full">
          <component :is="currentComponent" />

          <!-- Step navigation -->
          <div class="flex items-center justify-between mt-8 md:mt-10 pt-5 md:pt-6 border-t border-gray-200">
            <button
              @click="prev()"
              :disabled="currentStepIndex === 0"
              class="px-4 py-2.5 text-sm rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >← Précédent</button>
            <span class="text-xs text-gray-400">{{ currentStepIndex + 1 }} / {{ STEPS.length }}</span>
            <button
              @click="next()"
              :disabled="currentStepIndex === STEPS.length - 1"
              class="px-4 py-2.5 text-sm rounded-lg bg-accent-500 text-white hover:bg-accent-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >Suivant →</button>
          </div>
        </main>

      </div>
    </template>

    <!-- Floating feedback button -->
    <button
      @click="showFeedback = true"
      class="fixed bottom-5 right-4 z-30 flex items-center gap-2 px-3 py-2 md:px-4 md:py-2.5 rounded-full bg-brand-900 text-white text-xs font-semibold shadow-lg hover:bg-brand-700 transition-colors"
      title="Feedback & tickets d'amélioration"
    >
      💬 Feedback
      <span
        v-if="ticketsStore.openCount > 0"
        class="bg-accent-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center"
      >{{ ticketsStore.openCount }}</span>
    </button>

  </div>
</template>
