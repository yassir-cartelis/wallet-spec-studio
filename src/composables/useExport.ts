import { useSpecStore } from '@/stores/spec'
import { usePayload } from '@/composables/usePayload'

export function useExport() {
  const store = useSpecStore()
  const { fullConfig, urlQlf, urlProd, createPayload, updatePayload } = usePayload()
  const s = store.state

  function exportJson() {
    const blob = new Blob([JSON.stringify(fullConfig.value, null, 2)], {
      type: 'application/json',
    })
    download(blob, `wallet-spec-${s.meta.accountId || 'export'}.json`)
  }

  function exportMarkdown() {
    const md = buildMarkdown()
    const blob = new Blob([md], { type: 'text/markdown' })
    download(blob, `wallet-spec-${s.meta.accountId || 'export'}.md`)
  }

  function printSpec() {
    window.print()
  }

  function buildMarkdown(): string {
    const { meta, entry, security, campaigns, mapping, notifications, errors } = s
    const lines: string[] = []

    lines.push(`# Wallet Spec — ${meta.projectName || meta.brand}`)
    lines.push(``)
    lines.push(`## 1. Scope`)
    lines.push(`- **Marque** : ${meta.brand}`)
    lines.push(`- **Account ID** : ${meta.accountId}`)
    lines.push(`- **Project ID** : ${meta.projectId}`)
    lines.push(`- **Timezone** : ${meta.timezone}`)
    lines.push(``)

    lines.push(`## 2. Campagnes`)
    for (const c of campaigns) {
      lines.push(`- \`${c.name}\` — ${c.label}${c.description ? ` : ${c.description}` : ''}`)
    }
    lines.push(``)

    lines.push(`## 3. Parcours & URLs`)
    lines.push(`- **Variable pivot** : \`${entry.pivotVar}\``)
    lines.push(`- **Exemple** : \`${entry.pivotExample}\``)
    lines.push(`- **Canaux** : ${entry.channels.join(', ')}`)
    lines.push(`- **URL QLF** : \`${urlQlf.value}\``)
    lines.push(`- **URL PROD** : \`${urlProd.value}\``)
    lines.push(``)

    lines.push(`## 4. Sécurité`)
    lines.push(`- **Mode** : ${security.mode}`)
    lines.push(`- **Calcul** : ${security.computedBy}`)
    lines.push(``)

    lines.push(`## 5. Contrat de données`)
    lines.push(``)
    lines.push(`| Champ source | Champ Wallet | Type | Requis |`)
    lines.push(`|---|---|---|---|`)
    for (const f of mapping) {
      lines.push(`| \`${f.sourceField}\` | \`${f.walletField}\` | ${f.type} | ${f.required ? '✅' : ''} |`)
    }
    lines.push(``)

    lines.push(`## 6. Flux & Interfaces`)
    lines.push(``)
    lines.push(`### Création`)
    lines.push(`\`\`\`json`)
    lines.push(JSON.stringify(createPayload.value, null, 2))
    lines.push(`\`\`\``)
    lines.push(``)
    lines.push(`### Mise à jour`)
    lines.push(`\`\`\`json`)
    lines.push(JSON.stringify(updatePayload.value, null, 2))
    lines.push(`\`\`\``)
    lines.push(``)

    if (notifications.length > 0) {
      lines.push(`## 7. Notifications`)
      for (const n of notifications) {
        lines.push(`- **Trigger** : \`${n.trigger}\``)
        lines.push(`  - Titre : ${n.title}`)
        lines.push(`  - Corps : ${n.body}`)
      }
      lines.push(``)
    }

    lines.push(`## 8. Erreurs`)
    lines.push(``)
    lines.push(`| Code | Label | Stratégie | Notes |`)
    lines.push(`|---|---|---|---|`)
    for (const e of errors) {
      lines.push(`| ${e.code} | ${e.label} | ${e.strategy} | ${e.notes || ''} |`)
    }

    return lines.join('\n')
  }

  return { exportJson, exportMarkdown, printSpec }
}

function download(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}
