import { useState } from 'react'
import { motion } from 'framer-motion'
import { Check, PiggyBank, Plus, Trash2, Zap } from 'lucide-react'
import { Button, Card } from '../components/ui/primitives'
import { Modal } from '../components/ui/Modal'
import { ConfirmationDialog } from '../components/ui/ConfirmationDialog'
import { ScreenHeader } from '../components/ScreenHeader'
import { EmptyState } from '../components/ui/EmptyState'
import { TransactionItem } from '../components/TransactionItem'
import { MoneyImpactPreview } from '../components/ui/MoneyImpactPreview'
import { WhyThisAmount } from '../components/ui/WhyThisAmount'
import { useVault } from '../store/useVault'
import { inr, inrFull, monthsBetween, monthsUntil, monthYear } from '../utils/format'

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
        <EmptyState
          icon={<PiggyBank size={26} />}
          title="Goal not found"
          body="This goal may have been completed or removed."
          action={<Button onClick={() => go({ name: 'goals' })}>Back to goals</Button>}
        />
      </div>
    )
  }

  const amount = parseFloat(amountStr) || 0
  const remaining = goal.target - goal.saved
  const pct = (goal.saved / goal.target) * 100
  const requiredMonthly = remaining / monthsUntil(goal.targetDate)

  /* Pace calculation: linear expected progress from creation to target date */
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
      pushToast({ tone: 'error', title: "Couldn't add money", body: res.error })
      return
    }
    setAddOpen(false)
    setAmountStr('')
    pushToast({
      tone: 'success',
      title: 'Added to savings goal',
      body: `${inr(amount)} safely allocated to ${goal.name}.`,
    })
  }

  return (
    <div className="-mx-4 -mt-5 min-h-screen bg-white lg:mx-0 lg:mt-0 lg:rounded-3xl lg:border lg:border-ink-100 lg:shadow-card">
      <ScreenHeader title="Goal details" subtitle="What, How much, By when" />

      <div className="mx-auto max-w-lg px-5 pb-12 pt-6 space-y-5">
        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="overflow-hidden rounded-3xl p-6 text-white shadow-lift"
          style={{
            background: `linear-gradient(135deg, hsl(${goal.hue} 55% 30%), hsl(${goal.hue} 60% 18%))`,
          }}
        >
          <div className="flex items-start justify-between">
            <span className="text-3xl" aria-hidden>{goal.emoji}</span>
            <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-semibold">
              {Math.round(pct)}% saved
            </span>
          </div>
          <h2 className="mt-3 font-display text-2xl font-bold">{goal.name}</h2>
          <p className="tnum mt-1 font-display text-[38px] font-bold leading-none">{inr(goal.saved)}</p>
          <p className="mt-1.5 text-sm text-white/75">of {inr(goal.target)} target</p>

          <div className="mt-5 h-2.5 overflow-hidden rounded-full bg-white/20">
            <div
              className="h-full rounded-full bg-white transition-all duration-700"
              style={{ width: `${pct}%` }}
            />
          </div>
        </motion.div>

        {/* Goal completion celebration */}
        {pct >= 100 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: 'spring', damping: 14 }}
            className="rounded-2xl border border-pos-200 bg-pos-50 p-5 text-center shadow-xs"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', damping: 12, delay: 0.1 }}
              className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-pos-500 text-white"
            >
              <Check size={28} />
            </motion.div>
            <p className="font-display text-lg font-bold text-pos-900">Target reached!</p>
            <p className="tnum mt-1 text-sm text-pos-800">
              {inr(goal.target)} successfully saved. Your money is ready whenever you are.
            </p>
          </motion.div>
        )}

        {/* 3 Pillars: What, How much, By when */}
        <div className="grid grid-cols-3 gap-2.5">
          <Stat label="Remaining" value={inr(Math.max(0, remaining))} />
          <Stat label="Monthly pace" value={`~${inr(Math.round(requiredMonthly / 10) * 10)}`} />
          <Stat label="Target date" value={monthYear(goal.targetDate)} small />
        </div>

        {/* Realistic Pace Projection */}
        <div
          className={`rounded-2xl border p-4 shadow-xs ${
            onTrack ? 'border-pos-200 bg-pos-50' : 'border-warn-200 bg-warn-50'
          }`}
        >
          <p className={`text-sm font-semibold ${onTrack ? 'text-pos-900' : 'text-warn-900'}`}>
            {onTrack ? "At your current pace, you're on track." : 'A small adjustment will get you there.'}
          </p>
          <p className={`mt-1 text-[13px] leading-relaxed ${onTrack ? 'text-pos-800' : 'text-warn-800'}`}>
            {onTrack
              ? `You are right on schedule to reach your target by ${monthYear(goal.targetDate)}.`
              : `To reach ${inr(goal.target)} by ${monthYear(goal.targetDate)}, save about ${inr(
                  Math.round(requiredMonthly / 10) * 10,
                )} a month. You are ${inr(Math.round(behindBy))} behind pace — no stress, regular small amounts add up.`}
          </p>
        </div>

        {/* Why this suggested pace calculation breakdown */}
        <WhyThisAmount
          title="Why this suggested monthly pace?"
          items={[
            { label: 'Target amount', amount: goal.target },
            { label: 'Already saved', amount: goal.saved, isDeduction: true },
            { label: 'Remaining to save', amount: Math.max(0, remaining), isSubtotal: true },
            { label: `Months until ${monthYear(goal.targetDate)}`, amount: monthsUntil(goal.targetDate), note: 'Target deadline' },
          ]}
          total={Math.round(requiredMonthly / 10) * 10}
          totalLabel="Suggested monthly pace"
          formulaExplanation={`Calculation: ${inr(Math.max(0, remaining))} remaining ÷ ${monthsUntil(goal.targetDate)} months = ~${inr(Math.round(requiredMonthly / 10) * 10)}/month. This is a non-binding suggestion to help you plan.`}
        />

        {/* Primary and secondary actions */}
        <div className="grid grid-cols-2 gap-2.5 pt-1">
          <Button size="lg" onClick={() => setAddOpen(true)}>
            <Plus size={17} /> Add money
          </Button>
          <Button size="lg" variant="secondary" onClick={() => setConfirmDelete(true)}>
            <Trash2 size={17} /> Delete goal
          </Button>
        </div>

        {/* Contributions History */}
        <div>
          <h3 className="mb-2 font-display text-[15px] font-semibold text-ink-900">
            Recent contributions
          </h3>
          {contributions.length === 0 ? (
            <Card>
              <EmptyState
                icon={<PiggyBank size={22} />}
                title="No contributions yet"
                body="Money you add to this goal will show up here."
              />
            </Card>
          ) : (
            <Card className="divide-y divide-ink-100 px-2 py-1 shadow-card">
              {contributions.slice(0, 6).map((tx) => (
                <TransactionItem key={tx.id} tx={tx} onClick={() => go({ name: 'transaction', id: tx.id })} />
              ))}
            </Card>
          )}
        </div>

        <p className="text-center text-xs text-ink-400">
          Available to spend: <span className="tnum font-semibold text-ink-700">{inrFull(balance)}</span>
        </p>
      </div>

      {/* Add money modal */}
      <Modal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        title={`Add money to ${goal.name}`}
        footer={
          <Button size="lg" fullWidth onClick={handleAdd} disabled={amount <= 0 || amount > balance}>
            <Zap size={17} /> Move {amount > 0 ? inr(amount) : ''} to goal
          </Button>
        }
      >
        <div className="flex flex-col items-center py-2 space-y-4">
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

          <div className="flex gap-2">
            {[1000, 2500, 5000].map((q) => (
              <button
                key={q}
                onClick={() => setAmountStr(String(q))}
                className={`rounded-full border px-4 py-2 text-sm font-semibold transition-colors ${
                  amount === q
                    ? 'border-brand-500 bg-brand-50 text-brand-700'
                    : 'border-ink-200 text-ink-600 hover:border-brand-300'
                }`}
              >
                ₹{q.toLocaleString('en-IN')}
              </button>
            ))}
          </div>

          {amount > 0 && (
            <div className="w-full">
              <MoneyImpactPreview
                currentBalance={balance}
                amount={amount}
                fee={0}
                type="debit"
                label="Allocated to goal"
                explanation={`Moving ${inr(amount)} into ${goal.name} reserves it for your plan. You will have ${inrFull(balance - amount)} free to spend.`}
                compact
              />
            </div>
          )}
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
        title="Delete this savings goal?"
        confirmLabel="Yes, delete goal"
        tone="danger"
      >
        You will stop tracking progress for <strong className="font-semibold text-ink-900">{goal.name}</strong>. All saved funds remain safely in your account.
      </ConfirmationDialog>
    </div>
  )
}

function Stat({ label, value, small }: { label: string; value: string; small?: boolean }) {
  return (
    <div className="rounded-2xl border border-ink-100 bg-white p-3.5 text-center shadow-card">
      <p
        className={`tnum font-display font-bold text-ink-950 ${
          small ? 'text-[13px] leading-tight' : 'text-[16px]'
        }`}
      >
        {value}
      </p>
      <p className="mt-0.5 text-[11px] font-medium uppercase tracking-wide text-ink-400">{label}</p>
    </div>
  )
}

function monthYearToDate(): string {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-01`
}
