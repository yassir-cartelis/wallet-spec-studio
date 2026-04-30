<script setup lang="ts">
import { useSpecStore } from '@/stores/spec'
import { usePayload } from '@/composables/usePayload'
import StepShell from '@/components/StepShell.vue'
import StepHint from '@/components/StepHint.vue'
import FormField from '@/components/FormField.vue'
import CodeBlock from '@/components/CodeBlock.vue'
import { computed } from 'vue'

const store = useSpecStore()
const s = store.state
const { urlsPerCampaign } = usePayload()

const modes = [
  {
    value: 'none',
    label: 'Aucune',
    description: "L'identifiant est visible en clair dans l'URL. Déconseillé en prod.",
    badge: 'low',
  },
  {
    value: 'sha256',
    label: 'SHA256 HMAC',
    description: "L'identifiant est signé avec une clé secrète. Captain Wallet vérifie la signature.",
    badge: 'high',
  },
  {
    value: 'aes256cbc',
    label: 'AES-256-CBC',
    description: "L'identifiant est chiffré et illisible dans l'URL. Solution la plus sûre.",
    badge: 'max',
  },
] as const

const encryptionExample = computed(() => {
  const id = s.entry.pivotExample || '6C24562714038'
  if (s.security.mode === 'aes256cbc') {
    return `// Ce que le CRM envoie dans l'email (lien d'installation de la carte)

// Identifiant brut (ne JAMAIS mettre en clair en prod)
${s.entry.pivotVar || 'parcelNumber'} = "${id}"

// Chiffrement AES-256-CBC avec la KEY et l'IV fournis par Captain Wallet
// (disponibles dans : Project settings > Manage URL signers)
encrypted = AES256_CBC_encrypt("${id}", KEY, IV)

// URL finale envoyée au client
url = baseUrl + "?data=" + base64(encrypted) + "&channel=email&tag=newsletter"

// Exemple :
// Clair    → ?data=${id}&channel=email&tag=newsletter
// Chiffré  → ?data=2d26S245LIokiiPmzZF4kw==&channel=email&tag=newsletter`
  }
  if (s.security.mode === 'sha256') {
    return `// Ce que le CRM envoie dans l'email (lien d'installation de la carte)

${s.entry.pivotVar || 'parcelNumber'} = "${id}"
secret = "VOTRE_CLE_SECRETE"

// On signe l'identifiant avec la clé secrète
signature = HMAC_SHA256("${id}", secret)

// URL finale
url = baseUrl + "?data=${id}&sig=" + signature + "&channel=email"`
  }
  return `// Lien en clair — uniquement pour les tests
url = baseUrl + "?data=${id}&channel=email&tag=newsletter"`
})
</script>

<template>
  <StepShell icon="🔒" title="Sécurisation des liens" description="Protège les URLs d'installation de carte contre la fraude.">

    <StepHint title="Pourquoi sécuriser l'URL ?">
      <p>Le lien d'installation contient l'identifiant du colis / client dans le paramètre <code class="bg-blue-100 px-1 rounded font-mono text-xs">data=</code>.</p>
      <p class="mt-1">Sans sécurité, n'importe qui peut remplacer cet identifiant et accéder à la carte d'un autre client. La sécurisation rend l'URL inviolable.</p>
      <div class="mt-2 space-y-1 text-xs">
        <p><span class="font-mono bg-gray-100 px-1 rounded">data=6C24562714038</span> → identifiant visible, risqué</p>
        <p><span class="font-mono bg-green-50 px-1 rounded">data=2d26S245LIokiiPmzZF4kw==</span> → chiffré, illisible</p>
      </div>
    </StepHint>

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
            ? 'border-brand-500 bg-brand-50 ring-1 ring-brand-500'
            : 'border-gray-200 bg-white hover:border-brand-200'"
        >
          <div class="flex items-center justify-between mb-2">
            <span class="font-medium text-sm text-gray-900">{{ mode.label }}</span>
            <span
              class="text-xs px-2 py-0.5 rounded-full font-medium"
              :class="{
                'bg-red-100 text-red-600': mode.badge === 'low',
                'bg-green-100 text-green-600': mode.badge === 'high',
                'bg-brand-100 text-brand-600': mode.badge === 'max',
              }"
            >{{ mode.badge }}</span>
          </div>
          <p class="text-xs text-gray-500 leading-snug">{{ mode.description }}</p>
        </button>
      </div>
    </div>

    <!-- Compute side -->
    <FormField label="Calcul côté" hint="Qui génère le chiffrement avant d'envoyer le lien ?">
      <div class="flex gap-3 mt-1">
        <label
          v-for="opt in ['client', 'server']"
          :key="opt"
          class="flex items-center gap-2 cursor-pointer"
        >
          <input type="radio" v-model="s.security.computedBy" :value="opt" class="text-brand-600" />
          <span class="text-sm text-gray-700">{{ opt === 'client' ? 'Côté CRM / Brevo (routeur email)' : 'Côté backend client (serveur)' }}</span>
        </label>
      </div>
    </FormField>

    <!-- AES keys -->
    <template v-if="s.security.mode === 'aes256cbc'">
      <div class="rounded-lg bg-amber-50 border border-amber-200 p-4 space-y-3">
        <p class="text-xs text-amber-700 font-medium">La KEY et l'IV sont fournis par Captain Wallet — disponibles dans <span class="font-mono">Project settings › Manage URL signers</span>. À transmettre par voie sécurisée (lien éphémère, vault).</p>
        <div class="grid grid-cols-2 gap-4">
          <FormField label="AES Key (Base64)">
            <input v-model="s.security.aesKeyB64" type="text" placeholder="Base64 encoded key" class="input font-mono text-xs" />
          </FormField>
          <FormField label="AES IV (Base64)">
            <input v-model="s.security.aesIvB64" type="text" placeholder="Base64 encoded IV" class="input font-mono text-xs" />
          </FormField>
        </div>
      </div>
    </template>

    <!-- Example -->
    <CodeBlock :code="encryptionExample" label="Comment ça fonctionne" lang="javascript" />

    <!-- URLs par campagne -->
    <div v-if="s.entry.pivotVar && urlsPerCampaign.length" class="space-y-3">
      <h3 class="text-sm font-semibold text-gray-700">URLs résultantes par campagne</h3>
      <div
        v-for="c in urlsPerCampaign"
        :key="c.name"
        class="rounded-lg border border-gray-100 bg-gray-50 p-3 space-y-2"
      >
        <p class="text-xs font-semibold text-gray-600">
          {{ c.label }}
          <span class="font-normal font-mono text-gray-400 ml-1">{{ c.name }}</span>
        </p>
        <CodeBlock :code="c.qlf" label="QLF" />
        <CodeBlock :code="c.prod" label="PROD" />
      </div>
    </div>

  </StepShell>
</template>
