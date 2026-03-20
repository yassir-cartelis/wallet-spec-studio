<script setup lang="ts">
defineProps<{
  label: string
  hint?: string
  required?: boolean
  error?: string
}>()
</script>

<template>
  <div class="space-y-1">
    <label class="block text-sm font-medium text-gray-700">
      {{ label }}
      <span v-if="required" class="text-red-500 ml-0.5">*</span>
    </label>
    <slot />
    <p v-if="hint && !error" class="text-xs text-gray-400">{{ hint }}</p>
    <p v-if="error" class="text-xs text-red-500">{{ error }}</p>
  </div>
</template>
