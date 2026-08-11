import { useState } from 'react'
import { motion } from 'framer-motion'
import { BellRing, Check, CheckCircle2, Scale } from 'lucide-react'
import { Avatar, Badge, Button, Card } from '../components/ui/primitives'
import { ScreenHeader } from '../components/ScreenHeader'
import { EmptyState } from '../components/ui/EmptyState'
import { useVault, USER } from '../store/useVault'
import { humanDate, inr, monthYear } from '../utils/format'

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
    setTimeout(() => setReminded((r) => ({ ...r, [pid]: false })), 1800)
  }

  if (!bill) {
    return (
      <div className="-mx-4 -mt-5 min-h-screen bg-white lg:mx-0 lg:mt-0 lg:rounded-3xl lg:border lg:border-ink-100 lg:shadow-card">
        <ScreenHeader title="Split" />
        <EmptyState icon={<Scale size={26} />} title="This split is no longer available" body="It may have been settled or removed." action={<Button onClick={() => go({ name: 'home' })}>Back to home</Button>} />
      </div>
    )
  }

  const paid = bill.participants.filter((p) => p.paid)
  const collected = paid.reduce((s, p) => s + p.amount, 0)
  const remaining = bill.total - collected
  const unpaidOthers = bill.participants.filter((p) => !p.paid && p.name !== USER.name)
  const allPaid = bill.status === 'settled'
  const pct = (collected / bill.total) * 100

  return (
    <div className="-mx-4 -mt-5 min-h-screen bg-white lg:mx-0 lg:mt-0 lg:rounded-3xl lg:border lg:border-ink-100 lg:shadow-card">
      <ScreenHeader title="Split details" />

      <div className="mx-auto max-w-lg px-5 pb-12 pt-6">
        {/* Bill card */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="overflow-hidden rounded-3xl bg-gradient-to-br from-ink-800 via-ink-900 to-ink-950 p-5 text-white shadow-lift">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[12px] font-medium uppercase tracking-wider text-ink-300">{bill.merchant}</p>
              <h2 className="mt-1 font-display text-xl font-bold">{bill.title}</h2>
            </div>
            <Badge tone={allPaid ? 'success' : 'warn'}>{allPaid ? 'Settled' : 'Open'}</Badge>
          </div>
          <p className="tnum mt-4 font-display text-[32px] font-bold leading-none">{inr(bill.total)}</p>
          <p className="mt-2 text-[13px] text-ink-300">
            {humanDate(bill.date)} · {bill.participants.length} people · {bill.splitMode === 'equal' ? 'equal split' : bill.splitMode === 'item' ? 'item-based split' : 'custom split'}
          </p>
          <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-white/10">
            <div className="h-full rounded-full bg-pos-400 transition-all duration-700" style={{ width: `${pct}%` }} />
          </div>
          <div className="mt-3 flex justify-between text-[13px]">
            <span className="text-ink-300">
              <span className="font-semibold text-pos-300">{paid.length} of {bill.participants.length}</span> paid
            </span>
            <span className="tnum">
              <span className="font-semibold text-white">{inr(collected)}</span>{' '}
              <span className="text-ink-400">collected · </span>
              <span className="text-warn-300">{inr(remaining)}</span>{' '}
              <span className="text-ink-400">left</span>
            </span>
          </div>
        </motion.div>

        {allPaid && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="mt-4 flex items-center gap-3 rounded-2xl border border-pos-200 bg-pos-50 p-4">
            <CheckCircle2 size={22} className="shrink-0 text-pos-600" />
            <div>
              <p className="text-sm font-semibold text-pos-800">Everyone’s paid up</p>
              <p className="text-[13px] text-pos-700">This split is settled. Nice teamwork.</p>
            </div>
          </motion.div>
        )}

        {/* Participants */}
        <h3 className="mt-6 mb-2 font-display text-[15px] font-semibold text-ink-900">Who’s paid</h3>
        <Card className="divide-y divide-ink-100 px-1 py-1">
          {bill.participants.map((p) => {
            const isYou = p.name === USER.name
            return (
              <motion.div key={p.id} layout initial={{ opacity: 0 }} animate={{ opacity: 1, backgroundColor: p.paid ? 'rgba(16,180,116,0.04)' : 'transparent' }} transition={{ duration: 0.3 }} className="flex items-center gap-3 rounded-xl px-3 py-3">
                <Avatar initials={p.initials} hue={p.hue} size={40} />
                <div className="min-w-0 flex-1">
                  <p className="flex items-center gap-2 truncate text-[15px] font-medium text-ink-900">
                    {p.name}
                    {isYou && <span className="rounded-full bg-ink-100 px-2 py-0.5 text-[10.5px] font-semibold text-ink-500">You</span>}
                  </p>
                  <p className="tnum text-[13px] text-ink-400">{inr(p.amount)}</p>
                </div>
                {p.paid ? (
                  <span className="flex items-center gap-1 rounded-full bg-pos-100 px-2.5 py-1 text-xs font-semibold text-pos-700">
                    <Check size={13} /> Paid
                  </span>
                ) : (
                  <div className="flex items-center gap-1.5">
                    {!isYou && (
                      <>
                        <Button
                          size="sm"
                          variant={reminded[p.id] ? 'soft' : 'secondary'}
                          onClick={() => handleRemind(p.id)}
                          className={`h-8 px-2.5 text-xs transition-all duration-200 ${reminded[p.id] ? 'bg-pos-50 text-pos-700 border-pos-200' : ''}`}
                        >
                          {reminded[p.id] ? (
                            <><Check size={13} /> Sent</>
                          ) : (
                            <><BellRing size={13} /> {p.remindedAt ? 'Remind again' : 'Remind'}</>
                          )}
                        </Button>
                        <Button
                          size="sm"
                          variant="soft"
                          onClick={() => {
                            setParticipantPaid(bill.id, p.id, true)
                            pushToast({ tone: 'success', title: 'Payment received', body: `${p.name} paid ${inr(p.amount)}.` })
                          }}
                          className="h-8 px-2.5 text-xs"
                        >
                          Mark paid
                        </Button>
                      </>
                    )}
                    {isYou && <Badge tone="warn">Awaiting</Badge>}
                  </div>
                )}
              </motion.div>
            )
          })}
        </Card>

        {/* Reminder helper */}
        {unpaidOthers.length > 0 && (
          <div className="mt-4 rounded-2xl border border-ink-100 bg-cream-50 p-4">
            <p className="text-sm font-medium text-ink-800">Still owed</p>
            <p className="tnum mt-1 text-[13px] text-ink-500">
              {unpaidOthers.length} friend{unpaidOthers.length === 1 ? '' : 's'} haven’t paid {inr(remaining)} yet. A gentle reminder is all it takes.
            </p>
            <Button
              size="sm"
              variant="secondary"
              className="mt-3"
              onClick={() => {
                unpaidOthers.forEach((p) => remindParticipant(bill.id, p.id))
              }}
            >
              <BellRing size={14} /> Remind everyone
            </Button>
          </div>
        )}

        <p className="mt-6 text-center text-xs text-ink-400">
          Split created by {bill.createdByName} · Tracked in {monthYear(bill.date)} activity
        </p>
      </div>
    </div>
  )
}
