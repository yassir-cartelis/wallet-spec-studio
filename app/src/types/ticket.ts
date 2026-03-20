export type TicketType = 'Bug' | 'Idée' | 'Amélioration' | 'Question'
export type TicketStatus = 'Ouvert' | 'En cours' | 'Fait' | 'Rejeté'

export interface TicketComment {
  id: string
  author: string
  body: string
  createdAt: string
}

export interface Ticket {
  id: string
  type: TicketType
  title: string
  description: string
  step?: string        // which step of the spec tool the user was on
  status: TicketStatus
  author: string
  votes: number        // simple +1 count
  comments: TicketComment[]
  createdAt: string
  updatedAt: string
}
