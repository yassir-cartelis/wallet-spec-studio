<script setup lang="ts">
import { ref } from 'vue'

defineEmits<{ close: [] }>()

const activeTab = ref<'overview' | 'flows' | 'setup' | 'edge'>('overview')

const tabs = [
  { id: 'overview' as const, label: "🌐 Vue d'ensemble" },
  { id: 'flows'    as const, label: '⚡ Les 4 flux' },
  { id: 'setup'   as const, label: '🛠️ Setup étape par étape' },
  { id: 'edge'    as const, label: '🧪 Cas edge & recette' },
]

const valueProps = [
  { tag: 'accountId',       desc: 'Identifiant du compte Captain Wallet (fixe par compte)' },
  { tag: 'projectId',       desc: 'Identifiant du projet (ex : suivi de livraison)' },
  { tag: 'campaignId',      desc: "Design de carte à afficher — chaque design a son propre ID" },
  { tag: 'user.identifier', desc: "Identifiant pivot unique de l'utilisateur (dynamique, injecté par le CRM)" },
]

const lifecycle = [
  { label: 'Encartement',     desc: "Le client reçoit un email avec un CTA → clique → Captain Wallet appelle l'API GetCustomer du client → génère le visuel → l'utilisateur télécharge la carte dans son Wallet." },
  { label: 'Optin',           desc: "Captain Wallet notifie le système client en temps réel que la carte a été installée (ou supprimée), avec un timestamp et un statut booléen." },
  { label: 'Mises à jour',    desc: "Le système client pousse les changements de statut → la carte se met à jour silencieusement sur le téléphone + notification push envoyée." },
  { label: 'Fin de vie/RGPD', desc: "La carte bascule automatiquement en campagne \"Void\" → invitation à supprimer → anonymisation définitive en BDD 72h après." },
]

const tips = [
  "Demande au client le <strong>schéma de données</strong> en amont (dictionnaire, exemple JSON, export CSV) — le mapping sera 10x plus rapide.",
  "Identifie l'<strong>identifiant unique</strong> dès le début de l'atelier. Tout le reste s'articule autour.",
  "Les champs <strong>requis</strong> dans le mapping sont ceux qui bloquent la création de carte. Valide-les en priorité.",
  "Si le client hésite sur la sécurité, propose <strong>AES-256</strong> — méthode la plus robuste.",
  "Note les <strong>décisions et les doutes</strong> dans le champ Notes de chaque champ — évite de revenir dessus après l'atelier.",
]

const flows = [
  {
    num: '1',
    color: 'bg-brand-700',
    title: 'Encartement (GetCustomer)',
    dir: 'Captain Wallet → API client',
    who: "Le client fournit l'API · Captain Wallet appelle",
    body: "Lorsque l'utilisateur clique sur le CTA, Captain Wallet extrait le user.identifier de l'URL et appelle l'API GetCustomer du client. En retour, il reçoit un payload JSON avec toutes les données à afficher sur la carte. Le client doit exposer un endpoint sécurisé par token (basic auth ou OAuth).",
    payload: '',
    tip: "Tester sur Postman avant toute intégration officielle pour valider que les données retournées sont correctes et complètes.",
  },
  {
    num: '2',
    color: 'bg-green-600',
    title: 'Optin Wallet',
    dir: 'Captain Wallet → API client',
    who: "Le client fournit l'API · Captain Wallet pousse",
    body: "Captain Wallet sait en temps réel si un utilisateur a ajouté ou supprimé la carte. À chaque événement, il pousse cette information vers le système client. Le champ install_status (booléen : 1 = installée, 0 = supprimée) conditionne le filtre optinWallet = true sur le flux de mises à jour.",
    payload: '{ "user.identifier": "<id_pivot>", "install_status": 1, "event_date": "2026-03-20T10:00:00Z" }',
    tip: "Alternative SFTP : si le client ne peut pas exposer d'API en écriture, utiliser un SFTP en mode delta. Fréquence minimale recommandée : quotidienne.",
  },
  {
    num: '3',
    color: 'bg-blue-600',
    title: 'Mises à jour (PUSH)',
    dir: 'API client → Captain Wallet',
    who: "Captain Wallet fournit l'API · Le client appelle",
    body: "Quand le statut évolue, le système client appelle l'endpoint de Captain Wallet (méthode PUT) pour pousser les nouvelles données. Captain Wallet actualise silencieusement la carte et déclenche une notification push. Brevo fournit les credentials d'authentification lors du setup (PIM / OAuth token).",
    payload: '',
    tip: "⚠️ Règle critique : les updates ne doivent être envoyés que pour les clients dont optinWallet = true. Pousser des updates pour des utilisateurs non optins génère des appels inutiles et des erreurs.",
  },
  {
    num: '4',
    color: 'bg-orange-500',
    title: 'Anonymisation (RGPD)',
    dir: 'API client → Captain Wallet',
    who: "Captain Wallet fournit l'API · Le client appelle",
    body: "Pour traiter les requêtes RGPD ou fins de vie de carte, le client appelle un endpoint dédié (POST delete-pass-owners). Captain Wallet bascule ces utilisateurs vers la campagne \"Void\" — la carte devient vide et invite l'utilisateur à la supprimer. Anonymisation définitive en BDD 72h plus tard.",
    payload: '',
    tip: "Il n'est pas possible de supprimer directement une carte du Wallet d'un utilisateur. La campagne Void est le mécanisme standard pour inciter à la suppression.",
  },
]

const setupSteps = [
  {
    label: 'Définir les campagnes Wallet',
    body: "Identifier combien de designs de cartes sont nécessaires en fonction des cas d'usage métier. Chaque design correspond à une campagne avec un campaignId dédié.",
    example: "Exemple Colissimo : 4 campagnes — Hors domicile (avec code-barres), Domicile avec QR code, Domicile sans QR code (avec lien photo), Retour.",
  },
  {
    label: 'Définir le modèle de données (mapping)',
    body: "Lister tous les champs à afficher sur la carte et les faire correspondre aux champs du SI client. S'appuyer sur les noms de variables du client pour nommer les champs côté Brevo.",
    example: "Champs typiques : customerCompanyName, statusId (préférer un ID et non un libellé), deliveryDate, deliverySlot, qrCodeLink, returnCode.",
  },
  {
    label: "Construire l'API GetCustomer (côté client)",
    body: "Le client développe un endpoint qui reçoit le user.identifier, retourne un payload JSON avec les données de la carte, et est sécurisé par token (basic auth ou OAuth).",
    example: "Tester sur Postman avant d'intégrer dans les specs officielles. Le format JSON doit être simple — pas de transformation côté Brevo.",
  },
  {
    label: "Construire l'URL d'encartement sécurisée",
    body: "Générer les URLs de test (env qlf) avec les bons paramètres. Valider que Captain Wallet appelle correctement l'API GetCustomer et déchiffre les paramètres AES-256.",
    example: "La méthode privilégiée est le chiffrement AES-256 — plus robuste que SHA-256.",
  },
  {
    label: 'Mettre en place le flux Optin',
    body: "Créer les champs nécessaires dans le CRM/SI client : user.identifier, install_status (booléen), event_date (timestamp ISO 8601). Valider que Captain Wallet peut appeler l'endpoint et que les données remontent.",
    example: "Si SFTP : valider le format du fichier, l'accès au serveur, et la fréquence de traitement.",
  },
  {
    label: 'Mettre en place le flux de mise à jour',
    body: "Le client développe un flux (API PUT ou SFTP) pour pousser les changements de statut vers Captain Wallet. Brevo fournit les credentials d'authentification à ce stade.",
    example: "Le client doit filtrer ses envois aux seuls utilisateurs optinWallet = true. Si SFTP : préférer le mode delta, fréquence quotidienne minimum.",
  },
  {
    label: 'Valider les specs techniques en interne',
    body: "Faire valider le contrat d'interface complet par l'équipe Brevo. Une fois validé, créer un ticket de développement — il passe en recette interne avant tout contact client.",
    example: '',
  },
  {
    label: "Configurer l'anonymisation RGPD",
    body: "Mettre en place l'endpoint de bascule en campagne Void (POST delete-pass-owners). Tester le flux complet : appel → bascule → carte Void visible sur le téléphone → anonymisation 72h après.",
    example: '',
  },
]

const goLiveChecklist = [
  'Credentials API fournis et testés',
  'Toutes les campagnes validées (iOS + Android)',
  'Flux optin fonctionnel (install + uninstall)',
  'Flux update fonctionnel (changement de statut visible)',
  'Anonymisation testée et vérifiée 72h après',
  'Filtre optinWallet actif sur les updates',
  'Campagne Void configurée pour la fin de vie',
  'CR de recette externe envoyé et validé',
]

const edgeSections = [
  {
    flux: '1',
    color: 'text-brand-700',
    bg: 'bg-brand-50',
    border: 'border-brand-100',
    title: 'Flux 1 — Encartement (GetCustomer)',
    cases: [
      "user.identifier inexistant ou malformé dans l'URL : la carte doit afficher une erreur propre, pas planter silencieusement.",
      "URL expirée ou token AES-256 invalide : vérifier que l'accès est bloqué — tester sur mobile et desktop.",
      "L'API GetCustomer répond avec un champ vide : valider que la valeur par défaut s'affiche bien.",
      "L'API GetCustomer met trop de temps à répondre (timeout) : quel comportement sur la landing page ? À définir.",
      "Même URL ouverte sur desktop : vérifier que le QR code de fallback s'affiche et permet l'encartement sur mobile.",
      "Deux campagnes différentes pour le même user.identifier : s'assurer que le bon campaignId est utilisé selon les règles métier.",
      "Plusieurs variables dans l'URL : vérifier que le parsing côté Captain Wallet est correct.",
    ],
  },
  {
    flux: '2',
    color: 'text-green-700',
    bg: 'bg-green-50',
    border: 'border-green-100',
    title: 'Flux 2 — Optin Wallet',
    cases: [
      "Installation classique : vérifier que install_status = 1 remonte avec le bon user.identifier et un event_date cohérent.",
      "Suppression immédiate : install puis delete → install_status = 0 doit remonter, sans conflit avec le premier appel.",
      "Installations/suppressions multiples en peu de temps : tester install → delete → reinstall. Vérifier que l'état final reflète la dernière action.",
      "Carte installée sur deux appareils différents : comportement attendu côté CRM à valider — deux entrées distinctes ou une seule mise à jour ?",
      "L'API optin côté client est indisponible : y a-t-il un mécanisme de retry ? À vérifier avec l'équipe Brevo.",
    ],
  },
  {
    flux: '3',
    color: 'text-blue-700',
    bg: 'bg-blue-50',
    border: 'border-blue-100',
    title: 'Flux 3 — Mises à jour (PUSH)',
    cases: [
      "Update pour un user.identifier non optin : l'update doit être ignoré silencieusement, sans erreur ni notification fantôme.",
      "Changements de statuts très rapprochés : vérifier que la carte reflète bien le dernier état reçu et non un état intermédiaire.",
      "Payload JSON incomplet : envoyer un update avec un champ obligatoire manquant — erreur 400 avec message explicite ? À documenter.",
      "statusId inconnu ou non mappé : que s'affiche-t-il sur la carte ? Statut générique ? Rien ? À cadrer avec le client.",
      "Test des campagnes séparément : chaque campagne a ses propres champs spécifiques — tester chacune avec des payloads complets.",
      "Champ campaignId absent du payload : vérifier que le système sait toujours sur quelle campagne router la mise à jour.",
    ],
  },
  {
    flux: '4',
    color: 'text-orange-700',
    bg: 'bg-orange-50',
    border: 'border-orange-100',
    title: 'Flux 4 — Anonymisation (RGPD)',
    cases: [
      "Anonymisation d'un user.identifier qui n'a jamais installé la carte : l'appel doit passer sans erreur, même si l'utilisateur est inconnu.",
      "Tentative d'update après anonymisation : l'update ne doit pas s'appliquer et la carte Void ne doit pas être altérée.",
      "Vérification 72h après : planifier un test différé pour confirmer que les données sont bien effacées de la BDD Captain Wallet.",
      "Double appel d'anonymisation : comportement attendu — pas d'erreur, idempotent.",
    ],
  },
  {
    flux: '✕',
    color: 'text-gray-700',
    bg: 'bg-gray-50',
    border: 'border-gray-200',
    title: 'Cas transversaux',
    cases: [
      "Notifications push : vérifier sur iOS et Android (délais variables). Tester aussi si l'utilisateur a désactivé les notifs — la carte doit quand même se mettre à jour silencieusement.",
      "Fin de vie de la carte : déclencher la bascule Void, vérifier que la carte devient vide, que le CTA d'invitation à supprimer s'affiche, et que les données sensibles ne sont plus visibles.",
      "Changement d'appareil : l'utilisateur installe la carte sur un nouveau téléphone. Comportement à clarifier — nouvelle entrée ou reprise de l'existante ?",
      "Test multi-expéditeur : valider customerCompanyName renseigné vs vide. Confirmer le fallback et tester le cas retour.",
      "Parcours complet de bout en bout (smoke test) : email avec CTA → clic → encartement → changement de statut → notification push → fin de vie. À réaliser sur toutes les campagnes.",
    ],
  },
]
</script>

<template>
  <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" @click.self="$emit('close')">
    <div class="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden">

      <!-- Header -->
      <div class="px-8 py-5 border-b border-gray-100 flex items-start justify-between shrink-0">
        <div>
          <p class="text-xs font-bold text-brand-600 uppercase tracking-widest mb-1">Documentation</p>
          <h2 class="text-2xl font-bold text-brand-900">Guide Brevo Wallet</h2>
          <p class="text-brand-500 text-sm mt-0.5">Setup complet — de la compréhension des acteurs au go-live</p>
        </div>
        <button @click="$emit('close')" class="text-gray-300 hover:text-gray-500 transition-colors text-xl mt-1">✕</button>
      </div>

      <!-- Tabs -->
      <div class="flex border-b border-gray-100 px-8 shrink-0 bg-gray-50">
        <button
          v-for="tab in tabs"
          :key="tab.id"
          @click="activeTab = tab.id"
          class="px-4 py-3 text-sm font-medium border-b-2 transition-colors -mb-px"
          :class="activeTab === tab.id ? 'border-accent-500 text-accent-600' : 'border-transparent text-gray-500 hover:text-gray-800'"
        >{{ tab.label }}</button>
      </div>

      <!-- Body -->
      <div class="flex-1 overflow-y-auto px-8 py-7 space-y-8">

        <!-- ── VUE D'ENSEMBLE ──────────────────────────────────────────── -->
        <template v-if="activeTab === 'overview'">

          <section>
            <h3 class="text-base font-bold text-brand-900 mb-3">Qu'est-ce que Brevo Wallet ?</h3>
            <div class="bg-brand-50 border border-brand-100 rounded-xl p-5 text-sm text-brand-800 leading-relaxed space-y-3">
              <p>Brevo s'appuie sur <strong>Captain Wallet</strong> pour dématérialiser des cartes — suivi de colis, fidélité, billets, etc. — directement dans <strong>Apple Wallet et Google Wallet</strong>. Le système fonctionne en temps réel via API, avec des mises à jour silencieuses et des notifications push automatiques.</p>
              <p>Un projet Brevo Wallet dure en moyenne <strong>6 semaines</strong>, avec 1 à 3 ateliers techniques selon la complexité du cas d'usage.</p>
            </div>
          </section>

          <section>
            <h3 class="text-base font-bold text-brand-900 mb-4">Les 3 acteurs clés</h3>
            <div class="grid grid-cols-3 gap-4">
              <div class="rounded-xl border border-brand-100 p-4">
                <div class="text-2xl mb-2">⚡</div>
                <p class="font-bold text-brand-900 text-sm mb-1">Brevo / Captain Wallet</p>
                <p class="text-xs text-brand-600 leading-relaxed">Héberge et génère les cartes. Gère les mises à jour en temps réel, les notifications push, et l'anonymisation RGPD. Orchestre l'ensemble du cycle de vie de la carte.</p>
              </div>
              <div class="rounded-xl border border-brand-100 p-4">
                <div class="text-2xl mb-2">🏢</div>
                <p class="font-bold text-brand-900 text-sm mb-1">Le client (ex : Colissimo)</p>
                <p class="text-xs text-brand-600 leading-relaxed">Fournit l'API GetCustomer pour l'encartement, reçoit les remontées d'optin, et envoie les updates de statut via API ou SFTP. Détient les données métier à afficher.</p>
              </div>
              <div class="rounded-xl border border-brand-100 p-4">
                <div class="text-2xl mb-2">📱</div>
                <p class="font-bold text-brand-900 text-sm mb-1">L'utilisateur final</p>
                <p class="text-xs text-brand-600 leading-relaxed">Clique sur un CTA dans un email ou SMS, télécharge la carte, puis reçoit les push notifications automatiquement à chaque changement de statut.</p>
              </div>
            </div>
          </section>

          <section>
            <h3 class="text-base font-bold text-brand-900 mb-4">Cycle de vie d'une carte</h3>
            <div class="space-y-3">
              <div v-for="(step, i) in lifecycle" :key="i" class="flex gap-3 items-start">
                <div class="w-6 h-6 rounded-full bg-brand-700 text-white text-xs flex items-center justify-center shrink-0 mt-0.5 font-bold">{{ i + 1 }}</div>
                <div>
                  <p class="text-sm font-semibold text-brand-900">{{ step.label }}</p>
                  <p class="text-xs text-brand-600 mt-0.5 leading-relaxed">{{ step.desc }}</p>
                </div>
              </div>
            </div>
          </section>

          <section>
            <h3 class="text-base font-bold text-brand-900 mb-4">Structure de l'URL d'encartement</h3>
            <div class="space-y-3">
              <div>
                <p class="text-xs font-semibold text-brand-500 uppercase tracking-wide mb-1">Production</p>
                <div class="bg-gray-900 rounded-lg px-4 py-3 font-mono text-xs text-green-300 break-all leading-relaxed">
                  https://&#123;&#123;accountId&#125;&#125;.captainwallet.com/&#123;&#123;projectId&#125;&#125;/&#123;&#123;campaignId&#125;&#125;?user[identifier]=&#123;&#123;user.identifier&#125;&#125;&amp;channel=&#123;&#123;channel&#125;&#125;&amp;tag=&#123;&#123;tag&#125;&#125;
                </div>
              </div>
              <div>
                <p class="text-xs font-semibold text-brand-500 uppercase tracking-wide mb-1">Pré-production (qlf)</p>
                <div class="bg-gray-900 rounded-lg px-4 py-3 font-mono text-xs text-yellow-300 break-all leading-relaxed">
                  https://qlf-&#123;&#123;accountId&#125;&#125;.captainwallet.com/&#123;&#123;projectId&#125;&#125;/&#123;&#123;campaignId&#125;&#125;?user[identifier]=&#123;&#123;user.identifier&#125;&#125;&amp;channel=&#123;&#123;channel&#125;&#125;&amp;tag=&#123;&#123;tag&#125;&#125;
                </div>
              </div>
            </div>
            <div class="mt-4 grid grid-cols-2 gap-3">
              <div v-for="v in valueProps" :key="v.tag" class="bg-brand-50 rounded-lg px-3 py-2.5">
                <p class="font-mono text-xs font-bold text-brand-700">{{ v.tag }}</p>
                <p class="text-xs text-brand-500 mt-0.5 leading-relaxed">{{ v.desc }}</p>
              </div>
            </div>
            <div class="mt-3 bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 text-xs text-amber-700 leading-relaxed">
              <strong>Champs réservés :</strong> <code>user.identifier</code>, <code>user.firstname</code>, <code>user.lastname</code>. Pour les autres champs dynamiques, la convention est <code>user.{nom_du_champ}</code>.
            </div>
          </section>

          <section class="rounded-xl bg-amber-50 border border-amber-200 p-5">
            <h3 class="text-sm font-bold text-amber-800 mb-3">💡 Pour un atelier réussi</h3>
            <ul class="space-y-1.5 text-xs text-amber-700">
              <li v-for="(tip, i) in tips" :key="i" class="flex gap-2">
                <span>→</span><span v-html="tip" />
              </li>
            </ul>
          </section>

        </template>

        <!-- ── LES 4 FLUX ─────────────────────────────────────────────── -->
        <template v-if="activeTab === 'flows'">

          <div class="bg-brand-50 border border-brand-100 rounded-xl p-4 text-xs text-brand-700 leading-relaxed">
            Chaque flux a une direction et un responsable différent. C'est l'essentiel à comprendre avant de démarrer un setup.
          </div>

          <section v-for="flow in flows" :key="flow.num" class="rounded-xl border border-brand-100 overflow-hidden">
            <div class="flex items-center gap-3 px-5 py-3 border-b border-brand-100 bg-brand-50">
              <div class="w-7 h-7 rounded-full text-white text-sm flex items-center justify-center font-bold shrink-0" :class="flow.color">{{ flow.num }}</div>
              <div class="flex-1">
                <p class="text-sm font-bold text-brand-900">{{ flow.title }}</p>
                <p class="text-[11px] text-brand-500 font-mono mt-0.5">{{ flow.dir }}</p>
              </div>
              <span class="text-[11px] bg-white border border-brand-200 text-brand-700 px-2.5 py-1 rounded-full font-medium">{{ flow.who }}</span>
            </div>
            <div class="px-5 py-4 space-y-3">
              <p class="text-sm text-brand-700 leading-relaxed">{{ flow.body }}</p>
              <div v-if="flow.payload" class="bg-gray-900 rounded-lg px-4 py-3 font-mono text-xs text-green-300 leading-relaxed">{{ flow.payload }}</div>
              <div class="bg-amber-50 border border-amber-200 rounded-lg px-4 py-2.5 text-xs text-amber-700 leading-relaxed">{{ flow.tip }}</div>
            </div>
          </section>

        </template>

        <!-- ── SETUP ──────────────────────────────────────────────────── -->
        <template v-if="activeTab === 'setup'">

          <div class="space-y-4">
            <div v-for="(step, i) in setupSteps" :key="i" class="rounded-xl border border-brand-100 overflow-hidden">
              <div class="flex items-center gap-3 px-5 py-3 bg-brand-50 border-b border-brand-100">
                <div class="w-7 h-7 rounded-full bg-brand-700 text-white text-xs flex items-center justify-center font-bold shrink-0">{{ i + 1 }}</div>
                <p class="text-sm font-bold text-brand-900">{{ step.label }}</p>
              </div>
              <div class="px-5 py-4 space-y-2">
                <p class="text-sm text-brand-700 leading-relaxed">{{ step.body }}</p>
                <p v-if="step.example" class="text-xs text-brand-500 bg-brand-50 rounded-lg px-3 py-2 leading-relaxed">→ {{ step.example }}</p>
              </div>
            </div>
          </div>

          <section class="rounded-xl bg-green-50 border border-green-200 p-5">
            <h3 class="text-sm font-bold text-green-800 mb-3">✅ Checklist go-live</h3>
            <div class="grid grid-cols-2 gap-1.5">
              <div v-for="item in goLiveChecklist" :key="item" class="flex items-start gap-2 text-xs text-green-700">
                <span class="text-green-500 shrink-0 mt-0.5">✓</span>
                <span>{{ item }}</span>
              </div>
            </div>
            <div class="mt-4 bg-white border border-green-200 rounded-lg px-4 py-2.5 text-xs text-green-700 leading-relaxed">
              <strong>Point de vigilance :</strong> Brevo n'a pas accès aux logs côté client. En cas de bug, les échanges de diagnostic se font par mail — prévoir un canal de communication clair avec l'équipe technique client.
            </div>
          </section>

        </template>

        <!-- ── EDGE CASES ─────────────────────────────────────────────── -->
        <template v-if="activeTab === 'edge'">

          <div class="bg-red-50 border border-red-100 rounded-xl px-5 py-4 text-sm text-red-700 leading-relaxed">
            L'ensemble des cas limites à couvrir lors de la recette d'un projet Brevo Wallet, organisés par flux technique.
          </div>

          <section v-for="section in edgeSections" :key="section.flux" class="rounded-xl border overflow-hidden" :class="section.border">
            <div class="flex items-center gap-3 px-5 py-3 border-b" :class="[section.bg, section.border]">
              <div class="w-7 h-7 rounded-full bg-white border text-xs flex items-center justify-center font-bold shrink-0" :class="[section.color, section.border]">{{ section.flux }}</div>
              <p class="text-sm font-bold text-brand-900">{{ section.title }}</p>
            </div>
            <div class="px-5 py-4">
              <ul class="space-y-2.5">
                <li v-for="c in section.cases" :key="c" class="flex gap-2.5 text-xs text-brand-700 leading-relaxed">
                  <span class="shrink-0 mt-0.5 font-bold" :class="section.color">→</span>
                  <span>{{ c }}</span>
                </li>
              </ul>
            </div>
          </section>

        </template>

      </div>

      <!-- Footer -->
      <div class="px-8 py-4 border-t border-gray-100 flex justify-between items-center shrink-0">
        <div class="flex gap-2">
          <button
            v-for="tab in tabs"
            :key="tab.id"
            @click="activeTab = tab.id"
            class="w-2 h-2 rounded-full transition-colors"
            :class="activeTab === tab.id ? 'bg-accent-500' : 'bg-gray-200 hover:bg-gray-300'"
          />
        </div>
        <button @click="$emit('close')" class="px-5 py-2 rounded-lg bg-accent-500 text-white text-sm font-semibold hover:bg-accent-600 transition-colors">
          C'est parti →
        </button>
      </div>

    </div>
  </div>
</template>
