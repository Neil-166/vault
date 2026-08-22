import { ArrowDown, CheckCircle2, ShieldCheck, TrendingDown, TrendingUp } from 'lucide-react'
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

  if (compact) {
    return (
      <div
        className={`overflow-hidden rounded-2xl border transition-all ${
          isSufficient
            ? 'border-ink-100 bg-white shadow-card'
            : 'border-danger-200 bg-danger-50/50 shadow-card'
        } ${className}`}
      >
        <div className="flex items-center justify-between border-b border-ink-100 bg-cream-50/80 px-4 py-2.5 text-xs">
          <span className="flex items-center gap-1.5 font-semibold text-ink-700">
            <ShieldCheck size={14} className="text-pos-600" />
            Money impact
          </span>
          <span className="text-[11px] font-medium text-ink-400">Before → After</span>
        </div>
        <div className="grid grid-cols-3 divide-x divide-ink-100 p-0">
          <div className="p-3 text-center">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-ink-400">Before</span>
            <p className="tnum mt-1 font-display text-sm font-bold text-ink-800">{inrFull(currentBalance)}</p>
          </div>
          <div className={`p-3 text-center ${isDebit ? 'bg-brand-50/40' : 'bg-pos-50/40'}`}>
            <span className="text-[10px] font-semibold uppercase tracking-wider text-ink-400">{label}</span>
            <p className={`tnum mt-1 font-display text-sm font-bold ${isDebit ? 'text-danger-700' : 'text-pos-700'}`}>
              {isDebit ? '−' : '+'}{inr(amount)}
            </p>
          </div>
          <div className={`p-3 text-center ${isSufficient ? 'bg-pos-50/40' : 'bg-danger-50/40'}`}>
            <span className={`text-[10px] font-semibold uppercase tracking-wider ${isSufficient ? 'text-pos-600' : 'text-danger-600'}`}>After</span>
            <p className={`tnum mt-1 font-display text-sm font-bold ${isSufficient ? 'text-pos-800' : 'text-danger-700'}`}>
              {inrFull(balanceAfter)}
            </p>
          </div>
        </div>
        <div className={`flex items-start gap-2 px-4 py-2.5 text-[11px] leading-relaxed border-t border-ink-100 ${isSufficient ? 'text-pos-800' : 'text-danger-800'}`}>
          {isSufficient
            ? <CheckCircle2 size={13} className="shrink-0 text-pos-600 mt-0.5" />
            : <span className="shrink-0 font-bold text-danger-600">!</span>
          }
          <p className="font-medium">{explanation || defaultExplanation}</p>
        </div>
      </div>
    )
  }

  return (
    <div
      className={`overflow-hidden rounded-2xl border transition-all ${
        isSufficient
          ? 'border-ink-100 bg-white shadow-card'
          : 'border-danger-200 bg-danger-50/50 shadow-card'
      } ${className}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-ink-100 bg-cream-50/80 px-4 py-2.5 text-xs">
        <span className="flex items-center gap-1.5 font-semibold text-ink-700">
          <ShieldCheck size={14} className="text-pos-600" />
          Money impact
        </span>
        <span className="text-[11px] font-medium text-ink-400">
          Know before you move
        </span>
      </div>

      <div className="p-4 space-y-3">
        {/* Visual 3-Stage Flow with arrow connectors */}
        <div className="flex flex-col gap-1">
          {/* Before */}
          <div className="rounded-xl border border-ink-100 bg-cream-50 px-4 py-3">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-ink-400">Before</span>
            <div className="mt-1 flex items-baseline justify-between">
              <p className="tnum font-display text-lg font-bold text-ink-800">
                {inrFull(currentBalance)}
              </p>
              <span className="text-[11.5px] text-ink-500">Available now</span>
            </div>
          </div>

          {/* Arrow connector */}
          <div className="flex justify-center py-0.5">
            <ArrowDown size={16} className="text-ink-300" />
          </div>

          {/* This Action */}
          <div
            className={`rounded-xl border px-4 py-3 ${
              isDebit
                ? 'border-brand-200 bg-brand-50/60'
                : 'border-pos-200 bg-pos-50'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-ink-500">{label}</span>
              <span className="text-[11px] font-semibold text-pos-700">{feeLabel}: {fee === 0 ? '₹0' : `₹${fee}`}</span>
            </div>
            <div className="mt-1 flex items-baseline justify-between">
              <p className={`tnum font-display text-lg font-bold flex items-center gap-1 ${isDebit ? 'text-ink-900' : 'text-pos-800'}`}>
                {isDebit
                  ? <TrendingDown size={16} className="text-danger-500" />
                  : <TrendingUp size={16} className="text-pos-600" />
                }
                {isDebit ? '−' : '+'}{inr(amount)}
              </p>
              <span className="text-[11.5px] text-ink-600 truncate ml-2">
                {recipientName ? `To ${recipientName}` : fee === 0 ? 'Zero fees' : feeLabel}
              </span>
            </div>
          </div>

          {/* Arrow connector */}
          <div className="flex justify-center py-0.5">
            <ArrowDown size={16} className={isSufficient ? 'text-pos-400' : 'text-danger-400'} />
          </div>

          {/* After */}
          <div
            className={`rounded-xl border px-4 py-3 ${
              isSufficient
                ? 'border-pos-200 bg-pos-50/60'
                : 'border-danger-300 bg-danger-50'
            }`}
          >
            <span
              className={`text-[10px] font-semibold uppercase tracking-wider ${
                isSufficient ? 'text-pos-700' : 'text-danger-700'
              }`}
            >
              After
            </span>
            <div className="mt-1 flex items-baseline justify-between">
              <p
                className={`tnum font-display text-lg font-bold ${
                  isSufficient ? 'text-pos-900' : 'text-danger-700'
                }`}
              >
                {inrFull(balanceAfter)}
              </p>
              <span
                className={`text-[11.5px] font-medium ${
                  isSufficient ? 'text-pos-700' : 'text-danger-600'
                }`}
              >
                {isSufficient ? 'Available to spend' : 'Short by ' + inr(Math.abs(balanceAfter))}
              </span>
            </div>
          </div>
        </div>

        {/* Plain Language Reassurance */}
        <div
          className={`flex items-start gap-2.5 rounded-xl p-3 text-xs leading-relaxed ${
            isSufficient
              ? 'bg-pos-50 text-pos-900 border border-pos-200/80'
              : 'bg-danger-50 text-danger-900 border border-danger-200'
          }`}
        >
          {isSufficient ? (
            <CheckCircle2 size={15} className="shrink-0 text-pos-600 mt-0.5" />
          ) : (
            <span className="shrink-0 font-bold text-danger-600 mt-0.5">!</span>
          )}
          <p className="font-medium">
            {explanation || defaultExplanation}
          </p>
        </div>
      </div>
    </div>
  )
}
