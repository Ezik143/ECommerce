import { useRef } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'

export function ScrollRevealSection() {
  const sectionRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'end start'],
  })

  const scale = useTransform(scrollYProgress, [0, 0.4, 0.6, 1], [0.7, 1, 1, 0.8])
  const opacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0, 1, 1, 0])
  const y = useTransform(scrollYProgress, [0, 0.3, 0.7, 1], [120, 0, 0, -80])

  const bgScale = useTransform(scrollYProgress, [0, 0.5, 1], [1.1, 1, 1.05])
  const bgOpacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0.4, 0.8, 0.8, 0.3])

  const titleProgress = useTransform(scrollYProgress, [0.1, 0.4], [0, 1])
  const subtitleProgress = useTransform(scrollYProgress, [0.2, 0.5], [0, 1])
  const descriptionProgress = useTransform(scrollYProgress, [0.3, 0.6], [0, 1])

  return (
    <section
      ref={sectionRef}
      className="relative min-h-[120vh] flex items-center justify-center overflow-hidden"
    >
      <motion.div
        className="absolute inset-0 bg-gradient-to-br from-brand-dark/20 via-canvas to-overlay"
        style={{ scale: bgScale, opacity: bgOpacity }}
      />

      <motion.div
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: `
            radial-gradient(ellipse at 20% 50%, rgba(212,163,115,0.3) 0%, transparent 50%),
            radial-gradient(ellipse at 80% 50%, rgba(212,163,115,0.15) 0%, transparent 50%)
          `,
        }}
      />

      <motion.div
        className="relative z-10 max-w-5xl mx-auto px-6 text-center"
        style={{ scale, opacity, y }}
      >
        <motion.p
          className="text-brand font-heading text-[clamp(2rem,5vw,4rem)] font-normal italic leading-tight mb-6"
          style={{
            opacity: titleProgress,
            y: useTransform(titleProgress, [0, 1], [40, 0]),
          }}
        >
          Where every piece
          <br />
          <span className="text-text-primary">tells a story</span>
        </motion.p>
        <motion.p
          className="text-text-secondary font-body text-[clamp(0.9rem,2vw,1.2rem)] leading-relaxed max-w-2xl mx-auto mb-10"
          style={{
            opacity: subtitleProgress,
            y: useTransform(subtitleProgress, [0, 1], [30, 0]),
          }}
        >
          From the hands of master artisans to your doorstep — each object in our
          collection carries the warmth of human craft and the patina of intention.
        </motion.p>
        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16"
          style={{
            opacity: descriptionProgress,
            y: useTransform(descriptionProgress, [0, 1], [20, 0]),
          }}
        >
          {[
            { number: '01', label: 'Artisan Sourced', desc: 'Every piece hand-selected from master craftspeople around the world.' },
            { number: '02', label: 'Timeless Design', desc: 'Objects that transcend trends, built to last generations.' },
            { number: '03', label: 'Ethical Luxury', desc: 'Sustainable materials, fair wages, and zero compromise on quality.' },
          ].map((item) => (
            <motion.div
              key={item.number}
              className="p-8 rounded-2xl bg-surface/50 backdrop-blur-sm border border-text-muted/10"
              whileHover={{ y: -4, borderColor: 'rgba(212,163,115,0.3)' }}
              transition={{ duration: 0.3 }}
            >
              <span className="text-brand font-heading text-4xl italic block mb-3">
                {item.number}
              </span>
              <h3 className="text-text-primary font-body font-semibold text-lg mb-2">
                {item.label}
              </h3>
              <p className="text-text-muted font-body text-sm leading-relaxed">
                {item.desc}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>
    </section>
  )
}
