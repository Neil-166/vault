import { AnimatePresence, motion } from 'framer-motion'
import { CheckCircle2, AlertTriangle, Info, XCircle, X } from 'lucide-react'
import { useVault } from '../../store/useVault'
import type { ToastTone } from '../../types'

const toneStyles: Record<ToastTone, { icon: typeof Info; ring: string; iconColor: string }> = {
  success: { icon: CheckCircle2, ring: 'border-pos-200', iconColor: 'text-pos-600' },
  info: { icon: Info, ring: 'border-brand-200', iconColor: 'text-brand-600' },
  warn: { icon: AlertTriangle, ring: 'border-warn-300', iconColor: 'text-warn-600' },
  error: { icon: XCircle, ring: 'border-danger-200', iconColor: 'text-danger-600' },
}

export function Toasts() {
  const toasts = useVault((s) => s.toasts)
  const dismissToast = useVault((s) => s.dismissToast)

  return (
    <div className="pointer-events-none fixed inset-x-0 top-4 z-[60] flex flex-col items-center gap-2 px-4 sm:items-end sm:pr-6">
      <AnimatePresence>
        {toasts.map((t) => {
          const meta = toneStyles[t.tone]
          const Icon = meta.icon
          return (
            <motion.div
              key={t.id}
              layout
              initial={{ opacity: 0, y: -16, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.96 }}
              transition={{ type: 'spring', damping: 26, stiffness: 420 }}
              className={`pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-2xl border ${meta.ring} bg-white p-3.5 shadow-lift`}
              role="status"
            >
              <Icon size={19} className={`mt-0.5 shrink-0 ${meta.iconColor}`} />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-ink-900">{t.title}</p>
                {t.body && <p className="mt-0.5 text-[13px] leading-snug text-ink-500">{t.body}</p>}
              </div>
              <button
                onClick={() => dismissToast(t.id)}
                aria-label="Dismiss notification"
                className="shrink-0 rounded-lg p-1 text-ink-300 hover:bg-ink-50 hover:text-ink-600"
              >
                <X size={15} />
              </button>
            </motion.div>
          )
        })}
      </AnimatePresence>
    </div>
  )
}
