import { ShieldCheck, AlertCircle, CheckCircle2, Clock, Info, ShieldAlert } from 'lucide-react'

export type ConfidenceState =
  | 'clear'
  | 'review'
  | 'new-recipient'
  | 'large-amount'
  | 'pending'
  | 'completed'
  | 'verified'
  | 'insured'

interface ConfidenceStatusProps {
  status: ConfidenceState
  customLabel?: string
  customDetail?: string
  className?: string
  size?: 'sm' | 'md'
}

const STATUS_CONFIG: Record<
  ConfidenceState,
  {
    icon: typeof ShieldCheck
    label: string
    detail?: string
    badgeClass: string
    textClass: string
    dotColor: string
  }
> = {
  clear: {
    icon: ShieldCheck,
    label: 'Clear — no extra fees',
    detail: 'No hidden charges on this action',
    badgeClass: 'bg-pos-50 border-pos-200 text-pos-800',
    textClass: 'text-pos-700',
    dotColor: 'bg-pos-500',
  },
  review: {
    icon: AlertCircle,
    label: 'Review — verify details',
    detail: 'Take a quick look before confirming',
    badgeClass: 'bg-warn-50 border-warn-200 text-warn-800',
    textClass: 'text-warn-700',
    dotColor: 'bg-warn-500',
  },
  'new-recipient': {
    icon: Info,
    label: 'New recipient — please verify',
    detail: 'First time paying this contact',
    badgeClass: 'bg-brand-50 border-brand-200 text-brand-800',
    textClass: 'text-brand-700',
    dotColor: 'bg-brand-500',
  },
  'large-amount': {
    icon: ShieldAlert,
    label: 'Review — larger than usual',
    detail: 'Higher than your typical transfer amount',
    badgeClass: 'bg-warn-50 border-warn-200 text-warn-800',
    textClass: 'text-warn-700',
    dotColor: 'bg-warn-500',
  },
  pending: {
    icon: Clock,
    label: 'Pending — waiting for confirmation',
    detail: 'Your payment has started but hasn’t completed yet',
    badgeClass: 'bg-warn-50 border-warn-200 text-warn-800',
    textClass: 'text-warn-700',
    dotColor: 'bg-warn-500',
  },
  completed: {
    icon: CheckCircle2,
    label: 'Completed — payment received',
    detail: 'Money delivered and accounted for',
    badgeClass: 'bg-pos-50 border-pos-200 text-pos-800',
    textClass: 'text-pos-700',
    dotColor: 'bg-pos-500',
  },
  verified: {
    icon: ShieldCheck,
    label: 'Saved contact',
    detail: 'In your contact list',
    badgeClass: 'bg-brand-50 border-brand-200 text-brand-800',
    textClass: 'text-brand-700',
    dotColor: 'bg-brand-500',
  },
  insured: {
    icon: ShieldCheck,
    label: 'Transparent payment',
    detail: 'Zero fee on standard transactions',
    badgeClass: 'bg-pos-50 border-pos-200 text-pos-800',
    textClass: 'text-pos-700',
    dotColor: 'bg-pos-500',
  },
}

export function ConfidenceStatus({
  status,
  customLabel,
  customDetail,
  className = '',
  size = 'md',
}: ConfidenceStatusProps) {
  const config = STATUS_CONFIG[status]
  const Icon = config.icon
  const label = customLabel ?? config.label
  const detail = customDetail ?? config.detail

  if (size === 'sm') {
    return (
      <span
        className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium ${config.badgeClass} ${className}`}
      >
        <span className={`h-1.5 w-1.5 rounded-full ${config.dotColor}`} />
        <Icon size={12} className="shrink-0" />
        <span>{label}</span>
      </span>
    )
  }

  return (
    <div
      className={`flex items-start gap-3 rounded-2xl border p-3.5 transition-all ${config.badgeClass} ${className}`}
    >
      <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-white/80 shadow-xs">
        <Icon size={15} className={config.textClass} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold">{label}</p>
        {detail && <p className="mt-0.5 text-[12.5px] opacity-85 leading-snug">{detail}</p>}
      </div>
    </div>
  )
}
