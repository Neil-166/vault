import { Globe2, Languages, RefreshCcw, RotateCcw, ShieldCheck, Sparkles } from 'lucide-react'
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
      <ScreenHeader title="Settings" subtitle="Preferences & demo controls" />

      <div className="mx-auto max-w-lg px-5 pb-12 pt-6">
        <h3 className="mb-2 font-display text-[15px] font-semibold text-ink-900">General</h3>
        <MenuCard>
          <MenuRow
            icon={<Globe2 size={18} />}
            label="Currency"
            value="INR (₹)"
            onClick={() =>
              pushToast({
                tone: 'info',
                title: 'Currency',
                body: 'Indian Rupee (INR · ₹) is set as your default transaction currency.',
              })
            }
          />
          <MenuRow
            icon={<Languages size={18} />}
            label="Language"
            value="English"
            onClick={() =>
              pushToast({
                tone: 'info',
                title: 'Language',
                body: 'English is the default plain-English UX language.',
              })
            }
          />
        </MenuCard>

        <h3 className="mb-2 mt-6 font-display text-[15px] font-semibold text-ink-900">Demo controls</h3>
        <Card className="p-4 shadow-card">
          <div className="flex items-start gap-2.5">
            <Sparkles size={18} className="text-brand-600 shrink-0 mt-0.5" />
            <div className="text-sm text-ink-600">
              <p className="font-semibold text-ink-900">Hackathon Demonstration State</p>
              <p className="mt-1 leading-relaxed">
                You’ve sent, split and saved during this session. Available to spend balance is{' '}
                <strong className="tnum font-semibold text-ink-900">{inr(balance)}</strong>.
              </p>
            </div>
          </div>
          <Button
            variant="secondary"
            className="mt-4 w-full sm:w-auto"
            onClick={() => {
              resetDemo()
              go({ name: 'home' })
              pushToast({
                tone: 'success',
                title: 'Demo reset',
                body: 'All data restored to original demo state.',
              })
            }}
          >
            <RotateCcw size={16} /> Reset demo data
          </Button>
        </Card>

        <h3 className="mb-2 mt-6 font-display text-[15px] font-semibold text-ink-900">About VAULT</h3>
        <MenuCard>
          <MenuRow
            icon={<RefreshCcw size={18} />}
            label="Version"
            value="VAULT v1.0 (Confidence Layer)"
            onClick={() =>
              pushToast({
                tone: 'info',
                title: 'VAULT v1.0',
                body: 'Track 1 Hackathon project · Confidence-First Digital Banking.',
              })
            }
          />
          <MenuRow
            icon={<ShieldCheck size={18} />}
            label="Product Philosophy"
            value="Know before you send"
            onClick={() =>
              pushToast({
                tone: 'info',
                title: 'Confidence-First Banking',
                body: 'Zero hidden fees, zero banking jargon, and clear answers before money moves.',
              })
            }
          />
          <MenuRow icon={<Languages size={18} />} label="Privacy policy" onClick={() => go({ name: 'privacy' })} />
        </MenuCard>

        <p className="mt-6 text-center text-xs text-ink-400">
          VAULT is a hackathon prototype. No real money moves and no external credentials are required.
        </p>
      </div>
    </div>
  )
}
