# Wallet Spec Studio — Roadmap & Plan produit

_Dernière mise à jour : 24 avril 2026_

---

## Ce que fait le produit aujourd'hui

### Vision
Wallet Spec Studio est l'outil interne Cartelis pour construire, stocker et faire évoluer les spécifications d'intégration Wallet Brevo (Captain Wallet). Il remplace les specs Word/Notion manuelles par un formulaire structuré, versionné et exportable, utilisé pendant et après les ateliers client.

### Utilisateurs
Consultants et développeurs Cartelis sur des missions d'intégration Wallet Brevo.

### Fonctionnalités en production

**Authentification**
- Login Firebase (email/password), logout, protection des routes

**Gestion des missions (CRUD)**
- Dashboard missions : liste, statuts (Brouillon / En cours / Livré / En prod)
- Création, édition, suppression avec confirmation
- Accès direct à la spec d'une mission

**Spec studio — 8 étapes guidées**

| Étape | Ce qu'elle fait |
|---|---|
| Scope | Identité projet (accountId, projectId, timezone), campagnes, catégorie use-case, description pour la bibliothèque |
| Identity | Variable pivot, URLs QLF/PROD, canaux d'activation, prévisualisation URL par campagne |
| Security | Mode de sécurité (none / SHA256 / AES-256-CBC), calcul côté client ou serveur, exemple de code généré, KEY/IV pour AES |
| Mapping | Mapping source → Wallet Brevo avec type, requis, niveau root/metadata auto, notes inline, prévisualisation payload `[{identifier, metadatas: {...}}]` |
| Flux | Activation des 4 flux API (création, mise à jour, opt-in, anonymisation RGPD), sélection des champs par flux, payload par flux |
| Notifications | Templates de push (trigger, titre, corps max 150 chars, campagne cible) |
| Erreurs | Codes HTTP avec stratégie (retry / alert / ignore / fallback) et notes |
| Export | Score de complétude (0-100%), bannière de validation, export JSON / Markdown / Print |

**Versioning**
- Sauvegarde manuelle avec label + notes (modal)
- Historique des versions dans un panneau latéral
- Restauration d'une version antérieure
- Stockage Firestore : `missions/{id}/versions/{versionId}`

**Journal de mission**
- Log chronologique libre par mission (auteur + horodatage)
- Panneau slide-over dédié
- Stockage Firestore : `missions/{id}/journal/{entryId}`

**Import IA**
- Upload PDF / DOCX / texte
- Analyse GPT-4o via proxy backend
- Pré-remplissage automatique de toute la spec à partir des documents
- Prompt configurable avec contexte consultant

**Export**
- JSON complet (config machine-readable)
- Markdown structuré (document spec lisible)
- Impression / PDF navigateur

**Persistance**
- Auto-save localStorage en temps réel (spec active)
- Firestore pour missions, versions, journal

---

## Problèmes connus à corriger avant toute v1.x

Ces points sont des bugs ou incohérences introduits par le refactoring récent. À traiter en priorité absolue.

| # | Problème | Fichier | Impact |
|---|---|---|---|
| B1 | System prompt AI import utilise encore `user.identifier`, `user.status` (ancien format) | `useAiImport.ts` | L'IA génère du mapping avec les mauvais champs wallet |
| B2 | Export Markdown ne génère qu'une seule URL (première campagne) | `useExport.ts:49-50` | Spec incomplète pour projets multi-campagnes |
| B3 | StepExport affiche `createPayload` du store (format plat) au lieu du payload imbriqué `usePayload` | `StepExport.vue:112` | Payload dans l'export ne reflète pas la vraie structure CW |
| B4 | Champ `example` du mapping visible dans le type mais absent de l'UI StepMapping | `StepMapping.vue` | On ne peut pas renseigner un exemple de valeur par champ |

---

## Roadmap

### v1.1 — Fiabilité & Cohérence _(priorité haute, ~2-3 sessions)_

Objectif : le produit est fiable de bout en bout. Tout ce qu'on génère est correct.

**B1 — Corriger le system prompt AI import**
- Remplacer `user.identifier` → `identifier` (root)
- Remplacer `user.status` → `loyaltyStatus` (root)
- Tous les autres champs métier → clé directe dans `metadatas` (ex: `deliveryDate`, `parcelStatus`)
- Aligner les exemples payload dans le prompt avec la vraie structure `[{identifier, loyaltyStatus, metadatas: {...}}]`

**B2 — Export Markdown multi-campagnes**
- Générer une section "URLs par campagne" avec QLF + PROD pour chaque campagne
- Inclure le mode de sécurité et son impact sur le paramètre `data=`

**B3 — StepExport : payload correct**
- Utiliser `createPayload` de `usePayload()` (qui retourne `[{identifier, metadatas: {...}}]`)
- Idem pour `updatePayload` dans le récapitulatif

**B4 — Champ example dans StepMapping**
- Ajouter une colonne ou un champ inline `example` dans les lignes de mapping
- Afficher la valeur example dans la prévisualisation payload (déjà supporté par `buildPayloadForFields`)

**Autres polish v1.1**
- Indicateur de sauvegarde (saved / unsaved) plus visible dans le header de l'éditeur
- Message de confirmation après restauration d'une version ("Version v3 restaurée")
- Score de complétude : prendre en compte le remplissage de `pivotExample` et d'au moins 1 champ mapping

---

### v1.2 — Bibliothèque de use-cases _(priorité moyenne, ~3-4 sessions)_

Objectif : capitaliser sur les specs produites pour les réutiliser sur de nouvelles missions.

Le type `SavedProject` et la catégorisation use-case existent déjà dans le modèle de données. Il manque l'UI.

**Fonctionnalités**
- Page "Bibliothèque" dans le dashboard : liste des specs sauvegardées par catégorie (Logistique, Retail, Événementiel, etc.)
- "Démarrer depuis un template" : clone la spec d'un use-case existant dans une nouvelle mission
- Specs Cartelis par défaut (`isDefault: true`) pré-chargées : Suivi colis, Carte fidélité, Billet événement
- Recherche / filtre par catégorie et mots-clés
- Bouton "Publier dans la bibliothèque" depuis une mission (remplit `meta.description` + catégorie)

**Modèle Firestore**
- Collection `library/{projectId}` déjà prévue dans le type `SavedProject`
- Accès en lecture pour tous les utilisateurs auth, écriture réservée aux admins pour les defaults

---

### v1.3 — Collaboration & Revue _(priorité moyenne, ~3-4 sessions)_

Objectif : plusieurs consultants peuvent travailler ensemble ou valider une spec.

**Fonctionnalités**
- Assignation de plusieurs consultants à une mission (actuellement un seul)
- Commentaires sur une section de spec (champ mapping, flow, etc.) — style Notion/Linear
- Workflow de validation : le lead valide la spec avant export (statut `spec_validated`)
- Notifications email quand une version est sauvegardée ou une mission est assignée

**Technique**
- Sous-collection `missions/{id}/comments/{commentId}`
- Règles Firestore : accès en écriture limité aux consultants assignés
- Intégration possible avec Slack #cartelis_claude pour les notifications

---

### v1.4 — Améliorations IA _(priorité basse, ~2-3 sessions)_

Objectif : l'IA devient un vrai copilote tout au long de la spec, pas seulement à l'import.

**Fonctionnalités**
- Suggestion de notifications automatiques depuis le mapping (si champ `parcelStatus` détecté → propose 3 notifications)
- Détection d'incohérences dans le mapping ("ce champ est marqué root mais n'est pas `identifier` ni `loyaltyStatus`")
- Complétion de champ : depuis le `sourceField`, proposer automatiquement le `walletField` correspondant
- Mode "revue de spec" : l'IA analyse la spec complète et produit un rapport de recommandations

**Technique**
- Passer à l'API Claude (Anthropic) en direct plutôt que via proxy OpenAI — meilleure qualité de raisonnement
- Streaming des réponses pour feedback temps réel pendant l'analyse

---

### v2.0 — Portail client _(priorité basse, vision long terme)_

Objectif : le client peut consulter sa spec et valider sans avoir accès à l'outil complet.

**Fonctionnalités**
- Lien de partage read-only d'une spec (token unique)
- Vue client simplifiée : mapping lisible, URLs, payloads — sans les contrôles d'édition
- Workflow d'approbation : le client clique "J'approuve cette spec" → statut passe à `approved`
- Historique des changements depuis la dernière approbation

**Technique**
- Routes publiques protégées par token Firestore (pas d'auth Firebase requise)
- Règles Firestore : accès en lecture par token, sans écriture

---

## Synthèse priorisation

| Version | Effort | Valeur | Priorité |
|---|---|---|---|
| Bugs B1-B4 | Faible | Très haute (corrige la fiabilité) | **Immédiat** |
| v1.1 polish | Faible | Haute | **Court terme** |
| v1.2 Bibliothèque | Moyen | Haute (capitalisation) | Moyen terme |
| v1.3 Collaboration | Moyen | Moyenne (dépend volume équipe) | Moyen terme |
| v1.4 IA copilote | Moyen | Moyenne (nice to have) | Basse |
| v2.0 Portail client | Élevé | Haute (différenciant) | Long terme |
