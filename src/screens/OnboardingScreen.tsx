import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowRight, Check, Landmark, ShieldCheck, Wallet } from 'lucide-react'
import { Button } from '../components/ui/primitives'
import { USER } from '../store/useVault'

const BANKS = [
  { id: 'hdfc', name: 'HDFC Bank', color: '#004b8d' },
  { id: 'sbi', name: 'State Bank of India', color: '#223f8f' },
  { id: 'icici', name: 'ICICI Bank', color: '#f37c21' },
  { id: 'axis', name: 'Axis Bank', color: '#97144d' },
]

export default function OnboardingScreen({ onComplete }: { onComplete: () => void }) {
  const [step, setStep] = useState(0)
  const [selectedBank, setSelectedBank] = useState(BANKS[0])

  return (
    <div className="relative min-h-screen flex items-center justify-center px-6" style={{ background: 'var(--vault-bg)' }}>
      {/* Background */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute -left-32 -top-24 h-96 w-96 rounded-full bg-brand-600/15 blur-[120px]" />
        <div className="absolute -bottom-32 -right-24 h-[28rem] w-[28rem] rounded-full bg-brand-400/10 blur-[130px]" />
      </div>

      <div className="relative w-full max-w-md">
        <AnimatePresence mode="wait">
          {/* Step 0: Welcome */}
          {step === 0 && (
            <motion.div key="w0" initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }} transition={{ duration: 0.3 }} className="text-center">
              <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 shadow-lift">
                <ShieldCheck size={30} className="text-white" />
              </div>
              <h1 className="font-display text-2xl font-bold" style={{ color: 'var(--vault-text)' }}>Welcome to VAULT</h1>
              <p className="mt-2 text-[15px] leading-relaxed" style={{ color: 'var(--vault-text-secondary)' }}>
                A banking experience designed around clarity and confidence. Let's set up your account in a few quick steps.
              </p>
              <div className="mt-8 space-y-3">
                <div className="flex items-center gap-3 rounded-xl border p-3.5 text-left" style={{ borderColor: 'var(--vault-border)', backgroundColor: 'var(--vault-surface)' }}>
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-600"><Landmark size={16} /></span>
                  <span className="text-sm" style={{ color: 'var(--vault-text-secondary)' }}>Link your bank account</span>
                </div>
                <div className="flex items-center gap-3 rounded-xl border p-3.5 text-left" style={{ borderColor: 'var(--vault-border)', backgroundColor: 'var(--vault-surface)' }}>
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-600"><Wallet size={16} /></span>
                  <span className="text-sm" style={{ color: 'var(--vault-text-secondary)' }}>Set up your UPI ID</span>
                </div>
                <div className="flex items-center gap-3 rounded-xl border p-3.5 text-left" style={{ borderColor: 'var(--vault-border)', backgroundColor: 'var(--vault-surface)' }}>
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-600"><ShieldCheck size={16} /></span>
                  <span className="text-sm" style={{ color: 'var(--vault-text-secondary)' }}>You're ready to go</span>
                </div>
              </div>
              <Button size="lg" fullWidth className="mt-8" onClick={() => setStep(1)}>Get started <ArrowRight size={17} /></Button>
            </motion.div>
          )}

          {/* Step 1: Link bank */}
          {step === 1 && (
            <motion.div key="w1" initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }} transition={{ duration: 0.3 }}>
              <h2 className="font-display text-xl font-bold text-center" style={{ color: 'var(--vault-text)' }}>Link your bank</h2>
              <p className="mt-1 text-sm text-center" style={{ color: 'var(--vault-text-secondary)' }}>Choose your primary bank account.</p>
              <div className="mt-6 space-y-2.5">
                {BANKS.map((b) => (
                  <button key={b.id} onClick={() => setSelectedBank(b)} className={`flex w-full items-center gap-3 rounded-xl border p-4 text-left transition-all ${selectedBank.id === b.id ? 'border-brand-400 shadow-lift' : 'hover:border-ink-300'}`} style={{ borderColor: selectedBank.id === b.id ? undefined : 'var(--vault-border)', backgroundColor: 'var(--vault-surface)' }}>
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl text-white font-bold text-sm" style={{ background: b.color }}>{b.name.charAt(0)}</span>
                    <span className="flex-1 text-[15px] font-medium" style={{ color: 'var(--vault-text)' }}>{b.name}</span>
                    {selectedBank.id === b.id && <span className="flex h-5 w-5 items-center justify-center rounded-full bg-brand-600 text-white"><Check size={12} /></span>}
                  </button>
                ))}
              </div>
              <Button size="lg" fullWidth className="mt-6" onClick={() => setStep(2)}>Continue <ArrowRight size={17} /></Button>
              <button onClick={() => setStep(0)} className="mt-3 w-full text-center text-sm font-medium" style={{ color: 'var(--vault-text-secondary)' }}>Go back</button>
            </motion.div>
          )}

          {/* Step 2: Set UPI */}
          {step === 2 && (
            <motion.div key="w2" initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }} transition={{ duration: 0.3 }} className="text-center">
              <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-pos-100 text-pos-600">
                <Check size={28} />
              </div>
              <h2 className="font-display text-xl font-bold" style={{ color: 'var(--vault-text)' }}>You're all set!</h2>
              <p className="mt-2 text-[15px] leading-relaxed" style={{ color: 'var(--vault-text-secondary)' }}>
                Your VAULT is connected to <span className="font-semibold" style={{ color: 'var(--vault-text)' }}>{selectedBank.name}</span> and your UPI is <span className="font-semibold" style={{ color: 'var(--vault-text)' }}>{USER.upi}</span>.
              </p>
              <div className="mt-6 rounded-2xl border p-4 text-left" style={{ borderColor: 'var(--vault-border)', backgroundColor: 'var(--vault-surface)' }}>
                <div className="flex items-center justify-between py-1.5">
                  <span className="text-sm" style={{ color: 'var(--vault-text-secondary)' }}>Bank</span>
                  <span className="text-sm font-semibold" style={{ color: 'var(--vault-text)' }}>{selectedBank.name}</span>
                </div>
                <div className="flex items-center justify-between py-1.5 border-t" style={{ borderColor: 'var(--vault-border)' }}>
                  <span className="text-sm" style={{ color: 'var(--vault-text-secondary)' }}>UPI ID</span>
                  <span className="tnum text-sm font-semibold" style={{ color: 'var(--vault-text)' }}>{USER.upi}</span>
                </div>
                <div className="flex items-center justify-between py-1.5 border-t" style={{ borderColor: 'var(--vault-border)' }}>
                  <span className="text-sm" style={{ color: 'var(--vault-text-secondary)' }}>Account</span>
                  <span className="tnum text-sm font-semibold" style={{ color: 'var(--vault-text)' }}>{USER.accountNumber}</span>
                </div>
              </div>
              <Button size="lg" fullWidth className="mt-6" onClick={onComplete}>Open VAULT <ArrowRight size={17} /></Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
