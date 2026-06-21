import { useState, useEffect, useCallback } from 'react';
import { MagnifyingGlassIcon, XMarkIcon } from '@heroicons/react/20/solid';
import { productApi } from '../services/productApi';
import { useCart } from '../hooks/useCart';
import { useUserProfile } from '../hooks/useUserProfile';
import { ProductCard } from '../components/ui/ProductCard';
import { EmptyState } from '../components/ui/EmptyState';
import { LoadingSkeleton } from '../components/ui/LoadingSkeleton';
import { CategoryTree } from '../components/CategoryTree';
import type { ProductResponse } from '../types/api';

export const ProductsPage = () => {
  const { profile } = useUserProfile();
  const { addToCart, loading: cartLoading } = useCart();

  const [products, setProducts] = useState<ProductResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [debouncedSearch, setDebouncedSearch] = useState('');

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const productsData = await productApi.getAll(selectedCategory ?? undefined);
      setProducts(productsData);
    } catch {
      setError('Failed to load products');
    } finally {
      setLoading(false);
    }
  }, [selectedCategory]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
      product.description?.toLowerCase().includes(debouncedSearch.toLowerCase());
    const matchesCategory = selectedCategory === null || product.categoryId === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const isCustomer = profile?.role === 'Customer';

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCategory(null);
  };

  const hasActiveFilters = searchQuery || selectedCategory !== null;

  if (loading) {
    return (
      <div style={{ display: 'flex', gap: '1.5rem' }}>
        <div style={{ width: '14rem', flexShrink: 0, display: 'none' }} className="sidebar-desktop">
          <LoadingSkeleton variant="text" />
        </div>
        <div style={{ flex: 1 }}>
          <h1 className="page-title">Products</h1>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(16rem, 1fr))', gap: '1.5rem' }}>
            {[...Array(8)].map((_, i) => (
              <LoadingSkeleton key={i} variant="product-card" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ textAlign: 'center', padding: '3rem 0' }}>
        <p style={{ color: 'var(--error)', marginBottom: '1rem' }}>{error}</p>
        <button onClick={fetchData} className="btn btn-primary">Retry</button>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', gap: '1.5rem' }}>
      <aside style={{ width: '14rem', flexShrink: 0, display: 'none' }} className="sidebar-desktop">
        <CategoryTree activeCategoryId={selectedCategory} />
      </aside>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <h1 className="page-title" style={{ marginBottom: 0 }}>Products</h1>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }} className="filters-row">
            <div style={{ position: 'relative', flex: 1 }}>
              <MagnifyingGlassIcon style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', width: '1.25rem', height: '1.25rem', color: 'var(--text-muted)' }} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products..."
                className="input"
                style={{ paddingLeft: '2.5rem' }}
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer' }}
                >
                  <XMarkIcon style={{ width: '1.25rem', height: '1.25rem' }} />
                </button>
              )}
            </div>
            {hasActiveFilters && (
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button onClick={clearFilters} className="btn btn-secondary btn-sm">
                  Clear Filters
                </button>
              </div>
            )}
          </div>
        </div>

        {filteredProducts.length === 0 ? (
          <EmptyState
            type="products"
            onAction={clearFilters}
            actionLabel={hasActiveFilters ? 'Clear Filters' : undefined}
          />
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(16rem, 1fr))', gap: '1.5rem' }}>
            {filteredProducts.map((product, i) => (
              <div key={product.productId} className={`animate-fade-in-up stagger-${(i % 8) + 1}`}>
                <ProductCard
                  product={product}
                  onAddToCart={() => addToCart(product.productId)}
                  showAddToCart={isCustomer}
                  isAdding={cartLoading}
                />
              </div>
            ))}
          </div>
        )}
      </div>

      <style>{`
        @media (min-width: 640px) {
          .filters-row { flex-direction: row !important; align-items: center !important; }
        }
        @media (min-width: 768px) {
          .sidebar-desktop { display: block !important; }
        }
      `}</style>
    </div>
  );
};