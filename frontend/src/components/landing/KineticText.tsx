import { useRef } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'

interface KineticTextProps {
  text: string
  className?: string
}

export function KineticText({
  text,
  className = '',
}: KineticTextProps) {
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  })

  return (
    <div ref={ref} className={`inline-block ${className}`}>
      {text.split('').map((char, i) => {
        const start = i / text.length
        const end = start + 1 / text.length
        const opacity = useTransform(scrollYProgress, [start, end], [0.15, 1])
        const rotateX = useTransform(scrollYProgress, [start, end], [90, 0])
        const yPosition = useTransform(scrollYProgress, [start, end], [40, 0])

        return (
          <motion.span
            key={`${char}-${i}`}
            style={{
              opacity,
              rotateX,
              y: yPosition,
              display: 'inline-block',
              transformPerspective: 800,
            }}
          >
            {char === ' ' ? '\u00A0' : char}
          </motion.span>
        )
      })}
    </div>
  )
}
