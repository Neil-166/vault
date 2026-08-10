export function Logo({ size = 34, className = '' }: { size?: number; className?: string }) {
  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <span
        className="relative flex items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 shadow-card"
        style={{ width: size, height: size }}
        aria-hidden
      >
        <svg width={size * 0.56} height={size * 0.56} viewBox="0 0 24 24" fill="none">
          <path
            d="M12 3.5 19 8v8l-7 4.5L5 16V8l7-4.5Z"
            stroke="white"
            strokeWidth="1.7"
            strokeLinejoin="round"
            fill="rgba(255,255,255,0.08)"
          />
          <path d="M9.5 12.5h5" stroke="white" strokeWidth="1.7" strokeLinecap="round" />
          <path d="M12 12.5v-3.4" stroke="white" strokeWidth="1.7" strokeLinecap="round" />
        </svg>
      </span>
      <span className="font-display text-[19px] font-bold tracking-tight text-ink-950">
        VAULT
      </span>
    </span>
  )
}

export function LogoMark({ size = 34 }: { size?: number }) {
  return (
    <span
      className="flex items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 shadow-card"
      style={{ width: size, height: size }}
      aria-hidden
    >
      <svg width={size * 0.56} height={size * 0.56} viewBox="0 0 24 24" fill="none">
        <path
          d="M12 3.5 19 8v8l-7 4.5L5 16V8l7-4.5Z"
          stroke="white"
          strokeWidth="1.7"
          strokeLinejoin="round"
          fill="rgba(255,255,255,0.08)"
        />
        <path d="M9.5 12.5h5" stroke="white" strokeWidth="1.7" strokeLinecap="round" />
        <path d="M12 12.5v-3.4" stroke="white" strokeWidth="1.7" strokeLinecap="round" />
      </svg>
    </span>
  )
}
