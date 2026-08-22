import { CheckCircle2, ShieldCheck, TrendingDown, TrendingUp } from 'lucide-react'
import { inr, inrFull } from '../../utils/format'

interface MoneyImpactPreviewProps {
  currentBalance: number
  amount: number
  fee?: number
  type?: 'debit' | 'credit'
  label?: string
  feeLabel?: string
  recipientName?: string
  explanation?: string
  className?: string
  compact?: boolean
}

export function MoneyImpactPreview({
  currentBalance,
  amount,
  fee = 0,
  type = 'debit',
  label = 'This payment',
  feeLabel = 'Fee',
  recipientName,
  explanation,
  className = '',
  compact = false,
}: MoneyImpactPreviewProps) {
  const isDebit = type === 'debit'
  const totalChange = amount + (isDebit ? fee : -fee)
  const balanceAfter = Math.round((isDebit ? currentBalance - totalChange : currentBalance + amount) * 100) / 100
  const isSufficient = isDebit ? currentBalance >= totalChange : true

  const defaultExplanation = isDebit
    ? `You will still have ${inrFull(balanceAfter)} available to spend after this payment.`
    : `Your available balance will increase to ${inrFull(balanceAfter)} instantly.`

  return (
    <div
      className={`overflow-hidden rounded-2xl border transition-all ${
        isSufficient
          ? 'border-ink-100 bg-white shadow-card'
          : 'border-danger-200 bg-danger-50/50 shadow-card'
      } ${className}`}
    >
      {/* Header Badge */}
      <div className="flex items-center justify-between border-b border-ink-100 bg-cream-50/80 px-4 py-2.5 text-xs">
        <span className="flex items-center gap-1.5 font-semibold text-ink-700">
          <ShieldCheck size={14} className="text-pos-600" />
          Money Impact Preview
        </span>
        <span className="text-[11px] font-medium text-ink-400">
          Know before you move
        </span>
      </div>

      <div className="p-4 space-y-4">
        {/* Visual 3-Stage Flow: Before -> Movement -> After */}
        <div className={`grid ${compact ? 'grid-cols-1 gap-2' : 'grid-cols-1 sm:grid-cols-3 gap-3'} items-stretch`}>
          {/* Before */}
          <div className="rounded-xl border border-ink-100 bg-cream-50 p-3 text-center sm:text-left">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-ink-400">
              Before
            </span>
            <p className="tnum mt-1 font-display text-base font-bold text-ink-800">
              {inrFull(currentBalance)}
            </p>
            <span className="text-[11.5px] text-ink-500 block mt-0.5">
              Available now
            </span>
          </div>

          {/* This Action */}
          <div
            className={`rounded-xl border p-3 text-center sm:text-left ${
              isDebit
                ? 'border-brand-200 bg-brand-50/60 text-brand-900'
                : 'border-pos-200 bg-pos-50 text-pos-900'
            }`}
          >
            <div className="flex items-center justify-between text-[11px] font-semibold uppercase tracking-wider">
              <span>{label}</span>
              <span className="text-pos-700 font-bold">{fee === 0 ? '₹0 fee' : `+₹${fee} fee`}</span>
            </div>
            <p className="tnum mt-1 font-display text-base font-bold flex items-center justify-center sm:justify-start gap-1">
              {isDebit ? <TrendingDown size={15} className="text-danger-600" /> : <TrendingUp size={15} className="text-pos-600" />}
              {isDebit ? '−' : '+'}{inr(amount)}
            </p>
            <span className="text-[11.5px] text-ink-600 block mt-0.5 truncate">
              {recipientName ? `To ${recipientName}` : fee === 0 ? 'Zero hidden fees' : feeLabel}
            </span>
          </div>

          {/* After */}
          <div
            className={`rounded-xl border p-3 text-center sm:text-left ${
              isSufficient
                ? 'border-pos-200 bg-pos-50/60'
                : 'border-danger-300 bg-danger-50'
            }`}
          >
            <span
              className={`text-[11px] font-semibold uppercase tracking-wider ${
                isSufficient ? 'text-pos-800' : 'text-danger-800'
              }`}
            >
              After
            </span>
            <p
              className={`tnum mt-1 font-display text-base font-bold ${
                isSufficient ? 'text-pos-900' : 'text-danger-700'
              }`}
            >
              {inrFull(balanceAfter)}
            </p>
            <span
              className={`text-[11.5px] block mt-0.5 font-medium ${
                isSufficient ? 'text-pos-700' : 'text-danger-600'
              }`}
            >
              {isSufficient ? 'Available to spend' : 'Short by ' + inr(Math.abs(balanceAfter))}
            </span>
          </div>
        </div>

        {/* Plain Language Reassurance Statement */}
        <div
          className={`flex items-start gap-2.5 rounded-xl p-3 text-xs leading-relaxed ${
            isSufficient
              ? 'bg-pos-50 text-pos-900 border border-pos-200/80'
              : 'bg-danger-50 text-danger-900 border border-danger-200'
          }`}
        >
          {isSufficient ? (
            <CheckCircle2 size={16} className="shrink-0 text-pos-600 mt-0.5" />
          ) : (
            <span className="shrink-0 font-bold text-danger-600">!</span>
          )}
          <p className="font-medium">
            {explanation || defaultExplanation}
          </p>
        </div>
      </div>
    </div>
  )
}
