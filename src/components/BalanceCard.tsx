import { useEffect, useState } from 'react'
import { animate } from 'framer-motion'
import { ChevronDown, Eye, EyeOff, Lock, Clock } from 'lucide-react'
import { TiltCard } from './TiltCard'
import { inr, inrFull } from '../utils/format'
import { useVault } from '../store/useVault'

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
  const [expanded, setExpanded] = useState(false)
  const goals = useVault((s) => s.goals)
  const totalReservedInGoals = goals.reduce((sum, g) => sum + g.saved, 0)
  const pendingHolds = 0

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
            <p className="text-[13px] font-medium text-ink-300">Available to spend</p>
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

        <div className="mt-3">
          <p
            className={`tnum font-display text-[34px] font-bold leading-none tracking-tight ${
              hideBalance ? 'tracking-widest' : ''
            }`}
            aria-label={hideBalance ? 'Balance hidden' : `Available to spend ${inrFull(balance)}`}
          >
            {hideBalance ? '₹ ••••••' : inrFull(display)}
          </p>
        </div>

        {/* Expandable "Why this amount?" breakdown */}
        <button
          onClick={() => setExpanded(!expanded)}
          className="mt-3 flex items-center gap-1 text-[12px] font-medium text-ink-400 hover:text-ink-200 transition-colors"
          aria-expanded={expanded}
        >
          Why this amount?
          <ChevronDown
            size={13}
            className={`transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`}
          />
        </button>

        {expanded && (
          <div className="mt-2 rounded-xl border border-white/10 bg-white/5 p-3 text-xs space-y-1.5 animate-fade">
            <div className="flex justify-between text-ink-300">
              <span>Total balance</span>
              <span className="tnum font-semibold text-ink-100">
                {hideBalance ? '••••' : inrFull(balance + totalReservedInGoals + pendingHolds)}
              </span>
            </div>
            <div className="flex justify-between text-ink-400">
              <span className="flex items-center gap-1">
                <Lock size={10} className="text-brand-400" /> Reserved in goals
              </span>
              <span className="tnum text-ink-300">
                − {hideBalance ? '••••' : inr(totalReservedInGoals)}
              </span>
            </div>
            <div className="flex justify-between text-ink-400">
              <span className="flex items-center gap-1">
                <Clock size={10} className="text-pos-400" /> Pending holds
              </span>
              <span className="tnum text-ink-300">
                − {hideBalance ? '••••' : inr(pendingHolds)}
              </span>
            </div>
            <div className="flex justify-between border-t border-white/10 pt-1.5 text-ink-100 font-semibold">
              <span>Available to spend</span>
              <span className="tnum">{hideBalance ? '••••' : inrFull(balance)}</span>
            </div>
          </div>
        )}

        {/* Sub-bar: goals and pending (collapsed view) */}
        {!expanded && (
          <div className="mt-4 grid grid-cols-2 gap-2 rounded-2xl bg-white/5 p-3 border border-white/5 text-xs">
            <div>
              <span className="text-ink-400 flex items-center gap-1">
                <Lock size={11} className="text-brand-300" /> In savings goals
              </span>
              <p className="tnum font-semibold text-ink-100 mt-0.5">
                {hideBalance ? '••••' : inr(totalReservedInGoals)}
              </p>
            </div>
            <div>
              <span className="text-ink-400 flex items-center gap-1">
                <Clock size={11} className="text-pos-300" /> Pending holds
              </span>
              <p className="tnum font-semibold text-pos-300 mt-0.5">
                {hideBalance ? '••••' : inr(pendingHolds)}
              </p>
            </div>
          </div>
        )}

        <div className="mt-4 flex items-end justify-between border-t border-white/10 pt-4">
          <div>
            <p className="text-xs text-ink-400">Savings account</p>
            <p className="tnum mt-0.5 text-sm font-semibold text-white">VAULT · 9021 4487</p>
          </div>
          <span className="inline-flex items-center gap-1 rounded-lg bg-white/10 px-2.5 py-1 text-[11px] font-semibold tracking-wide text-ink-100">
            UPI · Instant
          </span>
        </div>
      </div>
    </TiltCard>
  )
}
