<script setup lang="ts">
import { useSpecStore } from '@/stores/spec'
import { usePayload } from '@/composables/usePayload'
import StepShell from '@/components/StepShell.vue'
import FormField from '@/components/FormField.vue'
import CodeBlock from '@/components/CodeBlock.vue'
import StepHint from '@/components/StepHint.vue'

const store = useSpecStore()
const s = store.state
const { urlsPerCampaign } = usePayload()

const CHANNELS = ['email', 'sms', 'push', 'web', 'inapp']

function toggleChannel(ch: string) {
  const idx = s.entry.channels.indexOf(ch)
  if (idx === -1) s.entry.channels.push(ch)
  else if (s.entry.channels.length > 1) s.entry.channels.splice(idx, 1)
}
</script>

<template>
  <StepShell icon="🔑" title="Identité & Points d'entrée" description="Variable pivot, URLs d'accès et canaux d'activation.">

    <StepHint title="C'est quoi la variable pivot ?">
      <p>Le pivot est <strong>l'identifiant unique</strong> qui relie une donnée côté client à une carte Wallet. C'est autour de lui que tout s'articule.</p>
      <p>En pratique : c'est le nom de la variable dans ton système source qui contient cet identifiant. Ex : <code class="bg-blue-100 px-1 rounded font-mono text-xs">parcelNumber</code>, <code class="bg-blue-100 px-1 rounded font-mono text-xs">orderId</code>, <code class="bg-blue-100 px-1 rounded font-mono text-xs">customerId</code>.</p>
      <p>Ce champ alimente le champ <code class="bg-blue-100 px-1 rounded font-mono text-xs">identifier</code> à la racine du payload API Captain Wallet. C'est le seul champ <strong>obligatoire</strong> dans tous les appels.</p>
    </StepHint>

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
            ? 'bg-brand-600 text-white border-brand-600'
            : 'bg-white text-gray-500 border-gray-200 hover:border-brand-300'"
        >
          {{ ch }}
        </button>
      </div>
    </FormField>

    <!-- URL Preview par campagne -->
    <div v-if="s.entry.pivotVar && s.campaigns.length" class="space-y-4">
      <h3 class="text-sm font-semibold text-gray-700">URLs d'encartement par campagne</h3>
      <div
        v-for="c in urlsPerCampaign"
        :key="c.name"
        class="rounded-lg border border-gray-100 bg-gray-50 p-3 space-y-2"
      >
        <p class="text-xs font-semibold text-gray-600">
          {{ c.label }}
          <span v-if="c.name" class="font-normal text-gray-400 font-mono ml-1">{{ c.name }}</span>
        </p>
        <CodeBlock :code="c.qlf" label="QLF" />
        <CodeBlock :code="c.prod" label="PROD" />
      </div>
    </div>

  </StepShell>
</template>
