import { computed } from 'vue'
import { useSpecStore } from '@/stores/spec'

export function usePayload() {
  const store = useSpecStore()
  const s = store.state

  // ── Entry URL ─────────────────────────────────────────────────────────────

  function buildUrl(env: 'qlf' | 'prod', channel = 'email', tag = 'crm_email') {
    const { accountId, projectId } = s.meta
    const { pivotVar, pivotExample, baseUrlQlf, baseUrlProd } = s.entry
    const base =
      env === 'qlf'
        ? baseUrlQlf || `https://qlf-${accountId}.captainwallet.com`
        : baseUrlProd || `https://${accountId}.captainwallet.com`
    const identifier = encodeURIComponent(pivotExample || `{{contact.${pivotVar?.toUpperCase() || 'IDENTIFIER'}}}`)
    return `${base}/${projectId}/loyalty?user%5Bidentifier%5D=${identifier}&channel=${channel}&tag=${tag}`
  }

  const urlQlf = computed(() => buildUrl('qlf'))
  const urlProd = computed(() => buildUrl('prod'))

  // ── API payloads ──────────────────────────────────────────────────────────

  function buildPayloadForFields(fieldIds: string[]) {
    const payload: Record<string, unknown> = {}
    for (const id of fieldIds) {
      const field = s.mapping.find((f) => f.id === id)
      if (!field) continue
      const value = field.example || exampleValue(field.type)
      setNested(payload, field.walletField, value)
    }
    return payload
  }

  const createPayload = computed(() => buildPayloadForFields(s.flows.create.fields))
  const updatePayload = computed(() => buildPayloadForFields(s.flows.update.fields))

  const optinPayload = computed(() => ({
    install_status: true,
    user: {
      identifier: s.entry.pivotExample || `{{${s.entry.pivotVar}}}`,
    },
  }))

  const anonymizePayload = computed(() => ({
    user: {
      identifier: s.entry.pivotExample || `{{${s.entry.pivotVar}}}`,
      email: 'anonymized@void.invalid',
      firstName: 'ANONYMIZED',
      lastName: 'ANONYMIZED',
    },
  }))

  // ── Full JSON export ──────────────────────────────────────────────────────

  const fullConfig = computed(() => ({
    meta: s.meta,
    entry: {
      ...s.entry,
      urlQlf: urlQlf.value,
      urlProd: urlProd.value,
    },
    security: s.security,
    campaigns: s.campaigns,
    mapping: s.mapping,
    flows: {
      create: { ...s.flows.create, examplePayload: createPayload.value },
      update: { ...s.flows.update, examplePayload: updatePayload.value },
      optin: { ...s.flows.optin, examplePayload: optinPayload.value },
      anonymize: { ...s.flows.anonymize, examplePayload: anonymizePayload.value },
    },
    notifications: s.notifications,
    errors: s.errors,
  }))

  return {
    urlQlf,
    urlProd,
    createPayload,
    updatePayload,
    optinPayload,
    anonymizePayload,
    fullConfig,
    buildUrl,
  }
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function exampleValue(type: string): unknown {
  switch (type) {
    case 'boolean': return true
    case 'number': return 0
    case 'date': return new Date().toISOString().split('T')[0]
    default: return '<string>'
  }
}

/** Sets a nested key like "user.status" on an object */
function setNested(obj: Record<string, unknown>, path: string, value: unknown) {
  const parts = path.split('.')
  let cur = obj
  for (let i = 0; i < parts.length - 1; i++) {
    if (!cur[parts[i]]) cur[parts[i]] = {}
    cur = cur[parts[i]] as Record<string, unknown>
  }
  cur[parts[parts.length - 1]] = value
}
