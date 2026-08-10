import type { ReactNode } from 'react'
import { ArrowLeft } from 'lucide-react'
import { useVault } from '../store/useVault'
import { IconButton } from './ui/primitives'

export function ScreenHeader({
  title,
  subtitle,
  right,
  onBack,
}: {
  title: string
  subtitle?: string
  right?: ReactNode
  onBack?: () => void
}) {
  const back = useVault((s) => s.back)
  return (
    <header className="sticky top-0 z-30 border-b border-ink-100/80 bg-cream-100/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 w-full max-w-3xl items-center gap-2 px-4">
        <IconButton label="Go back" onClick={onBack ?? back}>
          <ArrowLeft size={20} />
        </IconButton>
        <div className="min-w-0 flex-1">
          <h1 className="truncate font-display text-lg font-semibold text-ink-900">{title}</h1>
          {subtitle && <p className="truncate text-[13px] text-ink-400">{subtitle}</p>}
        </div>
        {right}
      </div>
    </header>
  )
}
