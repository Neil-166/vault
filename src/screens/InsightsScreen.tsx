import { useMemo } from 'react'
import { Lightbulb, PiggyBank, Sparkles, TrendingDown, TrendingUp } from 'lucide-react'
import { Card, ProgressBar } from '../components/ui/primitives'
import { CategoryIcon } from '../components/ui/CategoryIcon'
import { ScreenHeader } from '../components/ScreenHeader'
import { useVault } from '../store/useVault'
import { inr, currentMonthName, lastMonthName } from '../utils/format'
import type { Category, Transaction } from '../types'

const BUDGETS: Partial<Record<Category, number>> = {
  Food: 6000,
  Transport: 2000,
  Shopping: 5000,
  Entertainment: 1000,
  Bills: 4500,
  Groceries: 4000,
}

function spendInMonth(txs: Transaction[], key: string): number {
  return txs.filter((t) => t.type === 'debit' && t.date.startsWith(key)).reduce((s, t) => s + t.amount, 0)
}

function spendByCategory(txs: Transaction[], key: string): Map<Category, number> {
  const map = new Map<Category, number>()
  for (const t of txs) {
    if (t.type !== 'debit' || !t.date.startsWith(key)) continue
    map.set(t.category, (map.get(t.category) ?? 0) + t.amount)
  }
  return map
}

export default function InsightsScreen() {
  const transactions = useVault((s) => s.transactions)
  const goals = useVault((s) => s.goals)

  const insights = useMemo(() => {
    const d = new Date()
    const thisKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    const lm = new Date(d)
    lm.setMonth(lm.getMonth() - 1)
    const lastKey = `${lm.getFullYear()}-${String(lm.getMonth() + 1).padStart(2, '0')}`

    const thisTotal = spendInMonth(transactions, thisKey)
    const lastTotal = spendInMonth(transactions, lastKey)
    const delta = thisTotal - lastTotal

    const byCat = spendByCategory(transactions, thisKey)
    const cats = [...byCat.entries()].sort((a, b) => b[1] - a[1])

    const food = byCat.get('Food') ?? 0
    const lastFood = spendByCategory(transactions, lastKey).get('Food') ?? 0
    const foodDelta = food - lastFood

    const ent = byCat.get('Entertainment') ?? 0
    const entBudget = BUDGETS.Entertainment ?? 1000
    const entPct = Math.min(100, (ent / entBudget) * 100)

    const saved = transactions
      .filter((t) => t.category === 'Savings' && t.type === 'debit' && t.date.startsWith(thisKey))
      .reduce((s, t) => s + t.amount, 0)

    return { thisKey, thisTotal, lastTotal, delta, cats, food, lastFood, foodDelta, ent, entPct, entBudget, saved }
  }, [transactions])

  return (
    <div className="-mx-4 -mt-5 min-h-screen bg-white lg:mx-0 lg:mt-0 lg:rounded-3xl lg:border lg:border-ink-100 lg:shadow-card">
      <ScreenHeader title="Insights" subtitle="Plain answers, no jargon" />

      <div className="mx-auto max-w-lg px-5 pb-12 pt-6">
        {/* Hero */}
        <div className="rounded-3xl bg-gradient-to-br from-ink-800 via-ink-900 to-ink-950 p-5 text-white shadow-lift">
          <p className="text-[13px] font-medium text-ink-300">
            This {currentMonthName().toLowerCase()}, you spent
          </p>
          <p className="tnum mt-1 font-display text-[36px] font-bold leading-none">{inr(insights.thisTotal)}</p>
          <div className="mt-3 flex items-center gap-2 text-[13px] font-medium">
            {insights.delta <= 0 ? (
              <span className="flex items-center gap-1.5 text-pos-300">
                <TrendingDown size={15} /> {inr(Math.abs(insights.delta))} less than {lastMonthName()}
              </span>
            ) : (
              <span className="flex items-center gap-1.5 text-warn-300">
                <TrendingUp size={15} /> {inr(insights.delta)} more than {lastMonthName()}
              </span>
            )}
          </div>
        </div>

        {/* Category breakdown */}
        <Card className="mt-4 p-5">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-[15px] font-semibold text-ink-900">Where it went</h2>
            <span className="text-xs text-ink-400">{currentMonthName()}</span>
          </div>
          <div className="mt-4 space-y-3.5">
            {insights.cats.length === 0 ? (
              <p className="py-6 text-center text-sm text-ink-400">No spending yet this month.</p>
            ) : (
              insights.cats.slice(0, 5).map(([cat, amt]) => {
                const pct = (amt / Math.max(insights.thisTotal, 1)) * 100
                return (
                  <div key={cat} className="flex items-center gap-3">
                    <CategoryIcon category={cat} size={34} />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-baseline justify-between">
                        <span className="text-sm font-medium text-ink-800">{cat}</span>
                        <span className="tnum text-[13px] font-semibold text-ink-700">{inr(amt)}</span>
                      </div>
                      <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-ink-100">
                        <div
                          className="h-full rounded-full"
                          style={{
                            width: `${pct}%`,
                            background: `hsl(${hueFor(cat)} 62% 45%)`,
                          }}
                        />
                      </div>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </Card>

        {/* Food insight */}
        <Card className="mt-3 p-5">
          <div className="flex items-start gap-3">
            <CategoryIcon category="Food" size={40} />
            <div>
              <p className="text-[15px] font-medium text-ink-900">
                You spent <span className="tnum font-bold">{inr(insights.food)}</span> on food this month.
              </p>
              <p className="mt-1 text-[13px] leading-relaxed text-ink-500">
                {insights.foodDelta > 0
                  ? `That's ${inr(insights.foodDelta)} higher than last month.`
                  : insights.foodDelta < 0
                    ? `That's ${inr(Math.abs(insights.foodDelta))} lower than last month.`
                    : 'About the same as last month.'}{' '}
                {insights.foodDelta > 0 && 'Ordering in a couple fewer times would bring it back in line.'}
              </p>
            </div>
          </div>
        </Card>

        {/* Entertainment budget */}
        <Card className="mt-3 p-5">
          <div className="flex items-start gap-3">
            <CategoryIcon category="Entertainment" size={40} />
            <div className="min-w-0 flex-1">
              <p className="text-[15px] font-medium text-ink-900">
                You’ve used{' '}
                <span className="tnum font-bold">{Math.round(insights.entPct)}%</span> of your monthly
                entertainment budget.
              </p>
              <p className="tnum mt-0.5 text-[13px] text-ink-500">
                {inr(insights.ent)} of {inr(insights.entBudget)} used
              </p>
              <ProgressBar value={insights.entPct} hue={hueFor('Entertainment')} className="mt-3" />
            </div>
          </div>
        </Card>

        {/* Savings */}
        <Card className="mt-3 p-5">
          <div className="flex items-start gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-pos-50 text-pos-600">
              <PiggyBank size={20} />
            </span>
            <div>
              <p className="text-[15px] font-medium text-ink-900">
                You moved <span className="tnum font-bold">{inr(insights.saved)}</span> into savings this month.
              </p>
              <p className="mt-1 text-[13px] leading-relaxed text-ink-500">
                {goals.length > 0
                  ? `Across ${goals.length} goal${goals.length === 1 ? '' : 's'} — a regular amount like this compounds quietly.`
                  : 'Create a goal to see your progress here.'}
              </p>
            </div>
          </div>
        </Card>

        <div className="mt-6 flex items-center justify-center gap-2 text-center text-[13px] text-ink-400">
          <Sparkles size={14} className="text-brand-500" />
          <span>Insights are meant to inform, not to judge. There’s no wrong way to spend.</span>
          <Lightbulb size={14} className="text-brand-500" />
        </div>
      </div>
    </div>
  )
}

function hueFor(cat: Category): number {
  const hues: Record<Category, number> = {
    Food: 20,
    Transport: 210,
    Shopping: 280,
    Bills: 45,
    Entertainment: 320,
    Groceries: 152,
    Health: 0,
    Transfer: 232,
    Savings: 152,
    Other: 220,
  }
  return hues[cat] ?? 220
}
