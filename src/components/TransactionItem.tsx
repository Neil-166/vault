import { Avatar } from './ui/primitives'
import { CategoryIcon } from './ui/CategoryIcon'
import { Badge } from './ui/primitives'
import { humanDate, inrSigned } from '../utils/format'
import type { Transaction } from '../types'

export function TransactionItem({
  tx,
  onClick,
}: {
  tx: Transaction
  onClick?: () => void
}) {
  const isTransfer = tx.category === 'Transfer' || tx.category === 'Savings'
  const isCredit = tx.type === 'credit'

  return (
    <button
      onClick={onClick}
      className="flex w-full items-center gap-3 rounded-xl px-2 py-2.5 text-left transition-colors hover:bg-cream-50"
    >
      {isTransfer ? (
        <Avatar
          initials={tx.merchant
            .split(' ')
            .slice(0, 2)
            .map((p) => p[0])
            .join('')
            .toUpperCase()}
          hue={hueFromString(tx.merchant)}
          size={40}
          verified={isCredit}
        />
      ) : (
        <CategoryIcon category={tx.category} size={40} />
      )}

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="truncate text-[15px] font-medium text-ink-900">{tx.merchant}</p>
          {tx.status === 'Pending' && <Badge tone="warn">Pending</Badge>}
          {tx.status === 'Failed' && <Badge tone="error">Failed</Badge>}
        </div>
        <p className="mt-0.5 truncate text-[13px] text-ink-400">
          {tx.detail ?? tx.category} · {humanDate(tx.date)} · {tx.time}
        </p>
      </div>

      <div className="text-right">
        <p className={`tnum text-[15px] font-semibold ${isCredit ? 'text-pos-600' : 'text-ink-900'}`}>
          {isCredit ? '+' : '−'}
          {inrSigned(tx.amount).slice(1)}
        </p>
        {tx.fee > 0 && <p className="mt-0.5 text-xs text-ink-400">+ ₹{tx.fee} fee</p>}
      </div>
    </button>
  )
}

export function hueFromString(name: string): number {
  let h = 0
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) % 360
  return h
}
