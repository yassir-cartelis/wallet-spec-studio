<script setup lang="ts">
import { computed } from 'vue'
import { useSpecStore } from '@/stores/spec'
import { WALLET_FIELDS, ROOT_FIELDS } from '@/config/walletFields'
import StepShell from '@/components/StepShell.vue'
import StepHint from '@/components/StepHint.vue'
import CodeBlock from '@/components/CodeBlock.vue'
import type { FieldType } from '@/types/spec'

const store = useSpecStore()
const s = store.state

const TYPES: FieldType[] = ['string', 'boolean', 'number', 'date']

// Calcule le niveau effectif en temps réel depuis le walletField (ignore la valeur stockée)
function effectiveLevel(walletField: string): 'root' | 'metadata' {
  return ROOT_FIELDS.has(walletField) ? 'root' : 'metadata'
}

// Synchronise payloadLevel au store quand le champ wallet change
function onWalletFieldChange(field: { walletField: string; payloadLevel: 'root' | 'metadata' }) {
  field.payloadLevel = effectiveLevel(field.walletField)
}

// Presets
const PRESETS = [
  { sourceField: '', walletField: 'identifier', type: 'string' as FieldType, required: true, payloadLevel: 'root' as const },
  { sourceField: '', walletField: 'loyaltyStatus', type: 'string' as FieldType, required: false, payloadLevel: 'root' as const },
]

function addPreset(preset: typeof PRESETS[0]) {
  const exists = s.mapping.some((f) => f.walletField === preset.walletField)
  if (!exists) store.addMapping(preset)
}

// Preview du payload complet (tous les champs mappés)
const payloadPreview = computed(() => {
  if (s.mapping.length === 0) return null
  const root: Record<string, unknown> = {}
  const metadatas: Record<string, unknown> = {}

  for (const field of s.mapping) {
    if (!field.walletField) continue
    const val = field.example || `<${field.type}>`
    if (effectiveLevel(field.walletField) === 'root') {
      root[field.walletField] = val
    } else {
      metadatas[field.walletField] = val
    }
  }

  const obj: Record<string, unknown> = { ...root }
  if (Object.keys(metadatas).length > 0) obj.metadatas = metadatas
  return JSON.stringify([obj], null, 2)
})
</script>

<template>
  <StepShell icon="🗺️" title="Contrat de données" description="Mapping des champs source vers le payload API Captain Wallet.">

    <StepHint title="Structure du payload API">
      <p>L'API Captain Wallet attend un tableau d'objets avec cette structure :</p>
      <pre class="bg-blue-50 rounded p-2 text-xs font-mono mt-1 overflow-x-auto">[{
  "identifier": "...",       <span class="text-blue-500">← racine, obligatoire</span>
  "loyaltyStatus": "...",    <span class="text-blue-500">← racine, statut affiché</span>
  "metadatas": {             <span class="text-blue-500">← tous les autres champs</span>
    "deliveryDate": "...",
    "customField": "..."
  }
}]</pre>
      <p class="mt-2">Le badge <span class="bg-green-100 text-green-700 text-xs px-1.5 py-0.5 rounded font-medium">root</span> ou <span class="bg-blue-100 text-blue-700 text-xs px-1.5 py-0.5 rounded font-medium">metadata</span> est automatiquement assigné selon le champ Wallet choisi.</p>
    </StepHint>

    <!-- Quick presets -->
    <div>
      <p class="text-xs text-gray-500 mb-2">Ajouter les champs racine :</p>
      <div class="flex gap-2 flex-wrap">
        <button
          v-for="preset in PRESETS"
          :key="preset.walletField"
          @click="addPreset(preset)"
          :disabled="s.mapping.some(f => f.walletField === preset.walletField)"
          class="px-2.5 py-1 rounded border text-xs font-mono transition-colors"
          :class="s.mapping.some(f => f.walletField === preset.walletField)
            ? 'bg-gray-100 text-gray-300 border-gray-100 cursor-default'
            : 'bg-white text-gray-600 border-gray-200 hover:border-brand-400 hover:text-brand-600'"
        >{{ preset.walletField }}</button>
      </div>
    </div>

    <!-- Mapping rows -->
    <div class="space-y-2">
      <!-- Header -->
      <div class="grid grid-cols-[1fr_1fr_90px_72px_52px_28px] gap-2 px-3 text-xs font-medium text-gray-400 uppercase tracking-wide">
        <span>Champ source</span>
        <span>Champ Wallet</span>
        <span>Type</span>
        <span>Niveau</span>
        <span>Requis</span>
        <span></span>
      </div>

      <!-- Rows -->
      <div
        v-for="field in s.mapping"
        :key="field.id"
        class="rounded-lg border border-gray-100 bg-white hover:border-gray-200 transition-colors overflow-hidden"
      >
        <!-- Main row -->
        <div class="grid grid-cols-[1fr_1fr_90px_72px_52px_28px] gap-2 items-center p-2">
          <input
            v-model="field.sourceField"
            type="text"
            placeholder="parcelStatus"
            class="input font-mono text-sm"
          />
          <input
            v-model="field.walletField"
            type="text"
            list="wallet-fields-list"
            placeholder="loyaltyStatus"
            class="input text-sm font-mono"
            @change="onWalletFieldChange(field)"
          />
          <datalist id="wallet-fields-list">
            <option v-for="wf in WALLET_FIELDS" :key="wf.field" :value="wf.field" />
          </datalist>
          <select v-model="field.type" class="input text-sm">
            <option v-for="t in TYPES" :key="t" :value="t">{{ t }}</option>
          </select>
          <!-- Level badge — calculé depuis walletField, pas depuis la valeur stockée -->
          <span
            class="text-[11px] font-medium px-2 py-0.5 rounded-full text-center"
            :class="effectiveLevel(field.walletField) === 'root'
              ? 'bg-green-100 text-green-700'
              : 'bg-blue-100 text-blue-700'"
          >{{ effectiveLevel(field.walletField) }}</span>
          <div class="flex justify-center">
            <input type="checkbox" v-model="field.required" class="h-4 w-4 rounded accent-brand-600" />
          </div>
          <button
            @click="store.removeMapping(field.id)"
            class="text-gray-300 hover:text-red-400 transition-colors text-sm"
          >✕</button>
        </div>
        <!-- Notes row — toujours visible -->
        <div class="px-2 pb-2">
          <input
            v-model="field.notes"
            type="text"
            placeholder="Règle de transformation, contrainte, exemple de valeur…"
            class="w-full text-xs border border-gray-100 rounded px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-brand-300 placeholder:text-gray-300 bg-gray-50"
          />
        </div>
      </div>

      <!-- Empty state -->
      <div v-if="s.mapping.length === 0" class="text-center py-8 text-gray-400 text-sm border border-dashed border-gray-200 rounded-lg">
        Aucun champ mappé — utilisez les presets ci-dessus ou "Ajouter un champ".
      </div>
    </div>

    <!-- Add button -->
    <button @click="store.addMapping()" class="btn-dashed w-full">
      + Ajouter un champ
    </button>

    <!-- Payload preview -->
    <div v-if="payloadPreview">
      <CodeBlock :code="payloadPreview" label="Payload API généré (PUT /v2/contacts/{project})" lang="json" />
    </div>

  </StepShell>
</template>
