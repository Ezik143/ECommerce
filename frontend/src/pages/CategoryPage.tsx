import { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { categoryApi } from '../services/categoryApi';
import { productApi } from '../services/productApi';
import { useCart } from '../hooks/useCart';
import { useUserProfile } from '../hooks/useUserProfile';
import { ProductCard } from '../components/ui/ProductCard';
import { EmptyState } from '../components/ui/EmptyState';
import { LoadingSkeleton } from '../components/ui/LoadingSkeleton';
import { CategoryBreadcrumb } from '../components/CategoryBreadcrumb';
import { CategoryTree } from '../components/CategoryTree';
import type { CategoryResponse, ProductResponse } from '../types/api';

export const CategoryPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const { profile } = useUserProfile();
  const { addToCart, loading: cartLoading } = useCart();

  const [category, setCategory] = useState<CategoryResponse | null>(null);
  const [subcategories, setSubcategories] = useState<CategoryResponse[]>([]);
  const [products, setProducts] = useState<ProductResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSubcategory, setSelectedSubcategory] = useState<number | null>(null);

  const fetchData = useCallback(async () => {
    if (!slug) return;
    try {
      setLoading(true);
      const tree = await categoryApi.getTree();
      const findCat = (cats: CategoryResponse[]): CategoryResponse | null => {
        for (const c of cats) {
          if (c.slug === slug) return c;
          if (c.children.length > 0) {
            const found = findCat(c.children);
            if (found) return found;
          }
        }
        return null;
      };
      const found = findCat(tree);
      if (!found) {
        setLoading(false);
        return;
      }
      setCategory(found);

      const children = await categoryApi.getChildren(found.categoryId);
      setSubcategories(children);

      const prods = await productApi.getAll(found.categoryId);
      setProducts(prods);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    if (selectedSubcategory !== null) {
      productApi.getAll(selectedSubcategory).then(setProducts).catch(() => {});
    } else if (category) {
      productApi.getAll(category.categoryId).then(setProducts).catch(() => {});
    }
  }, [selectedSubcategory, category]);

  const isCustomer = profile?.role === 'Customer';

  if (loading) {
    return (
      <div style={{ display: 'flex', gap: '1.5rem' }}>
        <div style={{ width: '14rem', flexShrink: 0, display: 'none' }} className="sidebar-desktop">
          <LoadingSkeleton variant="text" />
        </div>
        <div style={{ flex: 1 }}>
          <LoadingSkeleton variant="text" />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(16rem, 1fr))', gap: '1.5rem', marginTop: '1rem' }}>
            {[...Array(6)].map((_, i) => (<LoadingSkeleton key={i} variant="product-card" />))}
          </div>
        </div>
      </div>
    );
  }

  if (!category) {
    return (
      <div style={{ textAlign: 'center', padding: '3rem 0' }}>
        <p style={{ color: 'var(--text-muted)', marginBottom: '1rem' }}>Category not found</p>
        <Link to="/products" className="btn btn-primary">Browse Products</Link>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', gap: '1.5rem' }}>
      <aside style={{ width: '14rem', flexShrink: 0, display: 'none' }} className="sidebar-desktop">
        <CategoryTree activeCategoryId={category.categoryId} />
      </aside>
      <div style={{ flex: 1, minWidth: 0 }}>
        <CategoryBreadcrumb categoryId={category.categoryId} categoryName={category.name} />
        <h1 className="page-title" style={{ marginTop: '0.5rem' }}>{category.name}</h1>
        {category.description && (
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '1.5rem' }}>{category.description}</p>
        )}

        {subcategories.length > 0 && (
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
            <button
              onClick={() => setSelectedSubcategory(null)}
              className={`btn btn-sm ${selectedSubcategory === null ? 'btn-primary' : 'btn-secondary'}`}
            >
              All
            </button>
            {subcategories.map((sub) => (
              <button
                key={sub.categoryId}
                onClick={() => setSelectedSubcategory(sub.categoryId)}
                className={`btn btn-sm ${selectedSubcategory === sub.categoryId ? 'btn-primary' : 'btn-secondary'}`}
              >
                {sub.name}
              </button>
            ))}
          </div>
        )}

        {products.length === 0 ? (
          <EmptyState type="products" />
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(16rem, 1fr))', gap: '1.5rem' }}>
            {products.map((product) => (
              <ProductCard
                key={product.productId}
                product={product}
                onAddToCart={() => addToCart(product.productId)}
                showAddToCart={isCustomer}
                isAdding={cartLoading}
              />
            ))}
          </div>
        )}

        <style>{`
          @media (min-width: 768px) {
            .sidebar-desktop { display: block !important; }
          }
        `}</style>
      </div>
    </div>
  );
};
