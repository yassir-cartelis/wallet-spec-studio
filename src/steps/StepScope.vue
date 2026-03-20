<script setup lang="ts">
import { useSpecStore } from '@/stores/spec'
import StepShell from '@/components/StepShell.vue'
import FormField from '@/components/FormField.vue'

const store = useSpecStore()
const s = store.state

const timezones = [
  'Europe/Paris',
  'Europe/London',
  'Europe/Madrid',
  'America/New_York',
  'America/Chicago',
  'America/Los_Angeles',
  'Asia/Tokyo',
  'UTC',
]
</script>

<template>
  <StepShell icon="🏷️" title="Scope du projet" description="Informations générales sur le projet et les campagnes Wallet.">

    <!-- Project info -->
    <div class="grid grid-cols-2 gap-4">
      <FormField label="Nom du projet" required>
        <input v-model="s.meta.projectName" type="text" placeholder="Ex: Colissimo Wallet" class="input" />
      </FormField>
      <FormField label="Marque / Brand" required>
        <input v-model="s.meta.brand" type="text" placeholder="Ex: Colissimo" class="input" />
      </FormField>
      <FormField label="Account ID" required hint="Identifiant du compte Wallet Brevo (ex: colissimo)">
        <input v-model="s.meta.accountId" type="text" placeholder="colissimo" class="input font-mono" />
      </FormField>
      <FormField label="Project ID" required hint="Locale du projet (ex: fr_FR)">
        <input v-model="s.meta.projectId" type="text" placeholder="fr_FR" class="input font-mono" />
      </FormField>
      <FormField label="Timezone">
        <select v-model="s.meta.timezone" class="input">
          <option v-for="tz in timezones" :key="tz" :value="tz">{{ tz }}</option>
        </select>
      </FormField>
    </div>

    <!-- Campaigns -->
    <div>
      <div class="flex items-center justify-between mb-3">
        <h3 class="text-sm font-semibold text-gray-700">Campagnes</h3>
        <button @click="store.addCampaign()" class="btn-secondary text-xs">+ Ajouter</button>
      </div>

      <div class="space-y-2">
        <div
          v-for="campaign in s.campaigns"
          :key="campaign.id"
          class="grid grid-cols-[1fr_1fr_2fr_auto] gap-2 items-start p-3 rounded-lg border border-gray-200 bg-white"
        >
          <FormField label="Nom technique">
            <input v-model="campaign.name" type="text" placeholder="loyalty" class="input font-mono text-sm" />
          </FormField>
          <FormField label="Label">
            <input v-model="campaign.label" type="text" placeholder="Loyalty" class="input text-sm" />
          </FormField>
          <FormField label="Description">
            <input v-model="campaign.description" type="text" placeholder="Description…" class="input text-sm" />
          </FormField>
          <div class="pt-5">
            <button
              @click="store.removeCampaign(campaign.id)"
              class="text-gray-300 hover:text-red-400 transition-colors"
              :disabled="s.campaigns.length <= 1"
            >✕</button>
          </div>
        </div>
      </div>
    </div>

  </StepShell>
</template>
