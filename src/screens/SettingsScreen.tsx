import { Globe2, Languages, RefreshCcw, RotateCcw } from 'lucide-react'
import { Button, Card } from '../components/ui/primitives'
import { ScreenHeader } from '../components/ScreenHeader'
import { MenuCard, MenuRow } from '../components/ui/MenuList'
import { useVault } from '../store/useVault'
import { inr } from '../utils/format'

export default function SettingsScreen() {
  const pushToast = useVault((s) => s.pushToast)
  const balance = useVault((s) => s.balance)
  const resetDemo = useVault((s) => s.resetDemo)
  const go = useVault((s) => s.go)

  return (
    <div className="-mx-4 -mt-5 min-h-screen bg-white lg:mx-0 lg:mt-0 lg:rounded-3xl lg:border lg:border-ink-100 lg:shadow-card">
      <ScreenHeader title="Settings" />

      <div className="mx-auto max-w-lg px-5 pb-12 pt-6">
        <h3 className="mb-2 font-display text-[15px] font-semibold text-ink-900">General</h3>
        <MenuCard>
          <MenuRow icon={<Globe2 size={18} />} label="Currency" value="INR (₹)" onClick={() => pushToast({ tone: 'info', title: 'Currency', body: 'INR is the only supported currency in this prototype.' })} />
          <MenuRow icon={<Languages size={18} />} label="Language" value="English" onClick={() => pushToast({ tone: 'info', title: 'Language', body: 'English is the only language in this prototype.' })} />
        </MenuCard>

        <h3 className="mb-2 mt-6 font-display text-[15px] font-semibold text-ink-900">Demo</h3>
        <Card className="p-4">
          <p className="text-sm text-ink-500">
            This is a hackathon prototype running on mock data. You’ve sent, split and saved during
            this session — your balance is{' '}
            <span className="tnum font-semibold text-ink-800">{inr(balance)}</span>.
          </p>
          <Button
            variant="secondary"
            className="mt-3"
            onClick={() => {
              resetDemo()
              go({ name: 'home' })
              pushToast({ tone: 'success', title: 'Demo reset', body: 'All data restored to the original demo state.' })
            }}
          >
            <RotateCcw size={16} /> Reset demo data
          </Button>
        </Card>

        <h3 className="mb-2 mt-6 font-display text-[15px] font-semibold text-ink-900">About</h3>
        <MenuCard>
          <MenuRow icon={<RefreshCcw size={18} />} label="Version" value="VAULT v1.0" onClick={() => pushToast({ tone: 'info', title: 'Version', body: 'VAULT v1.0 · built for the hackathon.' })} />
          <MenuRow icon={<Globe2 size={18} />} label="Terms of service" onClick={() => pushToast({ tone: 'info', title: 'Terms', body: 'Prototype terms — not a real banking product.' })} />
          <MenuRow icon={<Languages size={18} />} label="Privacy policy" onClick={() => go({ name: 'privacy' })} />
        </MenuCard>

        <p className="mt-6 text-center text-xs text-ink-400">
          VAULT is a prototype. No real money moves and no real credentials are stored.
        </p>
      </div>
    </div>
  )
}
