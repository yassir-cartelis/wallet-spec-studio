<script setup lang="ts">
import { ref, watch } from 'vue'
import { addJournalEntry, getJournalEntries } from '@/services/journal'
import type { Mission, MissionConsultant } from '@/types/mission'
import type { JournalEntry } from '@/types/journal'

const props = defineProps<{ mission: Mission; author: MissionConsultant }>()
defineEmits<{ close: [] }>()

const entries = ref<JournalEntry[]>([])
const loading = ref(true)
const error = ref(false)
const draft = ref('')
const submitting = ref(false)

watch(
  () => props.mission.id,
  async (id) => {
    loading.value = true
    error.value = false
    try {
      entries.value = await getJournalEntries(id)
    } catch {
      error.value = true
    } finally {
      loading.value = false
    }
  },
  { immediate: true },
)

async function submit() {
  const content = draft.value.trim()
  if (!content || submitting.value) return
  submitting.value = true
  draft.value = ''
  try {
    await addJournalEntry(props.mission.id, { content, author: props.author })
    entries.value = await getJournalEntries(props.mission.id)
  } catch {
    draft.value = content
  } finally {
    submitting.value = false
  }
}

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
  <aside class="fixed right-0 top-0 z-40 h-screen w-96 bg-white shadow-xl flex flex-col">

    <!-- Header -->
    <div class="flex items-center justify-between px-5 py-4 border-b border-gray-100">
      <div>
        <p class="text-sm font-semibold text-gray-800">Journal de mission</p>
        <p class="text-xs text-gray-400 mt-0.5 truncate max-w-[240px]">{{ mission.name }}</p>
      </div>
      <button
        @click="$emit('close')"
        class="text-gray-400 hover:text-gray-600 transition-colors text-lg leading-none"
        aria-label="Fermer"
      >×</button>
    </div>

    <!-- Add entry -->
    <div class="px-4 py-4 border-b border-gray-100 bg-gray-50">
      <textarea
        v-model="draft"
        placeholder="Ce qui s'est passé, une décision, un blocage, un apprentissage…"
        rows="3"
        class="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-400 placeholder:text-gray-300 resize-none bg-white"
        @keydown.meta.enter="submit"
        @keydown.ctrl.enter="submit"
      />
      <div class="flex items-center justify-between mt-2">
        <span class="text-[11px] text-gray-300">⌘↵ pour envoyer</span>
        <button
          @click="submit"
          :disabled="!draft.trim() || submitting"
          class="text-xs px-3 py-1.5 rounded-lg bg-brand-600 text-white hover:bg-brand-700 transition-colors disabled:opacity-30 disabled:cursor-not-allowed font-medium"
        >{{ submitting ? 'Envoi…' : 'Ajouter' }}</button>
      </div>
    </div>

    <!-- Entries -->
    <div class="flex-1 overflow-y-auto px-4 py-4">

      <div v-if="loading" class="flex items-center justify-center py-12">
        <span class="text-xs text-gray-400 animate-pulse">Chargement…</span>
      </div>

      <div v-else-if="error" class="text-center py-12">
        <p class="text-xs text-red-400">Impossible de charger le journal.</p>
      </div>

      <div v-else-if="entries.length === 0" class="text-center py-12">
        <p class="text-2xl mb-2">📓</p>
        <p class="text-xs text-gray-400">Aucune entrée pour l'instant.</p>
        <p class="text-xs text-gray-300 mt-1">Commencez à documenter cette mission.</p>
      </div>

      <ul v-else class="space-y-3">
        <li
          v-for="entry in entries"
          :key="entry.id"
          class="rounded-xl border border-gray-100 bg-gray-50 px-4 py-3"
        >
          <div class="flex items-center justify-between gap-2 mb-2">
            <span class="text-[11px] font-medium text-gray-600 truncate">{{ entry.author.name }}</span>
            <span class="text-[11px] text-gray-400 shrink-0">{{ formatDate(entry.createdAt) }}</span>
          </div>
          <p class="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{{ entry.content }}</p>
        </li>
      </ul>

    </div>

    <!-- Footer -->
    <div class="px-5 py-3 border-t border-gray-100">
      <p class="text-[11px] text-gray-300 text-center">
        {{ entries.length }} entrée{{ entries.length > 1 ? 's' : '' }}
      </p>
    </div>

  </aside>
</template>
