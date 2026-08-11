export type Category =
  | 'Food'
  | 'Transport'
  | 'Shopping'
  | 'Bills'
  | 'Entertainment'
  | 'Groceries'
  | 'Health'
  | 'Transfer'
  | 'Savings'
  | 'Other'

export type TxType = 'debit' | 'credit'
export type TxStatus = 'Completed' | 'Pending' | 'Failed'
export type PayMethod = 'UPI' | 'Card' | 'NetBanking' | 'Autopay' | 'VAULT'

export interface Transaction {
  id: string
  type: TxType
  category: Category
  /** Merchant or person this transaction was with */
  merchant: string
  /** Extra detail, e.g. "Transfer from Rahul Sharma" */
  detail?: string
  /** Absolute amount (always positive; sign implied by type) */
  amount: number
  /** ISO date, e.g. 2026-08-11 */
  date: string
  /** 12-hour time, e.g. 7:32 PM */
  time: string
  method: PayMethod
  status: TxStatus
  fee: number
  balanceAfter: number
  note?: string
}

export interface Contact {
  id: string
  name: string
  initials: string
  hue: number
  upi: string
  verified: boolean
  recent: boolean
}

export interface Goal {
  id: string
  name: string
  emoji: string
  target: number
  saved: number
  /** ISO target date */
  targetDate: string
  /** ISO creation date, used for pace tracking */
  createdAt: string
  hue: number
}

export type SplitMode = 'equal' | 'custom' | 'item'

export interface BillParticipant {
  id: string
  name: string
  initials: string
  hue: number
  amount: number
  paid: boolean
  remindedAt?: string | null
}

export interface Bill {
  id: string
  title: string
  merchant: string
  total: number
  date: string
  splitMode: SplitMode
  participants: BillParticipant[]
  status: 'open' | 'settled'
  createdByName: string
}

export interface MoneyRequest {
  id: string
  /** incoming = someone asked US for money; outgoing = we asked them */
  direction: 'incoming' | 'outgoing'
  name: string
  initials: string
  hue: number
  amount: number
  note?: string
  status: 'pending' | 'paid' | 'declined'
  date: string
}

export type NotificationKind = 'payment' | 'bill' | 'savings' | 'security' | 'system'

export interface AppNotification {
  id: string
  kind: NotificationKind
  title: string
  body: string
  time: string
  read: boolean
  priority: 'high' | 'normal'
}

export interface Device {
  id: string
  name: string
  location: string
  lastActive: string
  current?: boolean
  suspicious?: boolean
}

export type ToastTone = 'success' | 'info' | 'warn' | 'error'

export interface Toast {
  id: string
  title: string
  body?: string
  tone: ToastTone
}

export interface Settings {
  biometricLogin: boolean
  transactionAlerts: boolean
  securityCode: boolean
  marketing: boolean
  shareUsage: boolean
  currency: 'INR'
}
