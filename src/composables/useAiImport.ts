import { ref } from 'vue'

// ── System prompt ─────────────────────────────────────────────────────────────
// Describes our exact SpecState schema so the model fills the right fields

const SYSTEM_PROMPT = `Tu es un expert en intégration de wallet digital (Wallet Brevo / Captain Wallet).

Ta mission : analyser les documents fournis et en extraire les informations pour pré-remplir une spec d'intégration.

Retourne UNIQUEMENT un objet JSON valide (pas de markdown, pas d'explication) respectant ce schéma exact :

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
    "mode": "",
    "computedBy": ""
  },
  "campaigns": [
    { "name": "", "label": "", "description": "" }
  ],
  "mapping": [
    {
      "sourceField": "",
      "walletField": "",
      "type": "string",
      "required": false,
      "example": "",
      "notes": ""
    }
  ],
  "flows": {
    "create":    { "enabled": true,  "description": "", "fields": [] },
    "update":    { "enabled": true,  "description": "", "fields": [] },
    "optin":     { "enabled": false, "description": "", "fields": [] },
    "anonymize": { "enabled": false, "description": "", "fields": [] }
  },
  "notifications": [
    { "trigger": "", "title": "", "body": "", "campaignId": "" }
  ],
  "errors": []
}

Règles impératives :
- Ne remplis QUE ce que tu peux clairement déduire des documents.
- Laisse les champs vides ("") si tu n'as pas l'information.
- Pour "walletField" dans le mapping, utilise UNIQUEMENT ces valeurs standard :
  user.identifier, user.status, user.firstName, user.lastName, user.email, user.phone,
  install_status, user.expiration_date, user.custom_field_1, user.custom_field_2, user.custom_field_3
- "user.identifier" est le champ clé pivot — inclus-le toujours si tu identifies un identifiant.
- Pour "mode" dans security : "sha256", "aes256cbc" ou "none" uniquement.
- Pour "computedBy" : "client" ou "server" uniquement.
- N'invente rien qui ne soit pas présent dans les documents.
- Le tableau "errors" doit rester vide [].
- Le tableau "fields" dans chaque flow doit rester vide [].`

// ── File text extraction ───────────────────────────────────────────────────────

async function extractTextFromPdf(file: File): Promise<string> {
  // Lazy-load pdfjs so it doesn't bloat the main bundle
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
  // Plain text fallback
  return file.text()
}

// ── OpenAI call ───────────────────────────────────────────────────────────────

async function callOpenAI(apiKey: string, content: string): Promise<unknown> {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o',
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content },
      ],
      temperature: 0.2,
    }),
  })

  if (!response.ok) {
    const err = await response.json().catch(() => ({}))
    throw new Error((err as { error?: { message?: string } }).error?.message ?? `Erreur API ${response.status}`)
  }

  const data = await response.json()
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

  async function run(files: File[], contextPrompt: string, apiKey: string): Promise<unknown> {
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
        contextPrompt ? `## Contexte atelier\n${contextPrompt}` : '',
        `## Documents fournis\n${texts.join('\n\n')}`,
      ]
        .filter(Boolean)
        .join('\n\n')

      // 3. Call OpenAI
      status.value = 'calling'
      statusLabel.value = 'Analyse par GPT-4o…'
      const json = await callOpenAI(apiKey, userMessage)

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
