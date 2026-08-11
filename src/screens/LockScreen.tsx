import { useCallback, useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Fingerprint, ShieldCheck } from 'lucide-react'
import { USER } from '../store/useVault'
import { Avatar } from '../components/ui/primitives'

type Phase = 'idle' | 'scanning' | 'success'

export default function LockScreen({ onUnlock }: { onUnlock: () => void }) {
  const [phase, setPhase] = useState<Phase>('idle')
  const [mouse, setMouse] = useState({ x: 50, y: 50 })
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const raf = useRef<number>(0)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current)
    cancelAnimationFrame(raf.current)
  }, [])

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    cancelAnimationFrame(raf.current)
    raf.current = requestAnimationFrame(() => {
      const rect = containerRef.current?.getBoundingClientRect()
      if (!rect) return
      const x = ((e.clientX - rect.left) / rect.width) * 100
      const y = ((e.clientY - rect.top) / rect.height) * 100
      setMouse({ x, y })
    })
  }, [])

  const handleUnlock = () => {
    if (phase !== 'idle') return
    setPhase('scanning')
    timer.current = setTimeout(() => {
      setPhase('success')
      timer.current = setTimeout(onUnlock, 700)
    }, 1500)
  }

  // Parallax offsets for orbs (0-20px range)
  const px = (mouse.x - 50) * 0.2
  const py = (mouse.y - 50) * 0.2

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-ink-950 px-6 text-white"
    >
      {/* ── Interactive grid background ────────────────── */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        {/* Floating orbs with parallax */}
        <div
          className="absolute -left-32 -top-24 h-96 w-96 rounded-full bg-brand-600/25 blur-[120px]"
          style={{ transform: `translate(${-px * 4}px, ${-py * 4}px)`, transition: 'transform 0.4s ease-out' }}
        />
        <div
          className="animate-floaty absolute -bottom-32 -right-24 h-[28rem] w-[28rem] rounded-full bg-brand-400/15 blur-[130px]"
          style={{ transform: `translate(${px * 3.5}px, ${py * 3.5}px)`, transition: 'transform 0.4s ease-out' }}
        />
        <div
          className="absolute left-1/2 top-1/3 h-64 w-64 -translate-x-1/2 rounded-full bg-ink-700/30 blur-[90px]"
          style={{ transform: `translate(${-px * 2}px, ${-py * 2}px)`, transition: 'transform 0.4s ease-out' }}
        />

        {/* Grid pattern — strong mouse-responsive movement */}
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              'linear-gradient(rgba(255,255,255,0.045) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.045) 1px, transparent 1px)',
            backgroundSize: '56px 56px',
            backgroundPosition: `${px * 2.5}px ${py * 2.5}px`,
            transition: 'background-position 0.35s ease-out',
          }}
        />

        {/* Subtle vignette */}
        <div
          className="absolute inset-0"
          style={{
            background: 'radial-gradient(ellipse at center, transparent 40%, rgba(10,14,31,0.6) 100%)',
          }}
        />

        {/* Grid zoom mask — grid lines appear sharper near cursor */}
        <div
          className="absolute inset-0"
          style={{
            background: `radial-gradient(circle 250px at var(--mx) var(--my), rgba(255,255,255,0.025), transparent 60%)`,
          }}
        />

        {/* Subtle vignette */}
        <div
          className="absolute inset-0"
          style={{
            background: 'radial-gradient(ellipse at center, transparent 40%, rgba(10,14,31,0.6) 100%)',
          }}
        />
      </div>

      {/* ── Content ────────────────────────────────────── */}
      <div className="relative flex w-full max-w-sm flex-col items-center">
        {/* Brand */}
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="mb-10 flex flex-col items-center"
        >
          <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 shadow-lift">
            <svg width={30} height={30} viewBox="0 0 24 24" fill="none" aria-hidden>
              <path d="M12 3.5 19 8v8l-7 4.5L5 16V8l7-4.5Z" stroke="white" strokeWidth="1.7" strokeLinejoin="round" fill="rgba(255,255,255,0.1)" />
              <path d="M9.5 12.5h5" stroke="white" strokeWidth="1.7" strokeLinecap="round" />
              <path d="M12 12.5v-3.4" stroke="white" strokeWidth="1.7" strokeLinecap="round" />
            </svg>
          </div>
          <h1 className="font-display text-2xl font-bold tracking-tight">VAULT</h1>
          <p className="mt-1 text-sm font-medium text-ink-300">Money, made clear.</p>
        </motion.div>

        {/* Welcome */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.12, duration: 0.45 }}
          className="mb-8 flex flex-col items-center text-center"
        >
          <div className="mb-4">
            <Avatar initials={USER.initials} hue={USER.hue} size={56} ring />
          </div>
          <p className="text-sm text-ink-300">Welcome back</p>
          <p className="mt-0.5 font-display text-xl font-semibold">{USER.name}</p>
        </motion.div>

        {/* Biometric */}
        <motion.div
          initial={{ opacity: 0, scale: 0.94 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.4 }}
          className="flex flex-col items-center"
        >
          <button
            onClick={handleUnlock}
            disabled={phase !== 'idle'}
            aria-label="Unlock with fingerprint"
            className={`group relative flex h-24 w-24 items-center justify-center rounded-full ${
              phase === 'idle' ? 'animate-ring' : ''
            } bg-white/5 transition-transform active:scale-95`}
          >
            <span className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-brand-500/20 to-brand-700/20">
              <Fingerprint
                size={42}
                className={phase === 'success' ? 'text-pos-400' : 'text-brand-300'}
              />
            </span>
            {phase === 'scanning' && (
              <span
                aria-hidden
                className="animate-scan absolute inset-x-4 h-8 rounded-full bg-gradient-to-b from-transparent via-brand-400/25 to-transparent"
              />
            )}
            {phase === 'success' && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', damping: 14 }}
                className="absolute -right-1 -top-1 flex h-8 w-8 items-center justify-center rounded-full bg-pos-500 text-white"
              >
                <ShieldCheck size={16} />
              </motion.span>
            )}
          </button>

          <AnimatePresence mode="wait">
            <motion.p
              key={phase}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.25 }}
              className="mt-5 text-center text-sm font-medium text-ink-200"
            >
              {phase === 'idle' && 'Touch the sensor to unlock'}
              {phase === 'scanning' && 'Verifying…'}
              {phase === 'success' && 'Unlocked'}
            </motion.p>
          </AnimatePresence>
        </motion.div>

        <button
          onClick={onUnlock}
          className="mt-8 text-sm font-medium text-ink-400 transition-colors hover:text-white"
        >
          Use passcode instead
        </button>

        <p className="absolute bottom-8 text-xs text-ink-500">
          Protected by Face ID · Touch ID · passcode
        </p>
      </div>
    </div>
  )
}
