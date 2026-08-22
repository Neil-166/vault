const inrFormatter = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
})

const inrFullFormatter = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

/** ₹48,520.40 · ₹420 · whole amounts stay clean */
export function inr(n: number): string {
  const hasCents = Math.round((n % 1) * 100) !== 0
  return inrFormatter.format(hasCents ? Math.round(n * 100) / 100 : Math.round(n))
}

/** Always show two decimals: ₹48,520.40, ₹420.00 — for balances only */
export function inrFull(n: number): string {
  return inrFullFormatter.format(Math.round(n * 100) / 100)
}

const signedFormatter = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
})

/** ₹−420 / ₹+1,500 with explicit sign for transaction lists */
export function inrSigned(n: number): string {
  const sign = n < 0 ? '−' : '+'
  const hasCents = Math.round((Math.abs(n) % 1) * 100) !== 0
  const value = hasCents ? Math.round(Math.abs(n) * 100) / 100 : Math.round(Math.abs(n))
  return `${sign}${signedFormatter.format(value).replace('₹', '₹')}`
}

/** 100000 → 1,00,000 */
export function inrPlain(n: number): string {
  return new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 }).format(n)
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const FULL_MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

function startOfToday(): Date {
  const d = new Date()
  d.setHours(0, 0, 0, 0)
  return d
}

function diffDays(a: Date, b: Date): number {
  return Math.round((a.getTime() - b.getTime()) / 86400000)
}

export function dateKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(
    date.getDate(),
  ).padStart(2, '0')}`
}

export function parseISO(iso: string): Date {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(y, m - 1, d)
}

/** "Today", "Yesterday", "10 Aug", "3 Feb 2025" */
export function humanDate(iso: string): string {
  const d = parseISO(iso)
  const today = startOfToday()
  const diff = diffDays(d, today)
  if (diff === 0) return 'Today'
  if (diff === 1) return 'Yesterday'
  const label = `${d.getDate()} ${MONTHS[d.getMonth()]}`
  return d.getFullYear() === today.getFullYear() ? label : `${label} ${d.getFullYear()}`
}

/** "10 Aug 2026 · 8:42 PM" */
export function longDate(iso: string, time: string): string {
  const d = parseISO(iso)
  return `${d.getDate()} ${FULL_MONTHS[d.getMonth()]} ${d.getFullYear()} · ${time}`
}

/** "December 2026" for goal target dates */
export function monthYear(iso: string): string {
  const d = parseISO(iso)
  return `${FULL_MONTHS[d.getMonth()]} ${d.getFullYear()}`
}

export function monthsUntil(iso: string): number {
  const target = parseISO(iso)
  const now = new Date()
  const months =
    (target.getFullYear() - now.getFullYear()) * 12 + (target.getMonth() - now.getMonth())
  return Math.max(1, months)
}

/** Full calendar months between two ISO dates (rounded up to at least 1). */
export function monthsBetween(startISO: string, endISO: string): number {
  const a = parseISO(startISO)
  const b = parseISO(endISO)
  const months = (b.getFullYear() - a.getFullYear()) * 12 + (b.getMonth() - a.getMonth())
  return Math.max(1, months)
}

let txSequenceCounter = 30
export function txId(): string {
  txSequenceCounter += 1
  return `VX7A82${String(txSequenceCounter).padStart(2, '0')}`
}

/** Month label for the current / last month, e.g. "August" */
export function currentMonthName(): string {
  return FULL_MONTHS[new Date().getMonth()]
}

export function lastMonthName(): string {
  return FULL_MONTHS[(new Date().getMonth() + 11) % 12]
}
