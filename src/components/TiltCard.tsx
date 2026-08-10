import { useRef, type ReactNode } from 'react'
import {
  motion,
  useMotionTemplate,
  useMotionValue,
  useSpring,
  useTransform,
} from 'framer-motion'

/**
 * Subtle 3D tilt with a moving glare. Disabled on touch devices —
 * the tilt only makes sense with a pointer.
 */
export function TiltCard({
  children,
  className = '',
  max = 6,
}: {
  children: ReactNode
  className?: string
  max?: number
}) {
  const ref = useRef<HTMLDivElement>(null)
  const px = useMotionValue(0.5)
  const py = useMotionValue(0.5)

  const rotateX = useSpring(useTransform(py, [0, 1], [max, -max]), { stiffness: 140, damping: 18 })
  const rotateY = useSpring(useTransform(px, [0, 1], [-max, max]), { stiffness: 140, damping: 18 })
  const glareX = useTransform(px, [0, 1], ['15%', '85%'])
  const glareY = useTransform(py, [0, 1], ['12%', '88%'])
  const glare = useMotionTemplate`radial-gradient(220px circle at ${glareX} ${glareY}, rgba(255,255,255,0.14), transparent 65%)`

  const onMove = (e: React.PointerEvent) => {
    const r = ref.current?.getBoundingClientRect()
    if (!r) return
    px.set((e.clientX - r.left) / r.width)
    py.set((e.clientY - r.top) / r.height)
  }
  const onLeave = () => {
    px.set(0.5)
    py.set(0.5)
  }

  return (
    <div
      style={{ perspective: 1100 }}
      onPointerMove={onMove}
      onPointerLeave={onLeave}
      className="group"
    >
      <motion.div
        ref={ref}
        style={{ rotateX, rotateY, transformStyle: 'preserve-3d' }}
        className={`relative overflow-hidden ${className}`}
      >
        {children}
        <motion.div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{ background: glare }}
        />
      </motion.div>
    </div>
  )
}
