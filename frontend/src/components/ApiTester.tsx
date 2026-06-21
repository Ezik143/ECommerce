import { useState } from 'react';
import { categoryApi } from '../services/categoryApi';
import { productApi } from '../services/productApi';
import { profileApi } from '../services/profileApi';
import { handleApiError } from '../services/api';

const ApiTester = () => {
  const [loading, setLoading] = useState<string | null>(null);
  const [response, setResponse] = useState<unknown>(null);
  const [error, setError] = useState<string | null>(null);

  const handleRequest = async (label: string, request: () => Promise<unknown>) => {
    try {
      setLoading(label);
      setError(null);
      setResponse(null);
      const result = await request();
      setResponse(result);
    } catch (err) {
      setError(handleApiError(err));
    } finally {
      setLoading(null);
    }
  };

  const output = response ? JSON.stringify(response, null, 2) : null;

  return (
    <div style={{ marginTop: '2rem' }}>
      <h2 className="section-title">API Tester</h2>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(16rem, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
        <div className="card">
          <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1rem', color: 'var(--text-primary)', marginBottom: '0.75rem' }}>Profile</h3>
          <button
            onClick={() => handleRequest('Get Profile', () => profileApi.getMe())}
            disabled={loading !== null}
            className="btn btn-primary btn-sm"
            style={{ width: '100%' }}
          >
            {loading === 'Get Profile' ? 'Loading...' : 'GET /api/Profile/me'}
          </button>
        </div>

        <div className="card">
          <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1rem', color: 'var(--text-primary)', marginBottom: '0.75rem' }}>Categories</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <button
              onClick={() => handleRequest('Get Categories', () => categoryApi.getAll())}
              disabled={loading !== null}
              className="btn btn-primary btn-sm"
            >
              {loading === 'Get Categories' ? 'Loading...' : 'GET /api/Category'}
            </button>
            <button
              onClick={() => handleRequest('Create Category', () => categoryApi.create({ name: `Test Category ${Date.now()}`, slug: `test-category-${Date.now()}`, description: 'Created from API tester' }))}
              disabled={loading !== null}
              className="btn btn-secondary btn-sm"
            >
              {loading === 'Create Category' ? 'Loading...' : 'POST /api/Category'}
            </button>
          </div>
        </div>

        <div className="card">
          <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1rem', color: 'var(--text-primary)', marginBottom: '0.75rem' }}>Products</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <button
              onClick={() => handleRequest('Get Products', () => productApi.getAll())}
              disabled={loading !== null}
              className="btn btn-primary btn-sm"
            >
              {loading === 'Get Products' ? 'Loading...' : 'GET /api/Product'}
            </button>
            <button
              onClick={() => handleRequest('Create Product', () => productApi.create({ name: `Test Product ${Date.now()}`, price: 19.99, stockQuantity: 100, categoryId: 1 }))}
              disabled={loading !== null}
              className="btn btn-secondary btn-sm"
            >
              {loading === 'Create Product' ? 'Loading...' : 'POST /api/Product'}
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div style={{ padding: '0.75rem 1rem', background: 'var(--error-bg)', border: '1px solid rgba(197,90,90,0.3)', borderRadius: 'var(--radius-sm)', marginBottom: '1rem' }}>
          <p style={{ fontWeight: 500, color: 'var(--error)', marginBottom: '0.25rem', fontSize: '0.875rem' }}>Error</p>
          <pre style={{ fontSize: '0.8125rem', color: 'var(--error)', whiteSpace: 'pre-wrap' }}>{error}</pre>
        </div>
      )}

      {output && (
        <div style={{ padding: '0.75rem 1rem', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)' }}>
          <p style={{ fontWeight: 500, color: 'var(--text-secondary)', marginBottom: '0.5rem', fontSize: '0.875rem' }}>Response</p>
          <pre style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', whiteSpace: 'pre-wrap', overflow: 'auto', maxHeight: '24rem' }}>{output}</pre>
        </div>
      )}
    </div>
  );
};

export default ApiTester;