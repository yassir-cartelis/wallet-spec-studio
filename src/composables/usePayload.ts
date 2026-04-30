import { computed } from 'vue'
import { useSpecStore } from '@/stores/spec'

export function usePayload() {
  const store = useSpecStore()
  const s = store.state

  // ── Entry URL ─────────────────────────────────────────────────────────────
  // Le paramètre est toujours "data=" (clair ou chiffré selon mode)

  function buildUrl(env: 'qlf' | 'prod', campaignSlug: string, channel = 'email', tag = 'crm_email') {
    const { accountId, projectId } = s.meta
    const { pivotVar, pivotExample, baseUrlQlf, baseUrlProd } = s.entry
    const base =
      env === 'qlf'
        ? baseUrlQlf || `https://qlf-${accountId}.captainwallet.com`
        : baseUrlProd || `https://${accountId}.captainwallet.com`
    const identifier = encodeURIComponent(pivotExample || `{{contact.${pivotVar?.toUpperCase() || 'IDENTIFIER'}}}`)
    const dataParam = s.security.mode === 'aes256cbc' ? '<valeur_chiffrée>' : identifier
    return `${base}/${projectId}/${campaignSlug}?data=${dataParam}&channel=${channel}&tag=${tag}`
  }

  // URL pour la première campagne (utilisé dans StepSecurity)
  const urlQlf = computed(() => buildUrl('qlf', s.campaigns[0]?.name || 'loyalty'))
  const urlProd = computed(() => buildUrl('prod', s.campaigns[0]?.name || 'loyalty'))

  // URLs pour toutes les campagnes (utilisé dans StepIdentity)
  const urlsPerCampaign = computed(() =>
    s.campaigns.map((c) => ({
      name: c.name,
      label: c.label || c.name,
      qlf: buildUrl('qlf', c.name),
      prod: buildUrl('prod', c.name),
    })),
  )

  // ── API payloads ──────────────────────────────────────────────────────────
  // Structure réelle CW : [{ identifier, loyaltyStatus, metadatas: {...} }]

  function buildPayloadForFields(fieldIds: string[]) {
    const root: Record<string, unknown> = {}
    const metadatas: Record<string, unknown> = {}

    for (const id of fieldIds) {
      const field = s.mapping.find((f) => f.id === id)
      if (!field || !field.walletField) continue
      const value = field.example || exampleValue(field.type)
      if (field.payloadLevel === 'root') {
        root[field.walletField] = value
      } else {
        metadatas[field.walletField] = value
      }
    }

    const obj: Record<string, unknown> = { ...root }
    if (Object.keys(metadatas).length > 0) {
      obj.metadatas = metadatas
    }
    return [obj]
  }

  const createPayload = computed(() => buildPayloadForFields(s.flows.create.fields))
  const updatePayload = computed(() => buildPayloadForFields(s.flows.update.fields))

  const optinPayload = computed(() => ({
    identifier: s.entry.pivotExample || `{{${s.entry.pivotVar}}}`,
    install_status: true,
  }))

  const anonymizePayload = computed(() => ({
    identifier: s.entry.pivotExample || `{{${s.entry.pivotVar}}}`,
    metadatas: {
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
    urlsPerCampaign,
    createPayload,
    updatePayload,
    optinPayload,
    anonymizePayload,
    fullConfig,
    buildUrl,
  }
}

function exampleValue(type: string): unknown {
  switch (type) {
    case 'boolean': return true
    case 'number': return 0
    case 'date': return new Date().toISOString().split('T')[0]
    default: return '<string>'
  }
}
