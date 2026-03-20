<script setup lang="ts">
import { useSpecStore } from '@/stores/spec'
import { usePayload } from '@/composables/usePayload'
import StepShell from '@/components/StepShell.vue'
import CodeBlock from '@/components/CodeBlock.vue'
import type { FlowName } from '@/types/spec'


const store = useSpecStore()
const s = store.state
const { createPayload, updatePayload, optinPayload, anonymizePayload } = usePayload()

const FLOW_DEFS: { id: FlowName; label: string; description: string; icon: string }[] = [
  { id: 'create', label: 'Création', description: 'Création de la carte au premier passage', icon: '➕' },
  { id: 'update', label: 'Mise à jour', description: 'Mise à jour du statut en temps réel', icon: '✏️' },
  { id: 'optin', label: 'Opt-in Wallet', description: 'Confirmation d\'installation dans le wallet natif', icon: '📲' },
  { id: 'anonymize', label: 'Anonymisation', description: 'Suppression / anonymisation RGPD', icon: '🗑️' },
]

function payloadFor(id: FlowName): string {
  const map = {
    create: createPayload,
    update: updatePayload,
    optin: optinPayload,
    anonymize: anonymizePayload,
  }
  return JSON.stringify(map[id].value, null, 2)
}
</script>

<template>
  <StepShell icon="🔄" title="Flux & Interfaces" description="Définissez quels champs sont envoyés dans chaque flux d'API.">

    <div class="space-y-4">
      <div
        v-for="flow in FLOW_DEFS"
        :key="flow.id"
        class="rounded-lg border transition-all"
        :class="s.flows[flow.id].enabled ? 'border-violet-200 bg-white' : 'border-gray-100 bg-gray-50'"
      >
        <!-- Flow header -->
        <div class="flex items-center gap-3 p-4">
          <span class="text-lg">{{ flow.icon }}</span>
          <div class="flex-1">
            <div class="flex items-center gap-2">
              <span class="font-medium text-sm text-gray-900">{{ flow.label }}</span>
              <span
                v-if="s.flows[flow.id].enabled"
                class="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-600"
              >actif</span>
            </div>
            <p class="text-xs text-gray-500 mt-0.5">{{ flow.description }}</p>
          </div>
          <label class="flex items-center cursor-pointer">
            <div class="relative">
              <input type="checkbox" v-model="s.flows[flow.id].enabled" class="sr-only" />
              <div
                class="w-10 h-6 rounded-full transition-colors"
                :class="s.flows[flow.id].enabled ? 'bg-violet-600' : 'bg-gray-200'"
              ></div>
              <div
                class="absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-transform"
                :class="s.flows[flow.id].enabled ? 'translate-x-5' : 'translate-x-1'"
              ></div>
            </div>
          </label>
        </div>

        <!-- Flow body (only when enabled) -->
        <template v-if="s.flows[flow.id].enabled">
          <div class="border-t border-gray-100 p-4 space-y-3">
            <!-- Description override -->
            <input
              v-model="s.flows[flow.id].description"
              type="text"
              placeholder="Description du flux…"
              class="input text-sm"
            />

            <!-- Field selector for create / update -->
            <template v-if="flow.id === 'create' || flow.id === 'update'">
              <div>
                <p class="text-xs font-medium text-gray-500 mb-2">Champs inclus dans ce flux :</p>
                <div class="flex flex-wrap gap-2">
                  <button
                    v-for="field in s.mapping"
                    :key="field.id"
                    @click="store.toggleFlowField(flow.id, field.id)"
                    class="px-2.5 py-1 rounded border text-xs font-mono transition-colors"
                    :class="s.flows[flow.id].fields.includes(field.id)
                      ? 'bg-violet-600 text-white border-violet-600'
                      : 'bg-white text-gray-500 border-gray-200 hover:border-violet-300'"
                  >
                    {{ field.walletField || field.sourceField || '?' }}
                  </button>
                  <span v-if="s.mapping.length === 0" class="text-xs text-gray-400">
                    Aucun champ mappé — rendez-vous à l'étape Mapping.
                  </span>
                </div>
              </div>
            </template>

            <!-- Payload preview -->
            <CodeBlock
              :code="payloadFor(flow.id)"
              :label="`Payload ${flow.label}`"
              lang="json"
            />
          </div>
        </template>
      </div>
    </div>

  </StepShell>
</template>
