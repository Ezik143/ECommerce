import { useState, useEffect, useRef } from 'react'

export function useScrollVelocity() {
  const [velocity, setVelocity] = useState(0)
  const lastScrollY = useRef(0)
  const lastTime = useRef(Date.now())

  useEffect(() => {
    const handleScroll = () => {
      const now = Date.now()
      const dt = now - lastTime.current
      if (dt > 0) {
        const dy = window.scrollY - lastScrollY.current
        setVelocity(dy / dt)
      }
      lastScrollY.current = window.scrollY
      lastTime.current = now
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return velocity
}
