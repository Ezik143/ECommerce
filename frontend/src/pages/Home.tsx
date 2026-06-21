import { useAuth } from '../hooks/useAuth0';
import { Navigate } from 'react-router-dom';

const Home = () => {
  const { isAuthenticated, isLoading, loginWithRedirect } = useAuth();

  if (isLoading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
        <div className="spinner spinner-lg"></div>
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="hero-section" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center', maxWidth: '32rem', margin: '0 1.5rem' }}>
        <h1 style={{
          fontFamily: 'var(--font-heading)',
          fontSize: 'clamp(2.5rem, 8vw, 4.5rem)',
          color: 'var(--accent-gold)',
          marginBottom: '0.75rem',
          letterSpacing: '-0.03em',
          lineHeight: 1,
        }}>
          Kintsugi
        </h1>
        <p style={{
          fontFamily: 'var(--font-heading)',
          fontSize: '1.125rem',
          color: 'var(--text-secondary)',
          marginBottom: '0.5rem',
          fontStyle: 'italic',
        }}>
          curated commerce
        </p>
        <p style={{
          color: 'var(--text-muted)',
          fontSize: '0.9375rem',
          marginBottom: '2.5rem',
          maxWidth: '22rem',
          margin: '0 auto 2.5rem',
          lineHeight: 1.7,
        }}>
          A thoughtfully crafted marketplace where every piece tells a story. Login to begin.
        </p>
        <button
          onClick={() => loginWithRedirect()}
          className="btn btn-primary btn-lg animate-fade-in-up"
        >
          Enter
        </button>
      </div>
    </div>
  );
};

export default Home;