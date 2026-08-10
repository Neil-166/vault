import { useEffect, type ReactNode } from 'react'
import { AnimatePresence, motion } from 'framer-motion'

export function BottomSheet({
  open,
  onClose,
  children,
  title,
  className = '',
}: {
  open: boolean
  onClose: () => void
  children: ReactNode
  title?: string
  className?: string
}) {
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [open, onClose])

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-end justify-center bg-ink-950/45 backdrop-blur-[2px]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={title ?? 'Sheet'}
            onClick={(e) => e.stopPropagation()}
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 360 }}
            className={`w-full max-w-lg overflow-hidden rounded-t-3xl bg-white shadow-pop ${className}`}
          >
            <div className="flex justify-center pt-3">
              <span className="h-1 w-10 rounded-full bg-ink-200" aria-hidden />
            </div>
            {title && (
              <div className="px-5 pt-4 pb-1">
                <h3 className="font-display text-lg font-semibold text-ink-900">{title}</h3>
              </div>
            )}
            <div className="max-h-[80vh] overflow-y-auto safe-bottom">{children}</div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
