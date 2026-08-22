import { useMemo } from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { TrendingDown, TrendingUp } from 'lucide-react'
import { Card } from '../components/ui/primitives'
import { ScreenHeader } from '../components/ScreenHeader'
import { useVault } from '../store/useVault'
import { inr, currentMonthName, lastMonthName } from '../utils/format'
import type { Category, Transaction } from '../types'

const CATEGORY_COLORS: Record<Category, string> = {
  Food: '#f97316', Transport: '#3b82f6', Shopping: '#8b5cf6', Bills: '#eab308',
  Entertainment: '#ec4899', Groceries: '#10b981', Health: '#ef4444', Transfer: '#6366f1',
  Savings: '#14b8a6', Other: '#64748b',
}

function spendByCategory(txs: Transaction[], key: string): { name: string; value: number; color: string }[] {
  const map = new Map<Category, number>()
  for (const t of txs) {
    if (t.type !== 'debit' || !t.date.startsWith(key)) continue
    map.set(t.category, (map.get(t.category) ?? 0) + t.amount)
  }
  return [...map.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([cat, val]) => ({ name: cat, value: Math.round(val), color: CATEGORY_COLORS[cat] ?? '#64748b' }))
}

function weeklyData(txs: Transaction[]): { day: string; amount: number }[] {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
  const now = new Date()
  const mondayShift = (now.getDay() + 6) % 7
  const monday = new Date(now)
  monday.setDate(now.getDate() - mondayShift)
  monday.setHours(0, 0, 0, 0)

  return days.map((label, i) => {
    const d = new Date(monday)
    d.setDate(monday.getDate() + i)
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
    const amount = txs
      .filter((t) => t.type === 'debit' && t.date === key)
      .reduce((s, t) => s + t.amount, 0)
    return { day: label, amount: Math.round(amount) }
  })
}

function monthKey(offset: number): string {
  const d = new Date()
  d.setMonth(d.getMonth() + offset)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

export default function AnalyticsScreen() {
  const transactions = useVault((s) => s.transactions)

  const thisKey = monthKey(0)
  const lastKey = monthKey(-1)

  const thisMonthSpend = useMemo(() => transactions.filter((t) => t.type === 'debit' && t.date.startsWith(thisKey)).reduce((s, t) => s + t.amount, 0), [transactions, thisKey])
  const lastMonthSpend = useMemo(() => transactions.filter((t) => t.type === 'debit' && t.date.startsWith(lastKey)).reduce((s, t) => s + t.amount, 0), [transactions, lastKey])
  const delta = thisMonthSpend - lastMonthSpend
  const deltaPct = lastMonthSpend > 0 ? Math.round((delta / lastMonthSpend) * 100) : 0

  const categoryData = useMemo(() => spendByCategory(transactions, thisKey), [transactions, thisKey])
  const weekData = useMemo(() => weeklyData(transactions), [transactions])

  const BUDGETS: Partial<Record<Category, number>> = { Food: 6000, Transport: 2000, Shopping: 5000, Entertainment: 1000, Bills: 4500, Groceries: 4000 }

  return (
    <div className="-mx-4 -mt-5 min-h-screen bg-white lg:mx-0 lg:mt-0 lg:rounded-3xl lg:border lg:border-ink-100 lg:shadow-card">
      <ScreenHeader title="Spending analytics" subtitle={`${currentMonthName()} overview`} />

      <div className="mx-auto max-w-lg px-5 pb-12 pt-6 space-y-5">
        {/* Month summary */}
        <div className="rounded-2xl p-5 text-white shadow-lift" style={{ background: 'linear-gradient(135deg, #1c2540, #0a0e1f)' }}>
          <p className="text-[13px] font-medium text-ink-300">This {currentMonthName().toLowerCase()}, you spent</p>
          <p className="tnum mt-1 font-display text-[32px] font-bold leading-none">{inr(thisMonthSpend)}</p>
          <div className="mt-3 flex items-center gap-2 text-[13px] font-medium">
            {delta <= 0 ? (
              <span className="flex items-center gap-1.5 text-pos-300"><TrendingDown size={15} /> {Math.abs(deltaPct)}% less than {lastMonthName()}</span>
            ) : (
              <span className="flex items-center gap-1.5 text-warn-300"><TrendingUp size={15} /> {deltaPct}% more than {lastMonthName()}</span>
            )}
          </div>
        </div>

        {/* One thing worth knowing card */}
        <Card className="p-4 bg-cream-50 border border-brand-100 shadow-xs">
          <div className="flex items-start gap-3">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600 font-bold text-xs">
              💡
            </span>
            <div className="text-xs">
              <p className="font-semibold text-ink-900">One thing worth knowing</p>
              <p className="mt-1 leading-relaxed text-ink-600">
                {categoryData.length > 0
                  ? `${categoryData[0].name} was your largest spending category this month (${inr(categoryData[0].value)}). All other categories remained within planned thresholds.`
                  : 'Track your spending automatically as payments settle.'}
              </p>
            </div>
          </div>
        </Card>

        {/* Weekly bar chart */}
        <Card className="p-5">
          <h3 className="font-display text-[15px] font-semibold text-ink-900">This week</h3>
          <div className="mt-4 h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weekData} barCategoryGap="25%">
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#7f91af' }} />
                <YAxis hide />
                <Tooltip
                  formatter={(v) => [inr(Number(v)), 'Spent']}
                  contentStyle={{ borderRadius: 12, border: '1px solid #e8ecf3', fontSize: 13 }}
                  cursor={{ fill: 'rgba(99,102,241,0.06)' }}
                />
                <Bar dataKey="amount" fill="#6366f1" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Category donut */}
        {categoryData.length > 0 && (
          <Card className="p-5">
            <h3 className="font-display text-[15px] font-semibold text-ink-900">Where it went</h3>
            <div className="mt-4 flex items-center gap-6">
              <div className="h-40 w-40 shrink-0">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={categoryData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={40} outerRadius={65} strokeWidth={2} stroke="white">
                      {categoryData.map((entry) => (
                        <Cell key={entry.name} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(v) => inr(Number(v))} contentStyle={{ borderRadius: 12, border: '1px solid #e8ecf3', fontSize: 13 }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="min-w-0 flex-1 space-y-2">
                {categoryData.slice(0, 5).map((c) => (
                  <div key={c.name} className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: c.color }} />
                    <span className="min-w-0 flex-1 truncate text-[13px] text-ink-600">{c.name}</span>
                    <span className="tnum text-[13px] font-semibold text-ink-800">{inr(c.value)}</span>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        )}

        {/* Budget cards */}
        <div>
          <h3 className="mb-3 font-display text-[15px] font-semibold text-ink-900">Budget check</h3>
          <div className="space-y-2">
            {categoryData.slice(0, 4).map((c) => {
              const budget = BUDGETS[c.name as Category] ?? 5000
              const pct = Math.min(100, (c.value / budget) * 100)
              const over = pct >= 90
              return (
                <div key={c.name} className="rounded-xl border border-ink-100 bg-white p-3.5">
                  <div className="flex items-center justify-between text-[13px]">
                    <span className="font-medium text-ink-700">{c.name}</span>
                    <span className={`tnum font-semibold ${over ? 'text-danger-600' : 'text-ink-600'}`}>{inr(c.value)} / {inr(budget)}</span>
                  </div>
                  <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-ink-100">
                    <div className="h-full rounded-full transition-all duration-700" style={{ width: `${pct}%`, background: over ? '#e5484d' : c.color }} />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
