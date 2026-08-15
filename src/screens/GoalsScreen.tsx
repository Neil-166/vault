import { useState } from 'react'
import { motion } from 'framer-motion'
import { PiggyBank, Plus, TrendingUp, ShieldCheck } from 'lucide-react'
import { Button, Card, Input, ProgressBar } from '../components/ui/primitives'
import { Modal } from '../components/ui/Modal'
import { EmptyState } from '../components/ui/EmptyState'
import { useVault } from '../store/useVault'
import { inr, monthsUntil, monthYear } from '../utils/format'

export default function GoalsScreen() {
  const goals = useVault((s) => s.goals)
  const createGoal = useVault((s) => s.createGoal)
  const go = useVault((s) => s.go)
  const pushToast = useVault((s) => s.pushToast)

  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
  const [target, setTarget] = useState('')
  const [saved, setSaved] = useState('')
  const [targetDate, setTargetDate] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})

  const totalSaved = goals.reduce((s, g) => s + g.saved, 0)
  const totalTarget = goals.reduce((s, g) => s + g.target, 0)

  const openModal = () => {
    setName('')
    setTarget('')
    setSaved('')
    setTargetDate('')
    setErrors({})
    setOpen(true)
  }

  const handleCreate = () => {
    const e: Record<string, string> = {}
    if (name.trim().length < 2) e.name = 'What are you saving for?'
    const t = parseFloat(target) || 0
    const sv = parseFloat(saved) || 0
    if (t <= 0) e.target = 'Target amount must be above ₹0.'
    if (sv < 0 || sv > t) e.saved = 'Saved amount must be between ₹0 and target.'
    if (!targetDate) e.targetDate = 'Pick your target completion date.'
    if (Object.keys(e).length) {
      setErrors(e)
      return
    }
    createGoal({
      name: name.trim(),
      target: Math.round(t),
      saved: Math.round(sv),
      targetDate: targetDate + '-01',
    })
    setOpen(false)
    pushToast({ tone: 'success', title: 'Goal created', body: `You're on track saving for ${name.trim()}.` })
  }

  const monthly = (g: { saved: number; target: number; targetDate: string }) =>
    Math.max(0, g.target - g.saved) / monthsUntil(g.targetDate)

  return (
    <div className="space-y-5">
      <header className="flex items-end justify-between">
        <div>
          <h1 className="font-display text-[22px] font-bold text-ink-950">Savings goals</h1>
          <p className="mt-0.5 text-sm text-ink-400">Simple plans with clear targets. No streaks, no pressure.</p>
        </div>
        <Button onClick={openModal}>
          <Plus size={17} /> New goal
        </Button>
      </header>

      {/* Summary */}
      {goals.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-3xl bg-gradient-to-br from-brand-700 to-brand-900 p-6 text-white shadow-lift"
        >
          <div className="flex items-center justify-between text-[13px] font-medium text-brand-200">
            <span className="flex items-center gap-1.5"><TrendingUp size={16} /> Total saved across goals</span>
            <span className="rounded-full bg-white/10 px-2.5 py-0.5 text-xs text-white">
              {goals.length} active {goals.length === 1 ? 'goal' : 'goals'}
            </span>
          </div>
          <p className="tnum mt-2 font-display text-[34px] font-bold leading-none">{inr(totalSaved)}</p>
          <div className="mt-4 flex items-center gap-3">
            <div className="h-2 flex-1 overflow-hidden rounded-full bg-white/15">
              <div
                className="h-full rounded-full bg-white transition-all duration-700"
                style={{ width: `${(totalSaved / Math.max(totalTarget, 1)) * 100}%` }}
              />
            </div>
            <span className="tnum text-xs font-semibold text-brand-200">
              {Math.round((totalSaved / Math.max(totalTarget, 1)) * 100)}% of overall target
            </span>
          </div>
        </motion.div>
      )}

      {/* Goal list */}
      {goals.length === 0 ? (
        <Card>
          <EmptyState
            icon={<PiggyBank size={26} />}
            title="Create a goal to give your next big purchase a clear target"
            body="Name what you want, how much you need, and by when. VAULT calculates the monthly pace without any pressure."
            action={<Button onClick={openModal}>Create a goal</Button>}
          />
        </Card>
      ) : (
        <div className="space-y-3">
          {goals.map((g, i) => {
            const pct = (g.saved / g.target) * 100
            const remaining = g.target - g.saved
            return (
              <motion.button
                key={g.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                onClick={() => go({ name: 'goalDetail', id: g.id })}
                className="group flex w-full items-center gap-4 rounded-2xl border border-ink-100 bg-white p-4 text-left shadow-card transition-all hover:-translate-y-0.5 hover:shadow-lift"
              >
                <span
                  className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-2xl shadow-xs"
                  style={{ background: `hsl(${g.hue} 65% 95%)` }}
                  aria-hidden
                >
                  {g.emoji}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex items-center justify-between">
                    <span className="truncate text-[15px] font-semibold text-ink-900">{g.name}</span>
                    <span className="tnum text-[13px] font-bold text-ink-800">{Math.round(pct)}%</span>
                  </span>
                  <span className="tnum mt-0.5 block text-[13px] text-ink-500">
                    {inr(g.saved)} of {inr(g.target)} · <strong className="font-semibold text-ink-700">{inr(remaining)} remaining</strong>
                  </span>
                  <span className="mt-0.5 block text-xs text-ink-400">
                    Target: {monthYear(g.targetDate)}
                  </span>
                  <ProgressBar value={pct} hue={g.hue} className="mt-2.5" />
                </span>
              </motion.button>
            )
          })}
        </div>
      )}

      {goals.length > 0 && (
        <div className="flex items-start gap-2.5 rounded-2xl border border-pos-200 bg-pos-50 p-4">
          <ShieldCheck size={17} className="mt-0.5 shrink-0 text-pos-600" />
          <p className="text-[13px] leading-relaxed text-pos-800">
            <strong className="font-semibold">Goal funds stay in your account:</strong> Moving money into a savings goal reserves it for your plan while keeping it safe and accessible at all times.
          </p>
        </div>
      )}

      {/* Create modal with What? How much? By when? */}
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Start a savings goal"
        footer={
          <Button size="lg" fullWidth onClick={handleCreate}>
            Create goal
          </Button>
        }
      >
        <div className="space-y-4">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-ink-400">Step 1: What do you want?</span>
            <Input className="mt-1" placeholder="e.g. Emergency Fund, New Laptop" value={name} onChange={(e) => setName(e.target.value)} error={errors.name} />
          </div>

          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-ink-400">Step 2: How much?</span>
            <div className="grid grid-cols-2 gap-3 mt-1">
              <Input label="Target amount" placeholder="50,000" inputMode="decimal" value={target} onChange={(e) => setTarget(e.target.value.replace(/[^0-9.]/g, ''))} error={errors.target} />
              <Input label="Already saved" placeholder="0" inputMode="decimal" value={saved} onChange={(e) => setSaved(e.target.value.replace(/[^0-9.]/g, ''))} error={errors.saved} />
            </div>
          </div>

          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-ink-400">Step 3: By when?</span>
            <label htmlFor="goal-date" className="sr-only">Target date</label>
            <input
              id="goal-date"
              type="month"
              value={targetDate}
              onChange={(e) => setTargetDate(e.target.value)}
              className="mt-1 h-12 w-full rounded-xl border border-ink-200 bg-white px-4 text-[15px] text-ink-900 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
            />
            {errors.targetDate && <p className="mt-1.5 text-[13px] font-medium text-danger-600">{errors.targetDate}</p>}
          </div>

          {monthly({ saved: parseFloat(saved) || 0, target: parseFloat(target) || 0, targetDate: targetDate + '-01' }) > 0 && targetDate && (
            <div className="rounded-xl bg-pos-50 p-3.5 text-xs leading-relaxed text-pos-800 border border-pos-200">
              <p className="font-semibold">Calculated monthly pace:</p>
              <p className="mt-0.5">
                Save approximately <span className="tnum font-bold">{inr(Math.round(monthly({ saved: parseFloat(saved) || 0, target: parseFloat(target) || 0, targetDate: targetDate + '-01' }) / 10) * 10)}</span>/month to comfortably reach your goal.
              </p>
            </div>
          )}
        </div>
      </Modal>
    </div>
  )
}
