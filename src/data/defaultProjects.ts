import type { SavedProject } from '@/types/spec'

// ─── Standard errors (reused across all default projects) ────────────────────
const stdErrors = (prefix: string) => [
  { id: `${prefix}-e1`, code: '400', label: 'Payload invalide', strategy: 'alert' as const, notes: 'Vérifier le format et les champs requis' },
  { id: `${prefix}-e2`, code: '401', label: 'Authentification échouée', strategy: 'alert' as const, notes: 'Renouveler le token API' },
  { id: `${prefix}-e3`, code: '404', label: 'Ressource introuvable', strategy: 'retry' as const, notes: 'Délai 24h avant retry' },
  { id: `${prefix}-e4`, code: '409', label: 'Conflit / doublon', strategy: 'ignore' as const, notes: 'La carte existe déjà — passer en mode update' },
  { id: `${prefix}-e5`, code: '429', label: 'Rate limit dépassé', strategy: 'retry' as const, notes: 'Backoff exponentiel : 1s, 2s, 4s…' },
  { id: `${prefix}-e6`, code: '500', label: 'Erreur serveur Wallet', strategy: 'retry' as const, notes: '' },
]

export const DEFAULT_PROJECTS: SavedProject[] = [

  // ── 1. Suivi de colis ──────────────────────────────────────────────────────
  {
    id: 'default-colis',
    name: 'Suivi de colis',
    description: 'Carte Wallet mise à jour en temps réel à chaque événement transporteur. Couvre la création, le transit, la livraison et la disponibilité en bureau de poste.',
    category: 'Logistique',
    isDefault: true,
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z',
    spec: {
      meta: {
        projectName: 'Suivi de colis',
        brand: 'Colissimo',
        accountId: 'colissimo',
        projectId: 'fr_FR',
        timezone: 'Europe/Paris',
        description: 'Carte Wallet mise à jour en temps réel à chaque événement transporteur. Couvre la création, le transit, la livraison et la disponibilité en bureau de poste.',
        useCaseCategory: 'Logistique',
      },
      entry: {
        pivotVar: 'parcelNumber',
        pivotExample: '8X00123456789',
        channels: ['email', 'sms'],
        baseUrlQlf: 'https://qlf-colissimo.captainwallet.com',
        baseUrlProd: 'https://colissimo.captainwallet.com',
      },
      security: { mode: 'sha256', computedBy: 'client' },
      campaigns: [
        { id: 'coli-c1', name: 'livraison', label: 'Suivi livraison', description: 'Carte active pendant la livraison' },
        { id: 'coli-c2', name: 'void', label: 'Void', description: 'Colis livré — carte expirée' },
      ],
      mapping: [
        { id: 'coli-f1', sourceField: 'parcelNumber', walletField: 'user.identifier', type: 'string', required: true, example: '8X00123456789', notes: 'Clé pivot — numéro de colis unique' },
        { id: 'coli-f2', sourceField: 'parcelStatus', walletField: 'user.status', type: 'string', required: false, example: 'EN_TRANSIT', notes: 'Valeurs : EN_PREPARATION, EN_TRANSIT, DISPONIBLE_AU_BUREAU, LIVRE, RETOUR_EXPEDITEUR' },
        { id: 'coli-f3', sourceField: 'recipientFirstName', walletField: 'user.firstName', type: 'string', required: false, example: 'Marie' },
        { id: 'coli-f4', sourceField: 'recipientLastName', walletField: 'user.lastName', type: 'string', required: false, example: 'Dupont' },
        { id: 'coli-f5', sourceField: 'estimatedDelivery', walletField: 'user.delivery_date', type: 'date', required: false, example: '2025-06-15', notes: 'Format ISO 8601' },
        { id: 'coli-f6', sourceField: 'pickupPointName', walletField: 'user.pickup_point', type: 'string', required: false, example: 'Bureau de poste Paris 11e' },
        { id: 'coli-f7', sourceField: 'carrierName', walletField: 'user.carrier', type: 'string', required: false, example: 'Colissimo' },
      ],
      flows: {
        create: { enabled: true, description: 'Création au 1er scan du colis chez le transporteur', fields: ['coli-f1', 'coli-f2', 'coli-f3', 'coli-f4', 'coli-f7'] },
        update: { enabled: true, description: 'Mise à jour du statut à chaque événement transporteur', fields: ['coli-f1', 'coli-f2', 'coli-f5', 'coli-f6'] },
        optin: { enabled: true, description: 'Opt-in wallet natif confirmé côté Apple / Google', fields: [] },
        anonymize: { enabled: true, description: 'Anonymisation RGPD 30 jours après livraison', fields: [] },
      },
      notifications: [
        { id: 'coli-n1', trigger: 'user.status == "EN_TRANSIT"', title: 'Votre colis est en route !', body: 'Votre colis est pris en charge et en cours de livraison.', campaignId: 'coli-c1' },
        { id: 'coli-n2', trigger: 'user.status == "DISPONIBLE_AU_BUREAU"', title: 'Votre colis vous attend 📮', body: 'Votre colis est disponible au bureau de poste. Venez le retirer avec une pièce d\'identité.', campaignId: 'coli-c1' },
        { id: 'coli-n3', trigger: 'user.status == "LIVRÉ"', title: 'Colis livré ✓', body: 'Votre colis a été livré avec succès. Merci de votre confiance.', campaignId: 'coli-c1' },
      ],
      errors: stdErrors('coli'),
    },
  },

  // ── 2. Programme de fidélité ───────────────────────────────────────────────
  {
    id: 'default-fidelite',
    name: 'Programme de fidélité',
    description: 'Carte de fidélité digitale avec solde de points, niveau de statut et avantages personnalisés. Mise à jour à chaque achat et activation de récompense.',
    category: 'Retail',
    isDefault: true,
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z',
    spec: {
      meta: {
        projectName: 'Programme de fidélité',
        brand: 'MonBrand',
        accountId: 'monbrand-loyalty',
        projectId: 'fr_FR',
        timezone: 'Europe/Paris',
        description: 'Carte de fidélité digitale avec solde de points, niveau de statut et avantages personnalisés.',
        useCaseCategory: 'Retail',
      },
      entry: {
        pivotVar: 'customerId',
        pivotExample: 'CUS-00012345',
        channels: ['email', 'push', 'inapp'],
        baseUrlQlf: 'https://qlf-monbrand-loyalty.captainwallet.com',
        baseUrlProd: 'https://monbrand-loyalty.captainwallet.com',
      },
      security: { mode: 'sha256', computedBy: 'client' },
      campaigns: [
        { id: 'fidl-c1', name: 'gold', label: 'Carte Gold', description: 'Carte fidélité niveau Gold' },
        { id: 'fidl-c2', name: 'silver', label: 'Carte Silver', description: 'Carte fidélité niveau Silver' },
        { id: 'fidl-c3', name: 'void', label: 'Void', description: 'Carte expirée / compte clôturé' },
      ],
      mapping: [
        { id: 'fidl-f1', sourceField: 'customerId', walletField: 'user.identifier', type: 'string', required: true, example: 'CUS-00012345', notes: 'Clé pivot — ID client CRM' },
        { id: 'fidl-f2', sourceField: 'pointsBalance', walletField: 'user.points_balance', type: 'number', required: false, example: '1250', notes: 'Solde de points actuel' },
        { id: 'fidl-f3', sourceField: 'loyaltyTier', walletField: 'user.loyalty_tier', type: 'string', required: false, example: 'Gold', notes: 'Valeurs : Bronze, Silver, Gold, Platinum' },
        { id: 'fidl-f4', sourceField: 'memberFirstName', walletField: 'user.firstName', type: 'string', required: false, example: 'Sophie' },
        { id: 'fidl-f5', sourceField: 'memberLastName', walletField: 'user.lastName', type: 'string', required: false, example: 'Martin' },
        { id: 'fidl-f6', sourceField: 'memberSince', walletField: 'user.member_since', type: 'date', required: false, example: '2022-03-15' },
        { id: 'fidl-f7', sourceField: 'nextRewardThreshold', walletField: 'user.next_reward', type: 'number', required: false, example: '500', notes: 'Points manquants pour la prochaine récompense' },
      ],
      flows: {
        create: { enabled: true, description: 'Création de la carte à l\'adhésion au programme', fields: ['fidl-f1', 'fidl-f2', 'fidl-f3', 'fidl-f4', 'fidl-f5', 'fidl-f6'] },
        update: { enabled: true, description: 'Mise à jour du solde et du niveau après chaque achat', fields: ['fidl-f1', 'fidl-f2', 'fidl-f3', 'fidl-f7'] },
        optin: { enabled: true, description: 'Confirmation d\'installation dans le wallet natif', fields: [] },
        anonymize: { enabled: false, description: 'Anonymisation sur demande de suppression de compte', fields: [] },
      },
      notifications: [
        { id: 'fidl-n1', trigger: 'user.points_balance >= user.next_reward', title: 'Vous avez gagné une récompense ! 🎁', body: 'Votre solde de points vous permet de débloquer une récompense. Profitez-en maintenant.', campaignId: 'fidl-c1' },
        { id: 'fidl-n2', trigger: 'user.loyalty_tier == "Gold"', title: 'Bienvenue au statut Gold ⭐', body: 'Félicitations ! Vous atteignez le statut Gold et bénéficiez de nouveaux avantages exclusifs.', campaignId: 'fidl-c1' },
      ],
      errors: stdErrors('fidl'),
    },
  },

  // ── 3. Billet d'événement ─────────────────────────────────────────────────
  {
    id: 'default-event',
    name: "Billet d'événement",
    description: "Billet digitale pour concerts, spectacles et événements. Mise à jour du statut (valide, scanné, annulé) et notification de rappel avant l'événement.",
    category: 'Événementiel',
    isDefault: true,
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z',
    spec: {
      meta: {
        projectName: "Billet d'événement",
        brand: 'EventCo',
        accountId: 'eventco',
        projectId: 'fr_FR',
        timezone: 'Europe/Paris',
        description: "Billet digital pour concerts et spectacles. Statut mis à jour en temps réel (valide, scanné, annulé).",
        useCaseCategory: 'Événementiel',
      },
      entry: {
        pivotVar: 'ticketId',
        pivotExample: 'TKT-2025-00789',
        channels: ['email'],
        baseUrlQlf: 'https://qlf-eventco.captainwallet.com',
        baseUrlProd: 'https://eventco.captainwallet.com',
      },
      security: { mode: 'aes256cbc', computedBy: 'server' },
      campaigns: [
        { id: 'evnt-c1', name: 'ticket', label: 'Billet actif', description: 'Billet valide avant et pendant l\'événement' },
        { id: 'evnt-c2', name: 'scanned', label: 'Billet scanné', description: 'Billet utilisé / entrée effectuée' },
        { id: 'evnt-c3', name: 'void', label: 'Void', description: 'Billet annulé ou événement terminé' },
      ],
      mapping: [
        { id: 'evnt-f1', sourceField: 'ticketId', walletField: 'user.identifier', type: 'string', required: true, example: 'TKT-2025-00789', notes: 'Clé pivot — ID billet unique' },
        { id: 'evnt-f2', sourceField: 'ticketStatus', walletField: 'user.status', type: 'string', required: false, example: 'VALID', notes: 'Valeurs : VALID, SCANNED, CANCELLED, REFUNDED' },
        { id: 'evnt-f3', sourceField: 'eventName', walletField: 'user.event_name', type: 'string', required: false, example: 'Coldplay World Tour 2025' },
        { id: 'evnt-f4', sourceField: 'eventDate', walletField: 'user.event_date', type: 'date', required: false, example: '2025-07-12T20:00:00' },
        { id: 'evnt-f5', sourceField: 'venueName', walletField: 'user.venue', type: 'string', required: false, example: 'Stade de France - Saint-Denis' },
        { id: 'evnt-f6', sourceField: 'seatInfo', walletField: 'user.seat', type: 'string', required: false, example: 'Tribune Nord - Rang 12 - Siège 34' },
        { id: 'evnt-f7', sourceField: 'holderName', walletField: 'user.firstName', type: 'string', required: false, example: 'Jean-Pierre' },
      ],
      flows: {
        create: { enabled: true, description: 'Création du billet à la confirmation de commande', fields: ['evnt-f1', 'evnt-f2', 'evnt-f3', 'evnt-f4', 'evnt-f5', 'evnt-f6', 'evnt-f7'] },
        update: { enabled: true, description: 'Mise à jour du statut (scan à l\'entrée, annulation)', fields: ['evnt-f1', 'evnt-f2'] },
        optin: { enabled: false, description: '', fields: [] },
        anonymize: { enabled: false, description: '', fields: [] },
      },
      notifications: [
        { id: 'evnt-n1', trigger: 'user.event_date < today + 7d', title: "J-7 avant l'événement ! 🎵", body: 'Votre billet pour Coldplay est prêt. Pensez à l\'ajouter à votre wallet pour un accès rapide.', campaignId: 'evnt-c1' },
        { id: 'evnt-n2', trigger: 'user.event_date < today + 1d', title: "C'est demain ! 🎤", body: "Dernier rappel : votre événement est demain. Votre billet est dans votre wallet.", campaignId: 'evnt-c1' },
        { id: 'evnt-n3', trigger: 'user.status == "SCANNED"', title: 'Entrée validée ✓', body: 'Votre billet a été scanné. Bonne soirée !', campaignId: 'evnt-c2' },
      ],
      errors: stdErrors('evnt'),
    },
  },

  // ── 4. Carte cadeau ───────────────────────────────────────────────────────
  {
    id: 'default-gift',
    name: 'Carte cadeau',
    description: 'Carte cadeau digitale avec solde en temps réel. Mise à jour après chaque utilisation partielle. Notification à l\'approche de l\'expiration.',
    category: 'Commerce',
    isDefault: true,
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z',
    spec: {
      meta: {
        projectName: 'Carte cadeau',
        brand: 'MaMarque',
        accountId: 'mamarque-gift',
        projectId: 'fr_FR',
        timezone: 'Europe/Paris',
        description: 'Carte cadeau digitale avec solde mis à jour en temps réel après chaque utilisation.',
        useCaseCategory: 'Commerce',
      },
      entry: {
        pivotVar: 'giftCardId',
        pivotExample: 'GC-XMAS-00456',
        channels: ['email'],
        baseUrlQlf: 'https://qlf-mamarque-gift.captainwallet.com',
        baseUrlProd: 'https://mamarque-gift.captainwallet.com',
      },
      security: { mode: 'sha256', computedBy: 'client' },
      campaigns: [
        { id: 'gift-c1', name: 'active', label: 'Carte active', description: 'Carte avec solde disponible' },
        { id: 'gift-c2', name: 'void', label: 'Void', description: 'Carte épuisée ou expirée' },
      ],
      mapping: [
        { id: 'gift-f1', sourceField: 'giftCardId', walletField: 'user.identifier', type: 'string', required: true, example: 'GC-XMAS-00456', notes: 'Clé pivot — identifiant unique de la carte cadeau' },
        { id: 'gift-f2', sourceField: 'currentBalance', walletField: 'user.balance', type: 'number', required: false, example: '50.00', notes: 'Solde restant en EUR' },
        { id: 'gift-f3', sourceField: 'initialAmount', walletField: 'user.initial_amount', type: 'number', required: false, example: '100.00' },
        { id: 'gift-f4', sourceField: 'expiryDate', walletField: 'user.expiry_date', type: 'date', required: false, example: '2026-12-31' },
        { id: 'gift-f5', sourceField: 'recipientEmail', walletField: 'user.email', type: 'string', required: false, example: 'marie@example.com' },
        { id: 'gift-f6', sourceField: 'senderName', walletField: 'user.sender_name', type: 'string', required: false, example: 'Pierre Dupont', notes: 'Offert par' },
      ],
      flows: {
        create: { enabled: true, description: 'Création de la carte cadeau à l\'achat', fields: ['gift-f1', 'gift-f2', 'gift-f3', 'gift-f4', 'gift-f5', 'gift-f6'] },
        update: { enabled: true, description: 'Mise à jour du solde après chaque utilisation', fields: ['gift-f1', 'gift-f2'] },
        optin: { enabled: false, description: '', fields: [] },
        anonymize: { enabled: false, description: '', fields: [] },
      },
      notifications: [
        { id: 'gift-n1', trigger: 'user.expiry_date < today + 30d', title: 'Votre carte cadeau expire bientôt ⏳', body: 'Il vous reste moins de 30 jours pour utiliser votre carte cadeau. Solde disponible : voir la carte.', campaignId: 'gift-c1' },
        { id: 'gift-n2', trigger: 'user.balance == 0', title: 'Carte cadeau épuisée', body: 'Votre carte cadeau a été entièrement utilisée. Merci de votre confiance !', campaignId: 'gift-c1' },
      ],
      errors: stdErrors('gift'),
    },
  },

  // ── 5. Pass transport ─────────────────────────────────────────────────────
  {
    id: 'default-transport',
    name: 'Pass transport',
    description: 'Carte d\'embarquement digitale pour transport (train, bus, avion). Mise à jour du statut (check-in, embarquement, annulation, retard).',
    category: 'Mobilité',
    isDefault: true,
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z',
    spec: {
      meta: {
        projectName: 'Pass transport',
        brand: 'TransportCo',
        accountId: 'transportco',
        projectId: 'fr_FR',
        timezone: 'Europe/Paris',
        description: 'Carte d\'embarquement digitale avec mise à jour des informations de voyage en temps réel.',
        useCaseCategory: 'Mobilité',
      },
      entry: {
        pivotVar: 'bookingRef',
        pivotExample: 'TGV-2025-AB123',
        channels: ['email', 'sms'],
        baseUrlQlf: 'https://qlf-transportco.captainwallet.com',
        baseUrlProd: 'https://transportco.captainwallet.com',
      },
      security: { mode: 'sha256', computedBy: 'server' },
      campaigns: [
        { id: 'trnp-c1', name: 'boarding', label: 'Pass embarquement', description: 'Pass actif avant le voyage' },
        { id: 'trnp-c2', name: 'onboard', label: 'En voyage', description: 'Voyage en cours' },
        { id: 'trnp-c3', name: 'void', label: 'Void', description: 'Voyage terminé ou annulé' },
      ],
      mapping: [
        { id: 'trnp-f1', sourceField: 'bookingRef', walletField: 'user.identifier', type: 'string', required: true, example: 'TGV-2025-AB123', notes: 'Clé pivot — référence de réservation' },
        { id: 'trnp-f2', sourceField: 'travelStatus', walletField: 'user.status', type: 'string', required: false, example: 'CONFIRMED', notes: 'Valeurs : CONFIRMED, CHECKED_IN, BOARDING, ON_BOARD, ARRIVED, CANCELLED, DELAYED' },
        { id: 'trnp-f3', sourceField: 'passengerName', walletField: 'user.firstName', type: 'string', required: false, example: 'Alexandre' },
        { id: 'trnp-f4', sourceField: 'departureCity', walletField: 'user.departure', type: 'string', required: false, example: 'Paris Gare de Lyon' },
        { id: 'trnp-f5', sourceField: 'arrivalCity', walletField: 'user.destination', type: 'string', required: false, example: 'Lyon Part-Dieu' },
        { id: 'trnp-f6', sourceField: 'departureTime', walletField: 'user.departure_time', type: 'date', required: false, example: '2025-08-20T09:34:00' },
        { id: 'trnp-f7', sourceField: 'seatNumber', walletField: 'user.seat', type: 'string', required: false, example: '15A - Voiture 4' },
        { id: 'trnp-f8', sourceField: 'platform', walletField: 'user.platform', type: 'string', required: false, example: 'Voie 12', notes: 'Quai — mis à jour 30min avant départ' },
      ],
      flows: {
        create: { enabled: true, description: 'Création du pass à la confirmation de réservation', fields: ['trnp-f1', 'trnp-f2', 'trnp-f3', 'trnp-f4', 'trnp-f5', 'trnp-f6', 'trnp-f7'] },
        update: { enabled: true, description: 'Mise à jour statut, voie, et horaires en temps réel', fields: ['trnp-f1', 'trnp-f2', 'trnp-f6', 'trnp-f8'] },
        optin: { enabled: false, description: '', fields: [] },
        anonymize: { enabled: false, description: '', fields: [] },
      },
      notifications: [
        { id: 'trnp-n1', trigger: 'user.departure_time < today + 2h', title: 'Votre train part dans 2h 🚄', body: 'Votre départ de Paris Gare de Lyon approche. Voie communiquée 30 min avant.', campaignId: 'trnp-c1' },
        { id: 'trnp-n2', trigger: 'user.status == "DELAYED"', title: 'Retard signalé ⚠️', body: 'Votre train est retardé. Consultez votre pass pour les informations mises à jour.', campaignId: 'trnp-c1' },
        { id: 'trnp-n3', trigger: 'user.status == "BOARDING"', title: 'Embarquement en cours 🟢', body: 'L\'embarquement a commencé. Présentez ce pass au contrôleur.', campaignId: 'trnp-c2' },
      ],
      errors: stdErrors('trnp'),
    },
  },
]
