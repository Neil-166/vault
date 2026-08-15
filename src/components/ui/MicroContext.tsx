import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { HelpCircle, ChevronDown, Info } from 'lucide-react'

interface MicroContextProps {
  term: string
  explanation: string
  className?: string
  defaultOpen?: boolean
  inline?: boolean
}

export function MicroContext({
  term,
  explanation,
  className = '',
  defaultOpen = false,
  inline = false,
}: MicroContextProps) {
  const [open, setOpen] = useState(defaultOpen)

  if (inline) {
    return (
      <span className={`inline-flex items-center gap-1 relative ${className}`}>
        <span>{term}</span>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            setOpen(!open)
          }}
          className="text-ink-400 hover:text-brand-600 transition-colors p-0.5 rounded focus:outline-none focus:ring-1 focus:ring-brand-400"
          aria-label={`Learn more about ${term}`}
          aria-expanded={open}
        >
          <HelpCircle size={13} />
        </button>
        <AnimatePresence>
          {open && (
            <>
              <div
                className="fixed inset-0 z-30"
                onClick={(e) => {
                  e.stopPropagation()
                  setOpen(false)
                }}
              />
              <motion.div
                initial={{ opacity: 0, y: 4, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 4, scale: 0.95 }}
                transition={{ duration: 0.15 }}
                className="absolute bottom-full left-0 mb-2 z-40 w-60 rounded-xl bg-ink-950 p-3 text-xs leading-relaxed text-ink-200 shadow-pop"
              >
                <div className="flex items-start gap-1.5 font-semibold text-white mb-1">
                  <Info size={13} className="mt-0.5 text-brand-400 shrink-0" />
                  <span>{term}</span>
                </div>
                <p className="text-ink-300">{explanation}</p>
                <div className="absolute -bottom-1 left-4 h-2 w-2 rotate-45 bg-ink-950" />
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </span>
    )
  }

  return (
    <div className={`rounded-xl border border-ink-100 bg-cream-50 overflow-hidden text-left ${className}`}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between px-3.5 py-2.5 text-xs text-ink-600 hover:text-ink-900 transition-colors"
        aria-expanded={open}
      >
        <span className="flex items-center gap-1.5 font-medium">
          <HelpCircle size={13} className="text-ink-400" />
          <span>Why am I seeing this? · <strong className="font-semibold text-ink-800">{term}</strong></span>
        </span>
        <ChevronDown
          size={14}
          className={`text-ink-400 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
        />
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="border-t border-ink-100 px-3.5 py-2.5 text-xs leading-relaxed text-ink-500 bg-white">
              {explanation}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
