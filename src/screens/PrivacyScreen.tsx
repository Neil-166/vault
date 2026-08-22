import { useState } from 'react'
import { Download, ShieldCheck, Trash2 } from 'lucide-react'
import { Button, Card, Toggle } from '../components/ui/primitives'
import { ScreenHeader } from '../components/ScreenHeader'
import { ConfirmationDialog } from '../components/ui/ConfirmationDialog'
import { useVault } from '../store/useVault'

export default function PrivacyScreen() {
  const settings = useVault((s) => s.settings)
  const toggleSetting = useVault((s) => s.toggleSetting)
  const pushToast = useVault((s) => s.pushToast)
  const lock = useVault((s) => s.lock)

  const [analytics, setAnalytics] = useState(false)
  const [offers, setOffers] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)

  return (
    <div className="-mx-4 -mt-5 min-h-screen bg-white lg:mx-0 lg:mt-0 lg:rounded-3xl lg:border lg:border-ink-100 lg:shadow-card">
      <ScreenHeader title="Privacy" />

      <div className="mx-auto max-w-lg px-5 pb-12 pt-6">
        <div className="flex items-start gap-3 rounded-2xl border border-pos-200 bg-pos-50 p-4">
          <ShieldCheck size={22} className="mt-0.5 shrink-0 text-pos-600" />
          <p className="text-[13px] leading-relaxed text-pos-800">
            <span className="font-semibold">Your data is yours.</span> VAULT only shares what you
            choose, and never sells your transaction history.
          </p>
        </div>

        <h3 className="mb-2 mt-6 font-display text-[15px] font-semibold text-ink-900">Data & sharing</h3>
        <Card className="px-4 py-1">
          <Toggle
            checked={settings.shareUsage}
            onChange={() => toggleSetting('shareUsage')}
            label="Share usage data"
            description="Help improve VAULT with anonymous usage stats"
          />
          <div className="border-t border-ink-100" />
          <Toggle
            checked={settings.marketing}
            onChange={() => toggleSetting('marketing')}
            label="Marketing updates"
            description="Occasional tips about money, never spam"
          />
          <div className="border-t border-ink-100" />
          <Toggle checked={analytics} onChange={setAnalytics} label="Analytics" description="How the app is used, aggregated and anonymised" />
          <div className="border-t border-ink-100" />
          <Toggle checked={offers} onChange={setOffers} label="Personalised offers" description="Rewards based on how you already spend" />
        </Card>

        <h3 className="mb-2 mt-6 font-display text-[15px] font-semibold text-ink-900">Your data</h3>
        <Card className="p-4">
          <Button
            variant="secondary"
            fullWidth
            onClick={() => pushToast({ tone: 'success', title: 'Export requested', body: 'A copy of your data would be emailed to you.' })}
          >
            <Download size={16} /> Export my data
          </Button>
        </Card>

        <Card className="mt-3 p-4">
          <Button variant="danger" fullWidth onClick={() => setDeleteOpen(true)}>
            <Trash2 size={16} /> Delete my account
          </Button>
        </Card>
      </div>

      <ConfirmationDialog
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={() => {
          pushToast({ tone: 'info', title: 'Account scheduled for deletion', body: 'A 30-day grace period has been initiated. You have been safely logged out.' })
          lock()
        }}
        title="Delete your account?"
        confirmLabel="Yes, delete"
        tone="danger"
      >
        This will close your VAULT account and archive your transaction history after a 30-day security grace period.
      </ConfirmationDialog>
    </div>
  )
}
