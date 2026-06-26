import { motion } from 'framer-motion'

const marqueeText = 'CURATED  ·  ARTISAN  ·  BESPOKE  ·  GOLD  ·  WARMTH  ·  CRAFT  ·  PATINA  ·  HERITAGE  ·  '

export function InfiniteMarquee() {
  return (
    <section className="relative py-16 overflow-hidden bg-canvas border-y border-text-muted/10">
      <div className="absolute inset-0 bg-gradient-to-r from-canvas via-transparent to-canvas z-10 pointer-events-none" />
      <motion.div
        className="flex whitespace-nowrap"
        animate={{ x: ['0%', '-50%'] }}
        transition={{ repeat: Infinity, duration: 25, ease: 'linear' }}
      >
        <span className="text-[clamp(4rem,10vw,8rem)] font-heading text-text-muted/10 font-normal italic leading-none px-4 select-none">
          {marqueeText}
        </span>
        <span className="text-[clamp(4rem,10vw,8rem)] font-heading text-text-muted/10 font-normal italic leading-none px-4 select-none">
          {marqueeText}
        </span>
      </motion.div>
    </section>
  )
}
