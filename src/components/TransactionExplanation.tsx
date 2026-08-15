import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { HelpCircle, ChevronDown, ShieldCheck } from 'lucide-react'
import type { Transaction } from '../types'
import { inr, inrFull, longDate } from '../utils/format'

interface TransactionExplanationProps {
  tx: Transaction
  className?: string
}

export function TransactionExplanation({ tx, className = '' }: TransactionExplanationProps) {
  const [whyOpen, setWhyOpen] = useState(false)
  const isCredit = tx.type === 'credit'

  // Plain-English narrative explanation based on transaction data
  const generateNarrative = () => {
    if (isCredit) {
      if (tx.category === 'Transfer') {
        return `You received ${inr(tx.amount)} from ${tx.merchant} via ${tx.method}. This money was instantly added to your available balance.`
      }
      return `${tx.merchant} credited ${inr(tx.amount)} directly to your account. Your updated balance reflects this change.`
    } else {
      if (tx.category === 'Transfer') {
        return `You sent ${inr(tx.amount)} to ${tx.merchant} using instant ${tx.method}. No transfer fee was charged, and the recipient received the full amount.`
      }
      if (tx.category === 'Savings') {
        return `You moved ${inr(tx.amount)} into your ${tx.merchant} savings goal. This money remains yours and is safely reserved toward your target.`
      }
      if (tx.category === 'Bills') {
        return `You paid ${inr(tx.amount)} to ${tx.merchant}${tx.fee > 0 ? ` (plus ₹${tx.fee} processing fee)` : ' with ₹0 fees'}. Your payment was confirmed and settled.`
      }
      return `A payment of ${inr(tx.amount)} was authorized and completed at ${tx.merchant} using ${tx.method}.`
    }
  }

  const generateWhyAppears = () => {
    if (tx.status === 'Completed') {
      return `This record appears because an electronic payment was verified and settled. Your balance changed from ${inrFull(
        isCredit ? tx.balanceAfter - tx.amount : tx.balanceAfter + tx.amount + tx.fee,
      )} to ${inrFull(tx.balanceAfter)}.`
    }
    if (tx.status === 'Pending') {
      return 'This payment has been submitted to the payment network and is waiting for bank confirmation. No funds will be lost.'
    }
    return 'This payment could not be completed. Your money was not deducted from your account.'
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* What happened section */}
      <div className="rounded-2xl border border-ink-100 bg-white p-4 shadow-card">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-ink-400">What happened</h4>
        <p className="mt-2 text-sm leading-relaxed text-ink-800">
          {generateNarrative()}
        </p>

        <div className="mt-3 flex items-center gap-2 pt-3 border-t border-ink-100/80">
          <ShieldCheck size={15} className="text-pos-600 shrink-0" />
          <span className="text-xs font-medium text-ink-600">
            {tx.fee === 0 ? 'No hidden fees charged · ₹0 transfer fee' : `Transparent fee of ₹${tx.fee} applied`}
          </span>
        </div>
      </div>

      {/* Why this appears (expandable) */}
      <div className="rounded-2xl border border-ink-100 bg-cream-50 overflow-hidden shadow-xs">
        <button
          type="button"
          onClick={() => setWhyOpen(!whyOpen)}
          className="flex w-full items-center justify-between p-3.5 text-left text-xs font-medium text-ink-700 hover:bg-cream-100 transition-colors"
          aria-expanded={whyOpen}
        >
          <span className="flex items-center gap-2">
            <HelpCircle size={14} className="text-brand-600" />
            <span>Why this appears in your activity</span>
          </span>
          <ChevronDown
            size={15}
            className={`text-ink-400 transition-transform duration-200 ${whyOpen ? 'rotate-180' : ''}`}
          />
        </button>

        <AnimatePresence initial={false}>
          {whyOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="border-t border-ink-100/80 bg-white p-3.5 text-xs leading-relaxed text-ink-600 space-y-2">
                <p>{generateWhyAppears()}</p>
                <div className="flex items-center justify-between pt-2 border-t border-ink-100 text-[11px] text-ink-400">
                  <span>Logged at {longDate(tx.date, tx.time)}</span>
                  <span className="font-mono">Ref: {tx.id.slice(0, 10)}</span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
