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
      {/* Soft expanding ring */}
      <motion.div
        className="absolute inset-0 rounded-full"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 2.2, opacity: 0 }}
        transition={{ delay: 0.3, duration: 0.8, ease: 'easeOut' }}
        style={{ background: 'radial-gradient(circle, hsl(152 62% 42% / 0.15), transparent 70%)' }}
      />

      {/* Subtle particle dots */}
      {[0, 1, 2, 3, 4, 5].map((i) => {
        const angle = (i * 60) * (Math.PI / 180)
        const dist = 52
        return (
          <motion.span
            key={i}
            className="absolute h-1.5 w-1.5 rounded-full bg-pos-400"
            style={{ left: '50%', top: '50%' }}
            initial={{ x: 0, y: 0, opacity: 0, scale: 0 }}
            animate={{
              x: Math.cos(angle) * dist,
              y: Math.sin(angle) * dist,
              opacity: [0, 0.6, 0],
              scale: [0, 1, 0.5],
            }}
            transition={{ delay: 0.35 + i * 0.04, duration: 0.6, ease: 'easeOut' }}
          />
        )
      })}

      {/* Checkmark */}
      <motion.svg viewBox="0 0 64 64" className="h-20 w-20" aria-hidden>
        <motion.circle
          cx="32" cy="32" r="29"
          fill="none" stroke="hsl(152 62% 42%)" strokeWidth="3" strokeLinecap="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        />
        <motion.path
          d="M20 33.5l8.5 8.5L44 23"
          fill="none" stroke="hsl(152 62% 42%)" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ delay: 0.45, duration: 0.3, ease: 'easeOut' }}
        />
      </motion.svg>
    </motion.div>
  )
}
