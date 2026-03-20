<script setup lang="ts">
import { ref } from 'vue'

defineProps<{
  title?: string
}>()

const open = ref(false)
</script>

<template>
  <div class="rounded-lg border border-blue-100 bg-blue-50 overflow-hidden">
    <button
      @click="open = !open"
      class="w-full flex items-center gap-2 px-4 py-2.5 text-left hover:bg-blue-100/50 transition-colors"
    >
      <span class="text-blue-500 text-sm">💡</span>
      <span class="text-sm text-blue-700 font-medium flex-1">{{ title || 'Aide sur cette étape' }}</span>
      <span class="text-blue-400 text-xs transition-transform" :class="open ? 'rotate-180' : ''">▼</span>
    </button>
    <div v-if="open" class="px-4 pb-4 pt-1 text-sm text-blue-700 leading-relaxed space-y-2 border-t border-blue-100">
      <slot />
    </div>
  </div>
</template>
