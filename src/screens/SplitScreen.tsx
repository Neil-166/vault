import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowRight, Check, Scale, UserPlus } from 'lucide-react'
import { Avatar, Button, Chip, Input } from '../components/ui/primitives'
import { BottomSheet } from '../components/ui/BottomSheet'
import { ScreenHeader } from '../components/ScreenHeader'
import { StepProgress } from '../components/StepProgress'
import { SuccessState } from '../components/SuccessState'
import { CONTACTS, useVault, USER } from '../store/useVault'
import { inr } from '../utils/format'

const STEPS = ['Bill', 'People', 'Review', 'Done']

interface Person {
  id: string
  name: string
  initials: string
  hue: number
  isYou?: boolean
}

function equalShares(n: number, total: number): number[] {
  if (n === 0) return []
  const share = Math.floor((total / n) * 100) / 100
  const amounts = Array(n).fill(share)
  amounts[n - 1] = Math.round((total - share * (n - 1)) * 100) / 100
  return amounts
}

export default function SplitScreen() {
  const createBill = useVault((s) => s.createBill)
  const pushToast = useVault((s) => s.pushToast)
  const go = useVault((s) => s.go)
  const back = useVault((s) => s.back)

  const [step, setStep] = useState(0)
  const [title, setTitle] = useState('')
  const [totalStr, setTotalStr] = useState('')
  const [mode, setMode] = useState<'equal' | 'custom'>('equal')
  const [people, setPeople] = useState<Person[]>([{ id: 'you', name: USER.name, initials: USER.initials, hue: USER.hue, isYou: true }])
  const [custom, setCustom] = useState<Record<string, string>>({ you: '' })
  const [pickerOpen, setPickerOpen] = useState(false)
  const [newBillId, setNewBillId] = useState('')

  const total = parseFloat(totalStr) || 0
  const others = people.filter((p) => !p.isYou)
  const titleError = title.trim().length < 2 ? 'Give the bill a short name, e.g. “Dinner at Social”.' : ''
  const totalError = total <= 0 ? 'Enter a bill amount above ₹0.' : ''

  /* amounts for equal mode */
  const equalAmts = equalShares(people.length, total)

  const customSum = people.reduce((sum, p) => sum + (parseFloat(custom[p.id]) || 0), 0)
  const customDiff = total - customSum
  const customOk = Math.abs(customDiff) < 0.01 && people.every((p) => (parseFloat(custom[p.id]) || 0) > 0)

  const detailsValid = !titleError && !totalError
  const amountFor = (p: Person, idx: number) => (mode === 'equal' ? equalAmts[idx] ?? 0 : parseFloat(custom[p.id]) || 0)

  const togglePerson = (id: string) => {
    setPeople((prev) => {
      const exists = prev.some((p) => p.id === id)
      if (exists) return prev.filter((p) => p.id !== id)
      const c = CONTACTS.find((x) => x.id === id)
      if (!c) return prev
      setCustom((cu) => ({ ...cu, [id]: '' }))
      return [...prev, { id: c.id, name: c.name, initials: c.initials, hue: c.hue }]
    })
  }

  const handleContinue = () => {
    if (!detailsValid) return
    setStep(1)
  }

  const handleReview = () => {
    if (people.length < 2) {
      pushToast({ tone: 'warn', title: 'Add at least one friend', body: 'You need at least one other person in the split.' })
      return
    }
    if (mode === 'custom' && !customOk) return
    setStep(2)
  }

  const handleSend = () => {
    if (mode === 'custom' && !customOk) return
    const participants = people.map((p, i) => ({
      name: p.name,
      initials: p.initials,
      hue: p.hue,
      amount: Math.round(amountFor(p, i) * 100) / 100,
      paid: !!p.isYou,
    }))
    const id = createBill({
      title: title.trim(),
      merchant: 'Split with friends',
      total: Math.round(total * 100) / 100,
      splitMode: mode,
      participants,
    })
    setNewBillId(id)
    pushToast({ tone: 'success', title: 'Requests sent', body: `${others.length} friend${others.length === 1 ? '' : 's'} asked to pay.` })
    setStep(3)
  }

  return (
    <div className="-mx-4 -mt-5 min-h-screen bg-white lg:mx-0 lg:mt-0 lg:rounded-3xl lg:border lg:border-ink-100 lg:shadow-card">
      <ScreenHeader title="Split a bill" subtitle={STEPS[step]} onBack={() => (step === 0 ? back() : setStep(step - 1))} />

      <div className="mx-auto max-w-lg px-5 pt-5">
        <StepProgress steps={STEPS} current={step} />
      </div>

      <div className="mx-auto max-w-lg px-5 pb-10 pt-6">
        <AnimatePresence mode="wait">
          {/* ── 0 · Bill details ─────────────────────── */}
          {step === 0 && (
            <motion.div key="sp0" initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }} transition={{ duration: 0.22 }}>
              <h2 className="font-display text-xl font-bold text-ink-950">What are you splitting?</h2>
              <p className="mt-1 text-sm text-ink-400">Keep it short — friends will see this name.</p>

              <div className="mt-5 space-y-4">
                <Input label="Bill name" placeholder="e.g. Dinner at Social" value={title} onChange={(e) => setTitle(e.target.value)} error={step === 0 && titleError || undefined} />
                <Input
                  label="Total amount"
                  placeholder="0"
                  icon={<span className="font-semibold">₹</span>}
                  inputMode="decimal"
                  value={totalStr}
                  onChange={(e) => setTotalStr(e.target.value.replace(/[^0-9.]/g, ''))}
                  error={step === 0 && totalError || undefined}
                />
                <div>
                  <span className="mb-1.5 block text-sm font-medium text-ink-700">Split type</span>
                  <div className="flex gap-2">
                    <Chip active={mode === 'equal'} onClick={() => setMode('equal')}>Equal</Chip>
                    <Chip active={mode === 'custom'} onClick={() => setMode('custom')}>Custom</Chip>
                  </div>
                </div>
              </div>

              <Button size="lg" fullWidth className="mt-7" onClick={handleContinue} disabled={!detailsValid}>
                Continue <ArrowRight size={17} />
              </Button>
            </motion.div>
          )}

          {/* ── 1 · People ───────────────────────────── */}
          {step === 1 && (
            <motion.div key="sp1" initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }} transition={{ duration: 0.22 }}>
              <div className="flex items-center justify-between">
                <h2 className="font-display text-xl font-bold text-ink-950">Who’s in?</h2>
                <span className="text-sm text-ink-400">
                  {people.length} of {Math.max(people.length, 2)}
                </span>
              </div>
              <p className="mt-1 text-sm text-ink-400">You + {people.length - 1} friend{people.length - 1 === 1 ? '' : 's'}.</p>

              <div className="mt-4 space-y-2">
                {people.map((p, i) => {
                  const amt = amountFor(p, i)
                  return (
                    <div key={p.id} className="flex items-center gap-3 rounded-2xl border border-ink-100 bg-white p-3">
                      <Avatar initials={p.initials} hue={p.hue} size={40} />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[15px] font-medium text-ink-900">
                          {p.name}
                          {p.isYou && <span className="ml-2 rounded-full bg-ink-100 px-2 py-0.5 text-[10.5px] font-semibold text-ink-500">You</span>}
                        </p>
                        <p className="tnum text-[13px] text-ink-400">
                          {mode === 'equal' ? `Equal share · ${inr(amt)}` : 'Custom amount'}
                        </p>
                      </div>
                      {mode === 'custom' && !p.isYou ? (
                        <div className="flex items-center">
                          <span className="text-ink-400">₹</span>
                          <input
                            inputMode="decimal"
                            value={custom[p.id] ?? ''}
                            onChange={(e) => setCustom((c) => ({ ...c, [p.id]: e.target.value.replace(/[^0-9.]/g, '') }))}
                            placeholder="0"
                            aria-label={`Amount for ${p.name}`}
                            className="tnum h-9 w-20 rounded-lg border border-ink-200 px-2 text-right text-[15px] font-semibold text-ink-900 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
                          />
                        </div>
                      ) : mode === 'custom' && p.isYou ? (
                        <div className="flex items-center">
                          <span className="text-ink-400">₹</span>
                          <input
                            inputMode="decimal"
                            value={custom[p.id] ?? ''}
                            onChange={(e) => setCustom((c) => ({ ...c, [p.id]: e.target.value.replace(/[^0-9.]/g, '') }))}
                            placeholder="0"
                            aria-label="Your amount"
                            className="tnum h-9 w-20 rounded-lg border border-ink-200 px-2 text-right text-[15px] font-semibold text-ink-900 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
                          />
                        </div>
                      ) : (
                        <span className="tnum text-[15px] font-semibold text-ink-900">{inr(amt)}</span>
                      )}
                    </div>
                  )
                })}
              </div>

              <button
                onClick={() => setPickerOpen(true)}
                className="mt-3 flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-ink-200 py-3.5 text-sm font-semibold text-ink-500 transition-colors hover:border-brand-300 hover:text-brand-600"
              >
                <UserPlus size={17} /> Add friends
              </button>

              {mode === 'custom' && (
                <div className={`mt-4 flex items-center justify-between rounded-xl px-3.5 py-3 text-sm font-medium ${customOk ? 'bg-pos-50 text-pos-700' : 'bg-warn-50 text-warn-700'}`}>
                  <span>Total assigned</span>
                  <span className="tnum font-semibold">
                    {inr(customSum)} of {inr(total)}
                    {!customOk && customDiff !== 0 && ` · ${customDiff > 0 ? '+' : ''}${inr(Math.round(customDiff * 100) / 100)}`}
                  </span>
                </div>
              )}

              <Button size="lg" fullWidth className="mt-6" onClick={handleReview} disabled={mode === 'custom' && !customOk}>
                Review split <ArrowRight size={17} />
              </Button>
            </motion.div>
          )}

          {/* ── 2 · Review ───────────────────────────── */}
          {step === 2 && (
            <motion.div key="sp2" initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }} transition={{ duration: 0.22 }}>
              <h2 className="font-display text-xl font-bold text-ink-950">{title}</h2>
              <p className="tnum mt-1 text-sm text-ink-400">
                {inr(total)} total · {people.length} people · {mode === 'equal' ? 'equal' : 'custom'} split
              </p>

              <div className="mt-5 rounded-2xl border border-ink-100 bg-white">
                {people.map((p, i) => {
                  const amt = amountFor(p, i)
                  return (
                    <div key={p.id} className={`flex items-center gap-3 px-4 py-3 ${i !== 0 ? 'border-t border-ink-100' : ''}`}>
                      <Avatar initials={p.initials} hue={p.hue} size={36} />
                      <span className="flex-1 truncate text-sm font-medium text-ink-800">
                        {p.name}
                        {p.isYou && <span className="ml-2 text-[11px] font-semibold text-ink-400">(paid)</span>}
                      </span>
                      <span className={`tnum text-sm font-semibold ${p.isYou ? 'text-ink-900' : 'text-ink-700'}`}>{inr(amt)}</span>
                    </div>
                  )
                })}
              </div>

              <div className="mt-4 flex items-start gap-2.5 rounded-xl bg-brand-50 p-3.5 text-[13px] leading-snug text-brand-800">
                <Scale size={16} className="mt-0.5 shrink-0 text-brand-600" />
                <span>
                  Requests will be sent to {others.length} friend{others.length === 1 ? '' : 's'}. You’ve already paid your share of {inr(amountFor(people[0], 0))}.
                </span>
              </div>

              <Button size="lg" fullWidth className="mt-6" onClick={handleSend}>
                <Check size={18} /> Send requests
              </Button>
            </motion.div>
          )}

          {/* ── 3 · Success ──────────────────────────── */}
          {step === 3 && (
            <motion.div key="sp3" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <SuccessState
                title="Bill split"
                amount={total}
                subtitle={`${title} · ${people.length} people · ${mode} split`}
                meta={[
                  { label: 'You paid', value: inr(amountFor(people[0], 0)) },
                  { label: `Waiting on ${others.length} friend${others.length === 1 ? '' : 's'}`, value: inr(total - amountFor(people[0], 0)) },
                  { label: 'Status', value: 'Tracking payments' },
                ]}
              >
                <Button size="lg" fullWidth onClick={() => go({ name: 'splitDetail', id: newBillId })}>
                  View split
                </Button>
                <Button size="lg" fullWidth variant="secondary" onClick={() => go({ name: 'home' })}>
                  Done
                </Button>
              </SuccessState>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Friend picker */}
      <BottomSheet open={pickerOpen} onClose={() => setPickerOpen(false)} title="Add friends to this bill">
        <div className="px-5 pb-6 pt-1">
          <p className="mb-3 text-[13px] text-ink-400">Pick who shared the expense.</p>
          <div className="space-y-1">
            {CONTACTS.map((c) => {
              const added = people.some((p) => p.id === c.id)
              return (
                <button
                  key={c.id}
                  onClick={() => togglePerson(c.id)}
                  className="flex w-full items-center gap-3 rounded-xl px-2 py-2.5 text-left transition-colors hover:bg-cream-50"
                >
                  <Avatar initials={c.initials} hue={c.hue} size={40} verified={c.verified} />
                  <span className="flex-1 truncate text-[15px] font-medium text-ink-800">{c.name}</span>
                  <span
                    aria-hidden
                    className={`flex h-6 w-6 items-center justify-center rounded-lg border transition-colors ${
                      added ? 'border-brand-600 bg-brand-600 text-white' : 'border-ink-300 text-transparent'
                    }`}
                  >
                    <Check size={14} />
                  </span>
                </button>
              )
            })}
          </div>
          <div className="mt-4 flex items-center justify-between">
            <span className="text-sm text-ink-500">{people.length} person(s) in this bill</span>
            <Button size="sm" onClick={() => setPickerOpen(false)}>Done</Button>
          </div>
        </div>
      </BottomSheet>
    </div>
  )
}
