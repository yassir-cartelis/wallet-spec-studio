import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useStorage } from '@vueuse/core'
import type { SpecState, FieldMapping, FlowName } from '@/types/spec'
import { DEFAULT_ERROR_RULES } from '@/config/errorCodes'

function makeId() {
  return Math.random().toString(36).slice(2, 9)
}

const DEFAULT_STATE: SpecState = {
  meta: {
    projectName: '',
    brand: '',
    accountId: '',
    projectId: 'fr_FR',
    timezone: 'Europe/Paris',
  },
  entry: {
    pivotVar: '',
    pivotExample: '',
    channels: ['email'],
    baseUrlQlf: '',
    baseUrlProd: '',
  },
  security: {
    mode: 'sha256',
    computedBy: 'client',
  },
  campaigns: [
    { id: makeId(), name: 'loyalty', label: 'Loyalty', description: 'Carte principale active' },
    { id: makeId(), name: 'void', label: 'Void', description: 'Carte vidée / fin de vie' },
  ],
  mapping: [],
  flows: {
    create: { enabled: true, description: 'Création de carte à la première livraison', fields: [] },
    update: { enabled: true, description: 'Mise à jour du statut de livraison', fields: [] },
    optin: { enabled: false, description: 'Opt-in wallet natif (Apple / Google)', fields: [] },
    anonymize: { enabled: false, description: 'Anonymisation RGPD', fields: [] },
  },
  notifications: [],
  errors: DEFAULT_ERROR_RULES.map((e) => ({ ...e, id: makeId() })),
}

export const useSpecStore = defineStore('spec', () => {
  const state = useStorage<SpecState>('wallet-spec', structuredClone(DEFAULT_STATE), localStorage, {
    serializer: {
      read: (v) => (v ? JSON.parse(v) : structuredClone(DEFAULT_STATE)),
      write: (v) => JSON.stringify(v),
    },
  })

  const isDirty = ref(false)

  // ── Computed helpers ──────────────────────────────────────────────────────

  const entryUrl = computed(() => {
    const { accountId, projectId } = state.value.meta
    const { pivotVar, pivotExample } = state.value.entry
    if (!accountId || !pivotVar) return ''
    const base = state.value.entry.baseUrlProd || `https://${accountId}.captainwallet.com`
    const encoded = encodeURIComponent(`${pivotExample}`)
    return `${base}/${projectId}/loyalty?user%5Bidentifier%5D=${encoded}&channel=email&tag=crm_email`
  })

  const requiredFields = computed(() =>
    state.value.mapping.filter((f) => f.required),
  )

  const createPayload = computed(() => {
    const payload: Record<string, unknown> = {}
    for (const field of state.value.mapping) {
      if (state.value.flows.create.fields.includes(field.id)) {
        payload[field.walletField] = field.example || `<${field.type}>`
      }
    }
    return payload
  })

  const updatePayload = computed(() => {
    const payload: Record<string, unknown> = {}
    for (const field of state.value.mapping) {
      if (state.value.flows.update.fields.includes(field.id)) {
        payload[field.walletField] = field.example || `<${field.type}>`
      }
    }
    return payload
  })

  // ── Mutations ─────────────────────────────────────────────────────────────

  function addMapping(partial: Partial<FieldMapping> = {}) {
    const field: FieldMapping = {
      id: makeId(),
      sourceField: '',
      walletField: '',
      type: 'string',
      required: false,
      ...partial,
    }
    state.value.mapping.push(field)
    isDirty.value = true
    return field
  }

  function removeMapping(id: string) {
    state.value.mapping = state.value.mapping.filter((f) => f.id !== id)
    // also remove from all flow field lists
    for (const flow of Object.values(state.value.flows)) {
      flow.fields = flow.fields.filter((fid) => fid !== id)
    }
    isDirty.value = true
  }

  function toggleFlowField(flowName: FlowName, fieldId: string) {
    const flow = state.value.flows[flowName]
    const idx = flow.fields.indexOf(fieldId)
    if (idx === -1) flow.fields.push(fieldId)
    else flow.fields.splice(idx, 1)
    isDirty.value = true
  }

  function addCampaign() {
    state.value.campaigns.push({
      id: makeId(),
      name: '',
      label: '',
      description: '',
    })
    isDirty.value = true
  }

  function removeCampaign(id: string) {
    state.value.campaigns = state.value.campaigns.filter((c) => c.id !== id)
    isDirty.value = true
  }

  function addNotification() {
    state.value.notifications.push({
      id: makeId(),
      trigger: '',
      title: '',
      body: '',
      campaignId: state.value.campaigns[0]?.id ?? '',
    })
    isDirty.value = true
  }

  function removeNotification(id: string) {
    state.value.notifications = state.value.notifications.filter((n) => n.id !== id)
    isDirty.value = true
  }

  function addError() {
    state.value.errors.push({
      id: makeId(),
      code: '',
      label: '',
      strategy: 'alert',
    })
    isDirty.value = true
  }

  function removeError(id: string) {
    state.value.errors = state.value.errors.filter((e) => e.id !== id)
    isDirty.value = true
  }

  function reset() {
    state.value = structuredClone(DEFAULT_STATE)
    // Re-seed campaign ids after reset
    state.value.campaigns[0].id = makeId()
    state.value.campaigns[1].id = makeId()
    state.value.errors = DEFAULT_ERROR_RULES.map((e) => ({ ...e, id: makeId() }))
    isDirty.value = false
  }

  function markClean() {
    isDirty.value = false
  }

  return {
    state,
    isDirty,
    // computed
    entryUrl,
    requiredFields,
    createPayload,
    updatePayload,
    // mutations
    addMapping,
    removeMapping,
    toggleFlowField,
    addCampaign,
    removeCampaign,
    addNotification,
    removeNotification,
    addError,
    removeError,
    reset,
    markClean,
  }
})
