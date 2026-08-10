import type { ReactNode } from 'react'
import { Modal } from './Modal'
import { Button } from './primitives'
import { AlertTriangle } from 'lucide-react'

export function ConfirmationDialog({
  open,
  onClose,
  onConfirm,
  title,
  children,
  confirmLabel = 'Confirm',
  tone = 'primary',
  loading,
}: {
  open: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  children: ReactNode
  confirmLabel?: string
  tone?: 'primary' | 'danger'
  loading?: boolean
}) {
  return (
    <Modal open={open} onClose={onClose} size="sm">
      <div className="flex flex-col items-center pb-1 text-center">
        {tone === 'danger' ? (
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-danger-100 text-danger-600">
            <AlertTriangle size={22} />
          </div>
        ) : (
          <div className="mb-4 h-12 w-12 rounded-full bg-brand-50 text-brand-600 ring-8 ring-brand-50/50" />
        )}
        <h3 className="font-display text-lg font-semibold text-ink-900">{title}</h3>
        <div className="mt-2 text-[15px] leading-relaxed text-ink-500">{children}</div>
      </div>
      <div className="mt-6 flex flex-col gap-2.5">
        <Button
          fullWidth
          variant={tone === 'danger' ? 'danger' : 'primary'}
          loading={loading}
          onClick={onConfirm}
        >
          {confirmLabel}
        </Button>
        <Button fullWidth variant="ghost" onClick={onClose}>
          Cancel
        </Button>
      </div>
    </Modal>
  )
}
