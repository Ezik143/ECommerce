import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { profileApi } from '../services/profileApi';
import { handleApiError } from '../services/api';

interface RoleSelectionProps {
  onRoleChosen: () => void;
}

const RoleSelection = ({ onRoleChosen }: RoleSelectionProps) => {
  const [loading, setLoading] = useState<'Customer' | 'Seller' | null>(null);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleRoleSelect = async (role: 'Customer' | 'Seller') => {
    try {
      setLoading(role);
      setError(null);
      await profileApi.setRole(role);
      onRoleChosen();
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setError(handleApiError(err));
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="auth-bg">
      <div style={{ maxWidth: '42rem', width: '100%', margin: '0 1rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '2rem', color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
            Welcome to Kintsugi
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9375rem' }}>
            How would you like to use this platform?
          </p>
        </div>

        {error && (
          <div style={{ marginBottom: '1.5rem', padding: '0.75rem 1rem', background: 'var(--error-bg)', border: '1px solid rgba(197,90,90,0.3)', borderRadius: 'var(--radius-sm)', color: 'var(--error)', fontSize: '0.875rem' }}>
            {error}
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
          <button
            onClick={() => handleRoleSelect('Customer')}
            disabled={loading !== null}
            className="role-card animate-fade-in-up stagger-1"
          >
            {loading === 'Customer' && (
              <div style={{ position: 'absolute', inset: 0, background: 'rgba(28,24,23,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1 }}>
                <div className="spinner spinner-lg"></div>
              </div>
            )}
            <div style={{ opacity: loading === 'Customer' ? 0.2 : 1 }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>🛍️</div>
              <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.25rem', color: 'var(--text-primary)', marginBottom: '0.5rem' }}>I'm a Buyer</h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '1rem' }}>
                Browse products, add items to cart, and place orders.
              </p>
              <ul style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
                <li>Browse product catalog</li>
                <li>Add items to cart</li>
                <li>Place orders</li>
                <li>Track order history</li>
              </ul>
            </div>
          </button>

          <button
            onClick={() => handleRoleSelect('Seller')}
            disabled={loading !== null}
            className="role-card role-card-buyer animate-fade-in-up stagger-2"
          >
            {loading === 'Seller' && (
              <div style={{ position: 'absolute', inset: 0, background: 'rgba(28,24,23,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1 }}>
                <div className="spinner spinner-lg"></div>
              </div>
            )}
            <div style={{ opacity: loading === 'Seller' ? 0.2 : 1 }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>🏪</div>
              <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.25rem', color: 'var(--text-primary)', marginBottom: '0.5rem' }}>I Want to Sell</h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '1rem' }}>
                List your products, manage inventory, and grow your business.
              </p>
              <ul style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
                <li>List products for sale</li>
                <li>Manage inventory</li>
                <li>Track order fulfillment</li>
                <li>View sales analytics</li>
              </ul>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default RoleSelection;