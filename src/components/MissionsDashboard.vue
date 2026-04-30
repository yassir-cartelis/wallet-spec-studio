<template>
  <div class="min-h-screen bg-gray-50">

    <!-- Header -->
    <header class="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
      <div class="flex items-center gap-3">
        <span class="text-[11px] font-bold tracking-widest text-white bg-brand-700 px-2 py-0.5 rounded">CARTELIS</span>
        <span class="text-sm font-semibold text-brand-900">Wallet Spec Studio</span>
      </div>
      <div class="flex items-center gap-4">
        <span class="text-sm text-gray-500">{{ authStore.user?.email }}</span>
        <button
          @click="authStore.logout()"
          class="text-xs text-gray-400 hover:text-red-400 transition-colors"
        >Déconnexion</button>
      </div>
    </header>

    <div class="max-w-5xl mx-auto px-6 py-10">

      <!-- Title row -->
      <div class="flex items-center justify-between mb-8">
        <div>
          <h1 class="text-2xl font-bold text-gray-900">Missions</h1>
          <p class="text-sm text-gray-500 mt-1">{{ missions.length }} mission{{ missions.length !== 1 ? 's' : '' }}</p>
        </div>
        <button
          @click="showCreate = true"
          class="flex items-center gap-2 px-4 py-2 bg-accent-500 text-white text-sm font-medium rounded-lg hover:bg-accent-600 transition-colors"
        >
          + Nouvelle mission
        </button>
      </div>

      <!-- Erreur chargement -->
      <div v-if="loadError" class="text-center py-20">
        <p class="text-red-500 text-sm font-medium">Impossible de charger les missions.</p>
        <p class="text-gray-400 text-xs mt-1">Vérifie ta connexion puis</p>
        <button @click="loadMissions" class="mt-3 text-sm text-accent-600 hover:underline">Réessayer</button>
      </div>

      <!-- Loading -->
      <div v-else-if="loading" class="text-center py-20 text-gray-400 text-sm">Chargement…</div>

      <!-- Empty state -->
      <div v-else-if="missions.length === 0" class="text-center py-20">
        <p class="text-gray-400 text-sm">Aucune mission pour le moment.</p>
        <button
          @click="showCreate = true"
          class="mt-4 text-sm text-accent-600 hover:underline"
        >Créer la première mission →</button>
      </div>

      <!-- Mission list -->
      <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div
          v-for="m in missions"
          :key="m.id"
          @click="confirmingDeleteId !== m.id && openMission(m)"
          class="relative bg-white rounded-xl border border-gray-200 p-5 transition-all group"
          :class="confirmingDeleteId === m.id
            ? 'border-red-200 cursor-default'
            : 'cursor-pointer hover:border-brand-400 hover:shadow-sm'"
        >
          <!-- Actions — visibles au hover -->
          <div class="absolute top-3 right-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              @click.stop="editingMission = m"
              class="p-1 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-600"
              title="Modifier"
            >✏️</button>
            <button
              @click.stop="confirmingDeleteId = m.id"
              class="p-1 rounded hover:bg-red-50 text-gray-400 hover:text-red-500"
              title="Supprimer"
            >🗑️</button>
          </div>

          <!-- Contenu normal -->
          <template v-if="confirmingDeleteId !== m.id">
            <div class="flex items-start justify-between gap-2 mb-3 pr-14">
              <h2 class="text-sm font-semibold text-gray-900 group-hover:text-brand-700 transition-colors leading-snug">
                {{ m.name || 'Sans titre' }}
              </h2>
              <span
                class="shrink-0 text-[10px] font-medium px-2 py-0.5 rounded-full"
                :class="statusClass(m.status)"
              >{{ statusLabel(m.status) }}</span>
            </div>
            <p class="text-xs text-gray-500 mb-4">{{ m.client || '—' }}</p>
            <div class="flex items-center justify-between text-[11px] text-gray-400">
              <span>{{ m.consultant?.name || m.consultant?.email || '—' }}</span>
              <span>{{ formatDate(m.updatedAt) }}</span>
            </div>
          </template>

          <!-- Confirmation suppression -->
          <template v-else>
            <p class="text-sm font-medium text-red-600 mb-1">Supprimer cette mission ?</p>
            <p class="text-xs text-gray-400 mb-3">{{ m.name }}</p>
            <p v-if="deleteError === m.id" class="text-xs text-red-500 mb-2">Échec de la suppression. Réessaie.</p>
            <div class="flex gap-2">
              <button
                @click.stop="confirmingDeleteId = null; deleteError = null"
                class="flex-1 px-3 py-1.5 text-xs border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors"
              >Annuler</button>
              <button
                @click.stop="deleteConfirmed(m.id)"
                :disabled="deletingId === m.id"
                class="flex-1 px-3 py-1.5 text-xs bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50 transition-colors"
              >{{ deletingId === m.id ? 'Suppression…' : 'Supprimer' }}</button>
            </div>
          </template>

        </div>
      </div>

    </div>

    <!-- Create mission modal -->
    <CreateMissionModal
      v-if="showCreate"
      @close="showCreate = false"
      @created="onMissionCreated"
    />

    <!-- Edit mission modal -->
    <EditMissionModal
      v-if="editingMission"
      :mission="editingMission"
      @close="editingMission = null"
      @updated="onMissionUpdated"
    />

  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useAuthStore } from '../stores/auth'
import { getMissions, deleteMission } from '../services/missions'
import type { Mission } from '../types/mission'
import CreateMissionModal from './CreateMissionModal.vue'
import EditMissionModal from './EditMissionModal.vue'

const emit = defineEmits<{ openMission: [mission: Mission] }>()

const authStore = useAuthStore()
const missions = ref<Mission[]>([])
const loading = ref(true)
const showCreate = ref(false)
const editingMission = ref<Mission | null>(null)
const confirmingDeleteId = ref<string | null>(null)
const deletingId = ref<string | null>(null)
const loadError = ref(false)
const deleteError = ref<string | null>(null)

async function loadMissions() {
  loading.value = true
  loadError.value = false
  try {
    missions.value = await getMissions()
  } catch {
    loadError.value = true
  } finally {
    loading.value = false
  }
}

onMounted(loadMissions)

function openMission(m: Mission) {
  emit('openMission', m)
}

async function onMissionCreated(m: Mission) {
  showCreate.value = false
  missions.value = await getMissions()
  emit('openMission', m)
}

function onMissionUpdated(updated: Mission) {
  editingMission.value = null
  const idx = missions.value.findIndex(m => m.id === updated.id)
  if (idx !== -1) missions.value[idx] = updated
}

async function deleteConfirmed(id: string) {
  deletingId.value = id
  deleteError.value = null
  try {
    await deleteMission(id)
    missions.value = missions.value.filter(m => m.id !== id)
    confirmingDeleteId.value = null
  } catch {
    deleteError.value = id
  } finally {
    deletingId.value = null
  }
}

function statusLabel(s: string) {
  const map: Record<string, string> = {
    draft: 'Brouillon',
    in_progress: 'En cours',
    delivered: 'Livré',
    in_production: 'En prod',
  }
  return map[s] ?? s
}

function statusClass(s: string) {
  const map: Record<string, string> = {
    draft: 'bg-gray-100 text-gray-500',
    in_progress: 'bg-blue-50 text-blue-600',
    delivered: 'bg-green-50 text-green-600',
    in_production: 'bg-purple-50 text-purple-600',
  }
  return map[s] ?? 'bg-gray-100 text-gray-500'
}

function formatDate(d: unknown) {
  if (!d) return '—'
  const date = (d as { toDate?: () => Date }).toDate?.() ?? new Date(d as string)
  return date.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })
}
</script>
