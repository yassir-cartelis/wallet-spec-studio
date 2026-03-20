<script setup lang="ts">
import { useSpecStore } from '@/stores/spec'
import StepShell from '@/components/StepShell.vue'
import FormField from '@/components/FormField.vue'
import CodeBlock from '@/components/CodeBlock.vue'
import { computed } from 'vue'

const store = useSpecStore()
const s = store.state

const modes = [
  {
    value: 'none',
    label: 'Aucune',
    description: 'Lien en clair, aucune signature. Déconseillé en production.',
    badge: 'low',
  },
  {
    value: 'sha256',
    label: 'SHA256 HMAC',
    description: 'Signature HMAC-SHA256 du lien avec une clé secrète. Recommandé.',
    badge: 'high',
  },
  {
    value: 'aes256cbc',
    label: 'AES-256-CBC',
    description: "Chiffrement complet de l'identifiant. Pour les données sensibles.",
    badge: 'max',
  },
] as const

const exampleCode = computed(() => {
  if (s.security.mode === 'sha256') {
    return `// Brevo / côté client
const identifier = contact.NUMERO_COLIS;
const secret = "YOUR_SECRET_KEY";
const sig = hmacSha256(identifier, secret);
const url = \`\${baseUrl}?user[identifier]=\${identifier}&sig=\${sig}\`;`
  }
  if (s.security.mode === 'aes256cbc') {
    return `// AES-256-CBC
const key = Buffer.from("${s.security.aesKeyB64 || 'BASE64_KEY'}", "base64");
const iv  = Buffer.from("${s.security.aesIvB64 || 'BASE64_IV'}", "base64");
const encrypted = aes256cbc.encrypt(identifier, key, iv);
const url = \`\${baseUrl}?user[identifier]=\${encrypted}\`;`
  }
  return `// Pas de signature — lien en clair
const url = \`\${baseUrl}?user[identifier]=\${identifier}\`;`
})
</script>

<template>
  <StepShell icon="🔒" title="Politique de sécurité" description="Mode de signature et chiffrement des liens d'entrée.">

    <!-- Mode selection -->
    <div class="space-y-2">
      <label class="text-sm font-medium text-gray-700">Mode de sécurité</label>
      <div class="grid grid-cols-3 gap-3">
        <button
          v-for="mode in modes"
          :key="mode.value"
          @click="s.security.mode = mode.value"
          class="p-4 rounded-lg border text-left transition-all"
          :class="s.security.mode === mode.value
            ? 'border-violet-500 bg-violet-50 ring-1 ring-violet-500'
            : 'border-gray-200 bg-white hover:border-violet-200'"
        >
          <div class="flex items-center justify-between mb-2">
            <span class="font-medium text-sm text-gray-900">{{ mode.label }}</span>
            <span
              class="text-xs px-2 py-0.5 rounded-full font-medium"
              :class="{
                'bg-red-100 text-red-600': mode.badge === 'low',
                'bg-green-100 text-green-600': mode.badge === 'high',
                'bg-violet-100 text-violet-600': mode.badge === 'max',
              }"
            >{{ mode.badge }}</span>
          </div>
          <p class="text-xs text-gray-500 leading-snug">{{ mode.description }}</p>
        </button>
      </div>
    </div>

    <!-- Compute side -->
    <FormField label="Calcul côté" hint="Qui génère la signature / le chiffrement ?">
      <div class="flex gap-3 mt-1">
        <label
          v-for="opt in ['client', 'server']"
          :key="opt"
          class="flex items-center gap-2 cursor-pointer"
        >
          <input type="radio" v-model="s.security.computedBy" :value="opt" class="text-violet-600" />
          <span class="text-sm text-gray-700">{{ opt === 'client' ? 'Client (Brevo / CRM)' : 'Serveur (backend client)' }}</span>
        </label>
      </div>
    </FormField>

    <!-- AES extra fields -->
    <template v-if="s.security.mode === 'aes256cbc'">
      <div class="grid grid-cols-2 gap-4 p-4 rounded-lg bg-gray-50 border border-gray-200">
        <FormField label="AES Key (Base64)">
          <input v-model="s.security.aesKeyB64" type="text" placeholder="Base64 encoded key" class="input font-mono text-xs" />
        </FormField>
        <FormField label="AES IV (Base64)">
          <input v-model="s.security.aesIvB64" type="text" placeholder="Base64 encoded IV" class="input font-mono text-xs" />
        </FormField>
      </div>
    </template>

    <!-- Code snippet -->
    <CodeBlock :code="exampleCode" label="Exemple d'implémentation" lang="javascript" />

  </StepShell>
</template>
