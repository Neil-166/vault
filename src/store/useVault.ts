import { create } from 'zustand'
import type {
  AppNotification,
  Bill,
  Contact,
  Device,
  Goal,
  MoneyRequest,
  Settings,
  Toast,
  Transaction,
} from '../types'
import {
  BILLS,
  CONTACTS,
  DEFAULT_SETTINGS,
  DEVICES,
  GOALS,
  NOTIFICATIONS,
  REQUESTS,
  STARTING_BALANCE,
  TRANSACTIONS,
  USER,
} from '../data/mock'
import { dateKey, inr, txId } from '../utils/format'

/* ── Navigation ────────────────────────────────────────── */
export type Route =
  | { name: 'home' }
  | { name: 'activity' }
  | { name: 'goals' }
  | { name: 'profile' }
  | { name: 'pay' }
  | { name: 'notifications' }
  | { name: 'insights' }
  | { name: 'transaction'; id: string }
  | { name: 'send' }
  | { name: 'request' }
  | { name: 'split' }
  | { name: 'splitDetail'; id: string }
  | { name: 'goalDetail'; id: string }
  | { name: 'addMoney' }
  | { name: 'security' }
  | { name: 'devices' }
  | { name: 'settings' }
  | { name: 'privacy' }
  | { name: 'help' }

export interface SendResult {
  ok: boolean
  error?: string
  tx?: Transaction
}

export interface NewBillInput {
  title: string
  merchant: string
  total: number
  splitMode: Bill['splitMode']
  participants: { name: string; initials: string; hue: number; amount: number; paid: boolean }[]
}

export interface NewGoalInput {
  name: string
  target: number
  saved: number
  targetDate: string
}

function todayISO(): string {
  return dateKey(new Date())
}

function nowTime(): string {
  const d = new Date()
  let h = d.getHours()
  const m = d.getMinutes()
  const ampm = h >= 12 ? 'PM' : 'AM'
  h = h % 12 || 12
  return `${h}:${String(m).padStart(2, '0')} ${ampm}`
}

function hueFor(name: string): number {
  let h = 0
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) % 360
  return h
}

export interface VaultState {
  balance: number
  transactions: Transaction[]
  goals: Goal[]
  bills: Bill[]
  requests: MoneyRequest[]
  notifications: AppNotification[]
  devices: Device[]
  settings: Settings
  hideBalance: boolean
  toasts: Toast[]
  route: Route
  history: Route[]
  payMenuOpen: boolean
  locked: boolean

  unlock: () => void
  lock: () => void
  go: (r: Route) => void
  back: () => void
  resetToHome: () => void
  openPayMenu: () => void
  closePayMenu: () => void

  toggleHideBalance: () => void
  pushToast: (t: Omit<Toast, 'id'>) => void
  dismissToast: (id: string) => void

  sendMoney: (to: Contact, amount: number, note?: string) => SendResult
  addMoney: (amount: number) => void
  requestMoney: (from: Contact, amount: number, note?: string) => void
  payRequest: (id: string) => void
  declineRequest: (id: string) => void

  createBill: (input: NewBillInput) => string
  setParticipantPaid: (billId: string, participantId: string, paid: boolean) => void
  remindParticipant: (billId: string, participantId: string) => void

  createGoal: (input: NewGoalInput) => void
  addToGoal: (goalId: string, amount: number) => SendResult
  deleteGoal: (goalId: string) => void

  markNotificationRead: (id: string) => void
  markAllNotificationsRead: () => void
  toggleSetting: (key: keyof Settings) => void
  removeDevice: (id: string) => void
  resetDemo: () => void
}

export const useVault = create<VaultState>((set, get) => ({
  balance: STARTING_BALANCE,
  transactions: TRANSACTIONS,
  goals: GOALS,
  bills: BILLS,
  requests: REQUESTS,
  notifications: NOTIFICATIONS,
  devices: DEVICES,
  settings: DEFAULT_SETTINGS,
  hideBalance: false,
  toasts: [],
  route: { name: 'home' },
  history: [{ name: 'home' }],
  payMenuOpen: false,
  locked: true,

  unlock: () => set({ locked: false }),
  lock: () =>
    set({
      locked: true,
      route: { name: 'home' },
      history: [{ name: 'home' }],
      payMenuOpen: false,
      hideBalance: false,
    }),
  go: (r) => {
    const { history } = get()
    const prev = history[history.length - 1]
    if (prev && JSON.stringify(prev) === JSON.stringify(r)) return
    set({ history: [...history, r].slice(-40), route: r, payMenuOpen: false })
  },
  back: () => {
    const { history } = get()
    if (history.length <= 1) {
      set({ route: { name: 'home' }, history: [{ name: 'home' }] })
      return
    }
    const next = history.slice(0, -1)
    set({ history: next, route: next[next.length - 1], payMenuOpen: false })
  },
  resetToHome: () => set({ route: { name: 'home' }, history: [{ name: 'home' }], payMenuOpen: false }),
  openPayMenu: () => set({ payMenuOpen: true }),
  closePayMenu: () => set({ payMenuOpen: false }),

  toggleHideBalance: () => set((s) => ({ hideBalance: !s.hideBalance })),
  pushToast: (t) => {
    const id = txId()
    set((s) => ({ toasts: [...s.toasts, { ...t, id }] }))
    setTimeout(() => get().dismissToast(id), 4200)
  },
  dismissToast: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),

  sendMoney: (to, amount, note) => {
    const s = get()
    if (!amount || amount <= 0) return { ok: false, error: 'Enter an amount above ₹0 to continue.' }
    if (amount > s.balance) {
      return {
        ok: false,
        error: `You don’t have enough balance. Your available balance is ${inr(s.balance)}.`,
      }
    }
    const fee = 0
    const total = amount + fee
    const tx: Transaction = {
      id: txId(),
      type: 'debit',
      category: 'Transfer',
      merchant: to.name,
      detail: 'Payment sent',
      amount,
      date: todayISO(),
      time: nowTime(),
      method: 'UPI',
      status: 'Completed',
      fee,
      balanceAfter: Math.round((s.balance - total) * 100) / 100,
      note,
    }
    set({
      balance: tx.balanceAfter,
      transactions: [tx, ...s.transactions],
      notifications: [
        {
          id: txId(),
          kind: 'payment',
          title: 'Payment sent',
          body: `${inr(amount)} sent to ${to.name}`,
          time: nowTime(),
          read: false,
          priority: 'normal',
        },
        ...s.notifications,
      ],
    })
    return { ok: true, tx }
  },

  addMoney: (amount) => {
    const s = get()
    if (!amount || amount <= 0) return
    const tx: Transaction = {
      id: txId(),
      type: 'credit',
      category: 'Transfer',
      merchant: 'Added to VAULT',
      detail: 'Money added from linked bank',
      amount,
      date: todayISO(),
      time: nowTime(),
      method: 'NetBanking',
      status: 'Completed',
      fee: 0,
      balanceAfter: Math.round((s.balance + amount) * 100) / 100,
    }
    set({ balance: tx.balanceAfter, transactions: [tx, ...s.transactions] })
  },

  requestMoney: (from, amount, note) => {
    const s = get()
    const req: MoneyRequest = {
      id: txId(),
      direction: 'outgoing',
      name: from.name,
      initials: from.initials,
      hue: from.hue,
      amount,
      note,
      status: 'pending',
      date: todayISO(),
    }
    set({ requests: [req, ...s.requests] })
  },

  payRequest: (id) => {
    const s = get()
    const req = s.requests.find((r) => r.id === id)
    if (!req || req.status !== 'pending') return
    if (req.amount > s.balance) {
      get().pushToast({
        tone: 'error',
        title: 'Not enough balance',
        body: `Paying ${inr(req.amount)} needs a balance of at least that much.`,
      })
      return
    }
    const tx: Transaction = {
      id: txId(),
      type: 'debit',
      category: 'Transfer',
      merchant: req.name,
      detail: 'Request paid',
      amount: req.amount,
      date: todayISO(),
      time: nowTime(),
      method: 'UPI',
      status: 'Completed',
      fee: 0,
      balanceAfter: Math.round((s.balance - req.amount) * 100) / 100,
      note: req.note,
    }
    set({
      balance: tx.balanceAfter,
      transactions: [tx, ...s.transactions],
      requests: s.requests.map((r) => (r.id === id ? { ...r, status: 'paid' } : r)),
    })
    get().pushToast({ tone: 'success', title: 'Paid', body: `${inr(req.amount)} sent to ${req.name}` })
  },

  declineRequest: (id) => {
    set((s) => ({
      requests: s.requests.map((r) => (r.id === id ? { ...r, status: 'declined' } : r)),
    }))
    get().pushToast({ tone: 'info', title: 'Request declined', body: 'The other person can still remind you later.' })
  },

  createBill: (input) => {
    const s = get()
    const billId = txId()
    const bill: Bill = {
      id: billId,
      title: input.title,
      merchant: input.merchant,
      total: input.total,
      date: todayISO(),
      splitMode: input.splitMode,
      participants: input.participants.map((p) => ({ id: txId(), ...p, remindedAt: null })),
      status: 'open',
      createdByName: USER.name,
    }
    set({ bills: [bill, ...s.bills] })
    return billId
  },

  setParticipantPaid: (billId, participantId, paid) => {
    set((s) => ({
      bills: s.bills.map((b) =>
        b.id === billId
          ? {
              ...b,
              participants: b.participants.map((p) => (p.id === participantId ? { ...p, paid } : p)),
              status: b.participants.every((p) =>
                p.id === participantId ? paid : p.paid,
              )
                ? 'settled'
                : 'open',
            }
          : b,
      ),
    }))
  },

  remindParticipant: (billId, participantId) => {
    const s = get()
    const bill = s.bills.find((b) => b.id === billId)
    const p = bill?.participants.find((x) => x.id === participantId)
    if (!bill || !p) return
    set((st) => ({
      bills: st.bills.map((b) =>
        b.id === billId
          ? {
              ...b,
              participants: b.participants.map((x) =>
                x.id === participantId ? { ...x, remindedAt: nowTime() } : x,
              ),
            }
          : b,
      ),
    }))
    get().pushToast({
      tone: 'info',
      title: 'Reminder sent',
      body: `${p.name} was reminded about ${inr(p.amount)}.`,
    })
  },

  createGoal: (input) => {
    const goal: Goal = {
      id: txId(),
      name: input.name,
      emoji: '🎯',
      target: input.target,
      saved: input.saved,
      targetDate: input.targetDate,
      createdAt: todayISO(),
      hue: hueFor(input.name),
    }
    set((s) => ({ goals: [goal, ...s.goals] }))
  },

  addToGoal: (goalId, amount) => {
    const s = get()
    const goal = s.goals.find((g) => g.id === goalId)
    if (!goal) return { ok: false, error: 'Goal not found.' }
    if (!amount || amount <= 0) return { ok: false, error: 'Enter an amount above ₹0.' }
    if (amount > s.balance) {
      return { ok: false, error: `Not enough balance to save ${inr(amount)}.` }
    }
    const tx: Transaction = {
      id: txId(),
      type: 'debit',
      category: 'Savings',
      merchant: goal.name,
      detail: 'Moved to savings',
      amount,
      date: todayISO(),
      time: nowTime(),
      method: 'VAULT',
      status: 'Completed',
      fee: 0,
      balanceAfter: Math.round((s.balance - amount) * 100) / 100,
    }
    set({
      balance: tx.balanceAfter,
      transactions: [tx, ...s.transactions],
      goals: s.goals.map((g) =>
        g.id === goalId ? { ...g, saved: Math.min(g.target, g.saved + amount) } : g,
      ),
    })
    return { ok: true, tx }
  },

  deleteGoal: (goalId) => {
    set((s) => ({ goals: s.goals.filter((g) => g.id !== goalId) }))
    get().pushToast({ tone: 'info', title: 'Goal removed' })
  },

  markNotificationRead: (id) =>
    set((s) => ({
      notifications: s.notifications.map((n) => (n.id === id ? { ...n, read: true } : n)),
    })),
  markAllNotificationsRead: () =>
    set((s) => ({ notifications: s.notifications.map((n) => ({ ...n, read: true })) })),
  toggleSetting: (key) => set((s) => ({ settings: { ...s.settings, [key]: !s.settings[key] } })),
  removeDevice: (id) => set((s) => ({ devices: s.devices.filter((d) => d.id !== id) })),
  resetDemo: () =>
    set({
      balance: STARTING_BALANCE,
      transactions: TRANSACTIONS,
      goals: GOALS,
      bills: BILLS,
      requests: REQUESTS,
      notifications: NOTIFICATIONS,
      devices: DEVICES,
      settings: DEFAULT_SETTINGS,
      hideBalance: false,
    }),
}))

export { CONTACTS, USER }
