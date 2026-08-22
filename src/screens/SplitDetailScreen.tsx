import { useState } from 'react'
import { motion } from 'framer-motion'
import { BellRing, Check, CheckCircle2, Scale } from 'lucide-react'
import { Avatar, Badge, Button, Card } from '../components/ui/primitives'
import { ScreenHeader } from '../components/ScreenHeader'
import { EmptyState } from '../components/ui/EmptyState'
import { WhyThisAmount } from '../components/ui/WhyThisAmount'
import { useVault, USER } from '../store/useVault'
import { humanDate, inr } from '../utils/format'

export default function SplitDetailScreen() {
  const bill = useVault((s) =>
    s.bills.find((b) => (s.route.name === 'splitDetail' ? b.id === s.route.id : false)),
  )
  const setParticipantPaid = useVault((s) => s.setParticipantPaid)
  const remindParticipant = useVault((s) => s.remindParticipant)
  const pushToast = useVault((s) => s.pushToast)
  const go = useVault((s) => s.go)
  const [reminded, setReminded] = useState<Record<string, boolean>>({})

  const handleRemind = (pid: string) => {
    if (!bill) return
    remindParticipant(bill.id, pid)
    setReminded((r) => ({ ...r, [pid]: true }))
    setTimeout(() => setReminded((r) => ({ ...r, [pid]: false })), 2000)
  }

  if (!bill) {
    return (
      <div className="-mx-4 -mt-5 min-h-screen bg-white lg:mx-0 lg:mt-0 lg:rounded-3xl lg:border lg:border-ink-100 lg:shadow-card">
        <ScreenHeader title="Split" />
        <EmptyState
          icon={<Scale size={26} />}
          title="This split is no longer available"
          body="It may have been settled or removed."
          action={<Button onClick={() => go({ name: 'home' })}>Back to home</Button>}
        />
      </div>
    )
  }

  const paid = bill.participants.filter((p) => p.paid)
  const collected = paid.reduce((s, p) => s + p.amount, 0)
  const remaining = bill.total - collected
  const unpaidOthers = bill.participants.filter((p) => !p.paid && p.name !== USER.name)
  const allPaid = bill.status === 'settled' || bill.participants.every((p) => p.paid)
  const pct = (collected / bill.total) * 100

  return (
    <div className="-mx-4 -mt-5 min-h-screen bg-white lg:mx-0 lg:mt-0 lg:rounded-3xl lg:border lg:border-ink-100 lg:shadow-card">
      <ScreenHeader title="Split details" subtitle="Track everyone's share" />

      <div className="mx-auto max-w-lg px-5 pb-12 pt-6 space-y-5">
        {/* Hero Card */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="overflow-hidden rounded-3xl bg-gradient-to-br from-ink-800 via-ink-900 to-ink-950 p-6 text-white shadow-lift"
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[12px] font-medium uppercase tracking-wider text-ink-300">
                {bill.merchant}
              </p>
              <h2 className="mt-1 font-display text-2xl font-bold">{bill.title}</h2>
            </div>
            <Badge tone={allPaid ? 'success' : 'warn'}>
              {allPaid ? 'Split complete' : 'Active split'}
            </Badge>
          </div>
          <p className="tnum mt-4 font-display text-[36px] font-bold leading-none">
            {inr(bill.total)}
          </p>
          <p className="mt-2 text-[13px] text-ink-300">
            {humanDate(bill.date)} · {bill.participants.length} participants · {bill.splitMode === 'equal' ? 'Equal split' : bill.splitMode === 'item' ? 'Item-based split' : 'Custom split'}
          </p>

          <div className="mt-5 h-2 overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full rounded-full bg-pos-400 transition-all duration-700"
              style={{ width: `${pct}%` }}
            />
          </div>

          <div className="mt-3 flex justify-between text-[13px]">
            <span className="text-ink-300">
              <span className="font-semibold text-pos-300">
                {paid.length} of {bill.participants.length}
              </span>{' '}
              paid
            </span>
            <span className="tnum">
              <span className="font-semibold text-white">{inr(collected)}</span>{' '}
              <span className="text-ink-400">collected · </span>
              <span className="text-warn-300">{inr(remaining)}</span>{' '}
              <span className="text-ink-400">pending</span>
            </span>
          </div>
        </motion.div>

        {/* Split Complete Banner */}
        {allPaid && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="flex items-center gap-3 rounded-2xl border border-pos-200 bg-pos-50 p-4 shadow-xs"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-pos-500 text-white">
              <CheckCircle2 size={22} />
            </div>
            <div>
              <p className="text-sm font-bold text-pos-900">Split complete</p>
              <p className="text-[13px] text-pos-800">Everyone has paid their share. All balances are settled.</p>
            </div>
          </motion.div>
        )}

        {/* Everyone's Share list */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-display text-[15px] font-semibold text-ink-900">Everyone's share</h3>
            <span className="text-xs text-ink-400">Fee: ₹0 · Free tracking</span>
          </div>

          <Card className="divide-y divide-ink-100 px-1 py-1 shadow-card">
            {bill.participants.map((p) => {
              const isYou = p.name === USER.name
              return (
                <motion.div
                  key={p.id}
                  layout
                  initial={{ opacity: 0 }}
                  animate={{
                    opacity: 1,
                    backgroundColor: p.paid ? 'rgba(16,180,116,0.04)' : 'transparent',
                  }}
                  transition={{ duration: 0.3 }}
                  className="flex items-center gap-3 rounded-xl px-3.5 py-3.5"
                >
                  <Avatar initials={p.initials} hue={p.hue} size={40} />
                  <div className="min-w-0 flex-1">
                    <p className="flex items-center gap-2 truncate text-[15px] font-semibold text-ink-900">
                      {p.name}
                      {isYou && (
                        <span className="rounded-full bg-brand-50 text-brand-700 px-2 py-0.5 text-[10.5px] font-semibold">
                          You
                        </span>
                      )}
                    </p>
                    <p className="tnum text-[13px] text-ink-500 font-medium">{inr(p.amount)}</p>
                  </div>

                  {p.paid ? (
                    <span className="flex items-center gap-1 rounded-full bg-pos-100 px-3 py-1 text-xs font-semibold text-pos-700">
                      <Check size={13} strokeWidth={3} /> Paid
                    </span>
                  ) : (
                    <div className="flex items-center gap-2">
                      {!isYou && (
                        <>
                          <Button
                            size="sm"
                            variant={reminded[p.id] ? 'soft' : 'secondary'}
                            onClick={() => handleRemind(p.id)}
                            className={`h-8 px-2.5 text-xs transition-all duration-200 ${
                              reminded[p.id] ? 'bg-pos-50 text-pos-700 border-pos-200' : ''
                            }`}
                          >
                            {reminded[p.id] ? (
                              <>
                                <Check size={13} /> Reminder sent
                              </>
                            ) : (
                              <>
                                <BellRing size={13} /> {p.remindedAt ? 'Remind again' : 'Remind'}
                              </>
                            )}
                          </Button>
                          <Button
                            size="sm"
                            variant="soft"
                            onClick={() => {
                              setParticipantPaid(bill.id, p.id, true)
                              pushToast({
                                tone: 'success',
                                title: 'Payment marked as received',
                                body: `${p.name}'s share of ${inr(p.amount)} was recorded.`,
                              })
                            }}
                            className="h-8 px-2.5 text-xs"
                          >
                            Mark paid
                          </Button>
                        </>
                      )}
                      {isYou && <Badge tone="warn">Pending</Badge>}
                    </div>
                  )}
                </motion.div>
              )
            })}
          </Card>
        </div>

        {/* Why this amount calculation */}
        <WhyThisAmount
          title="Why these amounts?"
          items={bill.participants.map((p) => ({
            label: `${p.name}${p.name === USER.name ? ' (You - Paid)' : ''}`,
            amount: p.amount,
            note: p.paid ? 'Settled' : 'Pending payment',
          }))}
          total={bill.total}
          totalLabel="Total bill"
          formulaExplanation={`This ${bill.splitMode} split of ${inr(bill.total)} is divided across ${bill.participants.length} people. ${paid.length} of ${bill.participants.length} shares are settled.`}
        />

        {/* Gentle Reminder Helper */}
        {unpaidOthers.length > 0 && (
          <div className="rounded-2xl border border-ink-100 bg-cream-50 p-4 shadow-xs">
            <p className="text-sm font-semibold text-ink-900">Friendly reminders</p>
            <p className="tnum mt-1 text-[13px] leading-relaxed text-ink-500">
              {unpaidOthers.length} participant{unpaidOthers.length === 1 ? '' : 's'} have pending shares totaling {inr(remaining)}. Reminders are friendly and non-intrusive.
            </p>
            <Button
              size="sm"
              variant="secondary"
              className="mt-3"
              onClick={() => {
                unpaidOthers.forEach((p) => remindParticipant(bill.id, p.id))
                pushToast({
                  tone: 'info',
                  title: 'Reminders sent',
                  body: `Friendly reminders sent to ${unpaidOthers.length} friends.`,
                })
              }}
            >
              <BellRing size={14} /> Remind all pending participants
            </Button>
          </div>
        )}

        <p className="text-center text-xs text-ink-400">
          Created by {bill.createdByName} · Tracked with VAULT Confidence Layer
        </p>
      </div>
    </div>
  )
}
