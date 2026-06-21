import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth0';

const Callback = () => {
  const { isAuthenticated, isLoading, error } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      navigate('/dashboard', { replace: true });
    } else if (!isLoading && error) {
      navigate('/', { replace: true });
    }
  }, [isAuthenticated, isLoading, error, navigate]);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center' }}>
        <div className="spinner spinner-lg" style={{ margin: '0 auto 1rem' }}></div>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9375rem' }}>Authenticating...</p>
      </div>
    </div>
  );
};

export default Callback;