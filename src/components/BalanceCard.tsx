import { useEffect, useState } from 'react'
import { animate } from 'framer-motion'
import { Eye, EyeOff, ShieldCheck } from 'lucide-react'
import { TiltCard } from './TiltCard'
import { inrFull } from '../utils/format'

export function BalanceCard({
  balance,
  hideBalance,
  onToggleHide,
}: {
  balance: number
  hideBalance: boolean
  onToggleHide: () => void
}) {
  const [display, setDisplay] = useState(balance)

  useEffect(() => {
    const controls = animate(0, balance, {
      duration: 1,
      ease: [0.22, 1, 0.36, 1],
      onUpdate: (v) => setDisplay(v),
    })
    return () => controls.stop()
  }, [balance])

  return (
    <TiltCard className="rounded-3xl bg-gradient-to-br from-ink-800 via-ink-900 to-ink-950 text-white shadow-lift">
      {/* ambient glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute -right-16 -top-24 h-64 w-64 rounded-full bg-brand-500/20 blur-[70px]"
      />
      {/* faint vault watermark */}
      <svg
        aria-hidden
        className="pointer-events-none absolute -bottom-6 -right-6 h-40 w-40 text-white/[0.04]"
        viewBox="0 0 24 24"
        fill="currentColor"
      >
        <path d="M12 3.5 19 8v8l-7 4.5L5 16V8l7-4.5Z" />
      </svg>

      <div className="relative p-5 sm:p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[13px] font-medium text-ink-200">Available balance</p>
            <p className="mt-0.5 flex items-center gap-1.5 text-xs text-ink-400">
              <ShieldCheck size={12} className="text-pos-400" /> Insured · UPI enabled
            </p>
          </div>
          <button
            onClick={onToggleHide}
            aria-label={hideBalance ? 'Show balance' : 'Hide balance'}
            title={hideBalance ? 'Show balance' : 'Hide balance'}
            className="rounded-xl p-2 text-ink-300 transition-colors hover:bg-white/10 hover:text-white"
          >
            {hideBalance ? <EyeOff size={19} /> : <Eye size={19} />}
          </button>
        </div>

        <div className="mt-4">
          <p
            className={`tnum font-display text-[34px] font-bold leading-none tracking-tight ${
              hideBalance ? 'tracking-widest' : ''
            }`}
            aria-label={hideBalance ? 'Balance hidden' : `Available balance ${inrFull(balance)}`}
          >
            {hideBalance ? '₹ ••••••' : inrFull(display)}
          </p>
        </div>

        <div className="mt-6 flex items-end justify-between border-t border-white/10 pt-4">
          <div>
            <p className="text-xs text-ink-400">Savings account</p>
            <p className="tnum mt-0.5 text-sm font-semibold text-white">VAULT · 9021 4487</p>
          </div>
          <span className="rounded-lg bg-white/10 px-2.5 py-1 text-[11px] font-semibold tracking-wide text-ink-100">
            VAULT
          </span>
        </div>
      </div>
    </TiltCard>
  )
}
