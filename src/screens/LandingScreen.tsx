import { motion } from 'framer-motion'
import { ArrowRight, CheckCircle2, MessageSquareText, ShieldCheck, Sparkles } from 'lucide-react'

const PILLARS = [
  {
    step: '01',
    icon: ShieldCheck,
    title: 'Know Before You Send',
    desc: 'Transparent amounts, verified recipients, zero hidden fees, and instant arrival checks before money moves.',
    hue: 152,
  },
  {
    step: '02',
    icon: MessageSquareText,
    title: 'Money Without Jargon',
    desc: 'Plain human language. "Available to spend", "Money in / out", and clear explanations for non-finance experts.',
    hue: 232,
  },
  {
    step: '03',
    icon: CheckCircle2,
    title: 'Confidence After Every Action',
    desc: 'Smart receipts, narrative transaction explanations, and real social bill splitting with zero guesswork.',
    hue: 45,
  },
]

export default function LandingScreen({ onEnter }: { onEnter: () => void }) {
  return (
    <div className="relative min-h-screen overflow-hidden" style={{ background: 'var(--vault-bg)' }}>
      {/* Background ambient lighting */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute -left-32 -top-24 h-96 w-96 rounded-full bg-brand-600/20 blur-[120px]" />
        <div className="absolute -bottom-32 -right-24 h-[28rem] w-[28rem] rounded-full bg-brand-400/10 blur-[130px]" />
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              'linear-gradient(rgba(0,0,0,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.1) 1px, transparent 1px)',
            backgroundSize: '56px 56px',
          }}
        />
        <div
          className="absolute inset-0"
          style={{
            background: 'radial-gradient(ellipse at center, transparent 40%, rgba(10,14,31,0.4) 100%)',
          }}
        />
      </div>

      <div className="relative mx-auto flex min-h-screen max-w-5xl flex-col items-center justify-center px-6 py-16 text-center">
        {/* Logo & Category badge */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="mb-6 flex flex-col items-center"
        >
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 shadow-lift">
            <svg width={34} height={34} viewBox="0 0 24 24" fill="none" aria-hidden>
              <path
                d="M12 3.5 19 8v8l-7 4.5L5 16V8l7-4.5Z"
                stroke="white"
                strokeWidth="1.7"
                strokeLinejoin="round"
                fill="rgba(255,255,255,0.1)"
              />
              <path d="M9.5 12.5h5" stroke="white" strokeWidth="1.7" strokeLinecap="round" />
              <path d="M12 12.5v-3.4" stroke="white" strokeWidth="1.7" strokeLinecap="round" />
            </svg>
          </div>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-brand-200 bg-brand-50 px-3.5 py-1 text-xs font-semibold text-brand-700 shadow-xs">
            <Sparkles size={13} /> Track 1 Hackathon Innovation · Confidence-First Banking
          </span>
          <h1 className="mt-3 font-display text-3xl font-bold tracking-tight" style={{ color: 'var(--vault-text)' }}>
            VAULT
          </h1>
        </motion.div>

        {/* Headline */}
        <motion.h2
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.5 }}
          className="max-w-2xl font-display text-4xl font-bold leading-tight tracking-tight sm:text-5xl"
          style={{ color: 'var(--vault-text)' }}
        >
          Banking Without the <span className="text-brand-600">Guesswork.</span>
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="mt-5 max-w-xl text-lg leading-relaxed"
          style={{ color: 'var(--vault-text-secondary)' }}
        >
          Know exactly what happens before, during, and after you move your money. Built around clarity, fee transparency, and emotional calm.
        </motion.p>

        {/* 3 Core Pillars */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45, duration: 0.5 }}
          className="mt-12 grid w-full max-w-4xl gap-4 sm:grid-cols-3"
        >
          {PILLARS.map((p, i) => {
            const Icon = p.icon
            return (
              <motion.div
                key={p.title}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 + i * 0.1, duration: 0.4 }}
                className="rounded-3xl border p-6 text-left transition-all hover:-translate-y-1 hover:shadow-lift"
                style={{
                  borderColor: 'var(--vault-border)',
                  backgroundColor: 'var(--vault-surface)',
                  boxShadow: 'var(--vault-card-shadow)',
                }}
              >
                <div className="flex items-center justify-between mb-4">
                  <span
                    className="flex h-11 w-11 items-center justify-center rounded-2xl"
                    style={{
                      background: `hsl(${p.hue} 68% 95%)`,
                      color: `hsl(${p.hue} 55% 42%)`,
                    }}
                  >
                    <Icon size={22} />
                  </span>
                  <span className="font-mono text-xs font-bold text-ink-300">{p.step}</span>
                </div>
                <h3 className="font-display text-lg font-bold" style={{ color: 'var(--vault-text)' }}>
                  {p.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed" style={{ color: 'var(--vault-text-secondary)' }}>
                  {p.desc}
                </p>
              </motion.div>
            )
          })}
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.85, duration: 0.4 }}
          className="mt-12"
        >
          <button
            onClick={onEnter}
            className="group inline-flex items-center gap-2.5 rounded-2xl bg-ink-950 px-9 py-4 text-base font-semibold text-white shadow-lift transition-all hover:bg-ink-800 hover:shadow-pop active:scale-[0.97]"
          >
            Launch VAULT Experience
            <ArrowRight size={18} className="transition-transform group-hover:translate-x-0.5" />
          </button>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.1 }}
          className="mt-8 text-xs font-medium"
          style={{ color: 'var(--vault-text-tertiary)' }}
        >
          Confidence-First Digital Banking Architecture · Prototype Demonstration
        </motion.p>
      </div>
    </div>
  )
}
