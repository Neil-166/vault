import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowDownToLine, Landmark, ShieldCheck } from 'lucide-react'
import { Button } from '../components/ui/primitives'
import { ScreenHeader } from '../components/ScreenHeader'
import { SuccessState } from '../components/SuccessState'
import { FeeBreakdown } from '../components/ui/FeeBreakdown'
import { useVault } from '../store/useVault'
import { inr, inrFull } from '../utils/format'

const BANKS = [
  { id: 'hdfc', name: 'HDFC Bank', account: '•••• 4521', label: 'Primary checking' },
  { id: 'sbi', name: 'State Bank of India', account: '•••• 2288', label: 'Savings account' },
  { id: 'icici', name: 'ICICI Bank', account: '•••• 9134', label: 'Savings account' },
]
const QUICK = [1000, 2500, 5000, 10000]

export default function AddMoneyScreen() {
  const balance = useVault((s) => s.balance)
  const addMoney = useVault((s) => s.addMoney)
  const go = useVault((s) => s.go)
  const back = useVault((s) => s.back)

  const [amountStr, setAmountStr] = useState('')
  const [bank, setBank] = useState(BANKS[0])
  const [done, setDone] = useState(false)

  const amount = parseFloat(amountStr) || 0
  const error = amount <= 0 ? 'Enter an amount above ₹0.' : ''

  const handleAdd = () => {
    if (amount <= 0) return
    addMoney(amount)
    setDone(true)
  }

  return (
    <div className="-mx-4 -mt-5 min-h-screen bg-white lg:mx-0 lg:mt-0 lg:rounded-3xl lg:border lg:border-ink-100 lg:shadow-card">
      <ScreenHeader title="Add money" subtitle="Top up from your linked bank" onBack={() => (done ? go({ name: 'home' }) : back())} />

      <div className="mx-auto max-w-lg px-5 pb-10 pt-6">
        <AnimatePresence mode="wait">
          {!done ? (
            <motion.div key="a0" initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }} transition={{ duration: 0.22 }}>
              <h2 className="font-display text-xl font-bold text-ink-950">How much do you want to add?</h2>
              <p className="mt-1 text-sm text-ink-400">Funds land in your VAULT available to spend balance instantly.</p>

              <div className="mt-7 flex items-center justify-center gap-2">
                <span className="font-display text-3xl font-bold text-ink-400">₹</span>
                <input
                  autoFocus
                  inputMode="decimal"
                  type="text"
                  value={amountStr}
                  onChange={(e) => setAmountStr(e.target.value.replace(/[^0-9.]/g, ''))}
                  placeholder="0"
                  aria-label="Amount in rupees"
                  className="tnum w-52 border-0 bg-transparent text-center font-display text-[52px] font-bold text-ink-950 placeholder:text-ink-200 focus:outline-none focus:ring-0"
                />
              </div>

              <div className="mt-5 flex flex-wrap justify-center gap-2">
                {QUICK.map((q) => (
                  <button
                    key={q}
                    onClick={() => setAmountStr(String(q))}
                    className={`rounded-full border px-4 py-2 text-sm font-semibold transition-colors ${
                      amount === q ? 'border-brand-500 bg-brand-50 text-brand-700' : 'border-ink-200 text-ink-600 hover:border-brand-300'
                    }`}
                  >
                    ₹{q.toLocaleString('en-IN')}
                  </button>
                ))}
              </div>

              <div className="mt-7">
                <span className="mb-1.5 block text-sm font-medium text-ink-700">From linked bank</span>
                <div className="space-y-2">
                  {BANKS.map((b) => {
                    const active = bank.id === b.id
                    return (
                      <button
                        key={b.id}
                        onClick={() => setBank(b)}
                        aria-pressed={active}
                        className={`flex w-full items-center gap-3 rounded-2xl border p-3.5 text-left transition-all ${
                          active ? 'border-brand-400 bg-brand-50' : 'border-ink-100 bg-white hover:border-ink-200'
                        }`}
                      >
                        <span className={`flex h-10 w-10 items-center justify-center rounded-xl ${active ? 'bg-brand-600 text-white' : 'bg-ink-100 text-ink-500'}`}>
                          <Landmark size={19} />
                        </span>
                        <span className="flex-1">
                          <span className="block text-[15px] font-semibold text-ink-900">{b.name}</span>
                          <span className="tnum block text-[13px] text-ink-400">{b.account} · {b.label}</span>
                        </span>
                        <span aria-hidden className={`flex h-5 w-5 items-center justify-center rounded-full border-2 ${active ? 'border-brand-600' : 'border-ink-300'}`}>
                          {active && <span className="h-2.5 w-2.5 rounded-full bg-brand-600" />}
                        </span>
                      </button>
                    )
                  })}
                </div>
              </div>

              {amount > 0 && (
                <div className="mt-5 space-y-3">
                  <FeeBreakdown amount={amount} fee={0} feeLabel="Deposit fee" totalLabel="Total added to VAULT" />
                  <div className="flex items-center justify-between rounded-xl bg-cream-50 px-4 py-3 border border-ink-100 text-xs">
                    <span className="text-ink-500">Available to spend after:</span>
                    <span className="tnum font-display text-sm font-bold text-ink-950">{inrFull(balance + amount)}</span>
                  </div>
                </div>
              )}

              {error && <p className="mt-3 rounded-xl bg-danger-50 px-3.5 py-2.5 text-sm font-medium text-danger-600">{error}</p>}

              <Button size="lg" fullWidth className="mt-6" onClick={handleAdd} disabled={amount <= 0}>
                <ArrowDownToLine size={17} /> Add {amount > 0 ? inr(amount) : 'money'} now
              </Button>
            </motion.div>
          ) : (
            <motion.div key="a1" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <SuccessState
                title="Money added to VAULT"
                amount={amount}
                subtitle={`Deposited from ${bank.name} ${bank.account}`}
                meta={[
                  { label: 'New available balance', value: inrFull(balance + amount) },
                  { label: 'Deposit fee', value: '₹0 · No hidden fees' },
                  { label: 'Arrival', value: 'Instant' },
                  { label: 'Payment status', value: 'Completed' },
                ]}
              >
                <Button size="lg" fullWidth onClick={() => go({ name: 'home' })}>
                  Done
                </Button>
              </SuccessState>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <p className="mx-auto flex max-w-lg items-center justify-center gap-1.5 px-5 pb-8 text-center text-xs text-ink-400">
        <ShieldCheck size={14} className="text-pos-600" /> Funds move securely from your linked bank. Zero hidden charges.
      </p>
    </div>
  )
}
