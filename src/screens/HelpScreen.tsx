import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ChevronDown, Headset, ShieldCheck } from 'lucide-react'
import { Button, Card } from '../components/ui/primitives'
import { ScreenHeader } from '../components/ScreenHeader'
import { useVault } from '../store/useVault'

const FAQS = [
  {
    q: 'What is the VAULT Confidence Layer?',
    a: 'The Confidence Layer answers the 7 key questions before you move your money: What are you doing? How much will move? Are there any fees? Who is receiving the money? When will it arrive? What happens after you confirm? Is there anything unusual you should notice?',
  },
  {
    q: 'Are there any hidden fees or surprise charges?',
    a: 'Never. Fee transparency is our core design principle. Every transfer, bill payment, and request explicitly shows Amount + Fee = Total before you confirm. Standard transfers and bill splits have ₹0 fees.',
  },
  {
    q: 'How does VAULT verify transfer recipients?',
    a: 'Before sending money, VAULT checks the recipient’s registered identity, looks up your prior payment history with them, and warns you if the amount is unusually large or if the contact is new.',
  },
  {
    q: 'How does social bill splitting work?',
    a: 'Enter what the bill was for and the total amount, pick your friends, and select equal or custom shares. You can send friendly reminders in one tap, and VAULT tracks payments until the split is complete.',
  },
  {
    q: 'How do savings goals work?',
    a: 'Goals follow a simple mental model: "What do you want?", "How much?", and "By when?". We calculate your monthly pace without gamification, streaks, or pressure. Your money stays safely in your account.',
  },
  {
    q: 'What happens if a transfer fails?',
    a: 'You receive an immediate, plain-English explanation without cryptic banking codes. Your money is never deducted for a failed transfer, and you can edit or retry in one tap.',
  },
]

export default function HelpScreen() {
  const pushToast = useVault((s) => s.pushToast)
  const [open, setOpen] = useState<number | null>(0)

  return (
    <div className="-mx-4 -mt-5 min-h-screen bg-white lg:mx-0 lg:mt-0 lg:rounded-3xl lg:border lg:border-ink-100 lg:shadow-card">
      <ScreenHeader title="Help & clarity" subtitle="Answers without banking jargon" />

      <div className="mx-auto max-w-lg px-5 pb-12 pt-6 space-y-5">
        <div className="flex flex-col items-center py-4 text-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-50 text-brand-600 shadow-xs">
            <Headset size={26} />
          </span>
          <h2 className="mt-4 font-display text-xl font-bold text-ink-950">How can we help?</h2>
          <p className="mt-1 max-w-sm text-sm text-ink-500">
            Plain-language answers to your common questions. No jargon, just clear guidance.
          </p>
          <Button
            className="mt-5"
            onClick={() =>
              pushToast({
                tone: 'info',
                title: 'Help Assistant',
                body: 'VAULT provides built-in confidence micro-context across all screens.',
              })
            }
          >
            Ask a question
          </Button>
        </div>

        <div className="space-y-2">
          {FAQS.map((faq, i) => {
            const expanded = open === i
            return (
              <Card key={faq.q} className="overflow-hidden shadow-card">
                <button
                  onClick={() => setOpen(expanded ? null : i)}
                  aria-expanded={expanded}
                  className="flex w-full items-center justify-between gap-3 px-4 py-3.5 text-left"
                >
                  <span className="text-[15px] font-semibold text-ink-900">{faq.q}</span>
                  <ChevronDown
                    size={18}
                    className={`shrink-0 text-ink-400 transition-transform duration-200 ${
                      expanded ? 'rotate-180 text-brand-600' : ''
                    }`}
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
                      <p className="border-t border-ink-100 px-4 py-3.5 text-[14px] leading-relaxed text-ink-600 bg-cream-50/50">
                        {faq.a}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </Card>
            )
          })}
        </div>

        <div className="flex items-center justify-center gap-1.5 pt-4 text-center text-xs text-ink-400">
          <ShieldCheck size={14} className="text-pos-600" /> Confidence-First Banking Architecture · Money, made clear.
        </div>
      </div>
    </div>
  )
}
