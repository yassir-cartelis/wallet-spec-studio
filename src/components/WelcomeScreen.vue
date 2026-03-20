<script setup lang="ts">
import { ref } from 'vue'

const emit = defineEmits<{
  start: []
  openAi: []
  openImport: []
  openGuide: []
}>()

const hovered = ref<string | null>(null)
</script>

<template>
  <div class="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-6 py-12">

    <!-- Logo -->
    <div class="flex items-center gap-2 mb-12">
      <span class="text-2xl font-bold text-violet-600">Wallet</span>
      <span class="text-2xl font-light text-gray-400">Spec Studio</span>
    </div>

    <!-- Hero -->
    <div class="text-center max-w-xl mb-10">
      <h1 class="text-3xl font-semibold text-gray-900 leading-snug">
        Construis ta spec d'intégration<br />
        <span class="text-violet-600">pas à pas, sans rien oublier</span>
      </h1>
      <p class="mt-4 text-gray-500 text-base leading-relaxed">
        Wallet Spec Studio t'accompagne de la prise de brief jusqu'au contrat d'interface prêt pour les devs.
        Que tu partes de zéro ou d'un document existant.
      </p>
    </div>

    <!-- Action cards -->
    <div class="grid grid-cols-3 gap-4 w-full max-w-2xl mb-8">

      <button
        @click="emit('start')"
        @mouseenter="hovered = 'new'"
        @mouseleave="hovered = null"
        class="group flex flex-col items-start gap-3 p-5 rounded-xl border-2 text-left transition-all"
        :class="hovered === 'new' ? 'border-violet-500 bg-violet-50 shadow-md' : 'border-gray-200 bg-white'"
      >
        <span class="text-3xl">✏️</span>
        <div>
          <p class="font-semibold text-gray-900 text-sm">Nouveau projet</p>
          <p class="text-xs text-gray-400 mt-1 leading-snug">Partir de zéro et remplir les étapes manuellement.</p>
        </div>
        <span class="text-xs text-violet-600 font-medium mt-auto opacity-0 group-hover:opacity-100 transition-opacity">Commencer →</span>
      </button>

      <button
        @click="emit('openAi')"
        @mouseenter="hovered = 'ai'"
        @mouseleave="hovered = null"
        class="group flex flex-col items-start gap-3 p-5 rounded-xl border-2 text-left transition-all relative overflow-hidden"
        :class="hovered === 'ai' ? 'border-violet-500 bg-violet-50 shadow-md' : 'border-violet-200 bg-white'"
      >
        <div class="absolute top-3 right-3 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-violet-600 text-white">IA</div>
        <span class="text-3xl">✦</span>
        <div>
          <p class="font-semibold text-gray-900 text-sm">Analyser un brief</p>
          <p class="text-xs text-gray-400 mt-1 leading-snug">Dépose tes documents, GPT-4o pré-remplit la spec.</p>
        </div>
        <span class="text-xs text-violet-600 font-medium mt-auto opacity-0 group-hover:opacity-100 transition-opacity">Déposer des fichiers →</span>
      </button>

      <button
        @click="emit('openImport')"
        @mouseenter="hovered = 'import'"
        @mouseleave="hovered = null"
        class="group flex flex-col items-start gap-3 p-5 rounded-xl border-2 text-left transition-all"
        :class="hovered === 'import' ? 'border-violet-500 bg-violet-50 shadow-md' : 'border-gray-200 bg-white'"
      >
        <span class="text-3xl">↑</span>
        <div>
          <p class="font-semibold text-gray-900 text-sm">Reprendre une spec</p>
          <p class="text-xs text-gray-400 mt-1 leading-snug">Importer un fichier JSON d'une spec existante.</p>
        </div>
        <span class="text-xs text-violet-600 font-medium mt-auto opacity-0 group-hover:opacity-100 transition-opacity">Importer →</span>
      </button>

    </div>

    <!-- Guide CTA -->
    <button
      @click="emit('openGuide')"
      class="flex items-center gap-2 text-sm text-gray-400 hover:text-violet-600 transition-colors group"
    >
      <span class="w-5 h-5 rounded-full border border-gray-300 group-hover:border-violet-400 flex items-center justify-center text-xs transition-colors">?</span>
      C'est ton premier projet Wallet ? Lire le guide
    </button>

  </div>
</template>
