// Known Wallet Brevo API fields — single source of truth
// Add new fields here and they propagate to mapping dropdowns + validation

import type { FieldType } from '@/types/spec'

export interface WalletFieldDef {
  field: string           // dot-notation API field
  label: string           // human label
  type: FieldType
  required?: boolean
  description?: string
}

export const WALLET_FIELDS: WalletFieldDef[] = [
  // ── Identity ──────────────────────────────────────────────────────────────
  {
    field: 'user.identifier',
    label: 'Identifiant unique',
    type: 'string',
    required: true,
    description: 'Clé pivot — doit correspondre au parcelNumber ou identifiant client',
  },
  {
    field: 'user.status',
    label: 'Statut',
    type: 'string',
    description: 'Statut courant du colis / de la carte',
  },
  {
    field: 'user.firstName',
    label: 'Prénom',
    type: 'string',
  },
  {
    field: 'user.lastName',
    label: 'Nom',
    type: 'string',
  },
  {
    field: 'user.email',
    label: 'Email',
    type: 'string',
  },
  {
    field: 'user.phone',
    label: 'Téléphone',
    type: 'string',
  },
  {
    field: 'user.loyalty_tier',
    label: 'Niveau fidélité',
    type: 'string',
  },
  {
    field: 'user.points',
    label: 'Points',
    type: 'number',
  },
  // ── Pass display fields ────────────────────────────────────────────────────
  {
    field: 'pass.backgroundColor',
    label: 'Couleur de fond',
    type: 'string',
    description: 'Hex ou nom CSS',
  },
  {
    field: 'pass.foregroundColor',
    label: 'Couleur texte',
    type: 'string',
  },
  {
    field: 'pass.labelColor',
    label: 'Couleur labels',
    type: 'string',
  },
  {
    field: 'pass.logoText',
    label: 'Texte logo',
    type: 'string',
  },
  // ── Opt-in / lifecycle ────────────────────────────────────────────────────
  {
    field: 'install_status',
    label: 'Statut installation',
    type: 'boolean',
    description: 'true si la carte est installée dans le wallet natif',
  },
  {
    field: 'user.expiration_date',
    label: "Date d'expiration",
    type: 'date',
  },
  // ── Custom fields (prefix user.custom_) ───────────────────────────────────
  {
    field: 'user.custom_field_1',
    label: 'Champ personnalisé 1',
    type: 'string',
  },
  {
    field: 'user.custom_field_2',
    label: 'Champ personnalisé 2',
    type: 'string',
  },
  {
    field: 'user.custom_field_3',
    label: 'Champ personnalisé 3',
    type: 'string',
  },
]

export const WALLET_FIELD_NAMES = WALLET_FIELDS.map((f) => f.field)

export function getWalletField(field: string): WalletFieldDef | undefined {
  return WALLET_FIELDS.find((f) => f.field === field)
}
