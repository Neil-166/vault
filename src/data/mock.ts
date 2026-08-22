import type {
  AppNotification,
  Bill,
  Contact,
  Device,
  Goal,
  MoneyRequest,
  Settings,
  Transaction,
} from '../types'

export const USER = {
  name: 'Aarav Malhotra',
  firstName: 'Aarav',
  initials: 'AM',
  upi: 'aarav@vault',
  phone: '+91 98200 44120',
  email: 'aarav@vault.app',
  accountType: 'Savings Account',
  accountNumber: 'VAULT · 9021 4487',
  since: '2024',
  city: 'Bengaluru',
  branch: 'Indiranagar',
  pan: 'ABCEM1234F',
  hue: 232,
}

export const STARTING_BALANCE = 48520.4

/* ── Dynamic Date Helpers for Consistent Fresh Demos ────── */
export function daysAgo(days: number): string {
  const d = new Date()
  d.setDate(d.getDate() - days)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export function futureMonth(months: number): string {
  const d = new Date()
  d.setMonth(d.getMonth() + months)
  const lastDay = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`
}

/* ── Contacts ──────────────────────────────────────────── */
export const CONTACTS: Contact[] = [
  { id: 'c1', name: 'Rahul Sharma', initials: 'RS', hue: 222, upi: 'rahul.s@vault', verified: true, recent: true },
  { id: 'c2', name: 'Ananya Mehta', initials: 'AM', hue: 340, upi: 'ananya.m@vault', verified: true, recent: true },
  { id: 'c3', name: 'Karan Verma', initials: 'KV', hue: 152, upi: 'karan.v@vault', verified: true, recent: true },
  { id: 'c4', name: 'Arjun Kapoor', initials: 'AK', hue: 24, upi: 'arjun.k@vault', verified: true, recent: true },
  { id: 'c5', name: 'Priya Singh', initials: 'PS', hue: 280, upi: 'priya.singh@vault', verified: true, recent: false },
  { id: 'c6', name: 'Vikram Joshi', initials: 'VJ', hue: 190, upi: 'vikram.j@vault', verified: false, recent: false },
  { id: 'c7', name: 'Sneha Iyer', initials: 'SI', hue: 12, upi: 'sneha.iyer@vault', verified: true, recent: false },
  { id: 'c8', name: 'Rohan Verma', initials: 'RV', hue: 200, upi: 'rohan.v@vault', verified: true, recent: false },
  { id: 'c9', name: 'Ishaan Gupta', initials: 'IG', hue: 48, upi: 'ishaan.g@vault', verified: false, recent: false },
  { id: 'c10', name: 'Meera Nair', initials: 'MN', hue: 320, upi: 'meera.n@vault', verified: true, recent: false },
]

/* ── Deterministic Transaction Balance Generator ────────── */
type RawTransaction = Omit<Transaction, 'balanceAfter'>

const RAW_TRANSACTIONS: RawTransaction[] = [
  { id: 'VX7A8201', type: 'debit', category: 'Food', merchant: 'Swiggy', detail: 'Dinner · Butter Chicken & Naan', amount: 420, date: daysAgo(0), time: '7:32 PM', method: 'Card', status: 'Completed', fee: 0 },
  { id: 'VX7A8202', type: 'credit', category: 'Transfer', merchant: 'Rahul Sharma', detail: 'Transfer received', amount: 1500, date: daysAgo(0), time: '1:05 PM', method: 'UPI', status: 'Completed', fee: 0 },
  { id: 'VX7A8203', type: 'debit', category: 'Entertainment', merchant: 'Netflix', detail: 'Monthly subscription', amount: 649, date: daysAgo(1), time: '9:15 PM', method: 'Autopay', status: 'Completed', fee: 0 },
  { id: 'VX7A8204', type: 'debit', category: 'Food', merchant: 'Zomato', detail: 'Lunch · Biryani', amount: 384, date: daysAgo(1), time: '8:41 PM', method: 'Card', status: 'Completed', fee: 0 },
  { id: 'VX7A8205', type: 'debit', category: 'Groceries', merchant: 'Blinkit', detail: 'Weekly groceries', amount: 612, date: daysAgo(2), time: '11:20 AM', method: 'UPI', status: 'Completed', fee: 0 },
  { id: 'VX7A8206', type: 'debit', category: 'Transport', merchant: 'Uber', detail: 'Airport → Indiranagar', amount: 268, date: daysAgo(2), time: '9:04 AM', method: 'Card', status: 'Completed', fee: 0 },
  { id: 'VX7A8207', type: 'debit', category: 'Shopping', merchant: 'Amazon', detail: 'Wireless headphones', amount: 1299, date: daysAgo(3), time: '4:47 PM', method: 'Card', status: 'Completed', fee: 0 },
  { id: 'VX7A8208', type: 'debit', category: 'Entertainment', merchant: 'Spotify', detail: 'Monthly subscription', amount: 119, date: daysAgo(3), time: '7:12 AM', method: 'Autopay', status: 'Completed', fee: 0 },
  { id: 'VX7A8209', type: 'debit', category: 'Transfer', merchant: 'Arjun Kapoor', detail: 'Sent · Movie tickets', amount: 2000, date: daysAgo(4), time: '6:30 PM', method: 'UPI', status: 'Completed', fee: 0 },
  { id: 'VX7A8210', type: 'debit', category: 'Bills', merchant: 'BESCOM', detail: 'Electricity bill', amount: 1845, date: daysAgo(5), time: '10:12 AM', method: 'NetBanking', status: 'Completed', fee: 0 },
  { id: 'VX7A8211', type: 'debit', category: 'Transfer', merchant: 'Karan Verma', detail: 'Split · Groceries share', amount: 1200, date: daysAgo(6), time: '9:48 PM', method: 'UPI', status: 'Completed', fee: 0 },
  { id: 'VX7A8212', type: 'credit', category: 'Transfer', merchant: 'Ananya Mehta', detail: 'Request paid · Coffee run', amount: 750, date: daysAgo(6), time: '3:20 PM', method: 'UPI', status: 'Completed', fee: 0 },
  { id: 'VX7A8213', type: 'debit', category: 'Groceries', merchant: 'BigBasket', detail: 'Monthly pantry restock', amount: 1540, date: daysAgo(8), time: '6:15 PM', method: 'Card', status: 'Completed', fee: 0 },
  { id: 'VX7A8214', type: 'credit', category: 'Bills', merchant: 'Acme Corp', detail: 'Salary deposit', amount: 45000, date: daysAgo(10), time: '9:00 AM', method: 'NetBanking', status: 'Completed', fee: 0 },
  { id: 'VX7A8215', type: 'debit', category: 'Bills', merchant: 'Airtel', detail: 'Broadband + mobile', amount: 899, date: daysAgo(12), time: '8:30 AM', method: 'Autopay', status: 'Completed', fee: 0 },
  { id: 'VX7A8216', type: 'debit', category: 'Food', merchant: 'Third Wave Coffee', detail: 'Cold brew', amount: 340, date: daysAgo(14), time: '5:40 PM', method: 'Card', status: 'Completed', fee: 0 },
  { id: 'VX7A8217', type: 'debit', category: 'Bills', merchant: 'Rent · Indiranagar', detail: 'House rent', amount: 14000, date: daysAgo(16), time: '8:00 AM', method: 'NetBanking', status: 'Completed', fee: 0 },
  { id: 'VX7A8218', type: 'debit', category: 'Entertainment', merchant: 'PVR Cinemas', detail: 'Movie · 2 tickets', amount: 500, date: daysAgo(18), time: '8:20 PM', method: 'Card', status: 'Completed', fee: 0 },
  { id: 'VX7A8219', type: 'credit', category: 'Transfer', merchant: 'Rohan Verma', detail: 'Transfer received', amount: 2000, date: daysAgo(20), time: '2:15 PM', method: 'UPI', status: 'Completed', fee: 0 },
  { id: 'VX7A8220', type: 'debit', category: 'Health', merchant: 'PharmEasy', detail: 'Medicines', amount: 760, date: daysAgo(22), time: '7:05 PM', method: 'UPI', status: 'Completed', fee: 0 },
]

/**
 * Mathematically derives the sequential balanceAfter for every transaction
 * starting backward from the current account balance.
 */
export function calculateDeterministicBalances(
  rawTxs: RawTransaction[],
  currentBalance: number,
): Transaction[] {
  const result: Transaction[] = []
  let running = currentBalance

  for (let i = 0; i < rawTxs.length; i++) {
    const t = rawTxs[i]
    const balanceAfter = Math.round(running * 100) / 100
    result.push({
      ...t,
      balanceAfter,
    })
    // Compute the balance before this transaction for the older transaction
    if (t.type === 'debit') {
      running = running + t.amount + t.fee
    } else {
      running = running - t.amount + t.fee
    }
  }

  return result
}

export const TRANSACTIONS: Transaction[] = calculateDeterministicBalances(
  RAW_TRANSACTIONS,
  STARTING_BALANCE,
)

/* ── Savings goals ─────────────────────────────────────── */
export const GOALS: Goal[] = [
  { id: 'g1', name: 'MacBook Fund', emoji: '💻', target: 80000, saved: 42000, targetDate: futureMonth(4), createdAt: daysAgo(90), hue: 232 },
  { id: 'g2', name: 'Vacation', emoji: '🌴', target: 30000, saved: 18500, targetDate: futureMonth(7), createdAt: daysAgo(60), hue: 152 },
  { id: 'g3', name: 'Emergency Fund', emoji: '🛡️', target: 100000, saved: 65000, targetDate: futureMonth(6), createdAt: daysAgo(180), hue: 38 },
]

/* ── Bills / splits ────────────────────────────────────── */
export const BILLS: Bill[] = [
  {
    id: 'b1',
    title: 'Dinner at Social',
    merchant: 'Social · Koramangala',
    total: 4800,
    date: daysAgo(2),
    splitMode: 'equal',
    participants: [
      { id: 'p1', name: 'Aarav Malhotra', initials: 'AM', hue: 232, amount: 1200, paid: true },
      { id: 'p2', name: 'Rahul Sharma', initials: 'RS', hue: 222, amount: 1200, paid: true },
      { id: 'p3', name: 'Ananya Mehta', initials: 'AM', hue: 340, amount: 1200, paid: false },
      { id: 'p4', name: 'Karan Verma', initials: 'KV', hue: 152, amount: 1200, paid: true },
    ],
    status: 'open',
    createdByName: 'Aarav Malhotra',
  },
  {
    id: 'b2',
    title: 'Monthly Groceries',
    merchant: 'BigBasket',
    total: 2400,
    date: daysAgo(8),
    splitMode: 'equal',
    participants: [
      { id: 'p5', name: 'Aarav Malhotra', initials: 'AM', hue: 232, amount: 800, paid: true },
      { id: 'p6', name: 'Ananya Mehta', initials: 'AM', hue: 340, amount: 800, paid: false },
      { id: 'p7', name: 'Arjun Kapoor', initials: 'AK', hue: 24, amount: 800, paid: false },
    ],
    status: 'open',
    createdByName: 'Aarav Malhotra',
  },
  {
    id: 'b3',
    title: 'Cab to airport',
    merchant: 'Uber',
    total: 720,
    date: daysAgo(5),
    splitMode: 'equal',
    participants: [
      { id: 'p8', name: 'Aarav Malhotra', initials: 'AM', hue: 232, amount: 360, paid: true },
      { id: 'p9', name: 'Ananya Mehta', initials: 'AM', hue: 340, amount: 360, paid: false },
    ],
    status: 'open',
    createdByName: 'Aarav Malhotra',
  },
]

/* ── Money requests ────────────────────────────────────── */
export const REQUESTS: MoneyRequest[] = [
  { id: 'r1', direction: 'incoming', name: 'Ananya Mehta', initials: 'AM', hue: 340, amount: 850, note: 'Bakery supplies for Saturday', status: 'pending', date: daysAgo(0) },
  { id: 'r2', direction: 'outgoing', name: 'Arjun Kapoor', initials: 'AK', hue: 24, amount: 900, note: 'Concert tickets', status: 'pending', date: daysAgo(1) },
  { id: 'r3', direction: 'incoming', name: 'Vikram Joshi', initials: 'VJ', hue: 190, amount: 1250, note: 'Dinner split', status: 'declined', date: daysAgo(3) },
  { id: 'r4', direction: 'outgoing', name: 'Priya Singh', initials: 'PS', hue: 280, amount: 640, note: 'Museum entry', status: 'paid', date: daysAgo(5) },
]

/* ── Notifications ─────────────────────────────────────── */
export const NOTIFICATIONS: AppNotification[] = [
  { id: 'n1', kind: 'payment', title: 'Payment received', body: '₹1,500 received from Rahul Sharma', time: '1:06 PM', read: false, priority: 'normal' },
  { id: 'n2', kind: 'bill', title: 'Someone hasn’t paid yet', body: 'Ananya still owes ₹1,200 for Dinner at Social', time: '9:20 AM', read: false, priority: 'high' },
  { id: 'n3', kind: 'security', title: 'New device sign-in', body: 'MacBook Air · New Delhi signed in to your account', time: 'Yesterday', read: false, priority: 'high' },
  { id: 'n4', kind: 'savings', title: 'Savings update', body: 'You’re ₹38,000 away from your MacBook Fund goal', time: 'Yesterday', read: true, priority: 'normal' },
  { id: 'n5', kind: 'payment', title: 'Payment made', body: '₹1,200 sent to Karan Verma · Groceries share', time: '3 Aug', read: true, priority: 'normal' },
  { id: 'n6', kind: 'system', title: 'Your VAULT is set up', body: 'You can now send money, split bills and save in one place', time: '2 Aug', read: true, priority: 'normal' },
]

/* ── Devices ───────────────────────────────────────────── */
export const DEVICES: Device[] = [
  { id: 'd1', name: 'MacBook Pro', location: 'Bengaluru', lastActive: 'Active now', current: true },
  { id: 'd2', name: 'iPhone 15', location: 'Bengaluru', lastActive: '2 hours ago' },
  { id: 'd3', name: 'Chrome on Windows', location: 'New Delhi', lastActive: '3 days ago', suspicious: true },
  { id: 'd4', name: 'Samsung Galaxy', location: 'Mumbai', lastActive: '12 days ago' },
]

/* ── Preferences ───────────────────────────────────────── */
export const DEFAULT_SETTINGS: Settings = {
  biometricLogin: true,
  transactionAlerts: true,
  securityCode: true,
  marketing: false,
  shareUsage: false,
  currency: 'INR',
}
