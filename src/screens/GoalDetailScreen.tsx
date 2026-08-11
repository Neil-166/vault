import { useState } from 'react'
import { motion } from 'framer-motion'
import { Check, PiggyBank, Plus, Trash2 } from 'lucide-react'
import { Button, Card } from '../components/ui/primitives'
import { Modal } from '../components/ui/Modal'
import { ConfirmationDialog } from '../components/ui/ConfirmationDialog'
import { ScreenHeader } from '../components/ScreenHeader'
import { EmptyState } from '../components/ui/EmptyState'
import { TransactionItem } from '../components/TransactionItem'
import { useVault } from '../store/useVault'
import { inr, monthsBetween, monthsUntil, monthYear } from '../utils/format'

export default function GoalDetailScreen() {
  const goal = useVault((s) => s.goals.find((g) => (s.route.name === 'goalDetail' ? g.id === s.route.id : false)))
  const balance = useVault((s) => s.balance)
  const addToGoal = useVault((s) => s.addToGoal)
  const deleteGoal = useVault((s) => s.deleteGoal)
  const pushToast = useVault((s) => s.pushToast)
  const go = useVault((s) => s.go)
  const transactions = useVault((s) => s.transactions)

  const [addOpen, setAddOpen] = useState(false)
  const [amountStr, setAmountStr] = useState('')
  const [confirmDelete, setConfirmDelete] = useState(false)

  if (!goal) {
    return (
      <div className="-mx-4 -mt-5 min-h-screen bg-white lg:mx-0 lg:mt-0 lg:rounded-3xl lg:border lg:border-ink-100 lg:shadow-card">
        <ScreenHeader title="Goal" />
        <EmptyState icon={<PiggyBank size={26} />} title="Goal not found" body="It may have been removed." action={<Button onClick={() => go({ name: 'goals' })}>Back to goals</Button>} />
      </div>
    )
  }

  const amount = parseFloat(amountStr) || 0
  const remaining = goal.target - goal.saved
  const pct = (goal.saved / goal.target) * 100
  const requiredMonthly = remaining / monthsUntil(goal.targetDate)

  /* Pace: linear expected progress from creation to target date */
  const totalMonths = monthsBetween(goal.createdAt, goal.targetDate)
  const elapsed = monthsBetween(goal.createdAt, monthYearToDate())
  const expected = goal.target * (elapsed / totalMonths)
  const onTrack = goal.saved >= expected
  const behindBy = Math.max(0, expected - goal.saved)

  const contributions = transactions.filter((t) => t.category === 'Savings' && t.merchant === goal.name)

  const handleAdd = () => {
    if (amount <= 0) return
    const res = addToGoal(goal.id, amount)
    if (!res.ok) {
      pushToast({ tone: 'error', title: 'Couldn’t add money', body: res.error })
      return
    }
    setAddOpen(false)
    setAmountStr('')
    pushToast({ tone: 'success', title: 'Added to goal', body: `${inr(amount)} moved to ${goal.name}.` })
  }

  return (
    <div className="-mx-4 -mt-5 min-h-screen bg-white lg:mx-0 lg:mt-0 lg:rounded-3xl lg:border lg:border-ink-100 lg:shadow-card">
      <ScreenHeader title="Goal details" />

      <div className="mx-auto max-w-lg px-5 pb-12 pt-6">
        {/* Hero */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="overflow-hidden rounded-3xl p-5 text-white shadow-lift" style={{ background: `linear-gradient(135deg, hsl(${goal.hue} 55% 32%), hsl(${goal.hue} 60% 20%))` }}>
          <div className="flex items-start justify-between">
            <span className="text-3xl" aria-hidden>{goal.emoji}</span>
            <span className="rounded-full bg-white/15 px-2.5 py-1 text-xs font-semibold">{Math.round(pct)}% saved</span>
          </div>
          <h2 className="mt-3 font-display text-2xl font-bold">{goal.name}</h2>
          <p className="tnum mt-1 font-display text-[34px] font-bold leading-none">{inr(goal.saved)}</p>
          <p className="mt-1 text-sm text-white/70">of {inr(goal.target)} target</p>
          <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/20">
            <div className="h-full rounded-full bg-white transition-all duration-700" style={{ width: `${pct}%` }} />
          </div>
        </motion.div>

        {/* Goal completion celebration */}
        {pct >= 100 && (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ type: 'spring', damping: 14 }} className="mt-4 rounded-2xl border border-pos-200 bg-pos-50 p-5 text-center">
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', damping: 12, delay: 0.1 }} className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-pos-500 text-white">
              <Check size={28} />
            </motion.div>
            <p className="font-display text-lg font-bold text-pos-800">Goal reached</p>
            <p className="tnum mt-1 text-sm text-pos-700">{inr(goal.target)} saved · Target reached ✓</p>
          </motion.div>
        )}

        {/* Stats */}
        <div className="mt-4 grid grid-cols-3 gap-2.5">
          <Stat label="Remaining" value={inr(Math.max(0, remaining))} />
          <Stat label="Per month" value={`~${inr(Math.round(requiredMonthly / 10) * 10)}`} />
          <Stat label="Target date" value={monthYear(goal.targetDate)} small />
        </div>

        {/* Helpful message */}
        <div className={`mt-4 rounded-2xl border p-4 ${onTrack ? 'border-pos-200 bg-pos-50' : 'border-warn-200 bg-warn-50'}`}>
          <p className={`text-sm font-semibold ${onTrack ? 'text-pos-800' : 'text-warn-800'}`}>
            {onTrack ? 'You’re right on track' : 'A little behind the pace'}
          </p>
          <p className={`mt-1 text-[13px] leading-relaxed ${onTrack ? 'text-pos-700' : 'text-warn-700'}`}>
            {onTrack
              ? `Keep it up — you’re ahead of schedule for ${monthYear(goal.targetDate)}.`
              : `To reach ${inr(goal.target)} by ${monthYear(goal.targetDate)}, save about ${inr(Math.round(requiredMonthly / 10) * 10)} a month. You’re ${inr(Math.round(behindBy))} behind pace — no stress, a small regular amount gets you there.`}
          </p>
        </div>

        {/* Actions */}
        <div className="mt-5 grid grid-cols-2 gap-2.5">
          <Button size="lg" onClick={() => setAddOpen(true)}>
            <Plus size={17} /> Add money
          </Button>
          <Button size="lg" variant="danger" onClick={() => setConfirmDelete(true)}>
            <Trash2 size={17} /> Delete goal
          </Button>
        </div>

        {/* Contributions */}
        <h3 className="mt-7 mb-2 font-display text-[15px] font-semibold text-ink-900">Recent contributions</h3>
        {contributions.length === 0 ? (
          <Card>
            <EmptyState icon={<PiggyBank size={22} />} title="No contributions yet" body="Money you add to this goal will show up here." />
          </Card>
        ) : (
          <Card className="divide-y divide-ink-100 px-2 py-1">
            {contributions.slice(0, 6).map((tx) => (
              <TransactionItem key={tx.id} tx={tx} onClick={() => go({ name: 'transaction', id: tx.id })} />
            ))}
          </Card>
        )}

        <p className="mt-6 text-center text-xs text-ink-400">
          Available balance <span className="tnum font-semibold text-ink-600">{inr(balance)}</span>
        </p>
      </div>

      {/* Add money modal */}
      <Modal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        title={`Add to ${goal.name}`}
        footer={
          <Button size="lg" fullWidth onClick={handleAdd} disabled={amount <= 0}>
            Move {amount > 0 ? inr(amount) : ''} to goal
          </Button>
        }
      >
        <div className="flex flex-col items-center py-2">
          <div className="flex items-center gap-2">
            <span className="font-display text-3xl font-bold text-ink-400">₹</span>
            <input
              autoFocus
              inputMode="decimal"
              type="text"
              value={amountStr}
              onChange={(e) => setAmountStr(e.target.value.replace(/[^0-9.]/g, ''))}
              placeholder="0"
              aria-label="Amount to save"
              className="tnum w-40 border-0 bg-transparent text-center font-display text-[44px] font-bold text-ink-950 placeholder:text-ink-200 focus:outline-none focus:ring-0"
            />
          </div>
          <div className="mt-4 flex gap-2">
            {[1000, 2500, 5000].map((q) => (
              <button key={q} onClick={() => setAmountStr(String(q))} className={`rounded-full border px-4 py-2 text-sm font-semibold transition-colors ${amount === q ? 'border-brand-500 bg-brand-50 text-brand-700' : 'border-ink-200 text-ink-600'}`}>
                ₹{q.toLocaleString('en-IN')}
              </button>
            ))}
          </div>
          <p className="tnum mt-5 text-[13px] text-ink-400">
            Balance after: <span className="font-semibold text-ink-700">{inr(balance - amount)}</span>
          </p>
        </div>
      </Modal>

      {/* Delete confirm */}
      <ConfirmationDialog
        open={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        onConfirm={() => {
          deleteGoal(goal.id)
          go({ name: 'goals' })
        }}
        title="Delete this goal?"
        confirmLabel="Yes, delete"
        tone="danger"
      >
        You’ll lose the progress tracking for <span className="font-semibold text-ink-900">{goal.name}</span>. Money already saved stays in your balance.
      </ConfirmationDialog>
    </div>
  )
}

function Stat({ label, value, small }: { label: string; value: string; small?: boolean }) {
  return (
    <div className="rounded-2xl border border-ink-100 bg-white p-3 text-center shadow-card">
      <p className={`tnum font-display font-bold text-ink-900 ${small ? 'text-[12px] leading-tight' : 'text-[15px]'}`}>{value}</p>
      <p className="mt-0.5 text-[11px] font-medium uppercase tracking-wide text-ink-400">{label}</p>
    </div>
  )
}

function monthYearToDate(): string {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-01`
}
