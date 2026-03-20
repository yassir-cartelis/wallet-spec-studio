<script setup lang="ts">
import { ref } from 'vue'

const props = defineProps<{
  code: string
  lang?: string
  label?: string
}>()

const copied = ref(false)

async function copy() {
  await navigator.clipboard.writeText(props.code)
  copied.value = true
  setTimeout(() => (copied.value = false), 1500)
}
</script>

<template>
  <div class="rounded-lg border border-gray-200 overflow-hidden">
    <div class="flex items-center justify-between px-3 py-1.5 bg-gray-100 border-b border-gray-200">
      <span class="text-xs font-mono text-gray-500">{{ label || lang || 'code' }}</span>
      <button
        @click="copy"
        class="text-xs text-gray-400 hover:text-gray-700 transition-colors"
      >
        {{ copied ? '✓ Copié' : 'Copier' }}
      </button>
    </div>
    <pre class="p-4 text-sm font-mono bg-gray-50 overflow-x-auto text-gray-800 leading-relaxed">{{ code }}</pre>
  </div>
</template>
