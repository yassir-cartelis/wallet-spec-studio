<script setup lang="ts">
import { ref, onMounted } from 'vue'

const props = defineProps<{ initial: string; from: string }>()
const emit = defineEmits<{ confirm: [name: string]; cancel: [] }>()

const name = ref(props.initial)
const input = ref<HTMLInputElement | null>(null)

onMounted(() => {
  input.value?.focus()
  input.value?.select()
})

function confirm() {
  if (name.value.trim()) emit('confirm', name.value.trim())
}
</script>

<template>
  <div
    class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-brand-900/30 backdrop-blur-sm"
    @click.self="emit('cancel')"
  >
    <div class="bg-white rounded-2xl shadow-2xl w-full max-w-md p-7">

      <!-- Header -->
      <div class="mb-5">
        <p class="text-xs font-semibold text-brand-500 uppercase tracking-widest mb-1">Bibliothèque</p>
        <h3 class="text-lg font-bold text-brand-900">Dupliquer ce use-case</h3>
        <p class="text-sm text-brand-600 mt-1">
          Basé sur <span class="font-medium text-brand-800">{{ from }}</span>
        </p>
      </div>

      <!-- Input -->
      <div class="mb-6">
        <label class="text-xs font-semibold text-brand-700 uppercase tracking-wide mb-2 block">
          Nom du nouveau projet
        </label>
        <input
          ref="input"
          v-model="name"
          type="text"
          class="input text-base"
          placeholder="Ex : Suivi colis client Leroy Merlin"
          @keyup.enter="confirm"
          @keyup.escape="emit('cancel')"
        />
        <p class="text-xs text-brand-500 mt-2">
          Tu pourras modifier toutes les infos dans l'étape Scope.
        </p>
      </div>

      <!-- Actions -->
      <div class="flex items-center gap-3">
        <button
          @click="emit('cancel')"
          class="px-4 py-2 text-sm text-brand-600 hover:text-brand-900 transition-colors"
        >
          Annuler
        </button>
        <button
          @click="confirm"
          :disabled="!name.trim()"
          class="flex-1 px-5 py-2.5 rounded-xl bg-accent-500 text-white text-sm font-semibold hover:bg-accent-600 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Créer et ouvrir le projet →
        </button>
      </div>

    </div>
  </div>
</template>
