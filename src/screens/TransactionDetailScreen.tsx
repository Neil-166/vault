import { useState } from 'react'
import { Copy, Repeat } from 'lucide-react'
import { Avatar, Badge, Button, Card } from '../components/ui/primitives'
import { CategoryIcon } from '../components/ui/CategoryIcon'
import { ScreenHeader } from '../components/ScreenHeader'
import { EmptyState } from '../components/ui/EmptyState'
import { TransactionExplanation } from '../components/TransactionExplanation'
import { WhyThisAmount } from '../components/ui/WhyThisAmount'
import { useVault } from '../store/useVault'
import { inr, inrFull, longDate } from '../utils/format'

export default function TransactionDetailScreen() {
  const tx = useVault((s) =>
    s.transactions.find((t) => (s.route.name === 'transaction' ? t.id === s.route.id : false)),
  )
  const pushToast = useVault((s) => s.pushToast)
  const go = useVault((s) => s.go)

  const [copied, setCopied] = useState(false)

  if (!tx) {
    return (
      <div className="-mx-4 -mt-5 min-h-screen bg-white lg:mx-0 lg:mt-0 lg:rounded-3xl lg:border lg:border-ink-100 lg:shadow-card">
        <ScreenHeader title="Payment details" />
        <EmptyState
          icon={<CategoryIcon category="Other" size={44} />}
          title="Payment not found"
          body="This payment record may have been removed or never existed."
          action={<Button onClick={() => go({ name: 'activity' })}>Back to activity</Button>}
        />
      </div>
    )
  }

  const isCredit = tx.type === 'credit'
  const isPerson = tx.category === 'Transfer' || tx.category === 'Savings'
  const balanceBefore = isCredit
    ? Math.round((tx.balanceAfter - tx.amount) * 100) / 100
    : Math.round((tx.balanceAfter + tx.amount + tx.fee) * 100) / 100

  const copyId = () => {
    navigator.clipboard?.writeText(tx.id).catch(() => {})
    setCopied(true)
    pushToast({ tone: 'success', title: 'Copied', body: 'Transaction ID copied.' })
    setTimeout(() => setCopied(false), 1600)
  }

  return (
    <div className="-mx-4 -mt-5 min-h-screen bg-white lg:mx-0 lg:mt-0 lg:rounded-3xl lg:border lg:border-ink-100 lg:shadow-card">
      <ScreenHeader title="Payment details" subtitle="Understand this payment" onBack={() => go({ name: 'activity' })} />

      <div className="mx-auto max-w-lg px-5 pb-12 pt-8 space-y-6">
        {/* Head */}
        <div className="flex flex-col items-center text-center">
          {isPerson ? (
            <Avatar
              initials={tx.merchant
                .split(' ')
                .slice(0, 2)
                .map((p) => p[0])
                .join('')
                .toUpperCase()}
              hue={hueOf(tx.merchant)}
              size={64}
              verified={isCredit}
            />
          ) : (
            <CategoryIcon category={tx.category} size={64} />
          )}
          <p className="mt-4 text-[15px] font-medium text-ink-500">{tx.detail ?? tx.category}</p>
          <p className="mt-0.5 font-display text-xl font-semibold text-ink-900">{tx.merchant}</p>
          <p
            className={`tnum mt-3 font-display text-[40px] font-bold leading-none ${
              isCredit ? 'text-pos-600' : 'text-ink-950'
            }`}
          >
            {isCredit ? '+' : '−'}
            {inr(tx.amount)}
          </p>
          <p className="mt-1 text-xs font-semibold uppercase tracking-wider text-ink-400">
            {isCredit ? 'Money in' : 'Money out'}
          </p>
          <div className="mt-3">
            <StatusBadge status={tx.status} />
          </div>
        </div>

        {/* Structured summary */}
        <Card className="divide-y divide-ink-100 overflow-hidden shadow-card">
          <MetaRow label="Date & time" value={longDate(tx.date, tx.time)} />
          <MetaRow label="Payment method" value={tx.method} />
          <MetaRow label="Category" value={tx.category} />
          <MetaRow label="Balance before payment" value={inrFull(balanceBefore)} />
          <MetaRow
            label="Fee"
            value={tx.fee === 0 ? '₹0 · No hidden fees' : `₹${tx.fee}`}
            highlight={tx.fee === 0}
          />
          <MetaRow label="Balance after payment" value={inrFull(tx.balanceAfter)} />
          {tx.note && <MetaRow label="Note" value={tx.note} />}
        </Card>

        {/* Why this amount calculation breakdown */}
        <WhyThisAmount
          title="Why this amount?"
          items={[
            { label: `${isCredit ? 'Received from' : 'Paid to'} ${tx.merchant}`, amount: tx.amount },
            { label: 'Platform & transfer fee', amount: tx.fee, note: tx.fee === 0 ? 'Zero hidden fees' : 'Processing fee' },
          ]}
          total={tx.amount + tx.fee}
          totalLabel={isCredit ? 'Total credited to account' : 'Total deducted from account'}
          formulaExplanation={
            isCredit
              ? `Balance increased from ${inrFull(balanceBefore)} to ${inrFull(tx.balanceAfter)}.`
              : `Balance updated from ${inrFull(balanceBefore)} to ${inrFull(tx.balanceAfter)}.`
          }
        />

        {/* Narrative Explanation */}
        <TransactionExplanation tx={tx} />

        {/* Tx ID */}
        <Card className="flex items-center justify-between p-4 shadow-card">
          <div className="min-w-0">
            <p className="text-xs font-medium uppercase tracking-wide text-ink-400">Reference ID</p>
            <p className="tnum mt-0.5 truncate font-mono text-[13px] text-ink-800">{tx.id}</p>
          </div>
          <Button size="sm" variant="secondary" onClick={copyId}>
            <Copy size={14} /> {copied ? 'Copied' : 'Copy'}
          </Button>
        </Card>

        {/* Actions */}
        <div className="pt-2 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
          <Button size="lg" variant="secondary" onClick={() => go({ name: 'send' })}>
            <Repeat size={17} /> Repeat payment
          </Button>
          <Button size="lg" variant="ghost" onClick={() => go({ name: 'activity' })}>
            Back to activity
          </Button>
        </div>
      </div>
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  if (status === 'Completed') return <Badge tone="success">Payment Completed</Badge>
  if (status === 'Pending') return <Badge tone="warn">Payment Pending</Badge>
  return <Badge tone="error">Payment Failed</Badge>
}

function MetaRow({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="flex items-center justify-between px-4 py-3.5">
      <dt className="text-sm text-ink-500">{label}</dt>
      <dd className={`tnum text-sm font-semibold text-ink-800 ${highlight ? 'text-pos-600' : ''}`}>
        {value}
      </dd>
    </div>
  )
}

function hueOf(name: string): number {
  let h = 0
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) % 360
  return h
}
