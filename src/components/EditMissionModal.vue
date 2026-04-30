<template>
  <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
    <div class="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md mx-4">

      <h2 class="text-lg font-bold text-gray-900 mb-6">Modifier la mission</h2>

      <form @submit.prevent="submit" class="flex flex-col gap-4">

        <div>
          <label class="block text-xs font-medium text-gray-700 mb-1">Nom de la mission <span class="text-red-400">*</span></label>
          <input
            v-model="form.name"
            type="text"
            class="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400"
            required
          />
        </div>

        <div>
          <label class="block text-xs font-medium text-gray-700 mb-1">Client <span class="text-red-400">*</span></label>
          <input
            v-model="form.client"
            type="text"
            class="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400"
            required
          />
        </div>

        <div>
          <label class="block text-xs font-medium text-gray-700 mb-1">Statut</label>
          <select
            v-model="form.status"
            class="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400"
          >
            <option value="draft">Brouillon</option>
            <option value="in_progress">En cours</option>
            <option value="delivered">Livré</option>
            <option value="in_production">En prod</option>
          </select>
        </div>

        <p v-if="error" class="text-xs text-red-500 -mb-1">{{ error }}</p>

        <div class="flex gap-3 mt-2">
          <button
            type="button"
            @click="emit('close')"
            class="flex-1 px-4 py-2 text-sm border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors"
          >Annuler</button>
          <button
            type="submit"
            :disabled="saving"
            class="flex-1 px-4 py-2 text-sm bg-accent-500 text-white rounded-lg hover:bg-accent-600 disabled:opacity-50 transition-colors font-medium"
          >{{ saving ? 'Sauvegarde…' : 'Enregistrer' }}</button>
        </div>

      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { updateMission } from '../services/missions'
import type { Mission, MissionStatus } from '../types/mission'

const props = defineProps<{ mission: Mission }>()
const emit = defineEmits<{
  close: []
  updated: [mission: Mission]
}>()

const saving = ref(false)
const error = ref('')
const form = ref({
  name: props.mission.name,
  client: props.mission.client,
  status: props.mission.status as MissionStatus,
})

async function submit() {
  saving.value = true
  error.value = ''
  try {
    await updateMission(props.mission.id, {
      name: form.value.name,
      client: form.value.client,
      status: form.value.status,
    })
    emit('updated', {
      ...props.mission,
      name: form.value.name,
      client: form.value.client,
      status: form.value.status,
      updatedAt: new Date().toISOString(),
    })
  } catch {
    error.value = 'Impossible de sauvegarder. Vérifie ta connexion et réessaie.'
  } finally {
    saving.value = false
  }
}
</script>
