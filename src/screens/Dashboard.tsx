import { useMemo, useState } from 'react'
import {
  ArrowDownToLine,
  ArrowUpRight,
  Bell,
  BellRing,
  CheckCircle2,
  ChevronRight,
  HandCoins,
  Scale,
  Send,
} from 'lucide-react'
import { Avatar, Card, Button } from '../components/ui/primitives'
import { BottomSheet } from '../components/ui/BottomSheet'
import { TransactionSheet } from '../components/TransactionSheet'
import { BalanceCard } from '../components/BalanceCard'
import { TransactionItem } from '../components/TransactionItem'
import { ProgressBar } from '../components/ui/primitives'
import { useVault, USER } from '../store/useVault'
import { inr, dateKey } from '../utils/format'
import type { Transaction } from '../types'

function greeting(): string {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 17) return 'Good afternoon'
  return 'Good evening'
}

function thisWeekSpend(txs: Transaction[]): { label: string; amount: number; isToday: boolean }[] {
  const now = new Date()
  const mondayShift = (now.getDay() + 6) % 7
  const monday = new Date(now)
  monday.setDate(now.getDate() - mondayShift)
  monday.setHours(0, 0, 0, 0)

  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday)
    d.setDate(monday.getDate() + i)
    const dow = d.getDay()
    const label = dow === 0 ? 'Su' : ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'][dow - 1]
    return { label, amount: 0, isToday: i === mondayShift }
  })
  const keys = days.map((_, i) => {
    const d = new Date(monday)
    d.setDate(monday.getDate() + i)
    return dateKey(d)
  })

  for (const t of txs) {
    if (t.type !== 'debit') continue
    const idx = keys.indexOf(t.date)
    if (idx >= 0) days[idx].amount += t.amount
  }
  return days
}

function lastWeekSpend(txs: Transaction[]): number {
  const now = new Date()
  const shift = (now.getDay() + 6) % 7
  const monday = new Date(now)
  monday.setDate(now.getDate() - shift - 7)
  const next = new Date(monday)
  next.setDate(monday.getDate() + 7)
  const start = dateKey(monday)
  const end = dateKey(next)
  return txs
    .filter((t) => t.type === 'debit' && t.date >= start && t.date < end)
    .reduce((sum, t) => sum + t.amount, 0)
}

export default function Dashboard() {
  const balance = useVault((s) => s.balance)
  const hideBalance = useVault((s) => s.hideBalance)
  const toggleHideBalance = useVault((s) => s.toggleHideBalance)
  const go = useVault((s) => s.go)
  const openPayMenu = useVault((s) => s.openPayMenu)
  const transactions = useVault((s) => s.transactions)
  const goals = useVault((s) => s.goals)
  const bills = useVault((s) => s.bills)
  const requests = useVault((s) => s.requests)
  const payRequest = useVault((s) => s.payRequest)
  const declineRequest = useVault((s) => s.declineRequest)
  const pushToast = useVault((s) => s.pushToast)
  const unreadCount = useVault((s) => s.notifications.filter((n) => !n.read).length)
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null)

  const week = useMemo(() => thisWeekSpend(transactions), [transactions])
  const prevWeek = useMemo(() => lastWeekSpend(transactions), [transactions])
  const weekTotal = week.reduce((s, d) => s + d.amount, 0)
  const maxDay = Math.max(...week.map((d) => d.amount), 1)

  const incoming = requests.filter((r) => r.direction === 'incoming' && r.status === 'pending')
  const outgoing = requests.filter((r) => r.direction === 'outgoing' && r.status === 'pending')
  const openBills = bills.filter((b) => b.status === 'open')

  const attentionCount = incoming.length + outgoing.length + openBills.length

  return (
    <div className="space-y-6">
      {/* Header */}
      <header className="flex items-center justify-between">
        <div>
          <p className="text-[13px] text-ink-400">{greeting()}</p>
          <h1 className="mt-0.5 font-display text-[22px] font-bold text-ink-950">
            {USER.firstName} {USER.name.split(' ')[1]}
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => go({ name: 'notifications' })}
            aria-label={`Notifications${unreadCount ? `, ${unreadCount} unread` : ''}`}
            className="relative rounded-xl bg-white p-2.5 text-ink-600 shadow-card transition-colors hover:text-ink-900"
          >
            <Bell size={19} />
            {unreadCount > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-4.5 min-w-4.5 items-center justify-center rounded-full bg-danger-500 px-1 text-[9.5px] font-bold text-white">
                {unreadCount}
              </span>
            )}
          </button>
          <button
            onClick={() => go({ name: 'profile' })}
            aria-label="Profile"
            className="rounded-xl shadow-card transition-transform active:scale-95"
          >
            <Avatar initials={USER.initials} hue={USER.hue} size={42} />
          </button>
        </div>
      </header>

      {/* Confidence Banner */}
      <section className="animate-rise">
        <div className="flex items-center justify-between gap-3 rounded-2xl border border-pos-200 bg-pos-50/80 px-4 py-3 text-xs text-pos-800 shadow-card">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 size={16} className="shrink-0 text-pos-600" />
            <span>
              <strong className="font-semibold text-pos-900">You're all set.</strong> No unusual payments or hidden fees detected today.
            </span>
          </div>
          <span className="hidden sm:inline-flex items-center gap-1 rounded-full bg-pos-100 px-2.5 py-0.5 text-[11px] font-semibold text-pos-700">
            Protected
          </span>
        </div>
      </section>

      {/* Balance card */}
      <section className="animate-rise" style={{ animationDelay: '40ms' }}>
        <BalanceCard balance={balance} hideBalance={hideBalance} onToggleHide={toggleHideBalance} />
      </section>

      {/* Quick actions */}
      <section className="animate-rise grid grid-cols-4 gap-2.5" style={{ animationDelay: '80ms' }}>
        <QuickAction icon={Send} label="Send" onClick={() => go({ name: 'send' })} tint="bg-brand-50 text-brand-600" />
        <QuickAction icon={HandCoins} label="Request" onClick={() => go({ name: 'request' })} tint="bg-pos-50 text-pos-600" />
        <QuickAction icon={Scale} label="Split bill" onClick={() => go({ name: 'split' })} tint="bg-warn-50 text-warn-600" />
        <QuickAction icon={ArrowDownToLine} label="Add money" onClick={() => go({ name: 'addMoney' })} tint="bg-ink-100 text-ink-600" />
      </section>

      {/* Needs attention */}
      {attentionCount > 0 && (
        <section
          className="animate-rise overflow-hidden rounded-2xl border border-warn-200 bg-warn-50/60"
          style={{ animationDelay: '120ms' }}
        >
          <div className="flex items-center gap-2 border-b border-warn-100 px-4 py-3">
            <BellRing size={16} className="text-warn-600" />
            <h2 className="font-display text-[15px] font-semibold text-ink-900">
              Needs your attention
            </h2>
            <span className="ml-auto rounded-full bg-warn-200 px-2 py-0.5 text-xs font-semibold text-warn-800">
              {attentionCount}
            </span>
          </div>
          <div className="divide-y divide-warn-100/70">
            {incoming.map((r) => (
              <div key={r.id} className="flex items-center gap-3 px-4 py-3">
                <Avatar initials={r.initials} hue={r.hue} size={40} verified />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-ink-900">{r.name} requested</p>
                  <p className="text-[13px] text-ink-500">
                    {inr(r.amount)}
                    {r.note ? ` · ${r.note}` : ''}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" onClick={() => payRequest(r.id)}>
                    Pay
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => declineRequest(r.id)}>
                    Decline
                  </Button>
                </div>
              </div>
            ))}

            {openBills.map((b) => {
              const unpaid = b.participants.filter((p) => p.name !== USER.name && !p.paid)
              if (unpaid.length === 0) return null
              const total = unpaid.reduce((s, p) => s + p.amount, 0)
              return (
                <div key={b.id} className="flex items-center gap-3 px-4 py-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-warn-100 text-warn-600">
                    <Scale size={19} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-ink-900">
                      {inr(total)} owed for {b.title}
                    </p>
                    <p className="text-[13px] text-ink-500">
                      {unpaid.length} of {b.participants.length - 1} friends haven’t paid yet
                    </p>
                  </div>
                  <Button
                    size="sm"
                    variant="soft"
                    onClick={() => go({ name: 'splitDetail', id: b.id })}
                  >
                    Review
                  </Button>
                </div>
              )
            })}

            {outgoing.map((r) => (
              <div key={r.id} className="flex items-center gap-3 px-4 py-3">
                <Avatar initials={r.initials} hue={r.hue} size={40} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-ink-900">
                    Waiting for {r.name} to pay
                  </p>
                  <p className="text-[13px] text-ink-500">
                    {inr(r.amount)}
                    {r.note ? ` · ${r.note}` : ''}
                  </p>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() =>
                    pushToast({
                      tone: 'info',
                      title: 'Reminder sent',
                      body: `${r.name} was reminded about ${inr(r.amount)}.`,
                    })
                  }
                >
                  Remind
                </Button>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Spending this week */}
      <section className="animate-rise rounded-2xl border border-ink-100 bg-white p-5 shadow-card" style={{ animationDelay: '160ms' }}>
        <div className="flex items-baseline justify-between">
          <div>
            <h2 className="font-display text-[15px] font-semibold text-ink-900">Spending this week</h2>
            <p className="tnum mt-0.5 text-[13px] text-ink-400">
              {inr(weekTotal)} spent
              {prevWeek > 0 && (
                <>
                  {' '}
                  ·{' '}
                  <span className={weekTotal <= prevWeek ? 'text-pos-600 font-semibold' : 'text-danger-600 font-semibold'}>
                    {weekTotal <= prevWeek ? 'down' : 'up'} {Math.abs(Math.round(((weekTotal - prevWeek) / prevWeek) * 100))}%
                  </span>{' '}
                  vs last week
                </>
              )}
            </p>
          </div>
          <button
            onClick={() => go({ name: 'insights' })}
            className="text-xs font-medium text-brand-600 hover:text-brand-700"
          >
            Insights →
          </button>
        </div>
        <div className="mt-5 flex h-28 items-end gap-2" role="img" aria-label="Daily spending bar chart">
          {week.map((d, i) => (
            <div key={i} className="group flex flex-1 flex-col items-center gap-1.5">
              <span className="tnum text-[10px] font-medium text-ink-400 opacity-0 transition-opacity group-hover:opacity-100">
                {d.amount > 0 ? inr(d.amount) : ''}
              </span>
              <div
                title={`${d.label} · ${inr(d.amount)}`}
                className={`w-full rounded-md transition-all ${
                  d.isToday
                    ? 'bg-gradient-to-b from-brand-500 to-brand-700'
                    : 'bg-ink-200 group-hover:bg-ink-300'
                }`}
                style={{ height: `${Math.max((d.amount / maxDay) * 100, 4)}%` }}
              />
              <span className={`text-[11px] font-medium ${d.isToday ? 'text-brand-700 font-bold' : 'text-ink-400'}`}>
                {d.label}
              </span>
            </div>
          ))}
        </div>

        {/* One thing worth knowing card */}
        <div className="mt-4 flex items-center justify-between rounded-xl bg-cream-50 p-3 border border-ink-100 text-xs text-ink-600">
          <span>
            <strong className="text-ink-900 font-semibold">One thing worth knowing:</strong>{' '}
            {weekTotal <= prevWeek
              ? `You're on track to spend ${inr(Math.abs(weekTotal - prevWeek))} less than last week.`
              : `Your largest single payment was ${inr(Math.max(...transactions.slice(0, 5).filter(t => t.type === 'debit').map(t => t.amount)))}.`}
          </span>
          <button
            onClick={() => go({ name: 'insights' })}
            className="text-brand-600 font-semibold hover:underline shrink-0 ml-2"
          >
            Details
          </button>
        </div>
      </section>

      {/* Recent transactions */}
      <section className="animate-rise" style={{ animationDelay: '200ms' }}>
        <div className="mb-2 flex items-center justify-between">
          <h2 className="font-display text-[15px] font-semibold text-ink-900">Recent activity</h2>
          <button
            onClick={() => go({ name: 'activity' })}
            className="flex items-center gap-0.5 text-[13px] font-medium text-brand-600 hover:text-brand-700"
          >
            See all <ArrowUpRight size={14} />
          </button>
        </div>
        <Card className="divide-y divide-ink-100 px-2 py-1">
          {transactions.slice(0, 5).map((tx) => (
            <TransactionItem
              key={tx.id}
              tx={tx}
              onClick={() => setSelectedTx(tx)}
            />
          ))}
        </Card>
      </section>

      {/* Savings goals */}
      <section className="animate-rise" style={{ animationDelay: '240ms' }}>
        <div className="mb-2 flex items-center justify-between">
          <h2 className="font-display text-[15px] font-semibold text-ink-900">Savings goals</h2>
          <button
            onClick={() => go({ name: 'goals' })}
            className="flex items-center gap-0.5 text-[13px] font-medium text-brand-600 hover:text-brand-700"
          >
            View all <ChevronRight size={14} />
          </button>
        </div>
        <div className="grid gap-2.5 sm:grid-cols-3">
          {goals.slice(0, 3).map((g) => {
            const pct = (g.saved / g.target) * 100
            return (
              <button
                key={g.id}
                onClick={() => go({ name: 'goalDetail', id: g.id })}
                className="rounded-2xl border border-ink-100 bg-white p-4 text-left shadow-card transition-all hover:-translate-y-0.5 hover:shadow-lift"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xl" aria-hidden>
                    {g.emoji}
                  </span>
                  <span className="tnum text-[13px] font-semibold text-ink-700">
                    {Math.round(pct)}%
                  </span>
                </div>
                <p className="mt-2 truncate text-sm font-semibold text-ink-900">{g.name}</p>
                <p className="tnum mt-0.5 text-xs text-ink-400">
                  {inr(g.saved)} of {inr(g.target)}
                </p>
                <ProgressBar value={pct} hue={g.hue} className="mt-3" />
              </button>
            )
          })}
        </div>
      </section>

      {/* Primary CTA */}
      <section className="animate-rise pb-2 text-center" style={{ animationDelay: '280ms' }}>
        <Button size="lg" onClick={openPayMenu} className="w-full sm:w-auto sm:px-10">
          <Send size={17} /> Send money now
        </Button>
      </section>

      {/* Transaction detail sheet */}
      <BottomSheet open={!!selectedTx} onClose={() => setSelectedTx(null)} title="Transaction details">
        {selectedTx && <TransactionSheet tx={selectedTx} />}
      </BottomSheet>
    </div>
  )
}

function QuickAction({
  icon: Icon,
  label,
  onClick,
  tint,
}: {
  icon: typeof Send
  label: string
  onClick: () => void
  tint: string
}) {
  return (
    <button
      onClick={onClick}
      className="group flex flex-col items-center gap-2 rounded-2xl border border-ink-100 bg-white py-3.5 shadow-card transition-all hover:-translate-y-0.5 hover:shadow-lift active:scale-95"
    >
      <span className={`flex h-11 w-11 items-center justify-center rounded-xl ${tint}`}>
        <Icon size={20} />
      </span>
      <span className="text-xs font-semibold text-ink-800">{label}</span>
    </button>
  )
}
