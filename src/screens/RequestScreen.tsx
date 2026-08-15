import { useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowRight, BadgeCheck, Search } from 'lucide-react'
import { Avatar, Button, Input } from '../components/ui/primitives'
import { ScreenHeader } from '../components/ScreenHeader'
import { StepProgress } from '../components/StepProgress'
import { SuccessState } from '../components/SuccessState'
import { FeeBreakdown } from '../components/ui/FeeBreakdown'
import { CONTACTS, useVault } from '../store/useVault'
import { inr, inrFull } from '../utils/format'
import type { Contact } from '../types'

const STEPS = ['Recipient', 'Amount', 'Done']
const QUICK = [250, 500, 1000, 2000]

export default function RequestScreen() {
  const balance = useVault((s) => s.balance)
  const requestMoney = useVault((s) => s.requestMoney)
  const go = useVault((s) => s.go)
  const back = useVault((s) => s.back)

  const [step, setStep] = useState(0)
  const [recipient, setRecipient] = useState<Contact | null>(null)
  const [amountStr, setAmountStr] = useState('')
  const [note, setNote] = useState('')
  const [query, setQuery] = useState('')

  const amount = parseFloat(amountStr) || 0
  const amountError = amount <= 0 ? 'Enter an amount above ₹0.' : ''
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    const all = q ? CONTACTS.filter((c) => c.name.toLowerCase().includes(q) || c.upi.toLowerCase().includes(q)) : CONTACTS
    return [...all].sort((a, b) => Number(b.recent) - Number(a.recent))
  }, [query])

  const handleSend = () => {
    if (!recipient || amount <= 0) return
    requestMoney(recipient, amount, note || undefined)
    setStep(2)
  }

  return (
    <div className="-mx-4 -mt-5 min-h-screen bg-white lg:mx-0 lg:mt-0 lg:rounded-3xl lg:border lg:border-ink-100 lg:shadow-card">
      <ScreenHeader title="Request money" subtitle={STEPS[step]} onBack={() => (step === 0 ? back() : setStep(step - 1))} />

      <div className="mx-auto max-w-lg px-5 pt-5">
        <StepProgress steps={STEPS} current={step} />
      </div>

      <div className="mx-auto max-w-lg px-5 pb-10 pt-6">
        <AnimatePresence mode="wait">
          {step === 0 && (
            <motion.div key="r0" initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }} transition={{ duration: 0.22 }}>
              <h2 className="font-display text-xl font-bold text-ink-950">Who should pay you?</h2>
              <p className="mt-1 text-sm text-ink-400">They’ll get a friendly request they can pay in one tap.</p>

              <div className="mt-5">
                <Input
                  placeholder="Search contacts by name or UPI"
                  icon={<Search size={17} />}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  aria-label="Search contacts"
                />
              </div>

              <div className="mt-5 grid grid-cols-3 gap-2.5">
                {filtered.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => {
                      setRecipient(c)
                      setStep(1)
                    }}
                    className="flex flex-col items-center gap-2 rounded-2xl border border-ink-100 bg-white p-3 transition-all hover:border-brand-300 hover:shadow-lift"
                  >
                    <Avatar initials={c.initials} hue={c.hue} size={44} verified={c.verified} />
                    <span className="w-full truncate text-center text-[12.5px] font-medium text-ink-800">
                      {c.name}
                    </span>
                    <span className="truncate text-[10px] text-ink-400 max-w-full">{c.upi}</span>
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {step === 1 && recipient && (
            <motion.div key="r1" initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }} transition={{ duration: 0.22 }}>
              <div className="flex items-center gap-3 rounded-2xl border border-ink-100 bg-cream-50 p-3.5">
                <Avatar initials={recipient.initials} hue={recipient.hue} size={44} verified={recipient.verified} />
                <div className="min-w-0 flex-1">
                  <p className="flex items-center gap-1.5 truncate text-[15px] font-semibold text-ink-900">
                    {recipient.name}
                    {recipient.verified && <BadgeCheck size={15} className="shrink-0 text-brand-600" />}
                  </p>
                  <p className="truncate text-[13px] text-ink-400">{recipient.upi}</p>
                </div>
                <button onClick={() => setStep(0)} className="text-[13px] font-medium text-brand-600 hover:underline">
                  Change
                </button>
              </div>

              <div className="mt-7 flex items-center justify-center gap-2">
                <span className="font-display text-3xl font-bold text-ink-400">₹</span>
                <input
                  autoFocus
                  inputMode="decimal"
                  type="text"
                  value={amountStr}
                  onChange={(e) => setAmountStr(e.target.value.replace(/[^0-9.]/g, ''))}
                  placeholder="0"
                  aria-label="Amount in rupees"
                  className="tnum w-48 border-0 bg-transparent text-center font-display text-[52px] font-bold text-ink-950 placeholder:text-ink-200 focus:outline-none focus:ring-0"
                />
              </div>
              <p className="mt-1 text-center text-sm text-ink-400">
                Requesting from <strong className="font-semibold text-ink-700">{recipient.name}</strong>
              </p>

              <div className="mt-5 flex flex-wrap justify-center gap-2">
                {QUICK.map((q) => (
                  <button
                    key={q}
                    onClick={() => setAmountStr(String(q))}
                    className={`rounded-full border px-4 py-2 text-sm font-semibold transition-colors ${
                      amount === q ? 'border-brand-500 bg-brand-50 text-brand-700' : 'border-ink-200 text-ink-600 hover:border-brand-300'
                    }`}
                  >
                    ₹{q.toLocaleString('en-IN')}
                  </button>
                ))}
              </div>

              <Input
                className="mt-6"
                label="Reason for request (optional)"
                placeholder="e.g. Movie tickets, Coffee run"
                value={note}
                onChange={(e) => setNote(e.target.value)}
              />

              {amount > 0 && (
                <div className="mt-5">
                  <FeeBreakdown amount={amount} fee={0} feeLabel="Request fee" totalLabel="Amount they will receive request for" />
                </div>
              )}

              {amountError && (
                <p className="mt-3 rounded-xl bg-danger-50 px-3.5 py-2.5 text-sm font-medium text-danger-600">
                  {amountError}
                </p>
              )}

              <Button size="lg" fullWidth className="mt-6" onClick={handleSend} disabled={!!amountError || amount <= 0}>
                Send request <ArrowRight size={17} />
              </Button>
            </motion.div>
          )}

          {step === 2 && recipient && (
            <motion.div key="r2" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <SuccessState
                title="Request sent"
                amount={amount}
                subtitle={`${inr(amount)} requested from ${recipient.name}`}
                meta={[
                  { label: 'Recipient', value: recipient.name },
                  { label: 'Reason', value: note || 'Payment request' },
                  { label: 'Fee', value: '₹0 · Free' },
                  { label: 'Payment status', value: 'Waiting for payment' },
                ]}
              >
                <Button size="lg" fullWidth variant="secondary" onClick={() => go({ name: 'home' })}>
                  Done
                </Button>
                <Button size="lg" fullWidth variant="ghost" onClick={() => go({ name: 'activity' })}>
                  Track in activity
                </Button>
              </SuccessState>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <p className="mx-auto max-w-lg px-5 pb-8 text-center text-xs text-ink-400">
        Available to spend: <span className="tnum font-semibold text-ink-600">{inrFull(balance)}</span> · Requesting money does not deduct funds.
      </p>
    </div>
  )
}
