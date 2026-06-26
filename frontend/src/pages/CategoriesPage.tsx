import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { categoryApi } from '../services/categoryApi';
import { LoadingSkeleton } from '../components/ui/LoadingSkeleton';
import { EmptyState } from '../components/ui/EmptyState';
import type { CategoryResponse } from '../types/api';

const CategoryCard = ({ category }: { category: CategoryResponse }) => {
  const subCount = category.children.length;
  const imageUrl = category.imageUrl || 'https://via.placeholder.com/400x250?text=No+Image';

  return (
    <Link to={`/categories/${category.slug}`} style={{ textDecoration: 'none', display: 'block' }}>
      <div className="product-card category-card">
        <div className="product-card-image" style={{ aspectRatio: '16/9' }}>
          <img src={imageUrl} alt={category.name} loading="lazy" />
          {subCount > 0 && (
            <span className="product-card-badge badge badge-default">
              {subCount} {subCount === 1 ? 'subcategory' : 'subcategories'}
            </span>
          )}
        </div>
        <div className="product-card-body">
          <h3 className="product-card-name">{category.name}</h3>
          {category.description && (
            <p className="product-card-desc">{category.description}</p>
          )}
          <div className="product-card-meta" style={{ marginTop: 'auto', marginBottom: 0 }}>
            <span>Browse category</span>
            <span style={{ color: 'var(--accent-gold)' }}>Explore &rarr;</span>
          </div>
        </div>
      </div>
    </Link>
  );
};

export const CategoriesPage = () => {
  const [categories, setCategories] = useState<CategoryResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const tree = await categoryApi.getTree();
      setCategories(tree);
    } catch {
      setError('Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) {
    return (
      <div>
        <h1 className="page-title">Categories</h1>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>Browse our collection by category</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(16rem, 1fr))', gap: '1.5rem' }}>
          {[...Array(6)].map((_, i) => (
            <LoadingSkeleton key={i} variant="product-card" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ textAlign: 'center', padding: '3rem 0' }}>
        <p style={{ color: 'var(--error)', marginBottom: '1rem' }}>{error}</p>
        <button type="button" onClick={fetchData} className="btn btn-primary">Retry</button>
      </div>
    );
  }

  if (categories.length === 0) {
    return (
      <EmptyState
        type="products"
        title="No categories yet"
        message="Categories will appear here once they are created."
      />
    );
  }

  return (
    <div>
      <h1 className="page-title">Categories</h1>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
        Browse our collection by category
      </p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(16rem, 1fr))', gap: '1.5rem' }}>
        {categories.map((cat, i) => (
          <div key={cat.categoryId} className={`animate-fade-in-up stagger-${(i % 8) + 1}`}>
            <CategoryCard category={cat} />
          </div>
        ))}
      </div>

      <style>{`
        .category-card:hover {
          border-color: rgba(212, 163, 115, 0.25);
          transform: translateY(-4px);
          box-shadow: var(--shadow-md);
        }
        .category-card:hover .product-card-image img {
          transform: scale(1.08);
        }
      `}</style>
    </div>
  );
};
