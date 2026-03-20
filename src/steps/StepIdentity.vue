<script setup lang="ts">
import { useSpecStore } from '@/stores/spec'
import { usePayload } from '@/composables/usePayload'
import StepShell from '@/components/StepShell.vue'
import FormField from '@/components/FormField.vue'
import CodeBlock from '@/components/CodeBlock.vue'

const store = useSpecStore()
const s = store.state
const { urlQlf, urlProd } = usePayload()

const CHANNELS = ['email', 'sms', 'push', 'web', 'inapp']

function toggleChannel(ch: string) {
  const idx = s.entry.channels.indexOf(ch)
  if (idx === -1) s.entry.channels.push(ch)
  else if (s.entry.channels.length > 1) s.entry.channels.splice(idx, 1)
}
</script>

<template>
  <StepShell icon="🔑" title="Identité & Points d'entrée" description="Variable pivot, URLs d'accès et canaux d'activation.">

    <!-- Pivot -->
    <div class="grid grid-cols-2 gap-4">
      <FormField label="Variable pivot" required hint="Nom du champ identifiant côté source (ex: parcelNumber)">
        <input v-model="s.entry.pivotVar" type="text" placeholder="parcelNumber" class="input font-mono" />
      </FormField>
      <FormField label="Exemple de valeur" hint="Ex: 8X00123456789">
        <input v-model="s.entry.pivotExample" type="text" placeholder="8X00123456789" class="input font-mono" />
      </FormField>
    </div>

    <!-- Base URLs -->
    <div class="grid grid-cols-2 gap-4">
      <FormField label="Base URL QLF" hint="Laisser vide pour auto-générer">
        <input v-model="s.entry.baseUrlQlf" type="text" :placeholder="`https://qlf-${s.meta.accountId || 'account'}.captainwallet.com`" class="input font-mono text-sm" />
      </FormField>
      <FormField label="Base URL PROD" required hint="Laisser vide pour auto-générer">
        <input v-model="s.entry.baseUrlProd" type="text" :placeholder="`https://${s.meta.accountId || 'account'}.captainwallet.com`" class="input font-mono text-sm" />
      </FormField>
    </div>

    <!-- Channels -->
    <FormField label="Canaux d'activation">
      <div class="flex gap-2 flex-wrap mt-1">
        <button
          v-for="ch in CHANNELS"
          :key="ch"
          @click="toggleChannel(ch)"
          class="px-3 py-1.5 rounded-full text-sm border transition-colors"
          :class="s.entry.channels.includes(ch)
            ? 'bg-violet-600 text-white border-violet-600'
            : 'bg-white text-gray-500 border-gray-200 hover:border-violet-300'"
        >
          {{ ch }}
        </button>
      </div>
    </FormField>

    <!-- URL Preview -->
    <div v-if="s.entry.pivotVar" class="space-y-3">
      <h3 class="text-sm font-semibold text-gray-700">URLs générées</h3>
      <CodeBlock :code="urlQlf" label="URL QLF" />
      <CodeBlock :code="urlProd" label="URL PROD" />
    </div>

  </StepShell>
</template>
