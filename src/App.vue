<script setup lang="ts">
import { ref, computed } from 'vue'
import { useSpecStore } from '@/stores/spec'
import { useValidation } from '@/composables/useValidation'
import { STEPS } from '@/config/steps'
import type { StepId } from '@/types/spec'

// ── AI import modal ───────────────────────────────────────────────────────────
const showAiModal = ref(false)

function onAiImported(projectName: string) {
  showAiModal.value = false
  showToast(`✓ Spec générée — ${projectName}`, 'success')
  goTo('scope')
}

// ── Import feedback toast ─────────────────────────────────────────────────────
type Toast = { message: string; type: 'success' | 'error' }
const toast = ref<Toast | null>(null)
let toastTimer: ReturnType<typeof setTimeout>

function showToast(message: string, type: Toast['type']) {
  clearTimeout(toastTimer)
  toast.value = { message, type }
  toastTimer = setTimeout(() => (toast.value = null), 3000)
}

// ── JSON import ───────────────────────────────────────────────────────────────
const fileInput = ref<HTMLInputElement | null>(null)

function triggerImport() {
  fileInput.value?.click()
}

function onFileSelected(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (!fileInput.value) return
  fileInput.value.value = '' // reset so same file can be re-imported
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
const { score } = useValidation()
const currentStep = ref<StepId>('scope')

const currentStepIndex = computed(() => STEPS.findIndex((s) => s.id === currentStep.value))
const currentComponent = computed(() => STEP_COMPONENTS[currentStep.value])

function goTo(id: StepId) {
  currentStep.value = id
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
  <div class="min-h-screen bg-gray-50 flex flex-col">

    <!-- AI Import modal -->
    <AiImportModal v-if="showAiModal" @close="showAiModal = false" @imported="onAiImported" />

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

    <!-- Hidden file input -->
    <input ref="fileInput" type="file" accept=".json,application/json" class="hidden" @change="onFileSelected" />

    <!-- Top bar -->
    <header class="sticky top-0 z-20 bg-white border-b border-gray-200 px-6 py-3 flex items-center gap-4">
      <div class="flex items-center gap-2">
        <span class="text-lg font-bold text-violet-600">Wallet</span>
        <span class="text-lg font-light text-gray-400">Spec Studio</span>
      </div>

      <div class="flex-1" />

      <span v-if="store.state.meta.projectName" class="text-sm text-gray-500">
        {{ store.state.meta.projectName }}
      </span>

      <!-- Completeness bar -->
      <div class="flex items-center gap-2">
        <div class="w-24 h-1.5 rounded-full bg-gray-200 overflow-hidden">
          <div
            class="h-full rounded-full transition-all duration-500"
            :class="scoreColor"
            :style="{ width: score + '%' }"
          />
        </div>
        <span class="text-xs font-medium text-gray-500">{{ score }}%</span>
      </div>

      <!-- AI import button -->
      <button
        @click="showAiModal = true"
        class="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-md bg-violet-600 text-white hover:bg-violet-700 transition-colors font-medium"
        title="Générer une spec depuis des documents avec GPT-4o"
      >
        ✦ IA
      </button>

      <!-- Import button -->
      <button
        @click="triggerImport()"
        class="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-md border border-gray-200 text-gray-600 hover:border-violet-400 hover:text-violet-600 transition-colors"
        title="Importer un fichier JSON de spec"
      >
        ↑ Importer
      </button>

      <button
        @click="store.reset()"
        class="text-xs text-gray-400 hover:text-red-400 transition-colors"
        title="Réinitialiser la spec"
      >↺ Reset</button>
    </header>

    <div class="flex flex-1">

      <!-- Sidebar nav -->
      <nav class="w-56 shrink-0 border-r border-gray-200 bg-white sticky top-[53px] h-[calc(100vh-53px)] overflow-y-auto py-4">
        <ul class="space-y-0.5 px-3">
          <li v-for="step in STEPS" :key="step.id">
            <button
              @click="goTo(step.id)"
              class="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors text-sm"
              :class="currentStep === step.id
                ? 'bg-violet-50 text-violet-700 font-medium'
                : 'text-gray-600 hover:bg-gray-50'"
            >
              <span class="text-base w-5 text-center">{{ step.icon }}</span>
              <span class="flex-1 truncate">{{ step.label }}</span>
              <span v-if="currentStep === step.id" class="w-1.5 h-1.5 rounded-full bg-violet-500" />
            </button>
          </li>
        </ul>
      </nav>

      <!-- Main content -->
      <main class="flex-1 px-8 py-8 max-w-3xl">
        <component :is="currentComponent" />

        <!-- Step navigation -->
        <div class="flex items-center justify-between mt-10 pt-6 border-t border-gray-200">
          <button
            @click="prev()"
            :disabled="currentStepIndex === 0"
            class="px-4 py-2 text-sm rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            ← Précédent
          </button>
          <span class="text-xs text-gray-400">
            {{ currentStepIndex + 1 }} / {{ STEPS.length }}
          </span>
          <button
            @click="next()"
            :disabled="currentStepIndex === STEPS.length - 1"
            class="px-4 py-2 text-sm rounded-lg bg-violet-600 text-white hover:bg-violet-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            Suivant →
          </button>
        </div>
      </main>

    </div>
  </div>
</template>
