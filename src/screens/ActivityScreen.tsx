import { useMemo, useState } from 'react'
import { BellRing, Scale, Search, ShieldCheck } from 'lucide-react'
import { Avatar, Button, Card, Chip, SearchBar } from '../components/ui/primitives'
import { BottomSheet } from '../components/ui/BottomSheet'
import { TransactionSheet } from '../components/TransactionSheet'
import { TransactionItem } from '../components/TransactionItem'
import { EmptyState } from '../components/ui/EmptyState'
import { useVault, USER } from '../store/useVault'
import { humanDate, inr } from '../utils/format'
import type { Transaction } from '../types'

const FILTERS = ['All', 'Money in', 'Money out', 'Transfers', 'Bills'] as const
type Filter = (typeof FILTERS)[number]

export default function ActivityScreen() {
  const transactions = useVault((s) => s.transactions)
  const bills = useVault((s) => s.bills)
  const requests = useVault((s) => s.requests)
  const payRequest = useVault((s) => s.payRequest)
  const declineRequest = useVault((s) => s.declineRequest)
  const pushToast = useVault((s) => s.pushToast)
  const go = useVault((s) => s.go)

  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState<Filter>('All')
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null)

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return transactions.filter((tx) => {
      if (filter === 'Money in' && tx.type !== 'credit') return false
      if (filter === 'Money out' && tx.type !== 'debit') return false
      if (filter === 'Transfers' && tx.category !== 'Transfer') return false
      if (filter === 'Bills' && tx.category !== 'Bills') return false
      if (q && !`${tx.merchant} ${tx.detail ?? ''}`.toLowerCase().includes(q)) return false
      return true
    })
  }, [transactions, filter, query])

  const groups = useMemo(() => {
    const map = new Map<string, Transaction[]>()
    for (const tx of filtered) {
      const arr = map.get(tx.date) ?? []
      arr.push(tx)
      map.set(tx.date, arr)
    }
    return [...map.entries()]
  }, [filtered])

  const incoming = requests.filter((r) => r.direction === 'incoming' && r.status === 'pending')
  const outgoing = requests.filter((r) => r.direction === 'outgoing' && r.status === 'pending')
  const openBills = bills.filter((b) => b.status === 'open')

  return (
    <div className="space-y-5">
      <header>
        <h1 className="font-display text-[22px] font-bold text-ink-950">Activity</h1>
        <p className="mt-0.5 text-sm text-ink-400">Every payment, clearly explained.</p>
      </header>

      {/* Pending items */}
      {(incoming.length > 0 || outgoing.length > 0 || openBills.length > 0) && (
        <Card className="divide-y divide-ink-100 px-1 py-1 shadow-card">
          {incoming.map((r) => (
            <div key={r.id} className="flex items-center gap-3 px-3 py-3">
              <Avatar initials={r.initials} hue={r.hue} size={40} verified />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-ink-900">{r.name} requested</p>
                <p className="tnum text-[13px] text-ink-500">
                  {inr(r.amount)}
                  {r.note ? ` · ${r.note}` : ''}
                </p>
              </div>
              <div className="flex gap-2">
                <Button size="sm" onClick={() => payRequest(r.id)}>Pay</Button>
                <Button size="sm" variant="ghost" onClick={() => declineRequest(r.id)}>Decline</Button>
              </div>
            </div>
          ))}
          {outgoing.map((r) => (
            <div key={r.id} className="flex items-center gap-3 px-3 py-3">
              <Avatar initials={r.initials} hue={r.hue} size={40} />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-ink-900">Waiting for {r.name}</p>
                <p className="tnum text-[13px] text-ink-500">{inr(r.amount)} requested · {r.note ?? 'No note'}</p>
              </div>
              <Button size="sm" variant="secondary" onClick={() => pushToast({ tone: 'info', title: 'Reminder sent', body: `${r.name} was reminded about ${inr(r.amount)}.` })}>
                <BellRing size={13} /> Remind
              </Button>
            </div>
          ))}
          {openBills.map((b) => {
            const unpaid = b.participants.filter((p) => p.name !== USER.name && !p.paid)
            if (unpaid.length === 0) return null
            return (
              <div key={b.id} className="flex items-center gap-3 px-3 py-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-warn-100 text-warn-600">
                  <Scale size={19} />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-ink-900">{b.title}</p>
                  <p className="text-[13px] text-ink-500">
                    {unpaid.length} of {b.participants.length - 1} friends owe {inr(unpaid.reduce((s, p) => s + p.amount, 0))}
                  </p>
                </div>
                <Button size="sm" variant="soft" onClick={() => go({ name: 'splitDetail', id: b.id })}>
                  Review
                </Button>
              </div>
            )
          })}
        </Card>
      )}

      {/* Search + filters */}
      <div>
        <SearchBar value={query} onChange={setQuery} placeholder="Search payments by name or note" />
        <div className="mt-3 flex gap-2 overflow-x-auto pb-1 no-scrollbar">
          {FILTERS.map((f) => (
            <Chip key={f} active={filter === f} onClick={() => setFilter(f)}>
              {f}
            </Chip>
          ))}
        </div>
      </div>

      {/* Grouped list */}
      {groups.length === 0 ? (
        <Card>
          <EmptyState
            icon={<Search size={24} />}
            title={query || filter !== 'All' ? 'No matching payments' : 'Your payment history will appear here'}
            body={
              query || filter !== 'All'
                ? 'Try a different search keyword or category filter.'
                : 'When you send, receive, split or save, clear records show up here.'
            }
          />
        </Card>
      ) : (
        <div className="space-y-5">
          {groups.map(([date, txs]) => (
            <section key={date}>
              <h2 className="mb-1.5 px-1 text-[13px] font-semibold text-ink-400">
                {humanDate(date)}
              </h2>
              <Card className="divide-y divide-ink-100 px-2 py-1 shadow-card">
                {txs.map((tx) => (
                  <TransactionItem key={tx.id} tx={tx} onClick={() => setSelectedTx(tx)} />
                ))}
              </Card>
            </section>
          ))}
        </div>
      )}

      <p className="flex items-center justify-center gap-1.5 pt-2 text-xs text-ink-400">
        <ShieldCheck size={14} className="text-pos-600" /> {transactions.length} verified records · Transparent fee breakdown on every payment
      </p>

      {/* Transaction detail sheet */}
      <BottomSheet open={!!selectedTx} onClose={() => setSelectedTx(null)} title="Payment details">
        {selectedTx && <TransactionSheet tx={selectedTx} />}
      </BottomSheet>
    </div>
  )
}
