import type { FieldType, PayloadLevel } from '@/types/spec'

export interface WalletFieldDef {
  field: string
  label: string
  type: FieldType
  payloadLevel: PayloadLevel
  required?: boolean
  description?: string
}

export const WALLET_FIELDS: WalletFieldDef[] = [
  // ── Champs racine (root) — toujours au premier niveau du payload ──────────
  {
    field: 'identifier',
    label: 'Identifiant unique',
    type: 'string',
    payloadLevel: 'root',
    required: true,
    description: 'Clé pivot — identifiant unique du porteur de carte (parcelNumber, orderId, customerId…)',
  },
  {
    field: 'loyaltyStatus',
    label: 'Statut affiché',
    type: 'string',
    payloadLevel: 'root',
    description: 'Statut visible sur la carte (ex: "En cours de livraison", "Disponible en point relais")',
  },

  // ── Metadatas — dans l'objet metadatas du payload ─────────────────────────
  // Logistique / livraison
  {
    field: 'deliveryDate',
    label: 'Date de livraison',
    type: 'date',
    payloadLevel: 'metadata',
    description: 'Date prévue ou confirmée (format JJ/MM/AAAA)',
  },
  {
    field: 'deliveryAddress',
    label: 'Adresse de livraison',
    type: 'string',
    payloadLevel: 'metadata',
  },
  {
    field: 'deliverySlot',
    label: 'Créneau de livraison',
    type: 'string',
    payloadLevel: 'metadata',
    description: 'Ex: 12:00-14:00',
  },
  {
    field: 'pickupPointAddress',
    label: 'Adresse point relais',
    type: 'string',
    payloadLevel: 'metadata',
  },
  {
    field: 'pickupDeadline',
    label: 'Date limite retrait',
    type: 'date',
    payloadLevel: 'metadata',
  },

  // Fidélité / retail
  {
    field: 'pointsBalance',
    label: 'Solde points',
    type: 'number',
    payloadLevel: 'metadata',
  },
  {
    field: 'memberTier',
    label: 'Niveau fidélité',
    type: 'string',
    payloadLevel: 'metadata',
    description: 'Ex: Gold, Silver, Bronze',
  },
  {
    field: 'expiryDate',
    label: "Date d'expiration",
    type: 'date',
    payloadLevel: 'metadata',
  },
  {
    field: 'offerLabel',
    label: 'Libellé offre / avantage',
    type: 'string',
    payloadLevel: 'metadata',
  },

  // Événementiel / billet
  {
    field: 'eventDate',
    label: "Date de l'événement",
    type: 'date',
    payloadLevel: 'metadata',
  },
  {
    field: 'eventVenue',
    label: "Lieu de l'événement",
    type: 'string',
    payloadLevel: 'metadata',
  },
  {
    field: 'seat',
    label: 'Siège / emplacement',
    type: 'string',
    payloadLevel: 'metadata',
  },

  // Générique
  {
    field: 'referenceCode',
    label: 'Code de référence',
    type: 'string',
    payloadLevel: 'metadata',
  },
  {
    field: 'qrCodeToken',
    label: 'Token QR Code',
    type: 'string',
    payloadLevel: 'metadata',
    description: 'Valeur encodée dans le QR Code affiché sur la carte',
  },
  {
    field: 'companyName',
    label: 'Nom expéditeur / société',
    type: 'string',
    payloadLevel: 'metadata',
  },
]

export const ROOT_FIELDS = new Set(
  WALLET_FIELDS.filter((f) => f.payloadLevel === 'root').map((f) => f.field),
)

export const WALLET_FIELD_NAMES = WALLET_FIELDS.map((f) => f.field)

export function getWalletField(field: string): WalletFieldDef | undefined {
  return WALLET_FIELDS.find((f) => f.field === field)
}
