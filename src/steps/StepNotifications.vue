<script setup lang="ts">
import { useSpecStore } from '@/stores/spec'
import StepShell from '@/components/StepShell.vue'
import FormField from '@/components/FormField.vue'

const store = useSpecStore()
const s = store.state

const TRIGGER_PRESETS = [
  'user.status == "LIVRÉ"',
  'user.status == "EN_TRANSIT"',
  'user.status == "DISPONIBLE_AU_BUREAU"',
  'user.status == "RETOUR_EXPÉDITEUR"',
  'user.expiration_date < today + 7d',
]
</script>

<template>
  <StepShell icon="🔔" title="Notifications" description="Configurez les messages push déclenchés par des événements Wallet.">

    <div class="space-y-4">
      <div
        v-for="notif in s.notifications"
        :key="notif.id"
        class="p-4 rounded-lg border border-gray-200 bg-white space-y-3"
      >
        <div class="flex items-center justify-between">
          <span class="text-xs font-medium text-gray-500 uppercase tracking-wide">Notification</span>
          <button @click="store.removeNotification(notif.id)" class="text-gray-300 hover:text-red-400 text-sm transition-colors">✕</button>
        </div>

        <FormField label="Trigger">
          <div class="space-y-1.5">
            <input
              v-model="notif.trigger"
              type="text"
              placeholder='user.status == "LIVRÉ"'
              class="input font-mono text-sm"
            />
            <div class="flex flex-wrap gap-1.5">
              <button
                v-for="preset in TRIGGER_PRESETS"
                :key="preset"
                @click="notif.trigger = preset"
                class="px-2 py-0.5 rounded text-xs border border-gray-200 text-gray-500 hover:border-brand-300 hover:text-brand-600 font-mono transition-colors bg-white"
              >{{ preset }}</button>
            </div>
          </div>
        </FormField>

        <FormField label="Campagne cible">
          <select v-model="notif.campaignId" class="input text-sm">
            <option v-for="c in s.campaigns" :key="c.id" :value="c.id">
              {{ c.name }} — {{ c.label }}
            </option>
          </select>
        </FormField>

        <FormField label="Titre de la notification">
          <input v-model="notif.title" type="text" placeholder="Votre colis est arrivé !" class="input text-sm" />
        </FormField>

        <FormField label="Corps du message" :hint="`${notif.body.length}/150 caractères`" :error="notif.body.length > 150 ? 'Dépasse la limite de 150 caractères' : undefined">
          <textarea
            v-model="notif.body"
            rows="2"
            placeholder="Votre livraison est disponible. Récupérez-la avant le…"
            class="input text-sm resize-none"
            :class="notif.body.length > 150 ? 'border-red-300 ring-red-300' : ''"
          />
        </FormField>
      </div>

      <!-- Empty state -->
      <div v-if="s.notifications.length === 0" class="text-center py-8 text-gray-400 text-sm border border-dashed border-gray-200 rounded-lg">
        Aucune notification configurée.
      </div>
    </div>

    <button @click="store.addNotification()" class="btn-dashed w-full">
      + Ajouter une notification
    </button>

  </StepShell>
</template>
