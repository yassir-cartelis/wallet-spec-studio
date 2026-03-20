<script setup lang="ts">
defineProps<{
  icon: string
  title: string
  description?: string
}>()
</script>

<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex items-start gap-3">
      <span class="text-2xl">{{ icon }}</span>
      <div>
        <h2 class="text-lg font-semibold text-brand-900">{{ title }}</h2>
        <p v-if="description" class="text-sm text-brand-700 mt-0.5">{{ description }}</p>
      </div>
    </div>

    <!-- Content wrapped in white card -->
    <div class="bg-white rounded-2xl shadow-sm border border-brand-100 p-6 space-y-6">
      <slot />
    </div>
  </div>
</template>
