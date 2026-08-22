import { forwardRef, type ButtonHTMLAttributes, type InputHTMLAttributes, type ReactNode } from 'react'
import { Loader2, Search, X } from 'lucide-react'

/* ── Button ─────────────────────────────────────────────── */
type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'soft' | 'dark'
type ButtonSize = 'sm' | 'md' | 'lg'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  loading?: boolean
  fullWidth?: boolean
  children: ReactNode
}

const buttonBase =
  'inline-flex items-center justify-center gap-2 rounded-xl font-medium transition-all duration-150 select-none ' +
  'disabled:opacity-50 disabled:pointer-events-none active:scale-[0.985] whitespace-nowrap focus-visible:outline-2 focus-visible:outline-offset-2'
const buttonVariants: Record<ButtonVariant, string> = {
  primary: 'bg-ink-950 text-white hover:bg-ink-800 shadow-card',
  dark: 'bg-brand-700 text-white hover:bg-brand-600 shadow-card',
  secondary: 'bg-white text-ink-800 border border-ink-200 hover:border-ink-300 hover:bg-cream-50',
  ghost: 'text-ink-600 hover:bg-ink-100/70 hover:text-ink-900',
  soft: 'bg-brand-50 text-brand-700 hover:bg-brand-100',
  danger: 'bg-danger-600 text-white hover:bg-danger-500',
}
const buttonSizes: Record<ButtonSize, string> = {
  sm: 'h-9 px-3.5 text-sm',
  md: 'h-11 px-5 text-sm',
  lg: 'h-12 px-6 text-[15px]',
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = 'primary', size = 'md', loading, fullWidth, className = '', children, disabled, ...rest },
  ref,
) {
  return (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={`${buttonBase} ${buttonVariants[variant]} ${buttonSizes[size]} ${
        fullWidth ? 'w-full' : ''
      } ${className}`}
      {...rest}
    >
      {loading && <Loader2 size={16} className="animate-spin" aria-hidden />}
      {children}
    </button>
  )
})

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  label: string
  children: ReactNode
  size?: 'sm' | 'md' | 'lg'
}

export function IconButton({ label, children, size = 'md', className = '', ...rest }: IconButtonProps) {
  const sizes = { sm: 'h-8 w-8', md: 'h-10 w-10', lg: 'h-12 w-12' }
  return (
    <button
      aria-label={label}
      title={label}
      className={`inline-flex items-center justify-center rounded-xl text-ink-600 transition-colors hover:bg-ink-100/70 hover:text-ink-900 active:scale-95 ${sizes[size]} ${className}`}
      {...rest}
    >
      {children}
    </button>
  )
}

/* ── Card ───────────────────────────────────────────────── */
interface CardProps {
  children: ReactNode
  className?: string
  hover?: boolean
  onClick?: () => void
  as?: 'div' | 'button' | 'li'
}

export function Card({ children, className = '', hover, onClick, as = 'div' }: CardProps) {
  const Tag = as
  const TagAny = Tag as 'div'
  return (
    <TagAny
      onClick={onClick}
      className={`rounded-2xl border border-ink-100 bg-white shadow-card ${
        hover ? 'transition-all hover:-translate-y-0.5 hover:shadow-lift cursor-pointer' : ''
      } ${className}`}
    >
      {children}
    </TagAny>
  )
}

/* ── Input ──────────────────────────────────────────────── */
interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  hint?: string
  error?: string
  icon?: ReactNode
  rightSlot?: ReactNode
}

export function Input({ label, hint, error, icon, rightSlot, className = '', id, ...rest }: InputProps) {
  const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-')
  return (
    <div className="w-full">
      {label && (
        <label htmlFor={inputId} className="mb-1.5 block text-sm font-medium text-ink-700">
          {label}
        </label>
      )}
      <div className="relative">
        {icon && (
          <span className="pointer-events-none absolute inset-y-0 left-3.5 flex items-center text-ink-400">
            {icon}
          </span>
        )}
        <input
          id={inputId}
          className={`h-12 w-full rounded-xl border bg-white px-4 text-[15px] text-ink-900 placeholder:text-ink-300 transition-colors focus:outline-none focus:ring-2 ${
            icon ? 'pl-10' : ''
          } ${rightSlot ? 'pr-11' : ''} ${
            error
              ? 'border-danger-300 focus:border-danger-400 focus:ring-danger-100'
              : 'border-ink-200 focus:border-brand-400 focus:ring-brand-100'
          } ${className}`}
          {...rest}
        />
        {rightSlot && <span className="absolute inset-y-0 right-3 flex items-center">{rightSlot}</span>}
      </div>
      {error ? (
        <p className="mt-1.5 text-[13px] font-medium text-danger-600">{error}</p>
      ) : hint ? (
        <p className="mt-1.5 text-[13px] text-ink-400">{hint}</p>
      ) : null}
    </div>
  )
}

/* ── Badge ──────────────────────────────────────────────── */
type BadgeTone = 'success' | 'info' | 'warn' | 'error' | 'neutral' | 'brand'
const badgeTones: Record<BadgeTone, string> = {
  success: 'bg-pos-100 text-pos-700',
  info: 'bg-brand-50 text-brand-700',
  warn: 'bg-warn-100 text-warn-700',
  error: 'bg-danger-100 text-danger-700',
  neutral: 'bg-ink-100 text-ink-600',
  brand: 'bg-ink-950 text-white',
}

export function Badge({
  tone = 'neutral',
  children,
  className = '',
}: {
  tone?: BadgeTone
  children: ReactNode
  className?: string
}) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${badgeTones[tone]} ${className}`}
    >
      {children}
    </span>
  )
}

/* ── Progress bar ───────────────────────────────────────── */
export function ProgressBar({
  value,
  hue = 232,
  className = '',
  trackClassName = '',
}: {
  value: number
  hue?: number
  className?: string
  trackClassName?: string
}) {
  const pct = Math.max(0, Math.min(100, value))
  return (
    <div
      role="progressbar"
      aria-valuenow={Math.round(pct)}
      aria-valuemin={0}
      aria-valuemax={100}
      className={`h-2 w-full overflow-hidden rounded-full bg-ink-100 ${trackClassName} ${className}`}
    >
      <div
        className="h-full rounded-full transition-all duration-700 ease-out"
        style={{ width: `${pct}%`, background: `hsl(${hue} 62% 45%)` }}
      />
    </div>
  )
}

/* ── Avatar ─────────────────────────────────────────────── */
export function Avatar({
  initials,
  hue,
  size = 40,
  verified,
  ring,
  className = '',
}: {
  initials: string
  hue: number
  size?: number
  verified?: boolean
  ring?: boolean
  className?: string
}) {
  return (
    <div className={`relative shrink-0 ${className}`} style={{ width: size, height: size }}>
      <div
        className="flex h-full w-full items-center justify-center rounded-full font-semibold text-white select-none"
        style={{
          background: `linear-gradient(135deg, hsl(${hue} 58% 40%), hsl(${hue} 62% 56%))`,
          fontSize: size * 0.36,
          boxShadow: ring ? `0 0 0 2px white, 0 0 0 4px hsl(${hue} 62% 56%)` : undefined,
        }}
      >
        {initials}
      </div>
      {verified && (
        <span
          className="absolute -bottom-0.5 -right-0.5 flex items-center justify-center rounded-full bg-brand-600 text-white"
          style={{ width: size * 0.38, height: size * 0.38 }}
          title="Saved contact"
        >
          <svg width={size * 0.26} height={size * 0.26} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 6 9 17l-5-5" />
          </svg>
        </span>
      )}
    </div>
  )
}

/* ── Toggle ─────────────────────────────────────────────── */
export function Toggle({
  checked,
  onChange,
  label,
  description,
}: {
  checked: boolean
  onChange: (v: boolean) => void
  label: string
  description?: string
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className="flex w-full items-center justify-between gap-4 py-3 text-left"
    >
      <span>
        <span className="block text-[15px] font-medium text-ink-800">{label}</span>
        {description && <span className="mt-0.5 block text-[13px] text-ink-400">{description}</span>}
      </span>
      <span
        aria-hidden
        className={`relative h-6 w-11 shrink-0 rounded-full transition-colors duration-200 ${
          checked ? 'bg-brand-600' : 'bg-ink-200'
        }`}
      >
        <span
          className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform duration-200 ${
            checked ? 'translate-x-5' : ''
          }`}
        />
      </span>
    </button>
  )
}

/* ── Segmented control / filter chips ──────────────────── */
export function Chip({
  active,
  onClick,
  children,
}: {
  active?: boolean
  onClick: () => void
  children: ReactNode
}) {
  return (
    <button
      onClick={onClick}
      aria-pressed={active}
      className={`h-9 shrink-0 rounded-full px-4 text-sm font-medium transition-colors ${
        active
          ? 'bg-ink-950 text-white shadow-card'
          : 'border border-ink-200 bg-white text-ink-600 hover:border-ink-300'
      }`}
    >
      {children}
    </button>
  )
}

/* ── Search bar ─────────────────────────────────────────── */
export function SearchBar({
  value,
  onChange,
  placeholder = 'Search',
  className = '',
}: {
  value: string
  onChange: (v: string) => void
  placeholder?: string
  className?: string
}) {
  return (
    <div className={`relative ${className}`}>
      <Search size={17} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-400" />
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        aria-label={placeholder}
        className="h-11 w-full rounded-xl border border-ink-200 bg-white pl-10 pr-10 text-[15px] placeholder:text-ink-300 focus:outline-none focus:ring-2 focus:ring-brand-100 focus:border-brand-400"
      />
      {value && (
        <button
          aria-label="Clear search"
          onClick={() => onChange('')}
          className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-ink-400 hover:bg-ink-100 hover:text-ink-600"
        >
          <X size={15} />
        </button>
      )}
    </div>
  )
}

/* ── Spinner ────────────────────────────────────────────── */
export function Spinner({ size = 18, className = '' }: { size?: number; className?: string }) {
  return <Loader2 size={size} className={`animate-spin ${className}`} aria-label="Loading" />
}

/* ── Skeleton ───────────────────────────────────────────── */
export function Skeleton({ className = '' }: { className?: string }) {
  return <div className={`shimmer rounded-lg ${className}`} />
}
