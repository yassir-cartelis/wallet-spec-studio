<script setup lang="ts">
import { ref, computed } from 'vue'
import { useAiImport } from '@/composables/useAiImport'
import { useSpecStore } from '@/stores/spec'

const emit = defineEmits<{
  close: []
  imported: [projectName: string]
}>()

const store = useSpecStore()
const { status, statusLabel, error, run, reset } = useAiImport()

// ── Files ─────────────────────────────────────────────────────────────────────
const files = ref<File[]>([])
const fileInput = ref<HTMLInputElement | null>(null)
const isDragging = ref(false)

const ACCEPTED = ['.pdf', '.docx', '.txt', '.md']

function addFiles(list: FileList | null) {
  if (!list) return
  for (const f of list) {
    const ext = '.' + f.name.split('.').pop()?.toLowerCase()
    if (ACCEPTED.includes(ext) && !files.value.find((x) => x.name === f.name)) {
      files.value.push(f)
    }
  }
}

function removeFile(i: number) {
  files.value.splice(i, 1)
}

function onDrop(e: DragEvent) {
  isDragging.value = false
  addFiles(e.dataTransfer?.files ?? null)
}

// ── Context prompt ────────────────────────────────────────────────────────────
const contextPrompt = ref('')

// ── Submit ────────────────────────────────────────────────────────────────────
const canSubmit = computed(() => files.value.length > 0 && status.value === 'idle')

async function submit() {
  try {
    const json = await run(files.value, contextPrompt.value)
    const result = store.importSpec(json)
    if (result.ok) {
      emit('imported', store.state.meta.projectName || 'Nouveau projet')
    } else {
      // importSpec sets the error itself but we surface it here too
      reset()
    }
  } catch {
    // error already set in composable
  }
}

function closeModal() {
  reset()
  emit('close')
}

// ── File icon helper ──────────────────────────────────────────────────────────
function fileIcon(name: string): string {
  if (name.endsWith('.pdf')) return '📄'
  if (name.endsWith('.docx')) return '📝'
  return '📃'
}
</script>

<template>
  <!-- Backdrop -->
  <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" @click.self="closeModal">
    <div class="bg-white rounded-2xl shadow-2xl w-full max-w-xl flex flex-col max-h-[90vh] overflow-hidden">

      <!-- Header -->
      <div class="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
        <div>
          <h2 class="font-semibold text-gray-900">Import assisté par IA</h2>
          <p class="text-xs text-gray-400 mt-0.5">Dépose tes docs, GPT-4o pré-remplit la spec</p>
        </div>
        <button @click="closeModal" class="text-gray-300 hover:text-gray-500 transition-colors text-xl leading-none">✕</button>
      </div>

      <!-- Body -->
      <div class="flex-1 overflow-y-auto px-6 py-5 space-y-5">

        <!-- Drop zone -->
        <div class="space-y-2">
          <label class="text-sm font-medium text-gray-700">Documents <span class="text-gray-400 font-normal">(PDF, DOCX, TXT, MD)</span></label>

          <div
            ref="dropzone"
            class="border-2 border-dashed rounded-xl p-6 text-center transition-colors cursor-pointer"
            :class="isDragging ? 'border-violet-400 bg-violet-50' : 'border-gray-200 hover:border-violet-300 hover:bg-gray-50'"
            @click="fileInput?.click()"
            @dragover.prevent="isDragging = true"
            @dragleave="isDragging = false"
            @drop.prevent="onDrop"
          >
            <p class="text-3xl mb-2">{{ isDragging ? '📂' : '☁️' }}</p>
            <p class="text-sm text-gray-500">Glisse tes fichiers ici ou <span class="text-violet-600">parcourir</span></p>
            <p class="text-xs text-gray-400 mt-1">PDF · DOCX · TXT · MD — plusieurs fichiers acceptés</p>
            <input ref="fileInput" type="file" :accept="ACCEPTED.join(',')" multiple class="hidden" @change="addFiles(($event.target as HTMLInputElement).files)" />
          </div>

          <!-- File list -->
          <div v-if="files.length" class="space-y-1.5">
            <div
              v-for="(f, i) in files"
              :key="f.name"
              class="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-50 border border-gray-100"
            >
              <span>{{ fileIcon(f.name) }}</span>
              <span class="flex-1 text-sm text-gray-700 truncate">{{ f.name }}</span>
              <span class="text-xs text-gray-400">{{ (f.size / 1024).toFixed(0) }} Ko</span>
              <button @click="removeFile(i)" class="text-gray-300 hover:text-red-400 transition-colors text-xs">✕</button>
            </div>
          </div>
        </div>

        <!-- Context prompt -->
        <div class="space-y-1.5">
          <label class="text-sm font-medium text-gray-700">
            Contexte atelier
            <span class="text-gray-400 font-normal ml-1">— optionnel</span>
          </label>
          <textarea
            v-model="contextPrompt"
            rows="3"
            placeholder="Ex : Ce projet est une intégration Colissimo. Le suivi colis est le use case principal. Le client utilise Brevo pour les emails transactionnels…"
            class="input text-sm resize-none"
          />
          <p class="text-xs text-gray-400">Ce texte est envoyé en contexte au modèle avant les documents.</p>
        </div>

        <!-- Error -->
        <div v-if="error" class="flex gap-2 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
          <span>✗</span><span>{{ error }}</span>
        </div>

      </div>

      <!-- Footer -->
      <div class="px-6 py-4 border-t border-gray-100 flex items-center gap-3">

        <!-- Loading state -->
        <div v-if="status !== 'idle' && status !== 'error'" class="flex items-center gap-2 flex-1">
          <div class="w-4 h-4 rounded-full border-2 border-violet-600 border-t-transparent animate-spin shrink-0" />
          <span class="text-sm text-gray-500">{{ statusLabel }}</span>
        </div>
        <div v-else class="flex-1" />

        <button @click="closeModal" class="px-4 py-2 text-sm text-gray-500 hover:text-gray-700 transition-colors">
          Annuler
        </button>
        <button
          @click="submit"
          :disabled="!canSubmit"
          class="px-5 py-2 text-sm rounded-lg bg-violet-600 text-white hover:bg-violet-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors font-medium"
        >
          Analyser avec GPT-4o →
        </button>
      </div>

    </div>
  </div>
</template>
