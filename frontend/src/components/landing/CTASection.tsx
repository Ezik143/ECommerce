import { motion } from 'framer-motion'
import { ArrowRight, ArrowLeft } from 'lucide-react'
import { MagneticButton } from './MagneticButton'

interface CTASectionProps {
  isAuthenticated: boolean
  onCtaClick: () => void
  onExploreClick: () => void
}

export function CTASection({
  isAuthenticated,
  onCtaClick,
  onExploreClick,
}: CTASectionProps) {
  return (
    <section className="relative py-40 px-6 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-canvas via-overlay to-canvas" />

      <motion.div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `
            radial-gradient(circle at 30% 50%, var(--color-brand) 0%, transparent 50%),
            radial-gradient(circle at 70% 50%, var(--color-brand) 0%, transparent 50%)
          `,
        }}
      />

      <div className="relative z-10 max-w-3xl mx-auto text-center">
        <motion.h2
          className="text-text-primary font-heading text-[clamp(2.5rem,5vw,5rem)] font-normal italic leading-tight mb-6"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        >
          {isAuthenticated ? 'Welcome back' : 'Begin your journey'}
        </motion.h2>
        <motion.p
          className="text-text-secondary font-body text-[clamp(0.9rem,1.5vw,1.15rem)] leading-relaxed mb-12 max-w-lg mx-auto"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2, duration: 0.6 }}
        >
          {isAuthenticated
            ? 'Your curated collection awaits. Step into a world where every piece has a story.'
            : 'Join a community of collectors who cherish the art of mindful curation.'}
        </motion.p>
        <motion.div
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4, duration: 0.6 }}
        >
          <MagneticButton
            onClick={onCtaClick}
            className="group relative px-10 py-4 bg-brand text-canvas font-body font-semibold text-sm tracking-[0.2em] uppercase rounded-full overflow-hidden"
          >
            <span className="relative z-10 flex items-center gap-3">
              {isAuthenticated ? 'Go to Dashboard' : 'Sign Up'}
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

          <MagneticButton
            onClick={onExploreClick}
            className="group relative px-10 py-4 border border-text-muted/30 text-text-primary font-body font-semibold text-sm tracking-[0.2em] uppercase rounded-full overflow-hidden"
          >
            <span className="relative z-10 flex items-center gap-3">
              <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
              Explore Products
            </span>
            <motion.div
              className="absolute inset-0 bg-text-primary/5"
              initial={{ scaleX: 0 }}
              whileHover={{ scaleX: 1 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              style={{ originX: 0 }}
            />
          </MagneticButton>
        </motion.div>
      </div>

      <motion.footer
        className="relative z-10 mt-32 text-center"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 0.6, duration: 0.6 }}
      >
        <p className="text-text-muted/40 font-body text-xs tracking-[0.3em] uppercase">
          Kintsugi &middot; curated commerce
        </p>
        <p className="text-text-muted/20 font-body text-xs mt-2">
          &copy; {new Date().getFullYear()} All rights reserved.
        </p>
      </motion.footer>
    </section>
  )
}
