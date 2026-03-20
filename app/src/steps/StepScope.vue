<script setup lang="ts">
import { useSpecStore } from '@/stores/spec'
import StepShell from '@/components/StepShell.vue'
import FormField from '@/components/FormField.vue'
import StepHint from '@/components/StepHint.vue'
import { USE_CASE_CATEGORIES } from '@/types/spec'

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

    <StepHint title="Où trouver ces informations ?">
      <p><strong>Account ID</strong> : c'est le slug de ton compte Wallet Brevo, en minuscules sans espaces. Retrouve-le dans le dashboard Wallet Brevo ou demande-le à ton contact technique. Ex : <code class="bg-blue-100 px-1 rounded font-mono text-xs">colissimo</code></p>
      <p><strong>Project ID</strong> : correspond à la locale de la campagne. Généralement <code class="bg-blue-100 px-1 rounded font-mono text-xs">fr_FR</code> pour la France.</p>
      <p><strong>Campagnes</strong> : chaque projet a au minimum deux campagnes — la campagne principale (la carte active) et <code class="bg-blue-100 px-1 rounded font-mono text-xs">void</code> (utilisée pour vider la carte en fin de vie). Le nom technique doit être un slug minuscule.</p>
    </StepHint>

    <!-- Description du use-case -->
    <div class="rounded-xl bg-brand-50 border border-brand-100 p-4 space-y-3">
      <div class="flex items-center gap-2 mb-1">
        <span class="text-sm font-semibold text-brand-900">Description du use-case</span>
        <span class="text-[10px] text-brand-500 bg-brand-100 px-2 py-0.5 rounded-full">Bibliothèque</span>
      </div>
      <p class="text-xs text-brand-600">Ces informations alimentent la bibliothèque de use-cases pour faciliter la réutilisation.</p>
      <div class="grid grid-cols-2 gap-3">
        <FormField label="Catégorie use-case">
          <select v-model="s.meta.useCaseCategory" class="input text-sm">
            <option value="">— Sélectionner —</option>
            <option v-for="cat in USE_CASE_CATEGORIES" :key="cat" :value="cat">{{ cat }}</option>
          </select>
        </FormField>
      </div>
      <FormField label="Description" hint="1-2 phrases pour la bibliothèque">
        <textarea
          v-model="s.meta.description"
          rows="2"
          placeholder="Ex : Carte Wallet de suivi de colis mise à jour en temps réel à chaque événement transporteur..."
          class="input text-sm resize-none"
        />
      </FormField>
    </div>

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
