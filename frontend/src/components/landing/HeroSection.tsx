import { useRef } from 'react'
import { motion, useScroll, useTransform, useSpring } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import { MagneticButton } from './MagneticButton'

interface HeroSectionProps {
  onCtaClick: () => void
  ctaLabel: string
}

export function HeroSection({ onCtaClick, ctaLabel }: HeroSectionProps) {
  const sectionRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end start'],
  })

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 30,
    mass: 0.8,
  })

  const zoomScale = useTransform(smoothProgress, [0, 1], [1, 0.7])
  const yOffset = useTransform(smoothProgress, [0, 1], [0, -40])
  const contentOpacity = useTransform(smoothProgress, [0, 0.6, 1], [1, 1, 0])

  return (
    <section
      ref={sectionRef}
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
    >
      <motion.div
        className="flex flex-col items-center text-center px-6"
        style={{ scale: zoomScale, y: yOffset, opacity: contentOpacity }}
      >
        <motion.h1
          className="text-brand font-heading text-[clamp(4rem,12vw,10rem)] font-normal italic leading-none mb-2 select-none"
          initial={{ scale: 1.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
        >
          Kintsugi
        </motion.h1>
        <motion.p
          className="text-text-muted font-body text-[clamp(0.9rem,2.5vw,1.4rem)] tracking-[0.35em] uppercase mb-10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.6 }}
        >
          {'curated commerce'.split('').map((char, i) => (
            <motion.span
              key={i}
              className="inline-block"
              initial={{ opacity: 0, y: 20, rotateZ: 10 }}
              animate={{ opacity: 1, y: 0, rotateZ: 0 }}
              transition={{ delay: 0.8 + i * 0.03, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            >
              {char === ' ' ? '\u00A0' : char}
            </motion.span>
          ))}
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.4, duration: 0.6 }}
        >
          <MagneticButton
            onClick={onCtaClick}
            className="group relative px-10 py-4 bg-brand text-canvas font-body font-semibold text-sm tracking-[0.2em] uppercase rounded-full overflow-hidden"
          >
            <span className="relative z-10 flex items-center gap-3">
              {ctaLabel}
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </span>
            <motion.div
              className="absolute inset-0 bg-brand-hover"
              initial={{ scaleX: 0 }}
              whileHover={{ scaleX: 1 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              style={{ originX: 0 }}
            />
          </MagneticButton>
        </motion.div>
      </motion.div>

      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2, duration: 1 }}
      >
        <motion.div
          className="w-6 h-10 border-2 border-text-muted/40 rounded-full flex justify-center pt-2"
          animate={{ opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <motion.div
            className="w-1 h-2 bg-brand rounded-full"
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
          />
        </motion.div>
      </motion.div>
    </section>
  )
}
