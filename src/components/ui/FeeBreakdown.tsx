import { ShieldCheck, HelpCircle } from 'lucide-react'
import { inr } from '../../utils/format'

interface FeeBreakdownProps {
  amount: number
  fee?: number
  feeLabel?: string
  totalLabel?: string
  showGuarantee?: boolean
  className?: string
  onFeeInfoClick?: () => void
}

export function FeeBreakdown({
  amount,
  fee = 0,
  feeLabel = 'Transfer fee',
  totalLabel = 'Total you pay',
  showGuarantee = true,
  className = '',
  onFeeInfoClick,
}: FeeBreakdownProps) {
  const total = amount + fee

  return (
    <div className={`rounded-2xl border border-ink-100 bg-white shadow-card overflow-hidden ${className}`}>
      <div className="p-4 space-y-2.5">
        {/* Amount */}
        <div className="flex items-center justify-between text-sm">
          <span className="text-ink-500">Amount</span>
          <span className="tnum font-medium text-ink-900">{inr(amount)}</span>
        </div>

        {/* Fee */}
        <div className="flex items-center justify-between text-sm">
          <span className="flex items-center gap-1 text-ink-500">
            {feeLabel}
            {onFeeInfoClick && (
              <button
                type="button"
                onClick={onFeeInfoClick}
                className="text-ink-400 hover:text-ink-600 transition-colors"
                title="About this fee"
                aria-label="About this fee"
              >
                <HelpCircle size={13} />
              </button>
            )}
          </span>
          <span className={`tnum font-semibold ${fee === 0 ? 'text-pos-600' : 'text-ink-900'}`}>
            {fee === 0 ? '₹0' : inr(fee)}
          </span>
        </div>

        {/* Total */}
        <div className="border-t border-ink-100 pt-2.5 flex items-center justify-between">
          <span className="text-sm font-semibold text-ink-950">{totalLabel}</span>
          <span className="tnum font-display text-lg font-bold text-ink-950">{inr(total)}</span>
        </div>
      </div>

      {showGuarantee && (
        <div className="bg-cream-50 px-4 py-2.5 border-t border-ink-100/70 flex items-center gap-2 text-xs text-ink-500">
          <ShieldCheck size={14} className="shrink-0 text-pos-600" />
          <span>
            {fee === 0 ? (
              <>
                <strong className="font-semibold text-ink-700">No hidden fees.</strong> What you see is exactly what moves.
              </>
            ) : (
              <>
                <strong className="font-semibold text-ink-700">Clear fee structure.</strong> All charges shown before you confirm.
              </>
            )}
          </span>
        </div>
      )}
    </div>
  )
}
