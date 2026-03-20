import { ref } from 'vue'

// ── System prompt ─────────────────────────────────────────────────────────────

const SYSTEM_PROMPT = [
  `Tu es un architecte d'intégration expert en Wallet Brevo (anciennement Captain Wallet).`,

  `## CONTEXTE MÉTIER
Wallet Brevo permet à des marques d'envoyer des cartes digitales dans Apple Wallet et Google Wallet (cartes de fidélité, suivi de colis, billets, etc.).
Un consultant utilise cet outil pendant un atelier client pour construire une spec d'intégration complète.
Ton rôle : analyser tous les documents fournis et pré-remplir CHAQUE section de la spec aussi complètement que possible, afin que le consultant arrive en atelier avec un maximum d'informations déjà en place.`,

  `## OBJECTIF
Maximise le remplissage. Sois offensif dans l'extraction : déduis, infère, propose — mieux vaut une valeur raisonnable qu'un champ vide. Le consultant corrigera ce qui est faux, mais ne peut pas inventer ce qui est absent.`,

  `## SCHÉMA DE SORTIE
Retourne UNIQUEMENT un objet JSON valide (aucun markdown, aucun texte autour).

{
  "meta": {
    "projectName": "",
    "brand": "",
    "accountId": "",
    "projectId": "fr_FR",
    "timezone": "Europe/Paris"
  },
  "entry": {
    "pivotVar": "",
    "pivotExample": "",
    "channels": [],
    "baseUrlQlf": "",
    "baseUrlProd": ""
  },
  "security": {
    "mode": "sha256",
    "computedBy": "client"
  },
  "campaigns": [],
  "mapping": [],
  "flows": {
    "create":    { "enabled": true,  "description": "", "fields": [] },
    "update":    { "enabled": true,  "description": "", "fields": [] },
    "optin":     { "enabled": false, "description": "", "fields": [] },
    "anonymize": { "enabled": false, "description": "", "fields": [] }
  },
  "notifications": [],
  "errors": []
}`,

  `## INSTRUCTIONS PAR SECTION

### meta
- projectName : nom complet du projet (ex: "Colissimo Wallet - Suivi colis")
- brand : nom de la marque/entreprise cliente (ex: "Colissimo", "La Poste")
- accountId : slug du compte Wallet Brevo, en minuscules sans espaces (ex: "colissimo")
- projectId : locale du projet (ex: "fr_FR") — déduis depuis la langue des documents
- timezone : déduis depuis le pays/contexte (ex: "Europe/Paris")

### entry
- pivotVar : nom de la variable pivot côté client (ex: "parcelNumber", "orderId", "customerId")
- pivotExample : exemple de valeur concrète (ex: "8X00123456789", "CMD-2024-001")
- channels : liste des canaux mentionnés parmi "email", "sms", "push", "web", "inapp"
- baseUrlQlf / baseUrlProd : URLs si mentionnées dans les documents

### security
- mode : "sha256" par défaut, "aes256cbc" si données sensibles, "none" si explicitement sans signature
- computedBy : "client" si calcul côté CRM/Brevo, "server" si backend dédié

### campaigns
Toujours au moins 2 entrées :
[
  {"name": "loyalty", "label": "Carte principale", "description": "Carte active — use case principal"},
  {"name": "void",    "label": "Void",             "description": "Carte vidée / expirée / fin de vie"}
]
Ajoute d'autres campagnes si le document mentionne des variantes (ex: campagne premium, campagne retour, etc.)`,

  `### mapping — SECTION CRITIQUE
Le mapping liste tous les champs que le système source envoie vers Wallet Brevo.
Génère une entrée pour CHAQUE champ de données identifié dans les documents.

COMMENT IDENTIFIER LES CHAMPS :
- Tableaux de données, listes de champs, schémas JSON/XML, noms de colonnes BDD
- Variables mentionnées avec doubles accolades, crochets, ou en MAJUSCULES
- Mots-clés métier : numéro de commande, statut, prénom, email, date, solde, points, etc.
- Si le use case est clair (ex: suivi de colis), infère les champs évidents même non listés explicitement

CORRESPONDANCE sourceField -> walletField :
- Identifiant unique (numéro colis, ID commande, numéro client) -> "user.identifier" (required: true)
- Statut, état, étape -> "user.status"
- Prénom -> "user.firstName"
- Nom -> "user.lastName"
- Email -> "user.email"
- Téléphone -> "user.phone"
- Points, solde, score -> "user.points" (type: "number")
- Date expiration, fin de validité -> "user.expiration_date" (type: "date")
- Opt-in wallet installé -> "install_status" (type: "boolean")
- Tout autre champ métier -> "user.custom_field_1", "user.custom_field_2", "user.custom_field_3"

FORMAT d'un objet mapping :
{"sourceField": "NUMERO_COLIS", "walletField": "user.identifier", "type": "string", "required": true, "example": "8X00123456789", "notes": "Identifiant unique du colis"}

EXEMPLE complet pour suivi de colis :
[
  {"sourceField": "NUMERO_COLIS",          "walletField": "user.identifier",    "type": "string",  "required": true,  "example": "8X00123456789", "notes": ""},
  {"sourceField": "STATUT_LIVRAISON",      "walletField": "user.status",        "type": "string",  "required": false, "example": "EN_TRANSIT",    "notes": ""},
  {"sourceField": "PRENOM_DESTINATAIRE",   "walletField": "user.firstName",     "type": "string",  "required": false, "example": "Marie",          "notes": ""},
  {"sourceField": "NOM_DESTINATAIRE",      "walletField": "user.lastName",      "type": "string",  "required": false, "example": "Dupont",         "notes": ""},
  {"sourceField": "DATE_LIVRAISON_PREVUE", "walletField": "user.expiration_date","type": "date",   "required": false, "example": "2024-03-15",     "notes": ""}
]`,

  `### flows
- create : toujours activé. Description = quand la carte est créée (ex: "À l'expédition du colis")
- update : toujours activé. Description = quand le statut change (ex: "À chaque changement de statut")
- optin  : activer si le document mentionne Apple Wallet, Google Wallet, installation, opt-in natif
- anonymize : activer si le document mentionne RGPD, suppression de données, anonymisation
- IMPORTANT : "fields" reste TOUJOURS [] dans tous les flows

### notifications
Si le use case implique des événements (livraison, statut, expiration...), propose des notifications réalistes :
- trigger : condition métier en clair (ex: 'user.status devient LIVRE')
- title : titre court (ex: "Votre colis est arrivé !")
- body : message max 150 caractères
- campaignId : laisser ""

### RÈGLES FINALES
- "errors" reste TOUJOURS []
- "fields" dans chaque flow reste TOUJOURS []
- Le mapping doit contenir AU MINIMUM le champ user.identifier
- Les campaigns doivent TOUJOURS contenir au moins la campagne principale + "void"`,
].join('\n\n')

// ── File text extraction ───────────────────────────────────────────────────────

async function extractTextFromPdf(file: File): Promise<string> {
  const pdfjsLib = await import('pdfjs-dist')
  const { default: pdfjsWorker } = await import('pdfjs-dist/build/pdf.worker.min.mjs?url')
  pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker

  const buffer = await file.arrayBuffer()
  const pdf = await pdfjsLib.getDocument({ data: buffer }).promise
  const pages: string[] = []
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i)
    const content = await page.getTextContent()
    pages.push(content.items.map((item) => ('str' in item ? item.str : '')).join(' '))
  }
  return pages.join('\n\n')
}

async function extractTextFromDocx(file: File): Promise<string> {
  const mammoth = await import('mammoth')
  const buffer = await file.arrayBuffer()
  const result = await mammoth.extractRawText({ arrayBuffer: buffer })
  return result.value
}

async function extractText(file: File): Promise<string> {
  const name = file.name.toLowerCase()
  if (name.endsWith('.pdf')) return extractTextFromPdf(file)
  if (name.endsWith('.docx')) return extractTextFromDocx(file)
  return file.text()
}

// ── API call (via backend proxy) ──────────────────────────────────────────────

async function callGenerateSpec(content: string): Promise<unknown> {
  const response = await fetch('/api/generate-spec', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content },
      ],
    }),
  })

  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.error ?? `Erreur serveur ${response.status}`)
  }

  const raw = data.choices?.[0]?.message?.content
  if (!raw) throw new Error('Réponse vide du modèle.')
  return JSON.parse(raw)
}

// ── Composable ────────────────────────────────────────────────────────────────

export type AiImportStatus = 'idle' | 'extracting' | 'calling' | 'done' | 'error'

export function useAiImport() {
  const status = ref<AiImportStatus>('idle')
  const statusLabel = ref('')
  const error = ref<string | null>(null)
  const result = ref<unknown>(null)

  async function run(files: File[], contextPrompt: string): Promise<unknown> {
    status.value = 'extracting'
    error.value = null
    result.value = null

    try {
      // 1. Extract text from all files
      const texts: string[] = []
      for (const file of files) {
        statusLabel.value = `Extraction : ${file.name}…`
        texts.push(`=== ${file.name} ===\n${await extractText(file)}`)
      }

      // 2. Build user message
      const userMessage = [
        `## OBJECTIF DE L'ANALYSE
Lis attentivement tous les documents ci-dessous et pré-remplis la spec d'intégration Wallet Brevo aussi complètement que possible.
Porte une attention particulière au mapping des champs : identifie TOUS les champs de données mentionnés et fais la correspondance avec les champs Wallet Brevo.`,

        contextPrompt
          ? `## CONTEXTE FOURNI PAR LE CONSULTANT\n${contextPrompt}`
          : '',

        `## DOCUMENTS À ANALYSER\n${texts.join('\n\n---\n\n')}`,

        `## RAPPEL
Maximise le remplissage du JSON, notamment le tableau "mapping". Sois exhaustif. Le consultant corrigera, mais ne peut pas inventer.`,
      ]
        .filter(Boolean)
        .join('\n\n')

      // 3. Call backend proxy → OpenAI
      status.value = 'calling'
      statusLabel.value = 'Analyse par GPT-4o…'
      const json = await callGenerateSpec(userMessage)

      result.value = json
      status.value = 'done'
      statusLabel.value = ''
      return json
    } catch (e) {
      status.value = 'error'
      error.value = (e as Error).message
      statusLabel.value = ''
      throw e
    }
  }

  function reset() {
    status.value = 'idle'
    statusLabel.value = ''
    error.value = null
    result.value = null
  }

  return { status, statusLabel, error, result, run, reset }
}
