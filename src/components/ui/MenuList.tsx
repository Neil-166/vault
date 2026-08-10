import type { ReactNode } from 'react'
import { ChevronRight } from 'lucide-react'

export function MenuRow({
  icon,
  label,
  value,
  onClick,
  danger,
  badge,
}: {
  icon: ReactNode
  label: string
  value?: string
  onClick?: () => void
  danger?: boolean
  badge?: string
}) {
  const Tag = onClick ? 'button' : 'div'
  return (
    <Tag
      onClick={onClick}
      className={`flex w-full items-center gap-3 px-4 py-3.5 text-left ${
        onClick ? 'cursor-pointer transition-colors hover:bg-cream-50' : ''
      }`}
    >
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-ink-100/70 text-ink-600">
        {icon}
      </span>
      <span className={`min-w-0 flex-1 truncate text-[15px] font-medium ${danger ? 'text-danger-600' : 'text-ink-800'}`}>
        {label}
      </span>
      {badge && (
        <span className="rounded-full bg-brand-50 px-2 py-0.5 text-xs font-semibold text-brand-700">{badge}</span>
      )}
      {value && <span className="truncate text-[13px] text-ink-400">{value}</span>}
      {onClick && <ChevronRight size={17} className="shrink-0 text-ink-300" />}
    </Tag>
  )
}

export function MenuCard({ children }: { children: ReactNode }) {
  return <div className="divide-y divide-ink-100 overflow-hidden rounded-2xl border border-ink-100 bg-white shadow-card">{children}</div>
}
