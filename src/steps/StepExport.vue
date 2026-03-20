<script setup lang="ts">
import { computed } from 'vue'
import { useSpecStore } from '@/stores/spec'
import { useValidation } from '@/composables/useValidation'
import { useExport } from '@/composables/useExport'
import { usePayload } from '@/composables/usePayload'
import StepShell from '@/components/StepShell.vue'
import CodeBlock from '@/components/CodeBlock.vue'
import MissingBanner from '@/components/MissingBanner.vue'

const store = useSpecStore()
const s = store.state
const { notes, errors, warnings, score } = useValidation()
const { exportJson, exportMarkdown, printSpec } = useExport()
const { fullConfig, urlProd, createPayload } = usePayload()

const scoreColor = computed(() => {
  if (score.value >= 80) return 'text-green-600'
  if (score.value >= 50) return 'text-yellow-600'
  return 'text-red-600'
})

const scoreBg = computed(() => {
  if (score.value >= 80) return 'bg-green-50 border-green-200'
  if (score.value >= 50) return 'bg-yellow-50 border-yellow-200'
  return 'bg-red-50 border-red-200'
})
</script>

<template>
  <StepShell icon="📄" title="Export & Récapitulatif" description="Vérifiez la spec, corrigez les trous, exportez.">

    <!-- Completeness score -->
    <div class="rounded-xl border p-5 flex items-center gap-5" :class="scoreBg">
      <div class="relative w-20 h-20 shrink-0">
        <svg viewBox="0 0 36 36" class="w-full h-full -rotate-90">
          <circle cx="18" cy="18" r="15.9" fill="none" stroke="#e5e7eb" stroke-width="3.5" />
          <circle
            cx="18" cy="18" r="15.9" fill="none"
            :stroke="score >= 80 ? '#16a34a' : score >= 50 ? '#ca8a04' : '#dc2626'"
            stroke-width="3.5"
            stroke-linecap="round"
            :stroke-dasharray="`${score} ${100 - score}`"
            stroke-dashoffset="0"
          />
        </svg>
        <span class="absolute inset-0 flex items-center justify-center text-lg font-bold" :class="scoreColor">
          {{ score }}%
        </span>
      </div>
      <div>
        <h3 class="font-semibold text-gray-900">Complétude de la spec</h3>
        <p class="text-sm text-gray-600 mt-1">
          {{ errors.length }} erreur(s) · {{ warnings.length }} avertissement(s)
        </p>
        <p class="text-xs text-gray-400 mt-0.5">
          {{ score >= 80 ? 'Prête à exporter ✓' : 'Corrigez les points ci-dessous avant export.' }}
        </p>
      </div>
    </div>

    <!-- Validation notes -->
    <MissingBanner :notes="notes" />

    <!-- Export buttons -->
    <div class="grid grid-cols-3 gap-3">
      <button @click="exportJson()" class="flex flex-col items-center gap-1 p-4 rounded-xl border border-gray-200 bg-white hover:border-violet-300 hover:shadow-sm transition-all text-gray-700">
        <span class="text-lg">{ }</span>
        <span class="font-medium">JSON</span>
        <span class="text-xs text-gray-400">Config complète</span>
      </button>
      <button @click="exportMarkdown()" class="flex flex-col items-center gap-1 p-4 rounded-xl border border-gray-200 bg-white hover:border-violet-300 hover:shadow-sm transition-all text-gray-700">
        <span class="text-lg">#</span>
        <span class="font-medium">Markdown</span>
        <span class="text-xs text-gray-400">Spec lisible</span>
      </button>
      <button @click="printSpec()" class="flex flex-col items-center gap-1 p-4 rounded-xl border border-gray-200 bg-white hover:border-violet-300 hover:shadow-sm transition-all text-gray-700">
        <span class="text-lg">🖨️</span>
        <span class="font-medium">PDF</span>
        <span class="text-xs text-gray-400">Imprimer / sauvegarder</span>
      </button>
    </div>

    <!-- Live spec summary -->
    <div class="space-y-3">
      <h3 class="text-sm font-semibold text-gray-700">Récapitulatif spec</h3>

      <div class="grid grid-cols-2 gap-3 text-sm">
        <div class="p-3 rounded-lg bg-white border border-gray-200">
          <p class="text-xs text-gray-400 uppercase tracking-wide mb-1">Projet</p>
          <p class="font-medium text-gray-900">{{ s.meta.projectName || '—' }}</p>
          <p class="text-gray-500">{{ s.meta.brand }} · {{ s.meta.accountId }}</p>
        </div>
        <div class="p-3 rounded-lg bg-white border border-gray-200">
          <p class="text-xs text-gray-400 uppercase tracking-wide mb-1">Sécurité</p>
          <p class="font-medium font-mono text-gray-900">{{ s.security.mode }}</p>
          <p class="text-gray-500">Calcul {{ s.security.computedBy }}</p>
        </div>
        <div class="p-3 rounded-lg bg-white border border-gray-200">
          <p class="text-xs text-gray-400 uppercase tracking-wide mb-1">Mapping</p>
          <p class="font-medium text-gray-900">{{ s.mapping.length }} champ(s)</p>
          <p class="text-gray-500">{{ s.mapping.filter(f => f.required).length }} requis</p>
        </div>
        <div class="p-3 rounded-lg bg-white border border-gray-200">
          <p class="text-xs text-gray-400 uppercase tracking-wide mb-1">Campagnes</p>
          <p class="font-medium text-gray-900">{{ s.campaigns.length }} campagne(s)</p>
          <p class="text-gray-500 font-mono text-xs">{{ s.campaigns.map(c => c.name).join(', ') }}</p>
        </div>
      </div>

      <CodeBlock :code="urlProd" label="URL PROD" />
      <CodeBlock :code="JSON.stringify(createPayload, null, 2)" label="Payload Création" lang="json" />
      <CodeBlock :code="JSON.stringify(fullConfig, null, 2)" label="Config complète" lang="json" />
    </div>

  </StepShell>
</template>

