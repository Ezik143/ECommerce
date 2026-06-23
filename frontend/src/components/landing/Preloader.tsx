import { useEffect, useState } from 'react'
import { motion, useMotionValue, animate } from 'framer-motion'

interface PreloaderProps {
  onComplete: () => void
}

export function Preloader({ onComplete }: PreloaderProps) {
  const [isComplete, setIsComplete] = useState(false)
  const [displayValue, setDisplayValue] = useState('0')
  const count = useMotionValue(0)

  useEffect(() => {
    const unsubscribe = count.on('change', (v) => {
      setDisplayValue(String(Math.round(v)))
    })
    const controls = animate(count, 100, {
      duration: 2.5,
      ease: [0.16, 1, 0.3, 1],
      onComplete: () => {
        setTimeout(() => {
          setIsComplete(true)
        }, 400)
      },
    })
    return () => {
      unsubscribe()
      controls.stop()
    }
  }, [count, onComplete])

  return (
    <motion.div
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-canvas"
      initial={false}
      animate={isComplete ? { opacity: 0, scale: 1.05 } : { opacity: 1, scale: 1 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      onAnimationComplete={() => {
        if (isComplete) onComplete()
      }}
      style={{ pointerEvents: isComplete ? 'none' : 'auto' }}
    >
      <motion.h1
        className="text-brand font-heading text-[clamp(3rem,10vw,6rem)] font-normal italic leading-none mb-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      >
        Kintsugi
      </motion.h1>
      <div className="text-text-muted font-body text-[clamp(0.75rem,2vw,1rem)] tracking-[0.3em]">
        {displayValue}%
      </div>
      <motion.div
        className="mt-8 h-[1px] bg-brand/30"
        style={{ width: displayValue + '%', maxWidth: 240 }}
      />
    </motion.div>
  )
}
