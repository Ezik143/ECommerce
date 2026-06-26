import { useState, useEffect, useCallback, useReducer } from 'react';
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

interface CategoryState {
  category: CategoryResponse | null;
  subcategories: CategoryResponse[];
  products: ProductResponse[];
  loading: boolean;
}

const initialCategoryState: CategoryState = {
  category: null, subcategories: [], products: [], loading: true,
};

function categoryReducer(state: CategoryState, action: Partial<CategoryState>): CategoryState {
  return { ...state, ...action };
}

export const CategoryPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const { profile } = useUserProfile();
  const { addToCart, loading: cartLoading } = useCart();

  const [selectedSubcategory, setSelectedSubcategory] = useState<number | null>(null);
  const [{ category, subcategories, products, loading }, dispatch] = useReducer(categoryReducer, initialCategoryState);

  const fetchData = useCallback(async () => {
    if (!slug) return;
    try {
      dispatch({ loading: true });
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
        dispatch({ loading: false });
        return;
      }

      const children = await categoryApi.getChildren(found.categoryId);
      const prods = await productApi.getAll(found.categoryId);
      dispatch({ category: found, subcategories: children, products: prods, loading: false });
    } catch {
      dispatch({ loading: false });
    }
  }, [slug]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSubcategoryClick = useCallback(async (subcategoryId: number | null) => {
    setSelectedSubcategory(subcategoryId);
    if (subcategoryId !== null) {
      const prods = await productApi.getAll(subcategoryId);
      dispatch({ products: prods });
    } else if (category) {
      const prods = await productApi.getAll(category.categoryId);
      dispatch({ products: prods });
    }
  }, [category]);

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
          <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-caption)', marginBottom: '1.5rem' }}>{category.description}</p>
        )}

        {subcategories.length > 0 && (
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
            <button type="button"
              onClick={() => handleSubcategoryClick(null)}
              className={`btn btn-sm ${selectedSubcategory === null ? 'btn-primary' : 'btn-secondary'}`}
            >
              All
            </button>
            {subcategories.map((sub) => (
              <button type="button"
                key={sub.categoryId}
                onClick={() => handleSubcategoryClick(sub.categoryId)}
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
