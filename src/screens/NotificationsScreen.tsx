import { motion } from 'framer-motion'
import {
  ArrowLeftRight,
  BellOff,
  CheckCheck,
  Info,
  PiggyBank,
  Scale,
  ShieldCheck,
} from 'lucide-react'
import { Button, Card } from '../components/ui/primitives'
import { ScreenHeader } from '../components/ScreenHeader'
import { EmptyState } from '../components/ui/EmptyState'
import { useVault, type Route } from '../store/useVault'
import type { AppNotification, NotificationKind } from '../types'

const KIND_META: Record<NotificationKind, { icon: typeof Info; color: string; bg: string }> = {
  payment: { icon: ArrowLeftRight, color: 'text-pos-600', bg: 'bg-pos-50' },
  bill: { icon: Scale, color: 'text-warn-600', bg: 'bg-warn-50' },
  savings: { icon: PiggyBank, color: 'text-brand-600', bg: 'bg-brand-50' },
  security: { icon: ShieldCheck, color: 'text-danger-600', bg: 'bg-danger-50' },
  system: { icon: Info, color: 'text-ink-500', bg: 'bg-ink-100' },
}

export default function NotificationsScreen() {
  const notifications = useVault((s) => s.notifications)
  const markRead = useVault((s) => s.markNotificationRead)
  const markAll = useVault((s) => s.markAllNotificationsRead)
  const go = useVault((s) => s.go)

  const sorted = [...notifications].sort((a, b) => {
    if (a.read !== b.read) return Number(a.read) - Number(b.read)
    return 0
  })
  const unread = notifications.filter((n) => !n.read).length

  return (
    <div className="-mx-4 -mt-5 min-h-screen bg-white lg:mx-0 lg:mt-0 lg:rounded-3xl lg:border lg:border-ink-100 lg:shadow-card">
      <ScreenHeader
        title="Notifications"
        right={
          unread > 0 ? (
            <Button size="sm" variant="ghost" onClick={markAll}>
              <CheckCheck size={15} /> Mark all read
            </Button>
          ) : undefined
        }
      />

      <div className="mx-auto max-w-lg px-5 pb-12 pt-4">
        {notifications.length === 0 ? (
          <Card>
            <EmptyState
              icon={<BellOff size={24} />}
              title="You’re all caught up"
              body="Payment updates, bill reminders and security alerts will appear here."
            />
          </Card>
        ) : (
          <div className="space-y-2">
            {sorted.map((n, i) => (
              <NotifRow key={n.id} n={n} index={i} onOpen={() => markRead(n.id)} go={go} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function NotifRow({
  n,
  index,
  onOpen,
  go,
}: {
  n: AppNotification
  index: number
  onOpen: () => void
  go: (r: Route) => void
}) {
  const meta = KIND_META[n.kind]
  const Icon = meta.icon
  return (
    <motion.button
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04 }}
      onClick={() => {
        onOpen()
        if (n.kind === 'bill') {
          const bill = useVault.getState().bills.find((b) => b.status === 'open')
          if (bill) go({ name: 'splitDetail', id: bill.id })
        } else if (n.kind === 'savings') go({ name: 'goals' })
        else if (n.kind === 'security') go({ name: 'security' })
      }}
      className={`flex w-full items-start gap-3 rounded-2xl border p-4 text-left transition-all hover:shadow-lift ${
        n.read ? 'border-ink-100 bg-white' : 'border-brand-200 bg-brand-50/40'
      }`}
    >
      <span className={`mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${meta.bg} ${meta.color}`}>
        <Icon size={19} />
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-2">
          <span className={`truncate text-[15px] font-semibold ${n.read ? 'text-ink-700' : 'text-ink-900'}`}>
            {n.title}
          </span>
          {!n.read && <span className="h-2 w-2 shrink-0 rounded-full bg-brand-600" aria-label="Unread" />}
        </span>
        <span className="mt-0.5 block text-[13px] leading-snug text-ink-500">{n.body}</span>
        <span className="mt-1.5 block text-xs text-ink-400">
          {n.time}
          {n.priority === 'high' && <span className="ml-2 font-semibold text-danger-500">· High priority</span>}
        </span>
      </span>
    </motion.button>
  )
}
