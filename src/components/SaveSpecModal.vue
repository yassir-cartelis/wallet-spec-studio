<script setup lang="ts">
import { ref } from 'vue'

const emit = defineEmits<{
  cancel: []
  confirm: [payload: { label: string; notes: string }]
}>()

const label = ref('')
const notes = ref('')

function confirm() {
  emit('confirm', { label: label.value.trim(), notes: notes.value.trim() })
}
</script>

<template>
  <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-[2px]">
    <div class="bg-white rounded-2xl shadow-xl w-full max-w-md mx-4 flex flex-col">

      <!-- Header -->
      <div class="px-6 pt-5 pb-4 border-b border-gray-100">
        <h2 class="text-sm font-semibold text-gray-800">Sauvegarder une version</h2>
        <p class="text-xs text-gray-400 mt-0.5">Les deux champs sont optionnels.</p>
      </div>

      <!-- Body -->
      <div class="px-6 py-5 space-y-4">

        <div>
          <label class="block text-xs font-medium text-gray-600 mb-1.5">Label</label>
          <input
            v-model="label"
            type="text"
            placeholder="ex : Version validée client"
            class="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-400 placeholder:text-gray-300"
            @keyup.enter="confirm"
          />
        </div>

        <div>
          <label class="block text-xs font-medium text-gray-600 mb-1.5">Notes</label>
          <textarea
            v-model="notes"
            placeholder="Ce qui a changé, décisions prises, points bloquants…"
            rows="4"
            class="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-400 placeholder:text-gray-300 resize-none"
          />
        </div>

      </div>

      <!-- Footer -->
      <div class="px-6 pb-5 flex justify-end gap-2">
        <button
          @click="$emit('cancel')"
          class="text-sm px-4 py-2 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 transition-colors"
        >Annuler</button>
        <button
          @click="confirm"
          class="text-sm px-4 py-2 rounded-lg bg-brand-600 text-white hover:bg-brand-700 transition-colors font-medium"
        >Sauvegarder</button>
      </div>

    </div>
  </div>
</template>
