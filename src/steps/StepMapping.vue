<script setup lang="ts">
import { useSpecStore } from '@/stores/spec'
import { WALLET_FIELDS } from '@/config/walletFields'
import StepShell from '@/components/StepShell.vue'
import type { FieldType } from '@/types/spec'

const store = useSpecStore()
const s = store.state

const TYPES: FieldType[] = ['string', 'boolean', 'number', 'date']

// Quick-add presets
const PRESETS = [
  { sourceField: s.meta.accountId ? 'parcelNumber' : 'identifier', walletField: 'user.identifier', type: 'string' as FieldType, required: true },
  { sourceField: 'parcelStatus', walletField: 'user.status', type: 'string' as FieldType, required: false },
  { sourceField: 'recipientFirstName', walletField: 'user.firstName', type: 'string' as FieldType, required: false },
  { sourceField: 'recipientLastName', walletField: 'user.lastName', type: 'string' as FieldType, required: false },
]

function addPreset(preset: typeof PRESETS[0]) {
  const exists = s.mapping.some((f) => f.walletField === preset.walletField)
  if (!exists) store.addMapping(preset)
}
</script>

<template>
  <StepShell icon="🗺️" title="Contrat de données" description="Mapping des champs du système source vers les champs Wallet Brevo.">

    <!-- Quick presets -->
    <div>
      <p class="text-xs text-gray-500 mb-2">Ajout rapide :</p>
      <div class="flex gap-2 flex-wrap">
        <button
          v-for="preset in PRESETS"
          :key="preset.walletField"
          @click="addPreset(preset)"
          :disabled="s.mapping.some(f => f.walletField === preset.walletField)"
          class="px-2.5 py-1 rounded border text-xs font-mono transition-colors"
          :class="s.mapping.some(f => f.walletField === preset.walletField)
            ? 'bg-gray-100 text-gray-300 border-gray-100 cursor-default'
            : 'bg-white text-gray-600 border-gray-200 hover:border-violet-400 hover:text-violet-600'"
        >
          {{ preset.walletField }}
        </button>
      </div>
    </div>

    <!-- Mapping table -->
    <div class="space-y-2">
      <!-- Header -->
      <div class="grid grid-cols-[1fr_1fr_100px_80px_32px] gap-2 px-3 text-xs font-medium text-gray-400 uppercase tracking-wide">
        <span>Champ source</span>
        <span>Champ Wallet</span>
        <span>Type</span>
        <span>Requis</span>
        <span></span>
      </div>

      <!-- Rows -->
      <div
        v-for="field in s.mapping"
        :key="field.id"
        class="grid grid-cols-[1fr_1fr_100px_80px_32px] gap-2 items-center p-2 rounded-lg border border-gray-100 bg-white hover:border-gray-200 transition-colors"
      >
        <input
          v-model="field.sourceField"
          type="text"
          placeholder="parcelStatus"
          class="input font-mono text-sm"
        />
        <select v-model="field.walletField" class="input text-sm font-mono">
          <option value="" disabled>Choisir…</option>
          <optgroup label="Champs Wallet Brevo">
            <option v-for="wf in WALLET_FIELDS" :key="wf.field" :value="wf.field">
              {{ wf.field }}
            </option>
          </optgroup>
          <optgroup label="Personnalisé">
            <option value="__custom__">+ Saisir manuellement</option>
          </optgroup>
        </select>
        <select v-model="field.type" class="input text-sm">
          <option v-for="t in TYPES" :key="t" :value="t">{{ t }}</option>
        </select>
        <div class="flex justify-center">
          <input type="checkbox" v-model="field.required" class="h-4 w-4 rounded accent-violet-600" />
        </div>
        <button
          @click="store.removeMapping(field.id)"
          class="text-gray-300 hover:text-red-400 transition-colors text-sm"
        >✕</button>
      </div>

      <!-- Empty state -->
      <div v-if="s.mapping.length === 0" class="text-center py-8 text-gray-400 text-sm border border-dashed border-gray-200 rounded-lg">
        Aucun champ mappé — cliquez sur "Ajouter un champ" ou utilisez les presets ci-dessus.
      </div>
    </div>

    <!-- Add button -->
    <button @click="store.addMapping()" class="btn-dashed w-full">
      + Ajouter un champ
    </button>

    <!-- Notes per field (expanded on demand) -->
    <details v-if="s.mapping.length > 0" class="mt-2">
      <summary class="text-xs text-gray-400 cursor-pointer hover:text-gray-600">Ajouter des notes par champ</summary>
      <div class="mt-3 space-y-2">
        <div v-for="field in s.mapping" :key="'note-' + field.id" class="flex gap-2 items-start">
          <span class="text-xs font-mono text-gray-500 pt-2 w-36 shrink-0">{{ field.walletField || field.sourceField || '—' }}</span>
          <input
            v-model="field.notes"
            type="text"
            placeholder="Note / contrainte…"
            class="input text-sm flex-1"
          />
        </div>
      </div>
    </details>

  </StepShell>
</template>
