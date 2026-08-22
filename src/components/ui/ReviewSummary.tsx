import { ShieldCheck, BadgeCheck, Clock } from 'lucide-react'
import type { Contact } from '../../types'
import { inr, inrFull } from '../../utils/format'
import { Avatar } from './primitives'
import { ConfidenceStatus } from './ConfidenceStatus'

interface ReviewSummaryProps {
  title?: string
  amount: number
  recipient: Contact
  fromAccount?: string
  fee?: number
  balanceAfter?: number
  arrival?: string
  note?: string
  isLarge?: boolean
  isNew?: boolean
  className?: string
}

export function ReviewSummary({
  title = "You're about to send",
  amount,
  recipient,
  fromAccount = 'VAULT · Instant Balance',
  fee = 0,
  balanceAfter,
  arrival = 'Instant',
  note,
  isLarge = false,
  isNew = false,
  className = '',
}: ReviewSummaryProps) {
  const total = amount + fee

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Hero amount card */}
      <div className="rounded-3xl border border-ink-100 bg-cream-50 p-6 text-center shadow-card">
        <p className="text-xs font-semibold uppercase tracking-wider text-ink-400">{title}</p>
        <p className="tnum mt-2 font-display text-[44px] font-bold leading-none text-ink-950">
          {inr(amount)}
        </p>

        <div className="mt-4 flex items-center justify-center gap-2">
          {recipient.verified ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-brand-50 px-2.5 py-1 text-xs font-medium text-brand-700">
              <BadgeCheck size={13} className="text-brand-600" />
              Saved contact
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 rounded-full bg-ink-100 px-2.5 py-1 text-xs font-medium text-ink-600">
              New contact
            </span>
          )}
          <span className="inline-flex items-center gap-1 rounded-full bg-pos-50 px-2.5 py-1 text-xs font-medium text-pos-700">
            <Clock size={13} className="text-pos-600" />
            {arrival} arrival
          </span>
        </div>
      </div>

      {/* Structured detail rows */}
      <dl className="divide-y divide-ink-100 rounded-2xl border border-ink-100 bg-white shadow-card overflow-hidden">
        {/* Recipient */}
        <div className="flex items-center justify-between p-4">
          <dt className="text-sm text-ink-500">To</dt>
          <dd className="flex items-center gap-2.5 text-right">
            <div className="min-w-0">
              <p className="text-sm font-semibold text-ink-900 flex items-center justify-end gap-1">
                {recipient.name}
                {recipient.verified && <BadgeCheck size={14} className="text-brand-600 shrink-0" />}
              </p>
              <p className="text-xs text-ink-400">{recipient.upi}</p>
            </div>
            <Avatar initials={recipient.initials} hue={recipient.hue} size={36} />
          </dd>
        </div>

        {/* From */}
        <div className="flex items-center justify-between p-4">
          <dt className="text-sm text-ink-500">From</dt>
          <dd className="text-right">
            <p className="text-sm font-semibold text-ink-900">{fromAccount}</p>
            <p className="text-xs text-ink-400">Available to spend</p>
          </dd>
        </div>

        {/* Fee */}
        <div className="flex items-center justify-between p-4">
          <dt className="text-sm text-ink-500">Fee</dt>
          <dd className="text-right">
            <span className={`tnum text-sm font-semibold ${fee === 0 ? 'text-pos-600' : 'text-ink-900'}`}>
              {fee === 0 ? '₹0 · No hidden fees' : inr(fee)}
            </span>
          </dd>
        </div>

        {/* You pay vs Recipient receives */}
        <div className="flex items-center justify-between p-4 bg-cream-50/50">
          <dt className="text-sm font-semibold text-ink-900">You pay</dt>
          <dd className="tnum font-display text-base font-bold text-ink-950">{inr(total)}</dd>
        </div>

        <div className="flex items-center justify-between p-4 bg-cream-50/50">
          <dt className="text-sm font-semibold text-ink-900">Recipient receives</dt>
          <dd className="tnum font-display text-base font-bold text-pos-700">{inr(amount)}</dd>
        </div>

        {/* Arrival */}
        <div className="flex items-center justify-between p-4">
          <dt className="text-sm text-ink-500">Arrival</dt>
          <dd className="text-sm font-semibold text-ink-900">{arrival}</dd>
        </div>

        {/* Balance After */}
        {balanceAfter !== undefined && (
          <div className="flex items-center justify-between p-4">
            <dt className="text-sm text-ink-500">Available after</dt>
            <dd className="tnum text-sm font-semibold text-ink-800">{inrFull(balanceAfter)}</dd>
          </div>
        )}

        {/* Note */}
        {note && (
          <div className="flex items-center justify-between p-4">
            <dt className="text-sm text-ink-500">Note</dt>
            <dd className="text-sm text-ink-800 italic truncate max-w-[200px]">"{note}"</dd>
          </div>
        )}
      </dl>

      {/* Safety Reassurance */}
      {isLarge ? (
        <ConfidenceStatus
          status="large-amount"
          customLabel="Larger transfer than usual"
          customDetail="Take a moment to verify the recipient and amount before confirming."
        />
      ) : isNew ? (
        <ConfidenceStatus
          status="new-recipient"
          customLabel="New recipient — please verify"
          customDetail="First time sending money to this contact."
        />
      ) : (
        <div className="flex items-center gap-2 rounded-xl bg-pos-50 px-3.5 py-3 text-xs font-medium text-pos-800 border border-pos-200">
          <ShieldCheck size={16} className="text-pos-600 shrink-0" />
          <span>Everything looks clear. Review once more before sending.</span>
        </div>
      )}
    </div>
  )
}
