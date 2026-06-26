import { useState, useEffect, useCallback, lazy, Suspense } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth0'
import { Preloader } from '../components/landing/Preloader'
import { HeroSection } from '../components/landing/HeroSection'
import { ScrollRevealSection } from '../components/landing/ScrollRevealSection'
import { InfiniteMarquee } from '../components/landing/InfiniteMarquee'
import { ContentMorphGrid } from '../components/landing/ContentMorphGrid'
import { CTASection } from '../components/landing/CTASection'

const OrganicShaderCanvas = lazy(() =>
  import('../components/landing/OrganicShaderCanvas').then((m) => ({
    default: m.OrganicShaderCanvas,
  }))
)

const CustomCursor = lazy(() =>
  import('../components/landing/CustomCursor').then((m) => ({
    default: m.CustomCursor,
  }))
)

const Home = () => {
  const [preloaderDone, setPreloaderDone] = useState(false)
  const { isAuthenticated, isLoading, loginWithRedirect } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (preloaderDone && isAuthenticated) {
      navigate('/dashboard', { replace: true })
    }
  }, [preloaderDone, isAuthenticated, navigate])

  const handleCta = useCallback(() => {
    if (isAuthenticated) {
      navigate('/dashboard')
    } else {
      loginWithRedirect()
    }
  }, [isAuthenticated, navigate, loginWithRedirect])

  const handleExplore = useCallback(() => {
    navigate('/products')
  }, [navigate])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="spinner spinner-lg"></div>
      </div>
    )
  }

  if (preloaderDone && isAuthenticated) {
    return null
  }

  return (
    <>
      {!preloaderDone && (
        <Preloader onComplete={() => setPreloaderDone(true)} />
      )}

      <Suspense fallback={null}>
        <OrganicShaderCanvas />
      </Suspense>

      <Suspense fallback={null}>
        <CustomCursor />
      </Suspense>

      <main className="relative bg-canvas">
        <HeroSection
          onCtaClick={handleCta}
          ctaLabel={isAuthenticated ? 'Enter Dashboard' : 'Enter the Collection'}
        />

        <ScrollRevealSection />

        <InfiniteMarquee />

        <ContentMorphGrid />

        <CTASection
          isAuthenticated={isAuthenticated}
          onCtaClick={handleCta}
          onExploreClick={handleExplore}
        />
      </main>
    </>
  )
}

export default Home
