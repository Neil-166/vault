import { useState } from 'react'
import {
  BadgeCheck,
  Bell,
  Check,
  CreditCard,
  HelpCircle,
  Landmark,
  Lightbulb,
  Link2,
  LogOut,
  Moon,
  Lock,
  Settings,
  ShieldCheck,
  UserRound,
} from 'lucide-react'
import { Avatar, Button, Card } from '../components/ui/primitives'
import { Modal } from '../components/ui/Modal'
import { ConfirmationDialog } from '../components/ui/ConfirmationDialog'
import { MenuCard, MenuRow } from '../components/ui/MenuList'
import { useVault, USER } from '../store/useVault'

const PAYMENT_METHODS = [
  { label: 'UPI', value: USER.upi, note: 'Primary · always free' },
  { label: 'HDFC Debit Card', value: '•••• 4521', note: 'Used for card payments' },
  { label: 'NetBanking', value: 'HDFC Bank', note: 'For bills & salary credits' },
]

const LINKED_ACCOUNTS = [
  { bank: 'HDFC Bank', account: '•••• 4521', type: 'Current account', primary: true },
  { bank: 'State Bank of India', account: '•••• 2288', type: 'Savings account', primary: false },
  { bank: 'ICICI Bank', account: '•••• 9134', type: 'Savings account', primary: false },
]

export default function ProfileScreen() {
  const go = useVault((s) => s.go)
  const lock = useVault((s) => s.lock)
  const pushToast = useVault((s) => s.pushToast)
  const theme = useVault((s) => s.theme)
  const toggleTheme = useVault((s) => s.toggleTheme)

  const [infoOpen, setInfoOpen] = useState(false)
  const [paymentsOpen, setPaymentsOpen] = useState(false)
  const [accountsOpen, setAccountsOpen] = useState(false)
  const [logoutOpen, setLogoutOpen] = useState(false)
  const [bankPicker, setBankPicker] = useState(false)
  const [newBank, setNewBank] = useState('')

  return (
    <div className="space-y-5">
      <header>
        <h1 className="font-display text-[22px] font-bold text-ink-950">Profile</h1>
        <p className="mt-0.5 text-sm text-ink-400">Manage your account, security and preferences.</p>
      </header>

      {/* Identity card */}
      <div className="overflow-hidden rounded-3xl bg-gradient-to-br from-ink-800 via-ink-900 to-ink-950 p-5 text-white shadow-lift">
        <div className="flex items-center gap-4">
          <Avatar initials={USER.initials} hue={USER.hue} size={60} ring />
          <div className="min-w-0 flex-1">
            <p className="flex items-center gap-1.5 truncate font-display text-lg font-bold">
              {USER.name}
              <BadgeCheck size={17} className="shrink-0 text-brand-400" />
            </p>
            <p className="truncate text-[13px] text-ink-300">{USER.upi}</p>
            <p className="mt-1 text-xs text-ink-400">Member since {USER.since}</p>
          </div>
        </div>
        <div className="mt-4 flex flex-wrap gap-2 border-t border-white/10 pt-4 text-xs">
          <span className="rounded-full bg-white/10 px-2.5 py-1 font-medium text-ink-100">{USER.accountType}</span>
          <span className="tnum rounded-full bg-white/10 px-2.5 py-1 font-medium text-ink-100">{USER.accountNumber}</span>
          <span className="rounded-full bg-white/10 px-2.5 py-1 font-medium text-ink-100">{USER.city}</span>
        </div>
      </div>

      {/* Menu */}
      <MenuCard>
        <MenuRow icon={<UserRound size={18} />} label="Personal information" onClick={() => setInfoOpen(true)} />
        <MenuRow icon={<ShieldCheck size={18} />} label="Security" value="Devices · alerts" onClick={() => go({ name: 'security' })} />
        <MenuRow icon={<Bell size={18} />} label="Notifications" onClick={() => go({ name: 'notifications' })} />
        <MenuRow icon={<Lightbulb size={18} />} label="Insights" value="Spending answers" onClick={() => go({ name: 'insights' })} />
        <MenuRow icon={<CreditCard size={18} />} label="Payment methods" value={PAYMENT_METHODS.length.toString()} onClick={() => setPaymentsOpen(true)} />
        <MenuRow icon={<Landmark size={18} />} label="Connected accounts" value={LINKED_ACCOUNTS.length.toString()} onClick={() => setAccountsOpen(true)} />
        <MenuRow icon={<Lock size={18} />} label="Privacy" onClick={() => go({ name: 'privacy' })} />
        <MenuRow icon={<Moon size={18} />} label="Dark mode" value={theme === 'dark' ? 'On' : 'Off'} onClick={toggleTheme} />
        <MenuRow icon={<Settings size={18} />} label="Settings" value="Currency · language" onClick={() => go({ name: 'settings' })} />
        <MenuRow icon={<HelpCircle size={18} />} label="Help & support" onClick={() => go({ name: 'help' })} />
      </MenuCard>

      <Card className="p-1">
        <button
          onClick={() => setLogoutOpen(true)}
          className="flex w-full items-center gap-3 rounded-2xl px-4 py-3.5 text-left text-[15px] font-semibold text-danger-600 transition-colors hover:bg-danger-50"
        >
          <LogOut size={18} /> Log out
        </button>
      </Card>

      <p className="pb-2 text-center text-xs text-ink-400">
        VAULT v1.0 · Made for the hackathon · Money, made clear.
      </p>

      {/* Personal info modal */}
      <Modal open={infoOpen} onClose={() => setInfoOpen(false)} title="Personal information">
        <div className="space-y-3">
          {[
            ['Full name', USER.name],
            ['Phone', USER.phone],
            ['Email', USER.email],
            ['Account', `${USER.accountType} · ${USER.accountNumber}`],
            ['Branch', USER.branch],
            ['PAN', USER.pan],
            ['Member since', USER.since],
          ].map(([k, v]) => (
            <div key={k} className="flex items-center justify-between rounded-xl bg-cream-50 px-4 py-3">
              <span className="text-[13px] text-ink-500">{k}</span>
              <span className="tnum text-sm font-semibold text-ink-800">{v}</span>
            </div>
          ))}
        </div>
      </Modal>

      {/* Payment methods */}
      <Modal open={paymentsOpen} onClose={() => setPaymentsOpen(false)} title="Payment methods">
        <div className="space-y-2">
          {PAYMENT_METHODS.map((m) => (
            <div key={m.label} className="flex items-center gap-3 rounded-2xl border border-ink-100 p-3.5">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
                <CreditCard size={19} />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-ink-900">{m.label}</p>
                <p className="tnum text-[13px] text-ink-400">
                  {m.value} · {m.note}
                </p>
              </div>
            </div>
          ))}
        </div>
        <Button fullWidth variant="secondary" className="mt-4" onClick={() => pushToast({ tone: 'info', title: 'Payment methods', body: '3 active payment methods linked and ready for transfers.' })}>
          Add payment method
        </Button>
      </Modal>

      {/* Connected accounts */}
      <Modal open={accountsOpen} onClose={() => setAccountsOpen(false)} title="Connected accounts">
        <div className="space-y-2">
          {LINKED_ACCOUNTS.map((a) => (
            <div key={a.bank} className="flex items-center gap-3 rounded-2xl border border-ink-100 p-3.5">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-ink-100 text-ink-600">
                <Landmark size={19} />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-ink-900">{a.bank}</p>
                <p className="tnum text-[13px] text-ink-400">
                  {a.account} · {a.type}
                </p>
              </div>
              {a.primary ? (
                <span className="rounded-full bg-pos-100 px-2.5 py-1 text-xs font-semibold text-pos-700">Primary</span>
              ) : (
                <span className="rounded-full bg-ink-100 px-2.5 py-1 text-xs font-semibold text-ink-500">Linked</span>
              )}
            </div>
          ))}
        </div>
        <Button fullWidth variant="secondary" className="mt-4" onClick={() => setBankPicker(true)}>
          <Link2 size={16} /> Link another account
        </Button>
      </Modal>

      {/* Bank picker */}
      <Modal open={bankPicker} onClose={() => setBankPicker(false)} title="Link a bank account" footer={
        <Button fullWidth size="lg" disabled={!newBank} onClick={() => {
          if (newBank) {
            pushToast({ tone: 'success', title: 'Bank connected', body: `${newBank} has been linked to your VAULT account.` })
            setBankPicker(false)
            setNewBank('')
          }
        }}>
          Connect {newBank || 'bank'}
        </Button>
      }>
        <p className="mb-3 text-[13px] text-ink-400">Choose your bank to link it to VAULT.</p>
        {['HDFC Bank', 'State Bank of India', 'ICICI Bank', 'Axis Bank'].map((bank) => (
          <button key={bank} onClick={() => setNewBank(bank)} className={`flex w-full items-center gap-3 rounded-xl border p-3.5 text-left transition-all mb-2 ${newBank === bank ? 'border-brand-400 bg-brand-50' : 'border-ink-100 hover:border-ink-200'}`}>
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-ink-100 text-ink-600 text-sm font-bold">{bank.charAt(0)}</span>
            <span className="flex-1 text-sm font-medium text-ink-800">{bank}</span>
            {newBank === bank && <Check size={16} className="text-brand-600" />}
          </button>
        ))}
      </Modal>

      {/* Logout */}
      <ConfirmationDialog
        open={logoutOpen}
        onClose={() => setLogoutOpen(false)}
        onConfirm={lock}
        title="Log out of VAULT?"
        confirmLabel="Log out"
      >
        You’ll need to unlock again to see your account. Your money stays exactly where it is.
      </ConfirmationDialog>
    </div>
  )
}
