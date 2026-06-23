import { useEffect, useReducer } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeftIcon } from '@heroicons/react/20/solid';
import { productApi } from '../services/productApi';
import { useCart } from '../hooks/useCart';
import { useUserProfile } from '../hooks/useUserProfile';
import { LoadingSkeleton } from '../components/ui/LoadingSkeleton';
import type { ProductResponse } from '../types/api';

interface DetailState {
  product: ProductResponse | null;
  loading: boolean;
  error: string | null;
}

const initialDetailState: DetailState = { product: null, loading: true, error: null };

function detailReducer(state: DetailState, action: Partial<DetailState>): DetailState {
  return { ...state, ...action };
}

export const ProductDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const { addToCart, loading: cartLoading } = useCart();
  const { profile } = useUserProfile();

  const [{ product, loading, error }, dispatch] = useReducer(detailReducer, initialDetailState);

  useEffect(() => {
    if (!id) return;
    dispatch({ loading: true, error: null });
    productApi.getById(parseInt(id))
      .then((product) => dispatch({ product, loading: false }))
      .catch(() => dispatch({ error: 'Failed to load product', loading: false }));
  }, [id]);

  const isCustomer = profile?.role === 'Customer';

  if (loading) {
    return (
      <div style={{ maxWidth: '56rem', margin: '0 auto' }}>
        <Link to="/products" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.375rem', fontSize: 'var(--text-caption)', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
          <ArrowLeftIcon style={{ width: '1rem', height: '1rem' }} /> Back to Products
        </Link>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
          <LoadingSkeleton variant="product-card" />
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <LoadingSkeleton variant="text" />
            <LoadingSkeleton variant="text" />
            <LoadingSkeleton variant="text" />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ textAlign: 'center', padding: '3rem 0' }}>
        <p style={{ color: 'var(--error)', marginBottom: '1rem' }}>{error}</p>
        <button type="button" onClick={() => window.location.reload()} className="btn btn-primary">Retry</button>
      </div>
    );
  }

  if (!product) {
    return (
      <div style={{ textAlign: 'center', padding: '3rem 0' }}>
        <p style={{ color: 'var(--text-muted)', marginBottom: '1rem' }}>Product not found</p>
        <Link to="/products" className="btn btn-primary">Browse Products</Link>
      </div>
    );
  }

  const imageUrl = product.imageUrl || 'https://via.placeholder.com/600x400?text=No+Image';
  const listedDate = new Date(product.createdAt).toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric',
  });

  return (
    <div style={{ maxWidth: '56rem', margin: '0 auto' }}>
      <Link to="/products" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.375rem', fontSize: 'var(--text-caption)', color: 'var(--text-secondary)', marginBottom: '1.5rem', textDecoration: 'none' }}>
        <ArrowLeftIcon style={{ width: '1rem', height: '1rem' }} /> Back to Products
      </Link>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
        <div style={{ borderRadius: 'var(--radius)', overflow: 'hidden', background: 'var(--bg-secondary)' }}>
          <img src={imageUrl} alt={product.name} style={{ width: '100%', height: 'auto', display: 'block' }} />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--text-title)', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.2 }}>{product.name}</h1>

          <div style={{ fontSize: 'var(--text-title)', fontFamily: 'var(--font-heading)', fontWeight: 700, color: 'var(--accent-gold)' }}>
            ${product.price.toFixed(2)}
          </div>

          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <Link to={`/products?categoryId=${product.categoryId}`} className="badge badge-default" style={{ textDecoration: 'none' }}>
              {product.categoryName}
            </Link>
            <span className="badge badge-gray">Seller: {product.sellerName}</span>
            {product.stockQuantity > 0
              ? <span className="badge badge-green">In Stock ({product.stockQuantity})</span>
              : <span className="badge badge-red">Out of Stock</span>
            }
          </div>

          <p className="prose" style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-body)', borderLeft: '2px solid var(--border)', paddingLeft: '1rem' }}>
            {product.description || 'No description available.'}
          </p>

          {isCustomer && (
            <button type="button"
              onClick={() => addToCart(product.productId)}
              disabled={cartLoading || product.stockQuantity === 0}
              className="btn btn-primary btn-lg"
              style={{ alignSelf: 'flex-start', marginTop: 'auto' }}
            >
              {cartLoading ? 'Adding...' : product.stockQuantity === 0 ? 'Out of Stock' : 'Add to Cart'}
            </button>
          )}
        </div>
      </div>

      <div className="card" style={{ marginTop: '2rem' }}>
        <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--text-heading)', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '1rem' }}>Product Details</h2>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', fontSize: 'var(--text-caption)' }}>
          <div>
            <span className="label">Product ID</span>
            <p style={{ color: 'var(--text-primary)' }}>#{product.productId}</p>
          </div>
          <div>
            <span className="label">Category</span>
            <Link to={`/products?categoryId=${product.categoryId}`} style={{ color: 'var(--accent-gold)', textDecoration: 'none' }}>
              {product.categoryName}
            </Link>
          </div>
          <div>
            <span className="label">Seller</span>
            <p style={{ color: 'var(--text-primary)' }}>{product.sellerName}</p>
          </div>
          <div>
            <span className="label">Stock Quantity</span>
            <p style={{ color: 'var(--text-primary)' }}>{product.stockQuantity}</p>
          </div>
          <div>
            <span className="label">Date Listed</span>
            <p style={{ color: 'var(--text-primary)' }}>{listedDate}</p>
          </div>
        </div>
      </div>
    </div>
  );
};
