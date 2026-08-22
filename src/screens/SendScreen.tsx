import { useEffect, useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import {
  AlertTriangle,
  ArrowRight,
  BadgeCheck,
  Check,
  ChevronDown,
  CircleCheckBig,
  Edit3,
  HelpCircle,
  Loader2,
  RefreshCw,
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
import { ConfidenceStatus } from '../components/ui/ConfidenceStatus'
import { ReviewSummary } from '../components/ui/ReviewSummary'
import { MoneyImpactPreview } from '../components/ui/MoneyImpactPreview'
import { WhyThisAmount } from '../components/ui/WhyThisAmount'
import { MicroContext } from '../components/ui/MicroContext'
import { CONTACTS, useVault } from '../store/useVault'
import { inr, inrFull } from '../utils/format'
import type { Contact, Transaction } from '../types'

const STEPS = ['Recipient', 'Amount', 'Review', 'Safe to Send', 'Confirm', 'Done']
const QUICK_AMOUNTS = [500, 1000, 2000, 5000]
type CheckStatus = 'idle' | 'checking' | 'done' | 'warn'

export default function SendScreen() {
  const balance = useVault((s) => s.balance)
  const sendMoney = useVault((s) => s.sendMoney)
  const transactions = useVault((s) => s.transactions)
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
  const [checks, setChecks] = useState<CheckStatus[]>(['idle', 'idle', 'idle', 'idle'])
  const [allChecksDone, setAllChecksDone] = useState(false)
  const [sendError, setSendError] = useState<string | null>(null)

  const amount = parseFloat(amountStr) || 0
  const fee = 0
  const total = amount + fee
  const balanceAfter = balance - total
  const isLarge = amount >= 5000

  const hasPreviousPayment = recipient
    ? transactions.some(
        (t) => t.type === 'debit' && t.category === 'Transfer' && t.merchant.toLowerCase() === recipient.name.toLowerCase() && t.status === 'Completed',
      )
    : false

  const isNewRecipient = recipient ? !hasPreviousPayment && !recipient.recent : false

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    const all = q ? CONTACTS.filter((c) => c.name.toLowerCase().includes(q) || c.upi.toLowerCase().includes(q)) : CONTACTS
    return [...all].sort((a, b) => Number(b.recent) - Number(a.recent))
  }, [query])

  /* ── Sequential check animation when entering Safe-to-Send ── */
  useEffect(() => {
    if (step !== 3) return
    setChecks(['idle', 'idle', 'idle', 'idle'])
    setAllChecksDone(false)
    setVerifyExpanded(false)

    const timers: ReturnType<typeof setTimeout>[] = []

    // Check 0: Recipient — starts immediately
    timers.push(setTimeout(() => setChecks((c) => ['checking', c[1], c[2], c[3]]), 50))
    timers.push(setTimeout(() => setChecks((c) => ['done', c[1], c[2], c[3]]), 220))

    // Check 1: History — starts at 250ms
    timers.push(setTimeout(() => setChecks((c) => [c[0], 'checking', c[2], c[3]]), 250))
    timers.push(setTimeout(() => setChecks((c) => [c[0], hasPreviousPayment ? 'done' : 'warn', c[2], c[3]]), 420))

    // Check 2: Cost / Fees — starts at 450ms
    timers.push(setTimeout(() => setChecks((c) => [c[0], c[1], 'checking', c[3]]), 450))
    timers.push(setTimeout(() => setChecks((c) => [c[0], c[1], 'done', c[3]]), 600))

    // Check 3: Available Balance — starts at 620ms
    timers.push(setTimeout(() => setChecks((c) => [c[0], c[1], c[2], balance >= total ? 'checking' : 'warn']), 620))
    timers.push(setTimeout(() => setChecks((c) => [c[0], c[1], c[2], balance >= total ? 'done' : 'warn']), 780))

    // All done — show CTA
    timers.push(setTimeout(() => setAllChecksDone(true), 900))

    return () => timers.forEach(clearTimeout)
  }, [step, hasPreviousPayment, balance, total])

  const handleAmountContinue = () => {
    if (amount <= 0 || amount > balance) return
    setStep(2)
  }

  const handleConfirm = () => {
    if (!recipient) return
    setSendError(null)
    const res = sendMoney(recipient, amount, note || undefined)
    if (!res.ok) {
      setSendError(res.error ?? "We couldn't complete the payment. Your money was not moved.")
      return
    }
    setSentTx(res.tx ?? null)
    setStep(5)
  }

  const addUpiContact = () => {
    const valid = /^[\w.\-]{2,}@[a-z]{2,}$/.test(upiId.trim())
    if (!valid) {
      setUpiError("That doesn't look like a valid UPI ID (e.g. name@bank).")
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

  const checksComplete = checks.filter((c) => c === 'done' || c === 'warn').length

  return (
    <div className="-mx-4 -mt-5 min-h-screen bg-white lg:mx-0 lg:mt-0 lg:rounded-3xl lg:border lg:border-ink-100 lg:shadow-card">
      <ScreenHeader
        title="Send money"
        subtitle={STEPS[step]}
        onBack={() => (step === 0 ? back() : setStep(step - 1))}
      />

      {/* Step indicator */}
      <div className="mx-auto max-w-lg px-5 pt-5">
        <div className="flex items-center gap-1" aria-label={`Step ${step + 1} of ${STEPS.length}`}>
          {STEPS.map((s, i) => (
            <div key={s} className="flex flex-1 flex-col gap-1">
              <div
                className={`h-1 rounded-full transition-colors duration-300 ${
                  i <= step ? 'bg-brand-600' : 'bg-ink-100'
                }`}
              />
              <span
                className={`text-[10px] leading-tight ${
                  i === step ? 'font-semibold text-ink-800' : 'text-ink-300'
                }`}
              >
                {s}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="mx-auto max-w-lg px-5 pb-10 pt-6">
        <AnimatePresence mode="wait">
          {/* ── 0 · Recipient ──────────────────────────── */}
          {step === 0 && (
            <motion.div
              key="s0"
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -24 }}
              transition={{ duration: 0.22 }}
            >
              <h2 className="font-display text-xl font-bold text-ink-950">Who do you want to pay?</h2>
              <p className="mt-1 text-sm text-ink-400">Choose a saved contact or enter a UPI ID directly.</p>

              <div className="mt-5 flex gap-2">
                <div className="flex-1">
                  <Input
                    placeholder="Search name or UPI ID"
                    icon={<Search size={17} />}
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    aria-label="Search contacts"
                  />
                </div>
                <Button variant="secondary" onClick={() => setUpiModal(true)} className="h-12 px-4">
                  <Wallet size={17} /> Enter UPI
                </Button>
              </div>

              <div className="mt-5 grid grid-cols-3 gap-2.5">
                {filtered.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => {
                      setRecipient(c)
                      setStep(1)
                    }}
                    className="flex flex-col items-center gap-2 rounded-2xl border border-ink-100 bg-white p-3 transition-all hover:border-brand-300 hover:shadow-lift active:scale-[0.97]"
                  >
                    <Avatar initials={c.initials} hue={c.hue} size={44} verified={c.verified} />
                    <span className="w-full truncate text-center text-[12.5px] font-medium text-ink-800">
                      {c.name}
                    </span>
                    <span className="truncate text-[10px] text-ink-400 max-w-full">{c.upi}</span>
                  </button>
                ))}
              </div>
              {filtered.length === 0 && (
                <div className="mt-6 text-center text-sm text-ink-400 p-6 rounded-2xl border border-ink-100">
                  <p>No matching contacts found.</p>
                  <Button variant="secondary" size="sm" onClick={() => setUpiModal(true)} className="mt-3">
                    Enter a UPI ID instead
                  </Button>
                </div>
              )}
            </motion.div>
          )}

          {/* ── 1 · Amount ─────────────────────────────── */}
          {step === 1 && recipient && (
            <motion.div
              key="s1"
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -24 }}
              transition={{ duration: 0.22 }}
            >
              <RecipientChip recipient={recipient} onChange={() => setStep(0)} />

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

              <p className="tnum mt-1 text-center text-sm text-ink-400 flex items-center justify-center gap-1.5">
                <span>Available to spend: <strong className="font-semibold text-ink-700">{inrFull(balance)}</strong></span>
                <MicroContext
                  inline
                  term="Available to spend"
                  explanation="Money in your VAULT account that is free and ready to use immediately without pending holds."
                />
              </p>

              {/* Contextual Smart Safety Checks */}
              {amount > 0 && isLarge && amount <= balance && (
                <div className="mt-5">
                  <ConfidenceStatus
                    status="large-amount"
                    customLabel="Larger transfer than usual"
                    customDetail="That's larger than your typical transfer. Take a moment to check the amount and recipient."
                  />
                </div>
              )}

              {isNewRecipient && amount > 0 && !isLarge && amount <= balance && (
                <div className="mt-5">
                  <ConfidenceStatus
                    status="new-recipient"
                    customLabel="New recipient — please verify"
                    customDetail="This is your first time sending money to this contact."
                  />
                </div>
              )}

              <div className="mt-5 flex flex-wrap justify-center gap-2">
                {QUICK_AMOUNTS.map((q) => (
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

              <Input
                className="mt-6"
                placeholder="What's this for? (optional)"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                label="Note"
              />

              {/* Explicit Mistake Prevention for Insufficient Balance */}
              {amount > balance && (
                <div className="mt-5 rounded-2xl border border-danger-200 bg-danger-50/80 p-4 text-left shadow-card">
                  <div className="flex items-center gap-2">
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-danger-500 text-white font-bold text-sm">!</span>
                    <h3 className="font-display text-sm font-bold text-danger-900">
                      This payment is larger than your available balance
                    </h3>
                  </div>
                  
                  <div className="mt-3 space-y-1.5 rounded-xl bg-white/80 p-3 text-xs border border-danger-100">
                    <div className="flex justify-between text-ink-600">
                      <span>You have available:</span>
                      <strong className="tnum text-ink-900 font-semibold">{inrFull(balance)}</strong>
                    </div>
                    <div className="flex justify-between text-ink-600">
                      <span>You're trying to send:</span>
                      <strong className="tnum text-danger-700 font-semibold">{inr(amount)}</strong>
                    </div>
                    <div className="flex justify-between border-t border-danger-100 pt-1.5 text-danger-800 font-bold">
                      <span>You would be short by:</span>
                      <span className="tnum">{inr(Math.round((amount - balance) * 100) / 100)}</span>
                    </div>
                  </div>

                  <div className="mt-3 flex gap-2">
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => setAmountStr(String(Math.floor(balance)))}
                      className="text-xs"
                    >
                      Use max ({inr(Math.floor(balance))})
                    </Button>
                    <Button
                      size="sm"
                      variant="soft"
                      onClick={() => go({ name: 'addMoney' })}
                      className="text-xs"
                    >
                      Add money first
                    </Button>
                  </div>
                </div>
              )}

              {amount <= 0 && amountStr !== '' && (
                <p className="mt-3 rounded-xl bg-danger-50 px-3.5 py-2.5 text-sm font-medium text-danger-600">
                  Enter an amount above ₹0 to continue.
                </p>
              )}

              <Button
                size="lg"
                fullWidth
                className="mt-6"
                onClick={handleAmountContinue}
                disabled={amount <= 0 || amount > balance}
              >
                Review before sending <ArrowRight size={17} />
              </Button>
            </motion.div>
          )}

          {/* ── 2 · HERO REVIEW BEFORE SENDING ──────────── */}
          {step === 2 && recipient && (
            <motion.div
              key="s2-hero-review"
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -24 }}
              transition={{ duration: 0.22 }}
              className="space-y-5"
            >
              <div>
                <h2 className="font-display text-2xl font-bold text-ink-950">Review before sending</h2>
                <p className="mt-1 text-sm text-ink-500">
                  Know exactly what happens before you move your money.
                </p>
              </div>

              {/* Signature Money Impact Preview */}
              <MoneyImpactPreview
                currentBalance={balance}
                amount={amount}
                fee={0}
                type="debit"
                recipientName={recipient.name}
                explanation={`You will still have ${inrFull(balanceAfter)} available to spend after sending ${inr(amount)} to ${recipient.name}.`}
              />

              {/* Comprehensive Review Card */}
              <ReviewSummary
                title="You're about to send"
                amount={amount}
                recipient={recipient}
                fromAccount="VAULT Savings · Instant"
                fee={0}
                balanceAfter={balanceAfter}
                arrival="Instant"
                note={note}
                isLarge={isLarge}
                isNew={isNewRecipient}
              />

              {/* Why This Amount calculation breakdown */}
              <WhyThisAmount
                title="Why this amount & fee?"
                items={[
                  { label: `Transfer to ${recipient.name}`, amount },
                  { label: 'Platform & UPI fee', amount: 0, note: 'Zero fee on all standard transfers' },
                ]}
                total={amount}
                totalLabel="Total deducted from account"
                formulaExplanation={`Zero fees charged. Exactly ${inr(amount)} will move directly from your available balance of ${inrFull(balance)} to ${recipient.name}.`}
              />

              {/* Dual Action CTAs */}
              <div className="pt-2 space-y-2.5">
                <Button size="lg" fullWidth onClick={() => setStep(3)}>
                  <Check size={18} /> Continue to safety checks ({inr(amount)})
                </Button>
                <Button
                  size="lg"
                  fullWidth
                  variant="secondary"
                  onClick={() => setStep(1)}
                >
                  <Edit3 size={16} /> Edit amount or details
                </Button>
              </div>
            </motion.div>
          )}

          {/* ── 3 · SAFE TO SEND (Verification Layer) ────── */}
          {step === 3 && recipient && (
            <motion.div
              key="s3-safe"
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.97 }}
              transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            >
              {/* Header */}
              <div className="flex flex-col items-center text-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', damping: 12, delay: 0.1 }}
                  className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-pos-500 to-pos-700 text-white shadow-lift"
                >
                  <ShieldCheck size={32} />
                </motion.div>
                <h2 className="font-display text-2xl font-bold text-ink-950">Safe to Send</h2>
                <p className="mt-1 text-sm text-ink-500">
                  Automated checks completed so you can send with confidence.
                </p>
              </div>

              {/* Amount reminder */}
              <div className="mt-6 rounded-2xl border border-ink-100 bg-cream-50 p-4 text-center">
                <p className="text-xs font-semibold uppercase tracking-wide text-ink-400">Sending to {recipient.name}</p>
                <p className="tnum mt-1 font-display text-[36px] font-bold leading-none text-ink-950">
                  {inr(amount)}
                </p>
              </div>

              {/* Progress bar */}
              <div className="mt-5 h-1.5 overflow-hidden rounded-full bg-ink-100">
                <motion.div
                  className="h-full rounded-full bg-gradient-to-r from-pos-400 to-pos-600"
                  initial={{ width: '0%' }}
                  animate={{ width: `${(checksComplete / 4) * 100}%` }}
                  transition={{ duration: 0.3, ease: 'easeOut' }}
                />
              </div>
              <p className="mt-2 text-center text-[12px] font-medium text-ink-400">
                {allChecksDone ? 'All safety checks passed ✓' : `Checking ${checksComplete} of 4 security points...`}
              </p>

              {/* Sequential checks */}
              <div className="mt-4 space-y-2">
                <VerifyCheck
                  status={checks[0]}
                  label="Recipient verification"
                  detail={recipient.verified ? 'Payment identity matched & verified' : 'Payment identity registered'}
                />
                <VerifyCheck
                  status={checks[1]}
                  label="Transfer history"
                  detail={hasPreviousPayment ? "You've successfully paid this person before" : 'First payment to this recipient — details checked'}
                />
                <VerifyCheck
                  status={checks[2]}
                  label="Fee transparency"
                  detail="₹0 transfer fee · No hidden costs"
                />
                <VerifyCheck
                  status={checks[3]}
                  label="Available balance"
                  detail={`${inrFull(balance)} available to spend · ${inrFull(balanceAfter)} remaining`}
                />
              </div>

              {/* What did VAULT check? */}
              <button
                onClick={() => setVerifyExpanded(!verifyExpanded)}
                className="mt-4 flex w-full items-center justify-between rounded-xl border border-ink-100 bg-white px-4 py-3 text-left text-[13px] text-ink-500 transition-colors hover:bg-cream-50"
                aria-expanded={verifyExpanded}
              >
                <span className="flex items-center gap-1.5 font-medium">
                  <HelpCircle size={14} className="text-brand-600" />
                  What did VAULT verify?
                </span>
                <ChevronDown
                  size={16}
                  className={`transition-transform duration-200 ${verifyExpanded ? 'rotate-180' : ''}`}
                />
              </button>
              <AnimatePresence>
                {verifyExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="rounded-b-xl border border-t-0 border-ink-100 bg-white px-4 pb-3.5 text-[13px] leading-relaxed text-ink-500 space-y-2">
                      <p>
                        <span className="font-semibold text-ink-700">Recipient</span> — Identity and UPI routing verified.
                      </p>
                      <p>
                        <span className="font-semibold text-ink-700">History</span> —{' '}
                        {hasPreviousPayment
                          ? 'You previously completed transfers with this recipient.'
                          : 'First transfer to this recipient with full details verified.'}
                      </p>
                      <p>
                        <span className="font-semibold text-ink-700">Fees</span> — Zero platform fee or hidden surcharge.
                      </p>
                      <p>
                        <span className="font-semibold text-ink-700">Balance</span> — Sufficient funds available for immediate execution.
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* CTA — appears after checks complete */}
              <div className="mt-6 text-center">
                <AnimatePresence mode="wait">
                  {allChecksDone ? (
                    <motion.div
                      key="done"
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                      className="space-y-2.5"
                    >
                      <p className="mb-2 text-sm font-medium text-pos-700 flex items-center justify-center gap-1">
                        <Check size={16} /> Everything looks clear. Ready to send.
                      </p>
                      <Button size="lg" fullWidth onClick={() => setStep(4)}>
                        <Zap size={18} /> Send {inr(amount)} now
                      </Button>
                      <Button size="lg" fullWidth variant="ghost" onClick={() => setStep(2)}>
                        Back to review
                      </Button>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="checking"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex items-center justify-center gap-2 py-4 text-sm text-ink-400"
                    >
                      <Loader2 size={16} className="animate-spin" /> Verifying your payment...
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          )}

          {/* ── 4 · Confirm ────────────────────────────── */}
          {step === 4 && recipient && (
            <motion.div
              key="s4"
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -24 }}
              transition={{ duration: 0.22 }}
              className="flex flex-col items-center pt-4 text-center"
            >
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-50 text-brand-600">
                <UserRound size={26} />
              </div>
              <h2 className="mt-5 max-w-xs font-display text-2xl font-bold leading-snug text-ink-950">
                You're sending <span className="tnum text-brand-700">{inr(amount)}</span> to {recipient.name}.
              </h2>

              <div className="mt-3 text-sm text-ink-500">
                <p>Fee: <strong className="text-pos-700 font-semibold">₹0</strong> · Instant arrival</p>
                <p className="mt-1">Available balance after: <strong className="text-ink-800 font-semibold">{inrFull(balanceAfter)}</strong></p>
              </div>

              {sendError && (
                <div className="mt-5 w-full rounded-2xl border border-danger-200 bg-danger-50 p-4 text-left">
                  <p className="text-sm font-semibold text-danger-800">We couldn't send the money</p>
                  <p className="mt-1 text-xs text-danger-700">{sendError}</p>
                  <p className="mt-2 text-xs font-medium text-ink-600">Your money was not moved.</p>
                  <div className="mt-3 flex gap-2">
                    <Button size="sm" variant="danger" onClick={handleConfirm}>
                      <RefreshCw size={14} /> Try again
                    </Button>
                    <Button size="sm" variant="secondary" onClick={() => setStep(1)}>
                      Edit transfer
                    </Button>
                  </div>
                </div>
              )}

              {!sendError && (
                <div className="mt-8 w-full max-w-xs space-y-2.5">
                  <Button size="lg" fullWidth onClick={handleConfirm}>
                    <Zap size={18} /> Confirm and send {inr(amount)}
                  </Button>
                  <Button size="lg" fullWidth variant="ghost" onClick={() => setStep(3)}>
                    Go back
                  </Button>
                </div>
              )}
            </motion.div>
          )}

          {/* ── 5 · Success / Smart Receipt ────────────── */}
          {step === 5 && recipient && sentTx && (
            <motion.div
              key="s5"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.2 }}
            >
              <SuccessState
                title="Money sent"
                amount={sentTx.amount}
                subtitle={`to ${recipient.name} (${recipient.upi})`}
                meta={[
                  { label: 'Recipient', value: `${recipient.name} · ${recipient.upi}` },
                  { label: 'Balance now', value: inrFull(sentTx.balanceAfter) },
                  { label: 'Fee', value: '₹0 · No hidden fees' },
                  { label: 'Arrival', value: 'Instant' },
                  { label: 'Reference ID', value: sentTx.id },
                  { label: 'Date & time', value: `${sentTx.date} · ${sentTx.time}` },
                  { label: 'Status', value: 'Completed · Verified' },
                ]}
              >
                <Button
                  size="lg"
                  fullWidth
                  onClick={() => go({ name: 'transaction', id: sentTx.id })}
                >
                  View transaction
                </Button>
                <Button
                  size="lg"
                  fullWidth
                  variant="secondary"
                  onClick={() => go({ name: 'home' })}
                >
                  Done
                </Button>
              </SuccessState>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <Modal
        open={upiModal}
        onClose={() => setUpiModal(false)}
        title="Pay to a UPI ID"
        footer={
          <Button fullWidth size="lg" onClick={addUpiContact}>
            Continue
          </Button>
        }
      >
        <Input
          label="UPI ID"
          placeholder="e.g. rahul@okaxis"
          value={upiId}
          onChange={(e) => {
            setUpiId(e.target.value)
            setUpiError('')
          }}
          error={upiError}
          hint="You'll review the verified recipient and fees before sending."
        />
      </Modal>
    </div>
  )
}

/* ── Sub-components ────────────────────────────────────── */

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
      <button onClick={onChange} className="text-[13px] font-medium text-brand-600 hover:underline">
        Change
      </button>
    </div>
  )
}

function VerifyCheck({ status, label, detail }: { status: CheckStatus; label: string; detail: string }) {
  const isDone = status === 'done'
  const isChecking = status === 'checking'
  const isWarn = status === 'warn'
  const isIdle = status === 'idle'

  return (
    <motion.div
      initial={{ opacity: 0.5 }}
      animate={{ opacity: 1 }}
      className={`flex items-start gap-3 rounded-xl border p-3.5 transition-colors duration-300 ${
        isDone
          ? 'border-pos-200 bg-pos-50'
          : isWarn
          ? 'border-warn-200 bg-warn-50'
          : isChecking
          ? 'border-brand-200 bg-brand-50/50'
          : 'border-ink-100 bg-white'
      }`}
    >
      <motion.span
        key={status}
        initial={{ scale: 0.7, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', damping: 14, stiffness: 300 }}
        className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${
          isDone
            ? 'bg-pos-500 text-white'
            : isWarn
            ? 'bg-warn-500 text-white'
            : isChecking
            ? 'bg-brand-500 text-white'
            : 'bg-ink-200 text-ink-400'
        }`}
      >
        {isDone ? (
          <Check size={12} strokeWidth={3} />
        ) : isWarn ? (
          <AlertTriangle size={11} />
        ) : isChecking ? (
          <Loader2 size={11} className="animate-spin" />
        ) : (
          <CircleCheckBig size={12} />
        )}
      </motion.span>
      <div className="min-w-0 flex-1">
        <p
          className={`text-sm font-semibold ${
            isDone ? 'text-pos-800' : isWarn ? 'text-warn-800' : isChecking ? 'text-brand-700' : 'text-ink-400'
          }`}
        >
          {isChecking ? `Checking ${label.toLowerCase()}...` : label}
        </p>
        <p className="mt-0.5 text-[12px] leading-snug text-ink-500">
          {isIdle ? 'Waiting...' : isChecking ? 'Verifying...' : detail}
        </p>
      </div>
    </motion.div>
  )
}
