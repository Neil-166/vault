import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ChevronDown, Calculator, HelpCircle } from 'lucide-react'
import { inr } from '../../utils/format'

export interface BreakdownItem {
  label: string
  amount: number
  note?: string
  isSubtotal?: boolean
  isDeduction?: boolean
}

interface WhyThisAmountProps {
  title?: string
  items: BreakdownItem[]
  total: number
  totalLabel?: string
  formulaExplanation?: string
  className?: string
  defaultOpen?: boolean
}

export function WhyThisAmount({
  title = 'Why this amount?',
  items,
  total,
  totalLabel = 'Total',
  formulaExplanation,
  className = '',
  defaultOpen = false,
}: WhyThisAmountProps) {
  const [open, setOpen] = useState(defaultOpen)

  return (
    <div className={`overflow-hidden rounded-2xl border border-ink-100 bg-cream-50/70 shadow-xs ${className}`}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between px-4 py-3 text-left transition-colors hover:bg-cream-100/60"
        aria-expanded={open}
      >
        <span className="flex items-center gap-2 text-xs font-semibold text-ink-800">
          <Calculator size={14} className="text-brand-600" />
          <span>{title}</span>
        </span>
        <div className="flex items-center gap-2">
          <span className="tnum text-xs font-bold text-ink-900">{inr(total)}</span>
          <ChevronDown
            size={15}
            className={`text-ink-400 transition-transform duration-200 ${open ? 'rotate-180 text-brand-600' : ''}`}
          />
        </div>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="border-t border-ink-100 bg-white p-4 space-y-2.5">
              {/* Itemized Calculation Rows */}
              <div className="space-y-2 text-xs">
                {items.map((item, idx) => (
                  <div
                    key={idx}
                    className={`flex items-center justify-between ${
                      item.isSubtotal
                        ? 'border-t border-ink-100 pt-2 font-semibold text-ink-900'
                        : 'text-ink-600'
                    }`}
                  >
                    <span className="flex flex-col">
                      <span className="text-ink-700 font-medium">{item.label}</span>
                      {item.note && (
                        <span className="text-[11px] text-ink-400">{item.note}</span>
                      )}
                    </span>
                    <span className="tnum font-semibold text-ink-900">
                      {item.isDeduction ? '−' : ''}{inr(item.amount)}
                    </span>
                  </div>
                ))}
              </div>

              {/* Total Calculation Row */}
              <div className="flex items-center justify-between border-t border-ink-100 pt-2.5 text-xs font-bold text-ink-950">
                <span>{totalLabel}</span>
                <span className="tnum font-display text-sm text-brand-700">{inr(total)}</span>
              </div>

              {/* Formula or Reasoning Explanation */}
              {formulaExplanation && (
                <div className="mt-3 flex items-start gap-2 rounded-xl bg-cream-50 p-2.5 text-[11.5px] leading-relaxed text-ink-600 border border-ink-100/80">
                  <HelpCircle size={13} className="text-brand-600 mt-0.5 shrink-0" />
                  <p>{formulaExplanation}</p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
