// ─── Core enums ──────────────────────────────────────────────────────────────

export type SecurityMode = 'none' | 'sha256' | 'aes256cbc'
export type SecurityCompute = 'client' | 'server'
export type FieldType = 'string' | 'boolean' | 'number' | 'date'
export type FlowName = 'create' | 'update' | 'optin' | 'anonymize'
export type UpdateMode = 'api' | 'sftp'
export type StepId =
  | 'scope'
  | 'identity'
  | 'security'
  | 'mapping'
  | 'flows'
  | 'notifications'
  | 'errors'
  | 'export'

// ─── Field mapping ────────────────────────────────────────────────────────────

export interface FieldMapping {
  id: string
  sourceField: string       // client-side field name
  walletField: string       // wallet API field (e.g. user.status)
  type: FieldType
  required: boolean
  example?: string
  notes?: string
}

// ─── Flow contract ────────────────────────────────────────────────────────────

export interface FlowContract {
  enabled: boolean
  description?: string
  fields: string[]          // references to FieldMapping ids
}

// ─── Notification ─────────────────────────────────────────────────────────────

export interface Notification {
  id: string
  trigger: string           // e.g. "parcelStatus == 'LIVRÉ'"
  title: string
  body: string              // max 150 chars
  campaignId: string
}

// ─── Error rule ───────────────────────────────────────────────────────────────

export interface ErrorRule {
  id: string
  code: string              // e.g. "400", "401", "404"
  label: string
  strategy: 'retry' | 'alert' | 'ignore' | 'fallback'
  notes?: string
}

// ─── Campaign ─────────────────────────────────────────────────────────────────

export interface Campaign {
  id: string
  name: string              // e.g. "loyalty", "void"
  label: string             // human label
  description?: string
}

// ─── Review note (auto-generated from validation) ─────────────────────────────

export interface ReviewNote {
  field: string
  message: string
  severity: 'error' | 'warning' | 'info'
}

// ─── Full spec state ──────────────────────────────────────────────────────────

export interface SpecState {
  meta: {
    projectName: string
    brand: string
    accountId: string
    projectId: string
    timezone: string
    createdAt?: string
    updatedAt?: string
  }
  entry: {
    pivotVar: string        // field used as identifier (e.g. "parcelNumber")
    pivotExample: string    // example value
    channels: string[]      // email | sms | push | ...
    baseUrlQlf: string
    baseUrlProd: string
  }
  security: {
    mode: SecurityMode
    computedBy: SecurityCompute
    salt?: string
    aesKeyB64?: string
    aesIvB64?: string
  }
  campaigns: Campaign[]
  mapping: FieldMapping[]
  flows: Record<FlowName, FlowContract>
  notifications: Notification[]
  errors: ErrorRule[]
}

// ─── Step definition ──────────────────────────────────────────────────────────

export interface StepDef {
  id: StepId
  label: string
  description: string
  icon: string
}
