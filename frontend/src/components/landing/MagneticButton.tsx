import { motion } from 'framer-motion'
import { useState, useRef, type ReactNode, type ComponentPropsWithoutRef } from 'react'

interface MagneticButtonProps extends ComponentPropsWithoutRef<typeof motion.button> {
  children: ReactNode
}

export function MagneticButton({ children, className = '', ...props }: MagneticButtonProps) {
  const ref = useRef<HTMLButtonElement>(null)
  const [position, setPosition] = useState({ x: 0, y: 0 })

  const handleMouseMove = (e: React.MouseEvent) => {
    const el = ref.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const centerX = rect.left + rect.width / 2
    const centerY = rect.top + rect.height / 2
    const distX = e.clientX - centerX
    const distY = e.clientY - centerY
    const dist = Math.sqrt(distX * distX + distY * distY)
    const maxDist = 150
    if (dist < maxDist) {
      const strength = (1 - dist / maxDist) * 16
      setPosition({
        x: (distX / Math.max(dist, 1)) * strength,
        y: (distY / Math.max(dist, 1)) * strength,
      })
    } else {
      setPosition({ x: 0, y: 0 })
    }
  }

  return (
    <motion.button
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => setPosition({ x: 0, y: 0 })}
      animate={{ x: position.x, y: position.y }}
      transition={{ type: 'spring', stiffness: 300, damping: 15, mass: 0.5 }}
      className={className}
      {...props}
    >
      {children}
    </motion.button>
  )
}
