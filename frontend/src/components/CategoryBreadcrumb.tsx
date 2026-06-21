import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRightIcon } from '@heroicons/react/20/solid';
import { categoryApi } from '../services/categoryApi';
import type { CategoryResponse } from '../types/api';

interface CategoryBreadcrumbProps {
  categoryId: number;
  categoryName?: string;
}

export const CategoryBreadcrumb = ({ categoryId, categoryName }: CategoryBreadcrumbProps) => {
  const [ancestors, setAncestors] = useState<CategoryResponse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    categoryApi.getAncestors(categoryId)
      .then(setAncestors)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [categoryId]);

  if (loading) {
    return (
      <div style={{ display: 'flex', gap: '0.375rem', alignItems: 'center', fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
        <span>Categories</span>
      </div>
    );
  }

  return (
    <nav style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.8125rem', color: 'var(--text-muted)', flexWrap: 'wrap' }}>
      <Link to="/products" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>
        All Products
      </Link>
      {ancestors.map((a) => (
        <span key={a.categoryId} style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
          <ChevronRightIcon style={{ width: '0.875rem', height: '0.875rem' }} />
          <Link to={`/categories/${a.slug}`} style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>
            {a.name}
          </Link>
        </span>
      ))}
      {categoryName && (
        <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
          <ChevronRightIcon style={{ width: '0.875rem', height: '0.875rem' }} />
          <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{categoryName}</span>
        </span>
      )}
    </nav>
  );
};
