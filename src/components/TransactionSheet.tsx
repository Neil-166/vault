import { Copy } from 'lucide-react'
import { Avatar, Badge } from './ui/primitives'
import { CategoryIcon } from './ui/CategoryIcon'
import { TransactionExplanation } from './TransactionExplanation'
import { WhyThisAmount } from './ui/WhyThisAmount'
import { useVault } from '../store/useVault'
import { inr, inrFull, longDate } from '../utils/format'
import type { Transaction } from '../types'

export function TransactionSheet({ tx }: { tx: Transaction }) {
  const pushToast = useVault((s) => s.pushToast)
  const isCredit = tx.type === 'credit'
  const isPerson = tx.category === 'Transfer' || tx.category === 'Savings'

  const copyId = () => {
    navigator.clipboard?.writeText(tx.id).catch(() => {})
    pushToast({ tone: 'success', title: 'Copied', body: 'Transaction ID copied.' })
  }

  return (
    <div className="px-5 pb-8 pt-2 space-y-5">
      {/* Amount & Identity */}
      <div className="flex flex-col items-center text-center pb-2">
        {isPerson ? (
          <Avatar
            initials={tx.merchant.split(' ').slice(0, 2).map((p) => p[0]).join('').toUpperCase()}
            hue={hueOf(tx.merchant)}
            size={56}
            verified={isCredit}
          />
        ) : (
          <CategoryIcon category={tx.category} size={56} />
        )}
        <p className="mt-3 text-[13px] font-medium text-ink-400">{tx.detail ?? tx.category}</p>
        <p className="mt-0.5 font-display text-xl font-semibold text-ink-900">{tx.merchant}</p>
        <p className={`tnum mt-2 font-display text-[32px] font-bold leading-none ${isCredit ? 'text-pos-600' : 'text-ink-950'}`}>
          {isCredit ? '+' : '−'}{inr(tx.amount)}
        </p>
        <p className="mt-1 text-xs font-semibold uppercase tracking-wider text-ink-400">
          {isCredit ? 'Money in' : 'Money out'}
        </p>
        <div className="mt-2.5">
          {tx.status === 'Completed' ? (
            <Badge tone="success">Payment Completed</Badge>
          ) : tx.status === 'Pending' ? (
            <Badge tone="warn">Payment Pending</Badge>
          ) : (
            <Badge tone="error">Payment Failed</Badge>
          )}
        </div>
      </div>

      {/* Structured plain English breakdown */}
      <div className="rounded-2xl border border-ink-100 bg-white divide-y divide-ink-100 shadow-card overflow-hidden">
        <MetaRow label="Date & time" value={longDate(tx.date, tx.time)} />
        <MetaRow label="Payment method" value={tx.method} />
        <MetaRow label="Category" value={tx.category} />
        <MetaRow
          label="Balance before"
          value={inrFull(
            isCredit
              ? Math.round((tx.balanceAfter - tx.amount) * 100) / 100
              : Math.round((tx.balanceAfter + tx.amount + tx.fee) * 100) / 100,
          )}
        />
        <MetaRow label="Fee" value={tx.fee === 0 ? '₹0 · No hidden fees' : `₹${tx.fee}`} accent={tx.fee === 0} />
        <MetaRow label="Balance after" value={inrFull(tx.balanceAfter)} />
        {tx.note && <MetaRow label="Note" value={tx.note} />}
        <div className="flex items-center justify-between px-4 py-3">
          <span className="text-[13px] text-ink-500">Transaction ID</span>
          <button onClick={copyId} className="flex items-center gap-1.5 rounded-lg px-2 py-1 text-[13px] font-medium text-brand-600 hover:bg-brand-50 transition-colors">
            <span className="tnum font-mono text-[12px] text-ink-600">{tx.id}</span>
            <Copy size={13} />
          </button>
        </div>
      </div>

      {/* Why this amount calculation breakdown */}
      <WhyThisAmount
        title="Why this amount?"
        items={[
          { label: `${isCredit ? 'Credit from' : 'Payment to'} ${tx.merchant}`, amount: tx.amount },
          { label: 'Transfer fee', amount: tx.fee, note: tx.fee === 0 ? 'Zero fee' : 'Processing fee' },
        ]}
        total={tx.amount + tx.fee}
        totalLabel={isCredit ? 'Total credited' : 'Total debited'}
      />

      {/* Transaction explanation component */}
      <TransactionExplanation tx={tx} />
    </div>
  )
}

function MetaRow({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="flex items-center justify-between px-4 py-3">
      <span className="text-[13px] text-ink-500">{label}</span>
      <span className={`tnum text-[13px] font-semibold ${accent ? 'text-pos-600' : 'text-ink-800'}`}>{value}</span>
    </div>
  )
}

function hueOf(name: string): number {
  let h = 0
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) % 360
  return h
}
