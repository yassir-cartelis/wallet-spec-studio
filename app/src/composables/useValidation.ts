import { computed } from 'vue'
import { useSpecStore } from '@/stores/spec'
import type { ReviewNote } from '@/types/spec'

export function useValidation() {
  const store = useSpecStore()
  const s = store.state

  const notes = computed<ReviewNote[]>(() => {
    const result: ReviewNote[] = []

    // Meta
    if (!s.meta.accountId)
      result.push({ field: 'meta.accountId', message: 'Account ID manquant', severity: 'error' })
    if (!s.meta.brand)
      result.push({ field: 'meta.brand', message: 'Marque manquante', severity: 'warning' })
    if (!s.meta.projectName)
      result.push({ field: 'meta.projectName', message: 'Nom de projet manquant', severity: 'warning' })

    // Entry / pivot
    if (!s.entry.pivotVar)
      result.push({ field: 'entry.pivotVar', message: 'Variable pivot manquante', severity: 'error' })
    if (!s.entry.pivotExample)
      result.push({ field: 'entry.pivotExample', message: 'Exemple pivot manquant', severity: 'warning' })
    if (!s.entry.baseUrlProd)
      result.push({ field: 'entry.baseUrlProd', message: 'Base URL PROD manquante', severity: 'error' })

    // Mapping
    if (s.mapping.length === 0)
      result.push({ field: 'mapping', message: 'Aucun champ mappé', severity: 'error' })

    const hasIdentifier = s.mapping.some((f) => f.walletField === 'user.identifier')
    if (!hasIdentifier)
      result.push({ field: 'mapping', message: 'Champ user.identifier requis manquant', severity: 'error' })

    const emptyFields = s.mapping.filter((f) => !f.sourceField || !f.walletField)
    if (emptyFields.length > 0)
      result.push({
        field: 'mapping',
        message: `${emptyFields.length} champ(s) incomplets dans le mapping`,
        severity: 'warning',
      })

    // Flows
    if (s.flows.create.enabled && s.flows.create.fields.length === 0)
      result.push({ field: 'flows.create', message: 'Flux Création : aucun champ assigné', severity: 'warning' })
    if (s.flows.update.enabled && s.flows.update.fields.length === 0)
      result.push({ field: 'flows.update', message: 'Flux Mise à jour : aucun champ assigné', severity: 'warning' })
    if (s.flows.optin.enabled)
      result.push({ field: 'flows.optin', message: 'Flux Opt-in activé — mapping install_status requis', severity: 'info' })
    if (s.flows.anonymize.enabled)
      result.push({ field: 'flows.anonymize', message: 'Flux Anonymisation activé — vérifier RGPD', severity: 'info' })

    // Notifications
    const badNotifs = s.notifications.filter((n) => n.body.length > 150)
    if (badNotifs.length > 0)
      result.push({
        field: 'notifications',
        message: `${badNotifs.length} notification(s) dépassent 150 caractères`,
        severity: 'error',
      })

    return result
  })

  const errors = computed(() => notes.value.filter((n) => n.severity === 'error'))
  const warnings = computed(() => notes.value.filter((n) => n.severity === 'warning'))
  const infos = computed(() => notes.value.filter((n) => n.severity === 'info'))

  // 0–100 completeness score
  const score = computed(() => {
    const checks = [
      !!s.meta.accountId,
      !!s.meta.brand,
      !!s.meta.projectName,
      !!s.entry.pivotVar,
      !!s.entry.pivotExample,
      !!s.entry.baseUrlProd,
      s.mapping.length > 0,
      s.mapping.some((f) => f.walletField === 'user.identifier'),
      s.flows.create.fields.length > 0,
      s.flows.update.fields.length > 0 || !s.flows.update.enabled,
      s.notifications.length > 0,
      s.errors.length > 0,
    ]
    const passed = checks.filter(Boolean).length
    return Math.round((passed / checks.length) * 100)
  })

  return { notes, errors, warnings, infos, score }
}
