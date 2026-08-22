import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowRight, Check, Eye, ShieldCheck } from 'lucide-react'
import { Button } from '../components/ui/primitives'
import { USER } from '../store/useVault'
import { inrFull } from '../utils/format'
import { STARTING_BALANCE } from '../data/mock'

export default function OnboardingScreen({ onComplete }: { onComplete: () => void }) {
  const [step, setStep] = useState(0)

  return (
    <div className="relative min-h-screen flex items-center justify-center px-6" style={{ background: 'var(--vault-bg)' }}>
      {/* Background */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute -left-32 -top-24 h-96 w-96 rounded-full bg-brand-600/15 blur-[120px]" />
        <div className="absolute -bottom-32 -right-24 h-[28rem] w-[28rem] rounded-full bg-brand-400/10 blur-[130px]" />
      </div>

      <div className="relative w-full max-w-md">
        <AnimatePresence mode="wait">
          {/* Step 0: Value Pillar 1 — Know where your money goes */}
          {step === 0 && (
            <motion.div key="w0" initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }} transition={{ duration: 0.28 }} className="text-center">
              <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 shadow-lift">
                <Eye size={30} className="text-white" />
              </div>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-brand-200 bg-brand-50 px-3 py-0.5 text-xs font-semibold text-brand-700">
                01 · Clarity First
              </span>
              <h1 className="mt-3 font-display text-2xl font-bold" style={{ color: 'var(--vault-text)' }}>
                Know where your money goes.
              </h1>
              <p className="mt-2 text-[15px] leading-relaxed" style={{ color: 'var(--vault-text-secondary)' }}>
                Clear available balances, real-time spending breakdowns, and plain human explanations. No confusing banking jargon.
              </p>
              <div className="mt-6 space-y-2.5 text-left">
                <div className="flex items-center gap-3 rounded-xl border p-3" style={{ borderColor: 'var(--vault-border)', backgroundColor: 'var(--vault-surface)' }}>
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-pos-50 text-pos-600 font-bold text-xs">✓</span>
                  <span className="text-sm font-medium" style={{ color: 'var(--vault-text)' }}>"Available to spend" separated from reserved funds</span>
                </div>
                <div className="flex items-center gap-3 rounded-xl border p-3" style={{ borderColor: 'var(--vault-border)', backgroundColor: 'var(--vault-surface)' }}>
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-600 font-bold text-xs">✓</span>
                  <span className="text-sm font-medium" style={{ color: 'var(--vault-text)' }}>Plain-English narratives on every transaction</span>
                </div>
              </div>
              <Button size="lg" fullWidth className="mt-7" onClick={() => setStep(1)}>Next <ArrowRight size={17} /></Button>
            </motion.div>
          )}

          {/* Step 1: Value Pillar 2 — Know before you pay */}
          {step === 1 && (
            <motion.div key="w1" initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }} transition={{ duration: 0.28 }} className="text-center">
              <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-pos-500 to-pos-700 shadow-lift">
                <ShieldCheck size={30} className="text-white" />
              </div>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-pos-200 bg-pos-50 px-3 py-0.5 text-xs font-semibold text-pos-700">
                02 · Confidence First
              </span>
              <h2 className="mt-3 font-display text-2xl font-bold" style={{ color: 'var(--vault-text)' }}>
                Know what happens before you pay.
              </h2>
              <p className="mt-2 text-[15px] leading-relaxed" style={{ color: 'var(--vault-text-secondary)' }}>
                See recipient details, transparent ₹0 fees, and your exact balance after — before confirming any movement of money.
              </p>
              <div className="mt-6 space-y-2.5 text-left">
                <div className="flex items-center gap-3 rounded-xl border p-3" style={{ borderColor: 'var(--vault-border)', backgroundColor: 'var(--vault-surface)' }}>
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-pos-50 text-pos-600 font-bold text-xs">✓</span>
                  <span className="text-sm font-medium" style={{ color: 'var(--vault-text)' }}>Money Impact Preview on every transfer & split</span>
                </div>
                <div className="flex items-center gap-3 rounded-xl border p-3" style={{ borderColor: 'var(--vault-border)', backgroundColor: 'var(--vault-surface)' }}>
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-600 font-bold text-xs">✓</span>
                  <span className="text-sm font-medium" style={{ color: 'var(--vault-text)' }}>Friendly mistake prevention before confirmation</span>
                </div>
              </div>
              <div className="mt-7 flex gap-2">
                <Button size="lg" variant="secondary" onClick={() => setStep(0)}>Back</Button>
                <Button size="lg" className="flex-1" onClick={() => setStep(2)}>Continue <ArrowRight size={17} /></Button>
              </div>
            </motion.div>
          )}

          {/* Step 2: Confirmation & Demo account ready */}
          {step === 2 && (
            <motion.div key="w2" initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }} transition={{ duration: 0.28 }} className="text-center">
              <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-pos-100 text-pos-600">
                <Check size={32} />
              </div>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-pos-200 bg-pos-50 px-3 py-0.5 text-xs font-semibold text-pos-700">
                03 · Ready to Go
              </span>
              <h2 className="mt-3 font-display text-2xl font-bold" style={{ color: 'var(--vault-text)' }}>
                Make decisions with confidence.
              </h2>
              <p className="mt-2 text-[15px] leading-relaxed" style={{ color: 'var(--vault-text-secondary)' }}>
                Your VAULT demo account is ready with your contact list, sample goals, and transaction history.
              </p>
              <div className="mt-6 rounded-2xl border p-4 text-left shadow-xs" style={{ borderColor: 'var(--vault-border)', backgroundColor: 'var(--vault-surface)' }}>
                <div className="flex items-center justify-between py-1.5">
                  <span className="text-sm" style={{ color: 'var(--vault-text-secondary)' }}>Account Holder</span>
                  <span className="text-sm font-semibold" style={{ color: 'var(--vault-text)' }}>{USER.name}</span>
                </div>
                <div className="flex items-center justify-between py-1.5 border-t" style={{ borderColor: 'var(--vault-border)' }}>
                  <span className="text-sm" style={{ color: 'var(--vault-text-secondary)' }}>UPI ID</span>
                  <span className="tnum text-sm font-semibold" style={{ color: 'var(--vault-text)' }}>{USER.upi}</span>
                </div>
                <div className="flex items-center justify-between py-1.5 border-t" style={{ borderColor: 'var(--vault-border)' }}>
                  <span className="text-sm" style={{ color: 'var(--vault-text-secondary)' }}>Starting Balance</span>
                  <span className="tnum text-sm font-semibold text-brand-600">{inrFull(STARTING_BALANCE)}</span>
                </div>
              </div>
              <Button size="lg" fullWidth className="mt-6" onClick={onComplete}>
                Open VAULT <ArrowRight size={17} />
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
