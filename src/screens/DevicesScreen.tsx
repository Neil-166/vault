import { AlertTriangle, Laptop, LogOut, MonitorSmartphone } from 'lucide-react'
import { Button, Card } from '../components/ui/primitives'
import { ScreenHeader } from '../components/ScreenHeader'
import { useVault } from '../store/useVault'
import type { Device } from '../types'

export default function DevicesScreen() {
  const devices = useVault((s) => s.devices)
  const removeDevice = useVault((s) => s.removeDevice)
  const pushToast = useVault((s) => s.pushToast)

  const suspicious = devices.find((d) => d.suspicious)

  return (
    <div className="-mx-4 -mt-5 min-h-screen bg-white lg:mx-0 lg:mt-0 lg:rounded-3xl lg:border lg:border-ink-100 lg:shadow-card">
      <ScreenHeader title="Signed-in devices" subtitle={`${devices.length} devices active`} />

      <div className="mx-auto max-w-lg px-5 pb-12 pt-6">
        {suspicious && (
          <div className="mb-4 flex items-start gap-3 rounded-2xl border border-danger-200 bg-danger-50 p-4">
            <AlertTriangle size={20} className="mt-0.5 shrink-0 text-danger-600" />
            <div>
              <p className="text-sm font-semibold text-danger-800">Unusual sign-in detected</p>
              <p className="mt-0.5 text-[13px] leading-relaxed text-danger-700">
                A sign-in from {suspicious.location} on a new device happened 3 days ago. If it
                wasn’t you, sign that device out below.
              </p>
            </div>
          </div>
        )}

        <Card className="divide-y divide-ink-100 px-1 py-1">
          {devices.map((d) => (
            <DeviceRow key={d.id} d={d} onRemove={() => removeDevice(d.id)} pushToast={pushToast} />
          ))}
        </Card>

        <p className="mt-4 text-center text-xs leading-relaxed text-ink-400">
          If you see a device you don’t recognise, sign it out and change your security code.
        </p>
      </div>
    </div>
  )
}

function DeviceRow({
  d,
  onRemove,
  pushToast,
}: {
  d: Device
  onRemove: () => void
  pushToast: (t: { tone: 'success' | 'info' | 'warn' | 'error'; title: string; body?: string }) => void
}) {
  const Icon = d.current ? Laptop : MonitorSmartphone
  return (
    <div className="flex items-center gap-3 px-4 py-3.5">
      <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${d.suspicious ? 'bg-danger-50 text-danger-600' : 'bg-ink-100/70 text-ink-600'}`}>
        <Icon size={19} />
      </span>
      <div className="min-w-0 flex-1">
        <p className="flex items-center gap-2 truncate text-[15px] font-medium text-ink-900">
          {d.name}
          {d.current && <span className="rounded-full bg-pos-100 px-2 py-0.5 text-[10.5px] font-semibold text-pos-700">This device</span>}
          {d.suspicious && <span className="rounded-full bg-danger-100 px-2 py-0.5 text-[10.5px] font-semibold text-danger-700">Suspicious</span>}
        </p>
        <p className="tnum truncate text-[13px] text-ink-400">
          {d.location} · {d.lastActive}
        </p>
      </div>
      {!d.current && (
        <Button
          size="sm"
          variant={d.suspicious ? 'danger' : 'secondary'}
          className="h-8 px-2.5 text-xs"
          onClick={() => {
            onRemove()
            pushToast({ tone: 'info', title: 'Device signed out', body: `${d.name} was removed from your account.` })
          }}
        >
          <LogOut size={13} /> Sign out
        </Button>
      )}
    </div>
  )
}
