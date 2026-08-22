import { Fingerprint, KeyRound, Laptop, ShieldCheck, Smartphone } from 'lucide-react'
import { Card, Toggle } from '../components/ui/primitives'
import { ScreenHeader } from '../components/ScreenHeader'
import { MenuCard, MenuRow } from '../components/ui/MenuList'
import { useVault } from '../store/useVault'

export default function SecurityScreen() {
  const settings = useVault((s) => s.settings)
  const toggleSetting = useVault((s) => s.toggleSetting)
  const devices = useVault((s) => s.devices)
  const go = useVault((s) => s.go)
  const pushToast = useVault((s) => s.pushToast)

  return (
    <div className="-mx-4 -mt-5 min-h-screen bg-white lg:mx-0 lg:mt-0 lg:rounded-3xl lg:border lg:border-ink-100 lg:shadow-card">
      <ScreenHeader title="Security" subtitle="Keep your money safe" />

      <div className="mx-auto max-w-lg px-5 pb-12 pt-6">
        <div className="flex items-start gap-3 rounded-2xl border border-brand-100 bg-brand-50 p-4">
          <ShieldCheck size={22} className="mt-0.5 shrink-0 text-brand-600" />
          <p className="text-[13px] leading-relaxed text-brand-800">
            <span className="font-semibold">Your account is protected.</span> Biometric unlock, a
            security code and instant transaction alerts. For this hackathon prototype, security
            features are represented in the UI with realistic mock behaviour.
          </p>
        </div>

        <h3 className="mb-2 mt-6 font-display text-[15px] font-semibold text-ink-900">Sign-in & protection</h3>
        <Card className="px-4 py-1">
          <Toggle
            checked={settings.biometricLogin}
            onChange={() => toggleSetting('biometricLogin')}
            label="Biometric login"
            description="Face ID / Touch ID to open VAULT"
          />
          <div className="border-t border-ink-100" />
          <Toggle
            checked={settings.securityCode}
            onChange={() => toggleSetting('securityCode')}
            label="Security code"
            description="6-digit code when you unlock on a new device"
          />
        </Card>

        <h3 className="mb-2 mt-6 font-display text-[15px] font-semibold text-ink-900">Alerts</h3>
        <Card className="px-4 py-1">
          <Toggle
            checked={settings.transactionAlerts}
            onChange={() => toggleSetting('transactionAlerts')}
            label="Transaction alerts"
            description="Get notified instantly on every payment"
          />
        </Card>

        <h3 className="mb-2 mt-6 font-display text-[15px] font-semibold text-ink-900">Devices</h3>
        <MenuCard>
          <MenuRow
            icon={<Laptop size={18} />}
            label="Signed-in devices"
            value={`${devices.length} active`}
            onClick={() => go({ name: 'devices' })}
          />
        </MenuCard>

        <h3 className="mb-2 mt-6 font-display text-[15px] font-semibold text-ink-900">Identity</h3>
        <MenuCard>
          <MenuRow
            icon={<Fingerprint size={18} />}
            label="Verify your identity"
            value="KYC done"
            onClick={() => pushToast({ tone: 'info', title: 'Identity status', body: 'KYC details are simulated in this prototype.' })}
          />
          <MenuRow
            icon={<KeyRound size={18} />}
            label="Change security code"
            onClick={() => pushToast({ tone: 'info', title: 'Security code', body: 'Code changes are simulated in this prototype.' })}
          />
        </MenuCard>

        <p className="mt-6 flex items-center justify-center gap-1.5 text-center text-xs text-ink-400">
          <Smartphone size={13} /> Never share your security code or one-time passwords with anyone.
        </p>
      </div>
    </div>
  )
}
