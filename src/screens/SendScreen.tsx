import { useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import {
  AlertTriangle,
  ArrowRight,
  BadgeCheck,
  Check,
  ChevronDown,
  CircleCheckBig,
  Search,
  ShieldCheck,
  UserRound,
  Wallet,
  Zap,
} from 'lucide-react'
import { Avatar, Button, Input } from '../components/ui/primitives'
import { Modal } from '../components/ui/Modal'
import { ScreenHeader } from '../components/ScreenHeader'
import { SuccessState } from '../components/SuccessState'
import { CONTACTS, useVault } from '../store/useVault'
import { inr, inrFull } from '../utils/format'
import type { Contact, Transaction } from '../types'

const STEPS = ['Recipient', 'Amount', 'Review', 'Safe to Send', 'Confirm', 'Done']
const QUICK_AMOUNTS = [500, 1000, 2000, 5000]

export default function SendScreen() {
  const balance = useVault((s) => s.balance)
  const sendMoney = useVault((s) => s.sendMoney)
  const transactions = useVault((s) => s.transactions)
  const pushToast = useVault((s) => s.pushToast)
  const go = useVault((s) => s.go)
  const back = useVault((s) => s.back)

  const [step, setStep] = useState(0)
  const [recipient, setRecipient] = useState<Contact | null>(null)
  const [amountStr, setAmountStr] = useState('')
  const [note, setNote] = useState('')
  const [query, setQuery] = useState('')
  const [upiModal, setUpiModal] = useState(false)
  const [upiId, setUpiId] = useState('')
  const [upiError, setUpiError] = useState('')
  const [sentTx, setSentTx] = useState<Transaction | null>(null)
  const [verifyExpanded, setVerifyExpanded] = useState(false)

  const amount = parseFloat(amountStr) || 0
  const fee = 0
  const total = amount + fee
  const balanceAfter = balance - total
  const isLarge = amount >= 5000
  const amountError =
    amount <= 0 ? 'Enter an amount above ₹0.' : amount > balance ? `You have ${inr(balance)} available.` : ''

  const hasPreviousPayment = recipient
    ? transactions.some(
        (t) => t.type === 'debit' && t.category === 'Transfer' && t.merchant === recipient.name && t.status === 'Completed',
      )
    : false

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    const all = q ? CONTACTS.filter((c) => c.name.toLowerCase().includes(q)) : CONTACTS
    return [...all].sort((a, b) => Number(b.recent) - Number(a.recent))
  }, [query])

  const handleAmountContinue = () => {
    if (amount <= 0 || amount > balance) return
    setStep(2)
  }

  const handleConfirm = () => {
    if (!recipient) return
    const res = sendMoney(recipient, amount, note || undefined)
    if (!res.ok) {
      pushToast({ tone: 'error', title: 'Payment couldn’t be completed', body: res.error })
      setStep(1)
      return
    }
    setSentTx(res.tx ?? null)
    setStep(5)
  }

  const addUpiContact = () => {
    const valid = /^[\w.\-]{2,}@[a-z]{2,}$/.test(upiId.trim())
    if (!valid) {
      setUpiError('That doesn’t look like a valid UPI ID (e.g. name@bank).')
      return
    }
    const existing = CONTACTS.find((c) => c.upi.toLowerCase() === upiId.trim().toLowerCase())
    if (existing) {
      setRecipient(existing)
      setUpiModal(false)
      setStep(1)
      return
    }
    const namePart = upiId.split('@')[0].replace(/[.\-_\d]/g, ' ')
    const name = namePart.trim() || 'New contact'
    const display = name.split(' ').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
    setRecipient({
      id: 'upi-' + upiId,
      name: display,
      initials: display.split(' ').slice(0, 2).map((p) => p[0]).join('').toUpperCase(),
      hue: 232,
      upi: upiId.trim(),
      verified: true,
      recent: false,
    })
    setUpiModal(false)
    setStep(1)
  }

  return (
    <div className="-mx-4 -mt-5 min-h-screen bg-white lg:mx-0 lg:mt-0 lg:rounded-3xl lg:border lg:border-ink-100 lg:shadow-card">
      <ScreenHeader title="Send money" subtitle={STEPS[step]} onBack={() => (step === 0 ? back() : setStep(step - 1))} />

      <div className="mx-auto max-w-lg px-5 pt-5">
        <div className="flex items-center gap-1" aria-label={`Step ${step + 1} of ${STEPS.length}`}>
          {STEPS.map((s, i) => (
            <div key={s} className="flex flex-1 flex-col gap-1">
              <div className={`h-1 rounded-full transition-colors duration-300 ${i <= step ? 'bg-brand-600' : 'bg-ink-100'}`} />
              <span className={`text-[10px] leading-tight ${i === step ? 'font-semibold text-ink-800' : 'text-ink-300'}`}>{s}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="mx-auto max-w-lg px-5 pb-10 pt-6">
        <AnimatePresence mode="wait">
          {/* ── 0 · Recipient ──────────────────────────── */}
          {step === 0 && (
            <motion.div key="s0" initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }} transition={{ duration: 0.22 }}>
              <h2 className="font-display text-xl font-bold text-ink-950">Who do you want to pay?</h2>
              <p className="mt-1 text-sm text-ink-400">Choose a saved contact or pay a UPI ID directly.</p>

              <div className="mt-5 flex gap-2">
                <div className="flex-1">
                  <Input placeholder="Search contacts" icon={<Search size={17} />} value={query} onChange={(e) => setQuery(e.target.value)} aria-label="Search contacts" />
                </div>
                <Button variant="secondary" onClick={() => setUpiModal(true)} className="h-12 px-4">
                  <Wallet size={17} /> UPI
                </Button>
              </div>

              <div className="mt-5 grid grid-cols-3 gap-2.5">
                {filtered.map((c) => (
                  <button key={c.id} onClick={() => { setRecipient(c); setStep(1) }} className="flex flex-col items-center gap-2 rounded-2xl border border-ink-100 bg-white p-3 transition-all hover:border-brand-300 hover:shadow-lift">
                    <Avatar initials={c.initials} hue={c.hue} size={44} verified={c.verified} />
                    <span className="w-full truncate text-center text-[12.5px] font-medium text-ink-800">{c.name}</span>
                  </button>
                ))}
              </div>
              {filtered.length === 0 && <p className="mt-6 text-center text-sm text-ink-400">No contacts found. Try a UPI ID instead.</p>}
            </motion.div>
          )}

          {/* ── 1 · Amount ─────────────────────────────── */}
          {step === 1 && recipient && (
            <motion.div key="s1" initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }} transition={{ duration: 0.22 }}>
              <RecipientChip recipient={recipient} onChange={() => setStep(0)} />

              <div className="mt-7 flex items-center justify-center gap-2">
                <span className="font-display text-3xl font-bold text-ink-400">₹</span>
                <input autoFocus inputMode="decimal" type="text" value={amountStr} onChange={(e) => setAmountStr(e.target.value.replace(/[^0-9.]/g, ''))} placeholder="0" aria-label="Amount in rupees" className="tnum w-48 border-0 bg-transparent text-center font-display text-[52px] font-bold text-ink-950 placeholder:text-ink-200 focus:outline-none focus:ring-0" />
              </div>
              <p className="tnum mt-1 text-center text-sm text-ink-400">Available balance {inrFull(balance)}</p>

              {amount > 0 && isLarge && (
                <div className="mt-5 flex items-start gap-2.5 rounded-xl border border-warn-200 bg-warn-50 p-3 text-[13px] leading-snug text-warn-800">
                  <AlertTriangle size={16} className="mt-0.5 shrink-0 text-warn-600" />
                  <span>This is a large payment. Double-check the recipient before you continue — once confirmed, it can't be reversed.</span>
                </div>
              )}

              <div className="mt-5 flex flex-wrap justify-center gap-2">
                {QUICK_AMOUNTS.map((q) => (
                  <button key={q} onClick={() => setAmountStr(String(q))} className={`rounded-full border px-4 py-2 text-sm font-semibold transition-colors ${amount === q ? 'border-brand-500 bg-brand-50 text-brand-700' : 'border-ink-200 text-ink-600 hover:border-brand-300'}`}>
                    ₹{q.toLocaleString('en-IN')}
                  </button>
                ))}
              </div>

              <Input className="mt-6" placeholder="Add a note (optional)" value={note} onChange={(e) => setNote(e.target.value)} label="Note" />
              {amountError && <p className="mt-3 rounded-xl bg-danger-50 px-3.5 py-2.5 text-sm font-medium text-danger-600">{amountError}</p>}
              <Button size="lg" fullWidth className="mt-6" onClick={handleAmountContinue} disabled={!!amountError || amount <= 0}>Continue <ArrowRight size={17} /></Button>
            </motion.div>
          )}

          {/* ── 2 · Review ─────────────────────────────── */}
          {step === 2 && recipient && (
            <motion.div key="s2" initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }} transition={{ duration: 0.22 }}>
              <h2 className="font-display text-xl font-bold text-ink-950">Review payment details</h2>
              <p className="mt-1 text-sm text-ink-400">Nothing is sent until you confirm in the next step.</p>

              <RecipientChip recipient={recipient} onChange={() => setStep(0)} />

              <dl className="mt-4 divide-y divide-ink-100 rounded-2xl border border-ink-100 bg-white">
                <Row label="Amount" value={inr(amount)} strong />
                <Row label="Transfer fee" value="₹0" note="No hidden charges" accent />
                <Row label="Total" value={inr(total)} strong />
                <Row label="Payment method" value="VAULT · Instant" />
                <Row label="Balance after" value={inrFull(balanceAfter)} warning={balanceAfter < 0} />
                {note && <Row label="Note" value={note} />}
              </dl>

              <div className="mt-5 flex items-start gap-2.5 rounded-xl bg-brand-50 p-3.5 text-[13px] leading-snug text-brand-800">
                <Wallet size={16} className="mt-0.5 shrink-0 text-brand-600" />
                <span>The fee is always shown before you confirm. There are no hidden charges on VAULT sends.</span>
              </div>

              <Button size="lg" fullWidth className="mt-6" onClick={() => setStep(3)}>Continue to verification <ArrowRight size={17} /></Button>
            </motion.div>
          )}

          {/* ── 3 · SAFE TO SEND ────────────────────────── */}
          {step === 3 && recipient && (
            <motion.div key="s3-safe" initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.97 }} transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}>
              <div className="flex flex-col items-center text-center">
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', damping: 12, delay: 0.1 }} className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-pos-400 to-pos-600 text-white shadow-lift">
                  <ShieldCheck size={32} />
                </motion.div>
                <h2 className="font-display text-2xl font-bold text-ink-950">Safe to Send</h2>
                <p className="mt-1 text-sm text-ink-400">We checked a few things so you can send with confidence.</p>
              </div>

              <div className="mt-6 rounded-2xl border border-ink-100 bg-cream-50 p-5 text-center">
                <p className="text-sm font-medium text-ink-400">You're sending</p>
                <p className="tnum mt-1 font-display text-[38px] font-bold leading-none text-ink-950">{inr(amount)}</p>
              </div>

              <div className="mt-4 flex items-center gap-3 rounded-2xl border border-ink-100 bg-white p-4">
                <Avatar initials={recipient.initials} hue={recipient.hue} size={48} verified={recipient.verified} />
                <div className="min-w-0 flex-1">
                  <p className="flex items-center gap-1.5 text-[15px] font-semibold text-ink-900">
                    {recipient.name}
                    {recipient.verified && <BadgeCheck size={15} className="shrink-0 text-brand-600" />}
                  </p>
                  <p className="text-[13px] text-ink-400">{recipient.upi}</p>
                </div>
              </div>

              <div className="mt-5 space-y-2">
                <VerifyCheck label="Recipient verified" detail="Matched with a verified payment identity" checked={recipient.verified} delay={0.2} />
                <VerifyCheck label={hasPreviousPayment ? 'Previous successful payment' : 'New recipient'} detail={hasPreviousPayment ? "You've sent money to this person before" : 'First time sending to this recipient'} checked={hasPreviousPayment} warn={!hasPreviousPayment} delay={0.35} />
                <VerifyCheck label="No transfer fee" detail="This payment is free — ₹0 charges" checked delay={0.5} />
                <VerifyCheck label="Balance sufficient" detail={`${inrFull(balance)} available · ${inrFull(balanceAfter)} after payment`} checked={balance >= total} delay={0.65} />
              </div>

              {recipient.verified && (
                <>
                  <button onClick={() => setVerifyExpanded(!verifyExpanded)} className="mt-4 flex w-full items-center justify-between rounded-xl border border-ink-100 bg-white px-4 py-3 text-left text-[13px] text-ink-500 transition-colors hover:bg-cream-50" aria-expanded={verifyExpanded}>
                    <span>Why is this recipient verified?</span>
                    <ChevronDown size={16} className={`transition-transform duration-200 ${verifyExpanded ? 'rotate-180' : ''}`} />
                  </button>
                  <AnimatePresence>
                    {verifyExpanded && (
                      <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }} className="overflow-hidden">
                        <p className="rounded-b-xl border border-t-0 border-ink-100 bg-white px-4 pb-3.5 text-[13px] leading-relaxed text-ink-500">
                          This recipient has a verified VAULT payment identity. Their UPI handle is confirmed and matched against their account details. You can always double-check the name and UPI before sending.
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </>
              )}

              <div className="mt-4 flex items-center justify-between rounded-xl border border-ink-100 bg-white px-4 py-3">
                <span className="text-sm text-ink-500">Balance after payment</span>
                <span className="tnum text-sm font-bold text-ink-900">{inrFull(balanceAfter)}</span>
              </div>

              <div className="mt-6 text-center">
                <p className="mb-3 text-sm font-medium text-pos-600">Everything looks good ✓</p>
                <Button size="lg" fullWidth onClick={() => setStep(4)}><Check size={18} /> Confirm payment</Button>
                <Button size="lg" fullWidth variant="ghost" className="mt-2" onClick={() => setStep(2)}>Go back to review</Button>
              </div>
            </motion.div>
          )}

          {/* ── 4 · Confirm ────────────────────────────── */}
          {step === 4 && recipient && (
            <motion.div key="s4" initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }} transition={{ duration: 0.22 }} className="flex flex-col items-center pt-4 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-50 text-brand-600">
                <UserRound size={26} />
              </div>
              <h2 className="mt-5 max-w-xs font-display text-2xl font-bold leading-snug text-ink-950">
                You're about to send <span className="tnum text-brand-700">{inr(amount)}</span> to {recipient.name}.
              </h2>
              {isLarge ? (
                <div className="mt-5 flex items-start gap-2.5 rounded-xl border border-warn-200 bg-warn-50 p-3.5 text-left text-[13px] leading-snug text-warn-800">
                  <AlertTriangle size={16} className="mt-0.5 shrink-0 text-warn-600" />
                  <span>Please double-check the recipient before continuing. This payment can't be reversed.</span>
                </div>
              ) : (
                <p className="mt-4 text-sm text-ink-400">Confirm to send {inr(amount)} instantly to {recipient.name}.</p>
              )}
              <div className="mt-7 w-full max-w-xs space-y-2.5">
                <Button size="lg" fullWidth onClick={handleConfirm}><Zap size={18} /> Send {inr(amount)} now</Button>
                <Button size="lg" fullWidth variant="ghost" onClick={() => setStep(3)}>Go back</Button>
              </div>
            </motion.div>
          )}

          {/* ── 5 · Success ────────────────────────────── */}
          {step === 5 && recipient && sentTx && (
            <motion.div key="s5" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.2 }}>
              <SuccessState title="Payment sent" amount={sentTx.amount} subtitle={`To ${recipient.name}`} meta={[
                { label: 'Transaction ID', value: sentTx.id },
                { label: 'Date & time', value: `${sentTx.date} · ${sentTx.time}` },
                { label: 'Status', value: 'Completed' },
                { label: 'Fee', value: '₹0' },
              ]}>
                <Button size="lg" fullWidth onClick={() => go({ name: 'transaction', id: sentTx.id })}>View transaction</Button>
                <Button size="lg" fullWidth variant="secondary" onClick={() => go({ name: 'home' })}>Done</Button>
              </SuccessState>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <Modal open={upiModal} onClose={() => setUpiModal(false)} title="Pay to a UPI ID" footer={<Button fullWidth size="lg" onClick={addUpiContact}>Continue</Button>}>
        <Input label="UPI ID" placeholder="e.g. rahul@okaxis" value={upiId} onChange={(e) => { setUpiId(e.target.value); setUpiError('') }} error={upiError} hint="You'll review the recipient before sending." />
      </Modal>
    </div>
  )
}

function RecipientChip({ recipient, onChange }: { recipient: Contact; onChange: () => void }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-ink-100 bg-cream-50 p-3.5">
      <Avatar initials={recipient.initials} hue={recipient.hue} size={44} verified={recipient.verified} />
      <div className="min-w-0 flex-1">
        <p className="flex items-center gap-1.5 truncate text-[15px] font-semibold text-ink-900">
          {recipient.name}
          {recipient.verified && <BadgeCheck size={15} className="shrink-0 text-brand-600" />}
        </p>
        <p className="truncate text-[13px] text-ink-400">{recipient.upi}</p>
      </div>
      <button onClick={onChange} className="text-[13px] font-medium text-brand-600 hover:underline">Change</button>
    </div>
  )
}

function VerifyCheck({ label, detail, checked, warn, delay }: { label: string; detail: string; checked: boolean; warn?: boolean; delay: number }) {
  return (
    <motion.div initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay, duration: 0.3 }} className={`flex items-start gap-3 rounded-xl border p-3.5 ${checked ? 'border-pos-200 bg-pos-50' : warn ? 'border-warn-200 bg-warn-50' : 'border-ink-200 bg-white'}`}>
      <span className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${checked ? 'bg-pos-500 text-white' : warn ? 'bg-warn-400 text-white' : 'bg-ink-200 text-ink-500'}`}>
        <CircleCheckBig size={12} />
      </span>
      <div>
        <p className={`text-sm font-semibold ${checked ? 'text-pos-800' : warn ? 'text-warn-800' : 'text-ink-700'}`}>{label}</p>
        <p className="mt-0.5 text-[12px] leading-snug text-ink-500">{detail}</p>
      </div>
    </motion.div>
  )
}

function Row({ label, value, note, strong, accent, warning }: { label: string; value: string; note?: string; strong?: boolean; accent?: boolean; warning?: boolean }) {
  return (
    <div className="flex items-center justify-between px-4 py-3.5">
      <dt className="text-sm text-ink-500">
        {label}
        {note && <span className={`ml-2 text-xs ${accent ? 'font-medium text-pos-600' : 'text-ink-400'}`}>· {note}</span>}
      </dt>
      <dd className={`tnum text-sm ${warning ? 'font-bold text-danger-600' : strong ? 'font-bold text-ink-950' : accent ? 'font-semibold text-pos-600' : 'font-semibold text-ink-800'}`}>{value}</dd>
    </div>
  )
}
