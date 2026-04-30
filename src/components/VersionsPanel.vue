<script setup lang="ts">
import { ref, watch } from 'vue'
import { getVersions } from '@/services/versions'
import type { Mission } from '@/types/mission'
import type { SpecVersion } from '@/types/version'

const props = defineProps<{ mission: Mission; currentVersion: number }>()
const emit = defineEmits<{
  close: []
  restore: [version: SpecVersion]
}>()

const versions = ref<SpecVersion[]>([])
const loading = ref(true)
const error = ref(false)

watch(
  () => props.mission.id,
  async (id) => {
    loading.value = true
    error.value = false
    try {
      versions.value = await getVersions(id)
    } catch {
      error.value = true
    } finally {
      loading.value = false
    }
  },
  { immediate: true },
)

function formatDate(iso: string): string {
  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(iso))
}
</script>

<template>
  <!-- Backdrop -->
  <div class="fixed inset-0 z-30 bg-black/20 backdrop-blur-[1px]" @click="$emit('close')" />

  <!-- Panel -->
  <aside class="fixed right-0 top-0 z-40 h-screen w-80 bg-white shadow-xl flex flex-col">

    <!-- Header -->
    <div class="flex items-center justify-between px-5 py-4 border-b border-gray-100">
      <div>
        <p class="text-sm font-semibold text-gray-800">Historique des versions</p>
        <p class="text-xs text-gray-400 mt-0.5 truncate max-w-[200px]">{{ mission.name }}</p>
      </div>
      <button
        @click="$emit('close')"
        class="text-gray-400 hover:text-gray-600 transition-colors text-lg leading-none"
        aria-label="Fermer"
      >×</button>
    </div>

    <!-- Content -->
    <div class="flex-1 overflow-y-auto px-4 py-4">

      <!-- Loading -->
      <div v-if="loading" class="flex items-center justify-center py-12">
        <span class="text-xs text-gray-400 animate-pulse">Chargement…</span>
      </div>

      <!-- Error -->
      <div v-else-if="error" class="text-center py-12">
        <p class="text-xs text-red-400">Impossible de charger l'historique.</p>
      </div>

      <!-- Empty -->
      <div v-else-if="versions.length === 0" class="text-center py-12">
        <p class="text-2xl mb-2">📭</p>
        <p class="text-xs text-gray-400">Aucune version sauvegardée.</p>
        <p class="text-xs text-gray-300 mt-1">Utilisez "Sauvegarder" pour créer la première.</p>
      </div>

      <!-- Version list -->
      <ul v-else class="space-y-2">
        <li
          v-for="v in versions"
          :key="v.id"
          class="rounded-xl border px-4 py-3 transition-colors"
          :class="v.versionNumber === currentVersion
            ? 'border-brand-300 bg-brand-50'
            : 'border-gray-100 bg-gray-50 hover:border-brand-200 hover:bg-brand-50/50'"
        >
          <!-- Top row: version badge + date -->
          <div class="flex items-center justify-between gap-2 mb-1">
            <div class="flex items-center gap-1.5">
              <span class="inline-flex items-center text-xs font-semibold text-brand-700 bg-brand-100 px-2 py-0.5 rounded-full">
                v{{ v.versionNumber }}
              </span>
              <span
                v-if="v.versionNumber === currentVersion"
                class="text-[10px] text-brand-500 font-medium"
              >active</span>
            </div>
            <span class="text-[11px] text-gray-400 shrink-0">{{ formatDate(v.savedAt) }}</span>
          </div>

          <!-- Label (optional) -->
          <p v-if="v.label" class="text-xs font-medium text-gray-700 mb-1 truncate">{{ v.label }}</p>

          <!-- Notes (optional) -->
          <p v-if="v.notes" class="text-xs text-gray-500 mt-1 mb-1 leading-relaxed line-clamp-3">{{ v.notes }}</p>

          <!-- Saved by + restore button -->
          <div class="flex items-center justify-between gap-2 mt-2">
            <p class="text-[11px] text-gray-400 truncate">par {{ v.savedBy.name }}</p>
            <button
              v-if="v.versionNumber !== currentVersion"
              @click="emit('restore', v)"
              class="text-[11px] text-brand-600 hover:text-brand-800 font-medium shrink-0 transition-colors"
            >Charger →</button>
          </div>
        </li>
      </ul>

    </div>

    <!-- Footer -->
    <div class="px-5 py-3 border-t border-gray-100">
      <p class="text-[11px] text-gray-300 text-center">
        {{ versions.length }} version{{ versions.length > 1 ? 's' : '' }}
        · cliquez "Charger" puis sauvegardez pour créer une nouvelle version
      </p>
    </div>

  </aside>
</template>
