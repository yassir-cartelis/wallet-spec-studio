import { defineStore } from 'pinia'
import { computed } from 'vue'
import { useStorage } from '@vueuse/core'
import type { Ticket, TicketComment, TicketType, TicketStatus } from '@/types/ticket'

function makeId() {
  return Math.random().toString(36).slice(2, 9)
}

export const useTicketsStore = defineStore('tickets', () => {
  const tickets = useStorage<Ticket[]>('wallet-spec-tickets', [])
  const authorName = useStorage<string>('wallet-spec-author', '')

  // ── Computed ──────────────────────────────────────────────────────────────

  const openCount = computed(() => tickets.value.filter((t) => t.status === 'Ouvert').length)

  const sorted = computed(() =>
    [...tickets.value].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
  )

  // ── Mutations ─────────────────────────────────────────────────────────────

  function create(data: {
    type: TicketType
    title: string
    description: string
    step?: string
    author: string
  }): Ticket {
    const now = new Date().toISOString()
    const ticket: Ticket = {
      id: makeId(),
      type: data.type,
      title: data.title,
      description: data.description,
      step: data.step,
      status: 'Ouvert',
      author: data.author,
      votes: 0,
      comments: [],
      createdAt: now,
      updatedAt: now,
    }
    tickets.value.unshift(ticket)
    return ticket
  }

  function addComment(ticketId: string, body: string, author: string) {
    const ticket = tickets.value.find((t) => t.id === ticketId)
    if (!ticket) return
    const comment: TicketComment = {
      id: makeId(),
      author,
      body,
      createdAt: new Date().toISOString(),
    }
    ticket.comments.push(comment)
    ticket.updatedAt = new Date().toISOString()
  }

  function upvote(ticketId: string) {
    const ticket = tickets.value.find((t) => t.id === ticketId)
    if (ticket) {
      ticket.votes++
      ticket.updatedAt = new Date().toISOString()
    }
  }

  function setStatus(ticketId: string, status: TicketStatus) {
    const ticket = tickets.value.find((t) => t.id === ticketId)
    if (ticket) {
      ticket.status = status
      ticket.updatedAt = new Date().toISOString()
    }
  }

  function remove(ticketId: string) {
    tickets.value = tickets.value.filter((t) => t.id !== ticketId)
  }

  return {
    tickets,
    authorName,
    openCount,
    sorted,
    create,
    addComment,
    upvote,
    setStatus,
    remove,
  }
})
