import type { ReactNode } from 'react'

export function EmptyState({
  icon,
  title,
  body,
  action,
  className = '',
}: {
  icon: ReactNode
  title: string
  body?: string
  action?: ReactNode
  className?: string
}) {
  return (
    <div className={`flex flex-col items-center justify-center px-6 py-12 text-center ${className}`}>
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-ink-100/70 text-ink-400">
        {icon}
      </div>
      <h3 className="font-display text-base font-semibold text-ink-800">{title}</h3>
      {body && <p className="mt-1.5 max-w-xs text-sm leading-relaxed text-ink-500">{body}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  )
}
