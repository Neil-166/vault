import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowRight, Check, Plus, ShieldCheck, UserPlus, X } from 'lucide-react'
import { Avatar, Button, Chip, Input } from '../components/ui/primitives'
import { BottomSheet } from '../components/ui/BottomSheet'
import { ScreenHeader } from '../components/ScreenHeader'
import { StepProgress } from '../components/StepProgress'
import { SuccessState } from '../components/SuccessState'
import { FeeBreakdown } from '../components/ui/FeeBreakdown'
import { WhyThisAmount } from '../components/ui/WhyThisAmount'
import { CONTACTS, useVault, USER } from '../store/useVault'
import { inr } from '../utils/format'

const STEPS = ['Bill Details', 'Participants', 'Review Share', 'Done']

interface Person {
  id: string
  name: string
  initials: string
  hue: number
  isYou?: boolean
}

interface SplitItem {
  id: string
  name: string
  amount: number
  assignedIds: string[]
}

function equalShares(n: number, total: number): number[] {
  if (n === 0) return []
  const share = Math.floor((total / n) * 100) / 100
  const amounts = Array(n).fill(share)
  amounts[n - 1] = Math.round((total - share * (n - 1)) * 100) / 100
  return amounts
}

function itemTotals(people: Person[], items: SplitItem[]): Map<string, number> {
  const totals = new Map<string, number>()
  people.forEach((p) => totals.set(p.id, 0))
  for (const item of items) {
    const count = item.assignedIds.length || 1
    const share = item.amount / count
    for (const pid of item.assignedIds) {
      totals.set(pid, (totals.get(pid) ?? 0) + share)
    }
  }
  return totals
}

let itemCounter = 0

export default function SplitScreen() {
  const createBill = useVault((s) => s.createBill)
  const pushToast = useVault((s) => s.pushToast)
  const go = useVault((s) => s.go)
  const back = useVault((s) => s.back)

  const [step, setStep] = useState(0)
  const [title, setTitle] = useState('')
  const [totalStr, setTotalStr] = useState('')
  const [mode, setMode] = useState<'equal' | 'custom' | 'item'>('equal')
  const [people, setPeople] = useState<Person[]>([{ id: 'you', name: USER.name, initials: USER.initials, hue: USER.hue, isYou: true }])
  const [custom, setCustom] = useState<Record<string, string>>({ you: '' })
  const [items, setItems] = useState<SplitItem[]>([])
  const [pickerOpen, setPickerOpen] = useState(false)
  const [itemModal, setItemModal] = useState(false)
  const [itemName, setItemName] = useState('')
  const [itemAmount, setItemAmount] = useState('')
  const [itemPeople, setItemPeople] = useState<string[]>([])
  const [newBillId, setNewBillId] = useState('')

  const total = parseFloat(totalStr) || 0
  const others = people.filter((p) => !p.isYou)
  const titleError = title.trim().length < 2 ? 'What was this bill for? (e.g. "Dinner at Social")' : ''
  const totalError = total <= 0 ? 'Enter a total bill amount above ₹0.' : ''

  const equalAmts = equalShares(people.length, total)
  const itemTotalsMap = mode === 'item' ? itemTotals(people, items) : new Map()
  const itemSum = [...itemTotalsMap.values()].reduce((a, b) => a + b, 0)

  const customSum = people.reduce((sum, p) => sum + (parseFloat(custom[p.id]) || 0), 0)
  const customDiff = total - customSum
  const customOk = Math.abs(customDiff) < 0.01 && people.every((p) => (parseFloat(custom[p.id]) || 0) > 0)

  const itemOk = items.length > 0 && people.every((p) => (itemTotalsMap.get(p.id) ?? 0) > 0)
  const detailsValid = !titleError && !totalError

  const amountFor = (p: Person, idx: number) => {
    if (mode === 'equal') return equalAmts[idx] ?? 0
    if (mode === 'item') return itemTotalsMap.get(p.id) ?? 0
    return parseFloat(custom[p.id]) || 0
  }

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

  const addItem = () => {
    if (!itemName.trim() || !itemAmount || parseFloat(itemAmount) <= 0 || itemPeople.length === 0) return
    setItems((prev) => [...prev, { id: `item-${++itemCounter}`, name: itemName.trim(), amount: parseFloat(itemAmount), assignedIds: [...itemPeople] }])
    setItemName('')
    setItemAmount('')
    setItemPeople([])
    setItemModal(false)
  }

  const removeItem = (id: string) => setItems((prev) => prev.filter((i) => i.id !== id))

  const handleContinue = () => {
    if (!detailsValid) return
    setStep(1)
  }

  const handleReview = () => {
    if (people.length < 2) {
      pushToast({ tone: 'warn', title: 'Add at least one person', body: 'Select who was involved in this bill.' })
      return
    }
    if (mode === 'custom' && !customOk) return
    if (mode === 'item' && !itemOk) {
      pushToast({ tone: 'warn', title: 'Assign all items', body: 'Add items and make sure each person has an assigned item.' })
      return
    }
    setStep(2)
  }

  const handleSend = () => {
    if (mode === 'custom' && !customOk) return
    if (mode === 'item' && !itemOk) return
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
    pushToast({ tone: 'success', title: 'Requests sent', body: `${others.length} friend${others.length === 1 ? '' : 's'} notified with their calculated share.` })
    setStep(3)
  }

  return (
    <div className="-mx-4 -mt-5 min-h-screen bg-white lg:mx-0 lg:mt-0 lg:rounded-3xl lg:border lg:border-ink-100 lg:shadow-card">
      <ScreenHeader title="Start a split" subtitle={STEPS[step]} onBack={() => (step === 0 ? back() : setStep(step - 1))} />
      <div className="mx-auto max-w-lg px-5 pt-5">
        <StepProgress steps={STEPS} current={step} />
      </div>

      <div className="mx-auto max-w-lg px-5 pb-10 pt-6">
        <AnimatePresence mode="wait">
          {/* ── 0 · Bill details ─────────────────────── */}
          {step === 0 && (
            <motion.div key="sp0" initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }} transition={{ duration: 0.22 }}>
              <h2 className="font-display text-xl font-bold text-ink-950">What was the bill for?</h2>
              <p className="mt-1 text-sm text-ink-400">Give it a short, recognizable name for everyone involved.</p>
              <div className="mt-5 space-y-4">
                <Input label="What was the bill for?" placeholder="e.g. Dinner at Social" value={title} onChange={(e) => setTitle(e.target.value)} error={step === 0 && titleError || undefined} />
                <Input label="Total bill amount" placeholder="0" icon={<span className="font-semibold">₹</span>} inputMode="decimal" value={totalStr} onChange={(e) => setTotalStr(e.target.value.replace(/[^0-9.]/g, ''))} error={step === 0 && totalError || undefined} />
                <div>
                  <span className="mb-1.5 block text-sm font-medium text-ink-700">How should it be split?</span>
                  <div className="flex flex-wrap gap-2">
                    <Chip active={mode === 'equal'} onClick={() => setMode('equal')}>Equal split</Chip>
                    <Chip active={mode === 'custom'} onClick={() => setMode('custom')}>Custom shares</Chip>
                    <Chip active={mode === 'item'} onClick={() => setMode('item')}>By item</Chip>
                  </div>
                </div>
              </div>

              {total > 0 && (
                <div className="mt-5">
                  <FeeBreakdown amount={total} fee={0} feeLabel="Split processing fee" totalLabel="Total bill" />
                </div>
              )}

              <Button size="lg" fullWidth className="mt-7" onClick={handleContinue} disabled={!detailsValid}>Continue <ArrowRight size={17} /></Button>
            </motion.div>
          )}

          {/* ── 1 · People + Items ───────────────────── */}
          {step === 1 && (
            <motion.div key="sp1" initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }} transition={{ duration: 0.22 }}>
              <div className="flex items-center justify-between">
                <h2 className="font-display text-xl font-bold text-ink-950">Who was involved?</h2>
                <span className="text-sm font-medium text-ink-500">{people.length} people</span>
              </div>
              <p className="mt-1 text-sm text-ink-400">Select participants to divide the total bill of {inr(total)}.</p>

              <div className="mt-4 space-y-2">
                {people.map((p, i) => {
                  const amt = amountFor(p, i)
                  return (
                    <div key={p.id} className="flex items-center gap-3 rounded-2xl border border-ink-100 bg-white p-3 shadow-xs">
                      <Avatar initials={p.initials} hue={p.hue} size={40} />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[15px] font-medium text-ink-900">
                          {p.name}
                          {p.isYou && <span className="ml-2 rounded-full bg-brand-50 text-brand-700 px-2 py-0.5 text-[10.5px] font-semibold">You (Paid)</span>}
                        </p>
                        <p className="tnum text-[13px] text-ink-400">
                          {mode === 'equal' ? `Equal share · ${inr(amt)}` : mode === 'item' ? `Assigned items · ${inr(amt)}` : 'Custom share'}
                        </p>
                      </div>
                      {mode === 'custom' ? (
                        <div className="flex items-center">
                          <span className="text-ink-400 font-semibold mr-1">₹</span>
                          <input inputMode="decimal" value={custom[p.id] ?? ''} onChange={(e) => setCustom((c) => ({ ...c, [p.id]: e.target.value.replace(/[^0-9.]/g, '') }))} placeholder="0" aria-label={`Amount for ${p.name}`} className="tnum h-9 w-24 rounded-lg border border-ink-200 px-2 text-right text-[15px] font-semibold text-ink-900 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100" />
                        </div>
                      ) : (
                        <span className="tnum text-[15px] font-bold text-ink-950">{inr(amt)}</span>
                      )}
                    </div>
                  )
                })}
              </div>

              <button onClick={() => setPickerOpen(true)} className="mt-3 flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-ink-200 py-3.5 text-sm font-semibold text-ink-600 transition-colors hover:border-brand-300 hover:text-brand-600">
                <UserPlus size={17} /> Add participants
              </button>

              {/* Item mode: items list */}
              {mode === 'item' && (
                <div className="mt-5">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-semibold text-ink-800">Items ({items.length})</h3>
                    {items.length > 0 && <span className="tnum text-xs text-ink-400">{inr(itemSum)} of {inr(total)} assigned</span>}
                  </div>
                  {items.map((item) => (
                    <div key={item.id} className="flex items-center gap-2 rounded-xl border border-ink-100 bg-white p-3 mb-1.5">
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-ink-900">{item.name}</p>
                        <p className="tnum text-[12px] text-ink-400">
                          {inr(item.amount)} · split {item.assignedIds.length} way{item.assignedIds.length !== 1 ? 's' : ''}
                        </p>
                      </div>
                      <span className="tnum text-sm font-semibold text-ink-800">{inr(item.amount / item.assignedIds.length)}/each</span>
                      <button onClick={() => removeItem(item.id)} className="ml-1 rounded-lg p-1 text-ink-400 hover:bg-danger-50 hover:text-danger-600" aria-label={`Remove ${item.name}`}>
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                  <button onClick={() => setItemModal(true)} className="flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-ink-200 py-3 text-sm font-semibold text-ink-500 transition-colors hover:border-brand-300 hover:text-brand-600 mt-2">
                    <Plus size={16} /> Add item
                  </button>
                </div>
              )}

              {mode === 'custom' && (
                <div className={`mt-4 rounded-xl p-3.5 text-xs ${customOk ? 'bg-pos-50 border border-pos-200 text-pos-800' : 'bg-warn-50 border border-warn-200 text-warn-900'}`}>
                  <div className="flex items-center justify-between font-semibold">
                    <span>{customOk ? 'Split balanced ✓' : customDiff > 0 ? `Split is ${inr(customDiff)} short` : `Split is ${inr(Math.abs(customDiff))} over`}</span>
                    <span className="tnum">
                      {inr(customSum)} of {inr(total)}
                    </span>
                  </div>
                  {!customOk && (
                    <div className="mt-2 flex items-center justify-between pt-2 border-t border-warn-200/60">
                      <span className="text-ink-600">Bill: {inr(total)} · Split: {inr(customSum)}</span>
                      <button
                        type="button"
                        onClick={() => {
                          const perPerson = Math.round((customDiff / people.length) * 100) / 100
                          setCustom((prev) => {
                            const next = { ...prev }
                            people.forEach((p) => {
                              const cur = parseFloat(next[p.id]) || 0
                              next[p.id] = String(Math.max(0, Math.round((cur + perPerson) * 100) / 100))
                            })
                            return next
                          })
                        }}
                        className="rounded-lg bg-warn-200 px-2.5 py-1 text-[11px] font-bold text-warn-900 hover:bg-warn-300 transition-colors"
                      >
                        Auto-balance
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Equal mode summary helper */}
              {mode === 'equal' && people.length > 1 && total > 0 && (
                <div className="mt-4 rounded-xl bg-brand-50 border border-brand-200 p-3.5 text-xs text-brand-900 space-y-1">
                  <p className="font-semibold">Because you paid {inr(total)} upfront:</p>
                  <p className="text-ink-600">
                    You'll request <strong className="text-brand-700">{inr(equalAmts[1] ?? 0)}</strong> each from {others.length} friend{others.length === 1 ? '' : 's'}. Total coming back to you: <strong className="text-pos-700">{inr(total - (equalAmts[0] ?? 0))}</strong>.
                  </p>
                </div>
              )}

              <Button size="lg" fullWidth className="mt-6" onClick={handleReview} disabled={(mode === 'custom' && !customOk) || (mode === 'item' && !itemOk)}>
                Review everyone's share <ArrowRight size={17} />
              </Button>
            </motion.div>
          )}

          {/* ── 2 · Review Everyone's Share ──────────── */}
          {step === 2 && (
            <motion.div key="sp2" initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }} transition={{ duration: 0.22 }} className="space-y-4">
              <div>
                <h2 className="font-display text-2xl font-bold text-ink-950">Everyone's share</h2>
                <p className="tnum mt-1 text-sm text-ink-500">{title} · Total {inr(total)} · {people.length} people</p>
              </div>

              <div className="rounded-2xl border border-ink-100 bg-white shadow-card divide-y divide-ink-100 overflow-hidden">
                {people.map((p, i) => {
                  const amt = amountFor(p, i)
                  return (
                    <div key={p.id} className="flex items-center gap-3 px-4 py-3.5">
                      <Avatar initials={p.initials} hue={p.hue} size={38} />
                      <div className="flex-1 min-w-0">
                        <p className="truncate text-sm font-semibold text-ink-900">
                          {p.name}
                        </p>
                        <p className="text-xs text-ink-400">
                          {p.isYou ? 'Your share (already paid)' : 'Requested share'}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="tnum block text-sm font-bold text-ink-950">{inr(amt)}</span>
                        <span className={`text-xs font-semibold ${p.isYou ? 'text-pos-600' : 'text-warn-600'}`}>
                          {p.isYou ? 'Paid by you' : 'Will request'}
                        </span>
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Why this amount calculation */}
              <WhyThisAmount
                title="Why these shares?"
                items={people.map((p, i) => ({
                  label: `${p.name}${p.isYou ? ' (You)' : ''}`,
                  amount: amountFor(p, i),
                  note: p.isYou ? 'Paid upfront' : mode === 'equal' ? '1 of ' + people.length + ' equal shares' : 'Calculated share',
                }))}
                total={total}
                totalLabel="Total bill amount"
                formulaExplanation={`The total bill of ${inr(total)} is divided across ${people.length} participants with ₹0 platform fee. You will receive ${inr(total - amountFor(people[0], 0))} back as friends pay.`}
              />

              <div className="flex items-center gap-2 rounded-xl bg-pos-50 px-3.5 py-3 text-xs font-medium text-pos-800 border border-pos-200">
                <ShieldCheck size={16} className="text-pos-600 shrink-0" />
                <span>Zero fees charged for bill splitting. Requests will be sent clearly to {others.length} friend{others.length === 1 ? '' : 's'}.</span>
              </div>

              <div className="pt-2 space-y-2.5">
                <Button size="lg" fullWidth onClick={handleSend}><Check size={18} /> Create split & send requests ({inr(total)})</Button>
                <Button size="lg" fullWidth variant="ghost" onClick={() => setStep(1)}>Edit participants</Button>
              </div>
            </motion.div>
          )}

          {/* ── 3 · Success / Summary ────────────────── */}
          {step === 3 && (
            <motion.div key="sp3" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <SuccessState
                title="Split created"
                amount={total}
                subtitle={`${title} · ${people.length} participants`}
                meta={[
                  { label: 'Your share (paid)', value: inr(amountFor(people[0], 0)) },
                  { label: `Waiting on (${others.length} friends)`, value: inr(total - amountFor(people[0], 0)) },
                  { label: 'Fee', value: '₹0 · No hidden fees' },
                  { label: 'Split status', value: 'Active tracking' },
                ]}
              >
                <Button size="lg" fullWidth onClick={() => go({ name: 'splitDetail', id: newBillId })}>View split details</Button>
                <Button size="lg" fullWidth variant="secondary" onClick={() => go({ name: 'home' })}>Done</Button>
              </SuccessState>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Friend picker */}
      <BottomSheet open={pickerOpen} onClose={() => setPickerOpen(false)} title="Add participants to this bill">
        <div className="px-5 pb-6 pt-1">
          <p className="mb-3 text-[13px] text-ink-400">Pick who was involved in this expense.</p>
          <div className="space-y-1">
            {CONTACTS.map((c) => {
              const added = people.some((p) => p.id === c.id)
              return (
                <button key={c.id} onClick={() => togglePerson(c.id)} className="flex w-full items-center gap-3 rounded-xl px-2 py-2.5 text-left transition-colors hover:bg-cream-50">
                  <Avatar initials={c.initials} hue={c.hue} size={40} verified={c.verified} />
                  <span className="flex-1 truncate text-[15px] font-medium text-ink-800">{c.name}</span>
                  <span aria-hidden className={`flex h-6 w-6 items-center justify-center rounded-lg border transition-colors ${added ? 'border-brand-600 bg-brand-600 text-white' : 'border-ink-300 text-transparent'}`}><Check size={14} /></span>
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

      {/* Add item modal */}
      <BottomSheet open={itemModal} onClose={() => setItemModal(false)} title="Add an item">
        <div className="px-5 pb-6 pt-2 space-y-4">
          <Input label="Item name" placeholder="e.g. Butter Chicken" value={itemName} onChange={(e) => setItemName(e.target.value)} />
          <Input label="Amount" placeholder="0" icon={<span className="font-semibold">₹</span>} inputMode="decimal" value={itemAmount} onChange={(e) => setItemAmount(e.target.value.replace(/[^0-9.]/g, ''))} />
          <div>
            <span className="mb-1.5 block text-sm font-medium text-ink-700">Who shared this item?</span>
            <div className="space-y-1">
              {people.map((p) => {
                const selected = itemPeople.includes(p.id)
                return (
                  <button key={p.id} onClick={() => setItemPeople((prev) => selected ? prev.filter((id) => id !== p.id) : [...prev, p.id])} className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors ${selected ? 'bg-brand-50 border border-brand-300' : 'border border-ink-100 hover:bg-cream-50'}`}>
                    <Avatar initials={p.initials} hue={p.hue} size={32} />
                    <span className="flex-1 text-sm font-medium text-ink-800">{p.name}{p.isYou ? ' (You)' : ''}</span>
                    <span aria-hidden className={`flex h-5 w-5 items-center justify-center rounded-md border transition-colors ${selected ? 'border-brand-600 bg-brand-600 text-white' : 'border-ink-300 text-transparent'}`}><Check size={12} /></span>
                  </button>
                )
              })}
            </div>
          </div>
          <Button size="lg" fullWidth onClick={addItem} disabled={!itemName.trim() || !itemAmount || parseFloat(itemAmount) <= 0 || itemPeople.length === 0}>Add item</Button>
        </div>
      </BottomSheet>
    </div>
  )
}
