import type { StepDef } from '@/types/spec'

export const STEPS: StepDef[] = [
  {
    id: 'scope',
    label: 'Scope',
    description: 'Marque, projet, campagnes',
    icon: '🏷️',
  },
  {
    id: 'identity',
    label: 'Identité & Points d\'entrée',
    description: 'Variable pivot, URLs, canaux',
    icon: '🔑',
  },
  {
    id: 'security',
    label: 'Sécurité',
    description: 'Mode de signature des liens',
    icon: '🔒',
  },
  {
    id: 'mapping',
    label: 'Contrat de données',
    description: 'Mapping des champs client → Wallet',
    icon: '🗺️',
  },
  {
    id: 'flows',
    label: 'Flux & Interfaces',
    description: 'Création, mise à jour, opt-in, anonymisation',
    icon: '🔄',
  },
  {
    id: 'notifications',
    label: 'Notifications',
    description: 'Triggers et messages push',
    icon: '🔔',
  },
  {
    id: 'errors',
    label: 'Erreurs & Observabilité',
    description: 'Codes d\'erreur et stratégies',
    icon: '⚠️',
  },
  {
    id: 'export',
    label: 'Export',
    description: 'Spec finale + payload',
    icon: '📄',
  },
]
