<script setup lang="ts">
import { useSpecStore } from '@/stores/spec'
import StepShell from '@/components/StepShell.vue'
import type { ErrorRule } from '@/types/spec'

const store = useSpecStore()
const s = store.state

const STRATEGIES: ErrorRule['strategy'][] = ['retry', 'alert', 'ignore', 'fallback']

const STRATEGY_COLORS: Record<ErrorRule['strategy'], string> = {
  retry: 'bg-blue-100 text-blue-700',
  alert: 'bg-red-100 text-red-700',
  ignore: 'bg-gray-100 text-gray-600',
  fallback: 'bg-yellow-100 text-yellow-700',
}
</script>

<template>
  <StepShell icon="⚠️" title="Erreurs & Observabilité" description="Catalogue des codes d'erreur et stratégies de traitement.">

    <div class="space-y-2">
      <!-- Header -->
      <div class="grid grid-cols-[80px_1fr_120px_1fr_32px] gap-2 px-3 text-xs font-medium text-gray-400 uppercase tracking-wide">
        <span>Code</span>
        <span>Label</span>
        <span>Stratégie</span>
        <span>Notes</span>
        <span></span>
      </div>

      <div
        v-for="err in s.errors"
        :key="err.id"
        class="grid grid-cols-[80px_1fr_120px_1fr_32px] gap-2 items-center p-2 rounded-lg border border-gray-100 bg-white"
      >
        <input
          v-model="err.code"
          type="text"
          placeholder="400"
          class="input font-mono text-sm text-center"
        />
        <input
          v-model="err.label"
          type="text"
          placeholder="Bad Request"
          class="input text-sm"
        />
        <select v-model="err.strategy" class="input text-sm">
          <option v-for="st in STRATEGIES" :key="st" :value="st">{{ st }}</option>
        </select>
        <input
          v-model="err.notes"
          type="text"
          placeholder="Note…"
          class="input text-sm"
        />
        <button
          @click="store.removeError(err.id)"
          class="text-gray-300 hover:text-red-400 transition-colors text-sm"
        >✕</button>
      </div>

      <div v-if="s.errors.length === 0" class="text-center py-8 text-gray-400 text-sm border border-dashed border-gray-200 rounded-lg">
        Aucune règle d'erreur.
      </div>
    </div>

    <!-- Strategy legend -->
    <div class="flex gap-2 flex-wrap">
      <span
        v-for="st in STRATEGIES"
        :key="st"
        class="px-2.5 py-1 rounded-full text-xs font-medium"
        :class="STRATEGY_COLORS[st]"
      >{{ st }}</span>
    </div>

    <button @click="store.addError()" class="btn-dashed w-full">
      + Ajouter un code d'erreur
    </button>

  </StepShell>
</template>
