import type { ReactNode } from 'react'
import { motion } from 'framer-motion'
import { inr } from '../utils/format'

export function SuccessState({
  title,
  amount,
  subtitle,
  meta = [],
  children,
}: {
  title: string
  amount?: number
  subtitle?: string
  meta?: { label: string; value: string }[]
  children?: ReactNode
}) {
  return (
    <div className="flex flex-col items-center px-2 py-10 text-center">
      <SuccessCheck />
      <motion.h2
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.55 }}
        className="mt-5 font-display text-xl font-bold text-ink-900"
      >
        {title}
      </motion.h2>
      {amount !== undefined && (
        <motion.p
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.65 }}
          className="tnum mt-1 font-display text-[40px] font-bold leading-none text-ink-950"
        >
          {inr(amount)}
        </motion.p>
      )}
      {subtitle && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.75 }}
          className="mt-2 text-[15px] font-medium text-ink-500"
        >
          {subtitle}
        </motion.p>
      )}
      {meta.length > 0 && (
        <motion.dl
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.85 }}
          className="mt-6 w-full max-w-xs divide-y divide-ink-100 rounded-2xl border border-ink-100 bg-white px-4 text-left shadow-card"
        >
          {meta.map((row) => (
            <div key={row.label} className="flex items-center justify-between py-2.5">
              <dt className="text-[13px] text-ink-500">{row.label}</dt>
              <dd className="tnum text-[13px] font-semibold text-ink-800">{row.value}</dd>
            </div>
          ))}
        </motion.dl>
      )}
      {children && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.95 }}
          className="mt-7 w-full max-w-xs space-y-2.5"
        >
          {children}
        </motion.div>
      )}
    </div>
  )
}

function SuccessCheck() {
  return (
    <motion.div
      initial={{ scale: 0.6, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: 'spring', damping: 14 }}
      className="relative"
    >
      <motion.svg viewBox="0 0 64 64" className="h-20 w-20" aria-hidden>
        <motion.circle
          cx="32"
          cy="32"
          r="29"
          fill="none"
          stroke="hsl(152 62% 42%)"
          strokeWidth="3"
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        />
        <motion.path
          d="M20 33.5l8.5 8.5L44 23"
          fill="none"
          stroke="hsl(152 62% 42%)"
          strokeWidth="4.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ delay: 0.45, duration: 0.3, ease: 'easeOut' }}
        />
      </motion.svg>
    </motion.div>
  )
}
