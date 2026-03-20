<script setup lang="ts">
import type { ReviewNote } from '@/types/spec'

defineProps<{
  notes: ReviewNote[]
}>()
</script>

<template>
  <div v-if="notes.length" class="space-y-1.5">
    <div
      v-for="note in notes"
      :key="note.field + note.message"
      class="flex items-start gap-2 rounded-md px-3 py-2 text-sm"
      :class="{
        'bg-red-50 text-red-700 border border-red-200': note.severity === 'error',
        'bg-yellow-50 text-yellow-700 border border-yellow-200': note.severity === 'warning',
        'bg-blue-50 text-blue-700 border border-blue-200': note.severity === 'info',
      }"
    >
      <span class="mt-0.5 shrink-0">
        {{ note.severity === 'error' ? '✗' : note.severity === 'warning' ? '!' : 'ℹ' }}
      </span>
      <span>{{ note.message }}</span>
    </div>
  </div>
</template>
