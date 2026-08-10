import {
  House,
  PiggyBank,
  Plus,
  Receipt,
  Send,
  HandCoins,
  Scale,
  ArrowDownToLine,
  Bell,
  Lightbulb,
  ShieldCheck,
  UserRound,
} from 'lucide-react'
import { useVault, type Route } from '../store/useVault'
import { BottomSheet } from './ui/BottomSheet'
import { Logo } from './Logo'
import { inrFull } from '../utils/format'
import { USER } from '../store/useVault'
import { Avatar } from './ui/primitives'

type Tab = 'home' | 'activity' | 'goals' | 'profile'

const TABS: { key: Tab; label: string; icon: typeof House }[] = [
  { key: 'home', label: 'Home', icon: House },
  { key: 'activity', label: 'Activity', icon: Receipt },
  { key: 'goals', label: 'Goals', icon: PiggyBank },
  { key: 'profile', label: 'Profile', icon: UserRound },
]

const PAY_ACTIONS: { route: Route; icon: typeof Send; title: string; desc: string }[] = [
  { route: { name: 'send' }, icon: Send, title: 'Send money', desc: 'Pay a contact instantly' },
  { route: { name: 'request' }, icon: HandCoins, title: 'Request money', desc: 'Ask someone for money' },
  { route: { name: 'split' }, icon: Scale, title: 'Split a bill', desc: 'Divide an expense fairly' },
  { route: { name: 'addMoney' }, icon: ArrowDownToLine, title: 'Add money', desc: 'Top up from your bank' },
]

export function Navigation() {
  const route = useVault((s) => s.route)
  const go = useVault((s) => s.go)
  const payMenuOpen = useVault((s) => s.payMenuOpen)
  const closePayMenu = useVault((s) => s.closePayMenu)
  const openPayMenu = useVault((s) => s.openPayMenu)
  const balance = useVault((s) => s.balance)
  const hideBalance = useVault((s) => s.hideBalance)

  const activeTab: Tab = route.name === 'home'
    ? 'home'
    : route.name === 'activity' || route.name === 'transaction'
      ? 'activity'
      : route.name === 'goals' || route.name === 'goalDetail'
        ? 'goals'
        : route.name === 'profile'
          ? 'profile'
          : 'home'

  const onTab = (t: Tab) => go({ name: t } as Route)

  return (
    <>
      {/* ── Desktop sidebar ─────────────────────────────── */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col bg-ink-950 text-ink-200 lg:flex">
        <div className="px-6 pt-7">
          <Logo />
        </div>

        <nav className="mt-8 flex-1 space-y-1 px-3" aria-label="Primary">
          {TABS.map(({ key, label, icon: Icon }) => {
            const active = activeTab === key
            return (
              <button
                key={key}
                onClick={() => onTab(key)}
                aria-current={active ? 'page' : undefined}
                className={`flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-colors ${
                  active ? 'bg-white/10 text-white' : 'text-ink-300 hover:bg-white/5 hover:text-white'
                }`}
              >
                <Icon size={19} className={active ? 'text-brand-400' : ''} />
                {label}
                {key === 'activity' && <UnreadDot />}
              </button>
            )
          })}
        </nav>

        <div className="mx-3 mb-3 space-y-1 border-t border-white/10 pt-3">
          <SideLink icon={Bell} label="Notifications" onClick={() => go({ name: 'notifications' })} />
          <SideLink icon={Lightbulb} label="Insights" onClick={() => go({ name: 'insights' })} />
          <SideLink icon={ShieldCheck} label="Security" onClick={() => go({ name: 'security' })} />
        </div>

        <div className="p-4">
          <button
            onClick={openPayMenu}
            className="mb-3 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 py-3 text-sm font-semibold text-white shadow-lift transition-transform hover:scale-[1.02] active:scale-[0.98]"
          >
            <Plus size={18} /> Pay
          </button>
          <button
            onClick={() => onTab('profile')}
            className="flex w-full items-center gap-3 rounded-xl bg-white/5 p-3 text-left transition-colors hover:bg-white/10"
          >
            <Avatar initials={USER.initials} hue={USER.hue} size={36} />
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-medium text-white">{USER.name}</span>
              <span className="block truncate text-xs text-ink-400">
                {hideBalance ? '••••' : inrFull(balance)}
              </span>
            </span>
          </button>
        </div>
      </aside>

      {/* ── Mobile bottom nav ───────────────────────────── */}
      <nav
        aria-label="Primary"
        className="fixed inset-x-0 bottom-0 z-40 border-t border-ink-100 bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-md lg:hidden"
      >
        <div className="mx-auto grid h-[68px] max-w-md grid-cols-5 items-center px-2">
          {TABS.map(({ key, label, icon: Icon }) => {
            const active = activeTab === key
            return (
              <button
                key={key}
                onClick={() => onTab(key)}
                aria-current={active ? 'page' : undefined}
                className="relative flex flex-col items-center justify-center gap-1"
              >
                <span className={`relative ${active ? 'text-brand-600' : 'text-ink-400'}`}>
                  <Icon size={22} strokeWidth={active ? 2.4 : 2} />
                  {key === 'activity' && <UnreadDot small />}
                </span>
                <span
                  className={`text-[10.5px] font-medium ${active ? 'text-ink-900' : 'text-ink-400'}`}
                >
                  {label}
                </span>
                <span
                  className={`absolute -bottom-0.5 h-1 w-1 rounded-full bg-brand-600 transition-opacity ${
                    active ? 'opacity-100' : 'opacity-0'
                  }`}
                />
              </button>
            )
          })}
        </div>
      </nav>

      {/* ── Pay menu ────────────────────────────────────── */}
      <BottomSheet open={payMenuOpen} onClose={closePayMenu} title="What would you like to do?">
        <div className="px-5 pb-6 pt-2">
          <div className="grid grid-cols-2 gap-3">
            {PAY_ACTIONS.map(({ route: r, icon: Icon, title, desc }) => (
              <button
                key={title}
                onClick={() => {
                  closePayMenu()
                  go(r)
                }}
                className="group flex flex-col items-start gap-3 rounded-2xl border border-ink-100 bg-white p-4 text-left transition-all hover:border-brand-200 hover:shadow-lift active:scale-[0.98]"
              >
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50 text-brand-600 transition-colors group-hover:bg-brand-600 group-hover:text-white">
                  <Icon size={20} />
                </span>
                <span>
                  <span className="block text-sm font-semibold text-ink-900">{title}</span>
                  <span className="mt-0.5 block text-xs leading-snug text-ink-400">{desc}</span>
                </span>
              </button>
            ))}
          </div>
          <p className="mt-4 text-center text-xs text-ink-400">
            Available balance{' '}
            <span className="font-semibold text-ink-600">{hideBalance ? '••••' : inrFull(balance)}</span>
          </p>
        </div>
      </BottomSheet>
    </>
  )
}

function UnreadDot({ small }: { small?: boolean }) {
  const unread = useVault((s) => s.notifications.filter((n) => !n.read).length)
  if (unread === 0) return null
  return (
    <span
      aria-hidden
      className={
        small
          ? 'absolute -right-1.5 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-danger-500 px-1 text-[9px] font-bold text-white'
          : 'ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-danger-500 px-1 text-[10px] font-bold text-white'
      }
    >
      {unread > 9 ? '9+' : unread}
    </span>
  )
}

function SideLink({
  icon: Icon,
  label,
  onClick,
}: {
  icon: typeof Bell
  label: string
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-ink-300 transition-colors hover:bg-white/5 hover:text-white"
    >
      <Icon size={16} className="text-ink-400" />
      {label}
      {label === 'Notifications' && <UnreadDot />}
    </button>
  )
}
