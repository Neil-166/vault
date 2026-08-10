import { useState } from 'react'
import { motion } from 'framer-motion'
import { PiggyBank, Plus, Sparkles, TrendingUp } from 'lucide-react'
import { Button, Card, Input, ProgressBar } from '../components/ui/primitives'
import { Modal } from '../components/ui/Modal'
import { EmptyState } from '../components/ui/EmptyState'
import { useVault } from '../store/useVault'
import { inr, monthsUntil } from '../utils/format'

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
    if (name.trim().length < 2) e.name = 'Give your goal a name.'
    const t = parseFloat(target) || 0
    const sv = parseFloat(saved) || 0
    if (t <= 0) e.target = 'Target must be above ₹0.'
    if (sv < 0 || sv > t) e.saved = 'Current amount must be between ₹0 and the target.'
    if (!targetDate) e.targetDate = 'Pick a target date.'
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
    pushToast({ tone: 'success', title: 'Goal created', body: `You’re saving for ${name.trim()}.` })
  }

  const monthly = (g: { saved: number; target: number; targetDate: string }) =>
    Math.max(0, g.target - g.saved) / monthsUntil(g.targetDate)

  return (
    <div className="space-y-5">
      <header className="flex items-end justify-between">
        <div>
          <h1 className="font-display text-[22px] font-bold text-ink-950">Savings goals</h1>
          <p className="mt-0.5 text-sm text-ink-400">Small, steady steps. No streaks, no pressure.</p>
        </div>
        <Button onClick={openModal}>
          <Plus size={17} /> New goal
        </Button>
      </header>

      {/* Summary */}
      {goals.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl bg-gradient-to-br from-brand-700 to-brand-900 p-5 text-white shadow-lift">
          <div className="flex items-center gap-2 text-[13px] font-medium text-brand-200">
            <TrendingUp size={16} /> Total saved across goals
          </div>
          <p className="tnum mt-1.5 font-display text-[28px] font-bold leading-none">{inr(totalSaved)}</p>
          <div className="mt-3 flex items-center gap-3">
            <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/15">
              <div className="h-full rounded-full bg-white/90 transition-all duration-700" style={{ width: `${(totalSaved / Math.max(totalTarget, 1)) * 100}%` }} />
            </div>
            <span className="tnum text-xs text-brand-200">{Math.round((totalSaved / Math.max(totalTarget, 1)) * 100)}% of overall target</span>
          </div>
        </motion.div>
      )}

      {/* Goal list */}
      {goals.length === 0 ? (
        <Card>
          <EmptyState
            icon={<PiggyBank size={26} />}
            title="Start your first savings goal"
            body="Whether it’s a MacBook, a vacation or a rainy day — name it, set a target, and see what you need to save each month."
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
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-2xl" style={{ background: `hsl(${g.hue} 65% 95%)` }} aria-hidden>
                  {g.emoji}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex items-center justify-between">
                    <span className="truncate text-[15px] font-semibold text-ink-900">{g.name}</span>
                    <span className="tnum text-[13px] font-semibold text-ink-700">{Math.round(pct)}%</span>
                  </span>
                  <span className="tnum mt-0.5 block text-[13px] text-ink-400">
                    {inr(g.saved)} of {inr(g.target)} · {inr(remaining)} to go
                  </span>
                  <ProgressBar value={pct} hue={g.hue} className="mt-2" />
                </span>
              </motion.button>
            )
          })}
        </div>
      )}

      {goals.length > 0 && (
        <div className="flex items-start gap-2.5 rounded-2xl border border-brand-100 bg-brand-50 p-4">
          <Sparkles size={17} className="mt-0.5 shrink-0 text-brand-600" />
          <p className="text-[13px] leading-relaxed text-brand-800">
            <span className="font-semibold">A realistic plan:</span> open any goal to see exactly how much to save each month to reach it by the target date.
          </p>
        </div>
      )}

      {/* Create modal */}
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="New savings goal"
        footer={
          <Button size="lg" fullWidth onClick={handleCreate}>
            Create goal
          </Button>
        }
      >
        <div className="space-y-4">
          <Input label="Goal name" placeholder="e.g. New Laptop" value={name} onChange={(e) => setName(e.target.value)} error={errors.name} />
          <div className="grid grid-cols-2 gap-3">
            <Input label="Target amount" placeholder="80,000" inputMode="decimal" value={target} onChange={(e) => setTarget(e.target.value.replace(/[^0-9.]/g, ''))} error={errors.target} />
            <Input label="Already saved" placeholder="0" inputMode="decimal" value={saved} onChange={(e) => setSaved(e.target.value.replace(/[^0-9.]/g, ''))} error={errors.saved} />
          </div>
          <div>
            <label htmlFor="goal-date" className="mb-1.5 block text-sm font-medium text-ink-700">Target date</label>
            <input
              id="goal-date"
              type="month"
              value={targetDate}
              onChange={(e) => setTargetDate(e.target.value)}
              className="h-12 w-full rounded-xl border border-ink-200 bg-white px-4 text-[15px] text-ink-900 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
            />
            {errors.targetDate && <p className="mt-1.5 text-[13px] font-medium text-danger-600">{errors.targetDate}</p>}
          </div>
          {monthly({ saved: parseFloat(saved) || 0, target: parseFloat(target) || 0, targetDate: targetDate + '-01' }) > 0 && targetDate && (
            <p className="rounded-xl bg-pos-50 px-3.5 py-2.5 text-[13px] font-medium text-pos-700">
              Save approximately{' '}
              <span className="tnum font-bold">{inr(Math.round(monthly({ saved: parseFloat(saved) || 0, target: parseFloat(target) || 0, targetDate: targetDate + '-01' }) / 10) * 10)}</span>
              /month to reach this goal.
            </p>
          )}
        </div>
      </Modal>
    </div>
  )
}
