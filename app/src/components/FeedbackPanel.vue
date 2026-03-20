<script setup lang="ts">
import { ref, computed } from 'vue'
import { useTicketsStore } from '@/stores/tickets'
import type { TicketType, TicketStatus } from '@/types/ticket'

const props = defineProps<{ currentStep?: string }>()
const emit = defineEmits<{ close: [] }>()

const store = useTicketsStore()

// ── Author setup ───────────────────────────────────────────────────────────
const authorInput = ref(store.authorName)
function saveAuthor() {
  store.authorName = authorInput.value.trim()
}

// ── View state ─────────────────────────────────────────────────────────────
type View = 'list' | 'new' | 'detail'
const view = ref<View>('list')
const activeTicketId = ref<string | null>(null)

const activeTicket = computed(() =>
  activeTicketId.value ? store.tickets.find((t) => t.id === activeTicketId.value) ?? null : null,
)

function openTicket(id: string) {
  activeTicketId.value = id
  view.value = 'detail'
  newComment.value = ''
}

function backToList() {
  view.value = 'list'
  activeTicketId.value = null
}

// ── Filter ─────────────────────────────────────────────────────────────────
const filterStatus = ref<TicketStatus | 'Tous'>('Tous')
const filterType = ref<TicketType | 'Tous'>('Tous')

const STATUSES: Array<TicketStatus | 'Tous'> = ['Tous', 'Ouvert', 'En cours', 'Fait', 'Rejeté']
const TYPES: TicketType[] = ['Bug', 'Idée', 'Amélioration', 'Question']

const filteredTickets = computed(() => {
  return store.sorted.filter((t) => {
    if (filterStatus.value !== 'Tous' && t.status !== filterStatus.value) return false
    if (filterType.value !== 'Tous' && t.type !== filterType.value) return false
    return true
  })
})

// ── New ticket form ────────────────────────────────────────────────────────
const newType = ref<TicketType>('Idée')
const newTitle = ref('')
const newDescription = ref('')

function submitNew() {
  if (!newTitle.value.trim()) return
  const author = store.authorName || 'Anonyme'
  store.create({
    type: newType.value,
    title: newTitle.value.trim(),
    description: newDescription.value.trim(),
    step: props.currentStep,
    author,
  })
  newTitle.value = ''
  newDescription.value = ''
  newType.value = 'Idée'
  view.value = 'list'
}

// ── Comment ────────────────────────────────────────────────────────────────
const newComment = ref('')

function submitComment() {
  if (!newComment.value.trim() || !activeTicketId.value) return
  const author = store.authorName || 'Anonyme'
  store.addComment(activeTicketId.value, newComment.value.trim(), author)
  newComment.value = ''
}

// ── Helpers ────────────────────────────────────────────────────────────────
const STATUS_COLORS: Record<TicketStatus, string> = {
  'Ouvert':   'bg-brand-100 text-brand-700',
  'En cours': 'bg-yellow-100 text-yellow-700',
  'Fait':     'bg-green-100 text-green-700',
  'Rejeté':   'bg-gray-100 text-gray-500',
}

const TYPE_COLORS: Record<TicketType, string> = {
  'Bug':          'bg-red-100 text-red-700',
  'Idée':         'bg-purple-100 text-purple-700',
  'Amélioration': 'bg-blue-100 text-blue-700',
  'Question':     'bg-orange-100 text-orange-700',
}

const TYPE_ICONS: Record<TicketType, string> = {
  'Bug':          '🐛',
  'Idée':         '💡',
  'Amélioration': '⚡',
  'Question':     '❓',
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
}

const NEXT_STATUSES: Record<TicketStatus, TicketStatus[]> = {
  'Ouvert':   ['En cours', 'Rejeté'],
  'En cours': ['Fait', 'Rejeté', 'Ouvert'],
  'Fait':     ['Ouvert'],
  'Rejeté':   ['Ouvert'],
}
</script>

<template>
  <!-- Backdrop -->
  <div
    class="fixed inset-0 z-40 bg-brand-900/20 backdrop-blur-[2px]"
    @click="emit('close')"
  />

  <!-- Panel -->
  <aside class="fixed right-0 top-0 bottom-0 z-50 w-[480px] bg-white shadow-2xl flex flex-col border-l border-brand-200">

    <!-- Panel header -->
    <div class="flex items-center gap-3 px-5 py-4 border-b border-brand-100 shrink-0">
      <span class="text-lg">💬</span>
      <div class="flex-1">
        <h2 class="text-sm font-bold text-brand-900">Feedback & Tickets</h2>
        <p class="text-[11px] text-brand-500">{{ store.openCount }} ouvert{{ store.openCount > 1 ? 's' : '' }} · {{ store.tickets.length }} total</p>
      </div>
      <button
        v-if="view !== 'list'"
        @click="backToList"
        class="text-xs text-brand-500 hover:text-brand-700 mr-2 transition-colors"
      >← Retour</button>
      <button
        v-if="view === 'list'"
        @click="view = 'new'"
        class="text-xs px-3 py-1.5 rounded-lg bg-accent-500 text-white hover:bg-accent-600 transition-colors font-medium"
      >+ Nouveau</button>
      <button @click="emit('close')" class="text-brand-400 hover:text-brand-700 text-lg leading-none ml-1">×</button>
    </div>

    <!-- Author strip -->
    <div class="px-5 py-2.5 bg-brand-50 border-b border-brand-100 flex items-center gap-2 shrink-0">
      <span class="text-[11px] text-brand-600 font-medium shrink-0">Ton prénom :</span>
      <input
        v-model="authorInput"
        @blur="saveAuthor"
        @keyup.enter="saveAuthor"
        type="text"
        placeholder="ex : Marie"
        class="flex-1 text-xs bg-transparent border-b border-dashed border-brand-300 focus:border-accent-400 outline-none text-brand-900 py-0.5 placeholder:text-brand-300"
      />
      <span class="text-[10px] text-brand-400">mémorisé localement</span>
    </div>

    <!-- ── LIST VIEW ──────────────────────────────────────────────────────── -->
    <template v-if="view === 'list'">
      <!-- Filters -->
      <div class="px-5 py-3 border-b border-brand-100 flex items-center gap-2 flex-wrap shrink-0">
        <button
          v-for="s in STATUSES"
          :key="s"
          @click="filterStatus = s"
          class="text-[11px] px-2.5 py-1 rounded-full font-medium transition-colors"
          :class="filterStatus === s ? 'bg-brand-700 text-white' : 'bg-brand-100 text-brand-600 hover:bg-brand-200'"
        >{{ s }}</button>
        <div class="w-px h-4 bg-brand-100 mx-1" />
        <button
          v-for="tp in TYPES"
          :key="tp"
          @click="filterType = filterType === tp ? 'Tous' : tp"
          class="text-[11px] px-2.5 py-1 rounded-full font-medium transition-colors"
          :class="filterType === tp ? 'bg-accent-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'"
        >{{ TYPE_ICONS[tp] }} {{ tp }}</button>
      </div>

      <!-- Ticket list -->
      <div class="flex-1 overflow-y-auto divide-y divide-brand-50">
        <div v-if="filteredTickets.length === 0" class="text-center py-16 text-brand-400 text-sm">
          Aucun ticket pour ces filtres.
        </div>
        <button
          v-for="ticket in filteredTickets"
          :key="ticket.id"
          @click="openTicket(ticket.id)"
          class="w-full text-left px-5 py-3.5 hover:bg-brand-50 transition-colors group"
        >
          <div class="flex items-start gap-2.5">
            <span class="text-base mt-0.5 shrink-0">{{ TYPE_ICONS[ticket.type] }}</span>
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-2 mb-1">
                <span
                  class="text-[10px] font-bold px-2 py-0.5 rounded-full"
                  :class="STATUS_COLORS[ticket.status]"
                >{{ ticket.status }}</span>
                <span v-if="ticket.step" class="text-[10px] text-brand-400 font-medium">{{ ticket.step }}</span>
              </div>
              <p class="text-sm font-semibold text-brand-900 truncate">{{ ticket.title }}</p>
              <p class="text-xs text-brand-500 mt-0.5 flex items-center gap-2">
                <span>{{ ticket.author }}</span>
                <span>·</span>
                <span>{{ formatDate(ticket.createdAt) }}</span>
                <span v-if="ticket.comments.length > 0" class="ml-auto text-brand-400">
                  💬 {{ ticket.comments.length }}
                </span>
                <span v-if="ticket.votes > 0" class="text-brand-400">
                  ▲ {{ ticket.votes }}
                </span>
              </p>
            </div>
            <span class="text-brand-200 group-hover:text-brand-400 text-xs mt-1 transition-colors">→</span>
          </div>
        </button>
      </div>
    </template>

    <!-- ── NEW TICKET VIEW ────────────────────────────────────────────────── -->
    <template v-else-if="view === 'new'">
      <div class="flex-1 overflow-y-auto px-5 py-5 space-y-4">
        <div>
          <label class="text-xs font-semibold text-brand-700 uppercase tracking-wide mb-1.5 block">Type</label>
          <div class="flex gap-2 flex-wrap">
            <button
              v-for="tp in TYPES"
              :key="tp"
              @click="newType = tp"
              class="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full font-medium transition-colors border"
              :class="newType === tp
                ? 'bg-accent-500 text-white border-accent-500'
                : 'bg-white text-brand-700 border-brand-200 hover:border-brand-400'"
            >{{ TYPE_ICONS[tp] }} {{ tp }}</button>
          </div>
        </div>

        <div>
          <label class="text-xs font-semibold text-brand-700 uppercase tracking-wide mb-1.5 block">Titre <span class="text-red-400">*</span></label>
          <input
            v-model="newTitle"
            type="text"
            placeholder="Résume le problème ou l'idée en une ligne"
            class="input"
            @keyup.enter="submitNew"
          />
        </div>

        <div>
          <label class="text-xs font-semibold text-brand-700 uppercase tracking-wide mb-1.5 block">Description</label>
          <textarea
            v-model="newDescription"
            rows="5"
            placeholder="Plus tu détailles, plus c'est utile. Exemple : étape concernée, cas d'usage, comportement attendu vs observé…"
            class="input resize-none"
          />
        </div>

        <div v-if="currentStep" class="flex items-center gap-2 text-xs text-brand-500 bg-brand-50 px-3 py-2 rounded-lg">
          <span>📍</span>
          <span>Contexte capturé automatiquement : étape <strong class="text-brand-700">{{ currentStep }}</strong></span>
        </div>

        <div class="flex items-center gap-2 text-xs text-brand-400 bg-gray-50 px-3 py-2 rounded-lg">
          <span>👤</span>
          <span>Soumis par <strong class="text-brand-700">{{ store.authorName || 'Anonyme' }}</strong></span>
        </div>
      </div>

      <div class="px-5 py-4 border-t border-brand-100 flex gap-3 shrink-0">
        <button
          @click="view = 'list'"
          class="px-4 py-2.5 text-sm text-brand-600 hover:text-brand-900 transition-colors"
        >Annuler</button>
        <button
          @click="submitNew"
          :disabled="!newTitle.trim()"
          class="flex-1 px-5 py-2.5 rounded-xl bg-accent-500 text-white text-sm font-semibold hover:bg-accent-600 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >Soumettre le ticket →</button>
      </div>
    </template>

    <!-- ── DETAIL VIEW ────────────────────────────────────────────────────── -->
    <template v-else-if="view === 'detail' && activeTicket">
      <div class="flex-1 overflow-y-auto">
        <!-- Ticket header -->
        <div class="px-5 py-4 border-b border-brand-100">
          <div class="flex items-center gap-2 mb-2">
            <span class="text-xl">{{ TYPE_ICONS[activeTicket.type] }}</span>
            <span
              class="text-[10px] font-bold px-2 py-0.5 rounded-full"
              :class="TYPE_COLORS[activeTicket.type]"
            >{{ activeTicket.type }}</span>
            <span
              class="text-[10px] font-bold px-2 py-0.5 rounded-full"
              :class="STATUS_COLORS[activeTicket.status]"
            >{{ activeTicket.status }}</span>
            <span v-if="activeTicket.step" class="text-[10px] text-brand-400 font-medium ml-1">{{ activeTicket.step }}</span>
          </div>
          <h3 class="text-base font-bold text-brand-900 mb-1">{{ activeTicket.title }}</h3>
          <p class="text-xs text-brand-500">{{ activeTicket.author }} · {{ formatDate(activeTicket.createdAt) }}</p>
        </div>

        <!-- Description -->
        <div class="px-5 py-4 border-b border-brand-100">
          <p v-if="activeTicket.description" class="text-sm text-brand-800 leading-relaxed whitespace-pre-wrap">{{ activeTicket.description }}</p>
          <p v-else class="text-sm text-brand-300 italic">Pas de description.</p>
        </div>

        <!-- Actions row -->
        <div class="px-5 py-3 border-b border-brand-100 flex items-center gap-2 flex-wrap bg-brand-50">
          <button
            @click="store.upvote(activeTicket.id)"
            class="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full bg-white border border-brand-200 text-brand-700 hover:border-brand-400 transition-colors font-medium"
          >▲ +1 ({{ activeTicket.votes }})</button>
          <span class="text-brand-200">|</span>
          <span class="text-[11px] text-brand-500 font-medium">Changer statut :</span>
          <button
            v-for="s in NEXT_STATUSES[activeTicket.status]"
            :key="s"
            @click="store.setStatus(activeTicket.id, s)"
            class="text-[11px] px-2.5 py-1 rounded-full font-medium bg-white border border-brand-200 text-brand-600 hover:bg-brand-100 transition-colors"
          >→ {{ s }}</button>
          <button
            @click="store.remove(activeTicket.id); backToList()"
            class="ml-auto text-[11px] text-red-300 hover:text-red-500 transition-colors"
          >Supprimer</button>
        </div>

        <!-- Comments -->
        <div class="px-5 py-4 space-y-3">
          <p class="text-xs font-semibold text-brand-700 uppercase tracking-wide">
            Commentaires ({{ activeTicket.comments.length }})
          </p>
          <div v-if="activeTicket.comments.length === 0" class="text-sm text-brand-300 italic">
            Sois le premier à commenter.
          </div>
          <div
            v-for="comment in activeTicket.comments"
            :key="comment.id"
            class="bg-brand-50 rounded-xl px-4 py-3"
          >
            <p class="text-[11px] font-semibold text-brand-700 mb-1">
              {{ comment.author }} <span class="font-normal text-brand-400">· {{ formatDate(comment.createdAt) }}</span>
            </p>
            <p class="text-sm text-brand-800 whitespace-pre-wrap leading-relaxed">{{ comment.body }}</p>
          </div>
        </div>
      </div>

      <!-- Comment input -->
      <div class="px-5 py-4 border-t border-brand-100 shrink-0">
        <p class="text-xs font-semibold text-brand-700 mb-2 uppercase tracking-wide">Ajouter un commentaire</p>
        <textarea
          v-model="newComment"
          rows="3"
          placeholder="Partage ton retour, une idée, une question…"
          class="input resize-none text-sm"
          @keydown.meta.enter="submitComment"
        />
        <div class="flex items-center justify-between mt-2">
          <span class="text-[11px] text-brand-400">⌘↩ pour envoyer</span>
          <button
            @click="submitComment"
            :disabled="!newComment.trim()"
            class="text-xs px-4 py-2 rounded-lg bg-accent-500 text-white hover:bg-accent-600 transition-colors disabled:opacity-40 disabled:cursor-not-allowed font-medium"
          >Envoyer →</button>
        </div>
      </div>
    </template>

  </aside>
</template>
