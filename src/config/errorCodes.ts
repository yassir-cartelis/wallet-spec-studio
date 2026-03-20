import type { ErrorRule } from '@/types/spec'

// Default error catalogue — pre-filled in new specs
export const DEFAULT_ERROR_RULES: Omit<ErrorRule, 'id'>[] = [
  {
    code: '400',
    label: 'Bad Request',
    strategy: 'alert',
    notes: 'Payload malformé ou champ requis manquant. Vérifier le mapping.',
  },
  {
    code: '401',
    label: 'Unauthorized',
    strategy: 'alert',
    notes: 'Token API invalide ou expiré.',
  },
  {
    code: '404',
    label: 'Card Not Found',
    strategy: 'fallback',
    notes: 'La carte n\'existe pas. Créer si nécessaire.',
  },
  {
    code: '409',
    label: 'Conflict',
    strategy: 'ignore',
    notes: 'Carte déjà créée. Ignorer ou mettre à jour.',
  },
  {
    code: '429',
    label: 'Rate Limited',
    strategy: 'retry',
    notes: 'Attendre et relancer avec backoff exponentiel.',
  },
  {
    code: '500',
    label: 'Server Error',
    strategy: 'retry',
    notes: 'Erreur côté Wallet. Relancer après 30s.',
  },
]
