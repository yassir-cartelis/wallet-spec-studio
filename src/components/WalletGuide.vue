<script setup lang="ts">
defineEmits<{ close: [] }>()

const flows = [
  { color: 'bg-brand-500', label: 'Création',        desc: 'Carte créée au 1er événement' },
  { color: 'bg-blue-500',   label: 'Mise à jour',     desc: 'Statut synchronisé en temps réel' },
  { color: 'bg-green-500',  label: 'Opt-in',          desc: "Confirmation d'installation wallet" },
  { color: 'bg-orange-400', label: 'Anonymisation',   desc: 'Suppression RGPD des données' },
]

const concepts = [
  {
    term: 'Le pivot (identifier)',
    tag: 'user.identifier',
    def: "C'est la clé unique qui relie une donnée source à une carte Wallet. Souvent un numéro de colis, un ID client, un numéro de commande. Tout le mapping s'articule autour de lui.",
  },
  {
    term: 'Le mapping',
    tag: 'Étape 4',
    def: "La table de correspondance entre les champs du système client (ex: STATUT_LIVRAISON) et les champs de l'API Wallet Brevo (ex: user.status). C'est le contrat d'interface.",
  },
  {
    term: 'La campagne',
    tag: 'campaigns',
    def: 'Un modèle de carte configuré dans Wallet Brevo. Un projet a au minimum deux campagnes : la campagne principale (active) et "void" (carte expirée ou supprimée).',
  },
  {
    term: 'La sécurité du lien',
    tag: 'sha256 / aes256',
    def: "L'URL d'entrée vers la carte contient un identifiant. Pour éviter qu'elle soit devinable, on signe (SHA256) ou chiffre (AES-256) cet identifiant. Le calcul se fait côté CRM ou backend.",
  },
  {
    term: 'Le flux de mise à jour',
    tag: 'PUT /cards',
    def: "Chaque fois qu'un événement se produit côté client (changement de statut, mise à jour de points…), un appel API est fait vers Wallet Brevo pour synchroniser la carte de l'utilisateur.",
  },
]

const guideSteps = [
  {
    label: 'Importer un brief ou des notes',
    desc: 'Clique sur "✦ IA" et dépose les documents du client. GPT-4o pré-remplit la spec — tu arrives en atelier avec une base de travail.',
  },
  {
    label: 'Compléter le Scope',
    desc: "Renseigne la marque, l'account ID, et les campagnes. Ce sont les clés de voûte de tout le reste.",
  },
  {
    label: 'Valider le mapping',
    desc: "C'est l'étape la plus importante. Identifie chaque champ source et son équivalent Wallet. Utilise les presets pour les cas courants.",
  },
  {
    label: 'Configurer les flux',
    desc: 'Active et décris chaque flux (création, mise à jour…). Assigne les champs qui seront envoyés dans chaque appel API.',
  },
  {
    label: 'Exporter la spec',
    desc: 'Exporte en JSON (pour les devs) ou en Markdown (pour le client). Le score de complétude indique ce qui reste à remplir.',
  },
]

const tips = [
  "Demande au client le <strong>schéma de données</strong> en amont (dictionnaire, exemple JSON, export CSV) — le mapping sera 10x plus rapide.",
  "Identifie l'<strong>identifiant unique</strong> dès le début de l'atelier. Tout le reste s'articule autour.",
  "Les champs <strong>requis</strong> dans le mapping sont ceux qui bloquent la création de carte. Valide-les en priorité.",
  "Si le client hésite sur la sécurité, propose <strong>SHA256</strong> par défaut — c'est le plus courant et le plus simple à implémenter côté CRM.",
  "Note les <strong>décisions et les doutes</strong> dans le champ \"Notes\" de chaque champ — ça évite de revenir dessus après l'atelier.",
]
</script>

<template>
  <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" @click.self="$emit('close')">
    <div class="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden">

      <!-- Header -->
      <div class="px-8 py-6 border-b border-gray-100 flex items-start justify-between">
        <div>
          <p class="text-xs font-medium text-brand-600 uppercase tracking-widest mb-1">Guide</p>
          <h2 class="text-2xl font-semibold text-gray-900">C'est ton premier projet Wallet ?</h2>
          <p class="text-gray-500 text-sm mt-1">Tout ce qu'il faut savoir avant de se lancer.</p>
        </div>
        <button @click="$emit('close')" class="text-gray-300 hover:text-gray-500 transition-colors text-xl mt-1">✕</button>
      </div>

      <!-- Scrollable body -->
      <div class="flex-1 overflow-y-auto px-8 py-6 space-y-10">

        <!-- 1. C'est quoi -->
        <section>
          <h3 class="text-base font-semibold text-gray-900 mb-3">C'est quoi Wallet Brevo ?</h3>
          <p class="text-sm text-gray-600 leading-relaxed">
            Wallet Brevo (anciennement Captain Wallet) est une plateforme qui permet aux marques de créer et envoyer des <strong>cartes digitales</strong> dans Apple Wallet et Google Wallet — cartes de fidélité, suivi de colis, billets d'événement, coupons, cartes cadeaux.
            <br /><br />
            Ton rôle en tant que consultant : paramétrer le <strong>contrat d'interface</strong> entre le système du client (CRM, backend, Brevo) et la plateforme Wallet Brevo.
          </p>
        </section>

        <!-- 2. Schéma des flux -->
        <section>
          <h3 class="text-base font-semibold text-gray-900 mb-4">Comment ça fonctionne</h3>

          <div class="rounded-xl border border-gray-100 bg-gray-50 p-6">
            <!-- Diagram -->
            <div class="flex items-stretch gap-0 text-xs">

              <!-- Source system -->
              <div class="flex flex-col gap-2 items-center flex-1">
                <div class="w-full rounded-lg border border-gray-200 bg-white p-3 text-center">
                  <div class="text-2xl mb-1">🏢</div>
                  <p class="font-semibold text-gray-800 text-xs">Système source</p>
                  <p class="text-gray-400 mt-0.5">CRM · Brevo · Backend</p>
                </div>
                <div class="text-center text-gray-400 text-xs px-2">
                  <p>Données client</p>
                  <p class="font-mono bg-gray-100 rounded px-1 mt-0.5">parcelNumber</p>
                  <p class="font-mono bg-gray-100 rounded px-1 mt-0.5">status</p>
                </div>
              </div>

              <!-- Arrow 1 -->
              <div class="flex flex-col items-center justify-center px-2 gap-1 min-w-[80px]">
                <div class="flex flex-col items-center gap-0.5 text-gray-400">
                  <span class="text-xs">Création</span>
                  <span class="text-[10px] text-brand-400 font-medium">POST /cards</span>
                  <span class="text-base">→</span>
                </div>
                <div class="flex flex-col items-center gap-0.5 text-gray-400">
                  <span class="text-base">→</span>
                  <span class="text-[10px] text-blue-400 font-medium">PUT /cards</span>
                  <span class="text-xs">Mise à jour</span>
                </div>
                <div class="flex flex-col items-center gap-0.5 text-gray-400 mt-1">
                  <span class="text-base">←</span>
                  <span class="text-[10px] text-green-400 font-medium">Webhook</span>
                  <span class="text-xs">Opt-in</span>
                </div>
              </div>

              <!-- Wallet Brevo -->
              <div class="flex flex-col gap-2 items-center flex-1">
                <div class="w-full rounded-lg border-2 border-brand-200 bg-brand-50 p-3 text-center">
                  <div class="text-2xl mb-1">⚡</div>
                  <p class="font-semibold text-brand-800 text-xs">Wallet Brevo</p>
                  <p class="text-brand-400 mt-0.5">Captain Wallet</p>
                </div>
                <div class="text-center text-gray-400 text-xs px-2">
                  <p>Cartes digitales</p>
                  <p class="font-mono bg-brand-50 rounded px-1 mt-0.5 text-brand-600">user.identifier</p>
                  <p class="font-mono bg-brand-50 rounded px-1 mt-0.5 text-brand-600">user.status</p>
                </div>
              </div>

              <!-- Arrow 2 -->
              <div class="flex flex-col items-center justify-center px-3 gap-1 min-w-[60px]">
                <span class="text-base text-gray-400">→</span>
                <span class="text-[10px] text-gray-400">Push notif</span>
              </div>

              <!-- End user -->
              <div class="flex flex-col gap-2 items-center flex-1">
                <div class="w-full rounded-lg border border-gray-200 bg-white p-3 text-center">
                  <div class="text-2xl mb-1">📱</div>
                  <p class="font-semibold text-gray-800 text-xs">Utilisateur final</p>
                  <p class="text-gray-400 mt-0.5">Apple · Google Wallet</p>
                </div>
                <div class="text-center text-gray-400 text-xs px-2">
                  <p>Carte installée</p>
                  <p>Notifications reçues</p>
                </div>
              </div>

            </div>

            <!-- Flows legend -->
            <div class="mt-5 pt-4 border-t border-gray-200 grid grid-cols-4 gap-3">
              <div v-for="flow in flows" :key="flow.label" class="flex items-start gap-2">
                <div class="w-2 h-2 rounded-full mt-1 shrink-0" :class="flow.color" />
                <div>
                  <p class="text-xs font-medium text-gray-700">{{ flow.label }}</p>
                  <p class="text-[11px] text-gray-400 leading-tight">{{ flow.desc }}</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <!-- 3. Concepts clés -->
        <section>
          <h3 class="text-base font-semibold text-gray-900 mb-3">Les concepts clés</h3>
          <div class="space-y-2">
            <div v-for="concept in concepts" :key="concept.term" class="flex gap-3 p-3 rounded-lg bg-gray-50 border border-gray-100">
              <div class="flex-1">
                <div class="flex items-center gap-2 mb-0.5">
                  <p class="text-sm font-medium text-gray-900">{{ concept.term }}</p>
                  <span class="text-[10px] font-mono px-1.5 py-0.5 rounded bg-brand-100 text-brand-600">{{ concept.tag }}</span>
                </div>
                <p class="text-xs text-gray-500 leading-relaxed">{{ concept.def }}</p>
              </div>
            </div>
          </div>
        </section>

        <!-- 4. Guide d'utilisation -->
        <section>
          <h3 class="text-base font-semibold text-gray-900 mb-3">Comment utiliser cet outil</h3>
          <div class="space-y-2">
            <div v-for="(step, i) in guideSteps" :key="i" class="flex gap-3 items-start">
              <div class="w-6 h-6 rounded-full bg-brand-600 text-white text-xs flex items-center justify-center shrink-0 mt-0.5 font-medium">{{ i + 1 }}</div>
              <div>
                <p class="text-sm font-medium text-gray-800">{{ step.label }}</p>
                <p class="text-xs text-gray-500 mt-0.5 leading-relaxed">{{ step.desc }}</p>
              </div>
            </div>
          </div>
        </section>

        <!-- 5. Tips atelier -->
        <section class="rounded-xl bg-amber-50 border border-amber-200 p-5">
          <h3 class="text-sm font-semibold text-amber-800 mb-3">💡 Pour un atelier réussi</h3>
          <ul class="space-y-1.5 text-xs text-amber-700">
            <li v-for="(tip, i) in tips" :key="i" class="flex gap-2">
              <span>→</span><span v-html="tip" />
            </li>
          </ul>
        </section>

      </div>

      <!-- Footer -->
      <div class="px-8 py-4 border-t border-gray-100 flex justify-end">
        <button @click="$emit('close')" class="px-5 py-2 rounded-lg bg-brand-600 text-white text-sm hover:bg-brand-700 transition-colors">
          C'est parti →
        </button>
      </div>

    </div>
  </div>
</template>
