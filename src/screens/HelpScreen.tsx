import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ChevronDown, Headset } from 'lucide-react'
import { Button, Card } from '../components/ui/primitives'
import { ScreenHeader } from '../components/ScreenHeader'
import { useVault } from '../store/useVault'

const FAQS = [
  {
    q: 'Are there any hidden charges?',
    a: 'No. Every fee is shown before you confirm a payment, on a clear breakdown. VAULT sends between verified recipients are free.',
  },
  {
    q: 'How do I make sure I pay the right person?',
    a: 'Only verified recipients can receive money from your VAULT. Before you confirm, we always show the recipient, the amount and the total — and warn you on large payments.',
  },
  {
    q: 'How does bill splitting work?',
    a: 'Create a split, add friends, choose an equal or custom division, and send requests. Each friend’s share is tracked until everyone has paid, and you can send reminders any time.',
  },
  {
    q: 'How much should I save each month?',
    a: 'Open any savings goal and we’ll tell you exactly what to save per month to reach it by your target date. No games, no streaks — just a realistic plan.',
  },
  {
    q: 'What happens if a payment fails?',
    a: 'You’ll see a clear message explaining why, never an error code. Your balance is never deducted for a failed payment.',
  },
]

export default function HelpScreen() {
  const pushToast = useVault((s) => s.pushToast)
  const [open, setOpen] = useState<number | null>(0)

  return (
    <div className="-mx-4 -mt-5 min-h-screen bg-white lg:mx-0 lg:mt-0 lg:rounded-3xl lg:border lg:border-ink-100 lg:shadow-card">
      <ScreenHeader title="Help & support" />

      <div className="mx-auto max-w-lg px-5 pb-12 pt-6">
        <div className="flex flex-col items-center py-4 text-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-50 text-brand-600">
            <Headset size={26} />
          </span>
          <h2 className="mt-4 font-display text-lg font-semibold text-ink-900">How can we help?</h2>
          <p className="mt-1 max-w-xs text-sm text-ink-500">
            The answers below cover the most common questions. For anything else, we’re one message
            away.
          </p>
          <Button className="mt-5" onClick={() => pushToast({ tone: 'info', title: 'Contact support', body: 'In this prototype, chat is simulated. Real banking support would be a tap away.' })}>
            Start a chat
          </Button>
        </div>

        <div className="mt-4 space-y-2">
          {FAQS.map((faq, i) => {
            const expanded = open === i
            return (
              <Card key={faq.q} className="overflow-hidden">
                <button
                  onClick={() => setOpen(expanded ? null : i)}
                  aria-expanded={expanded}
                  className="flex w-full items-center justify-between gap-3 px-4 py-3.5 text-left"
                >
                  <span className="text-[15px] font-medium text-ink-800">{faq.q}</span>
                  <ChevronDown
                    size={18}
                    className={`shrink-0 text-ink-400 transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`}
                  />
                </button>
                <AnimatePresence initial={false}>
                  {expanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.22 }}
                    >
                      <p className="border-t border-ink-100 px-4 py-3.5 text-[14px] leading-relaxed text-ink-500">
                        {faq.a}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </Card>
            )
          })}
        </div>

        <p className="mt-6 text-center text-xs text-ink-400">
          Built for the hackathon · Money, made clear.
        </p>
      </div>
    </div>
  )
}
