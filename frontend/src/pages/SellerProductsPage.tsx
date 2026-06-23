import { useState, useEffect, useCallback, useReducer } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { PencilIcon, TrashIcon } from '@heroicons/react/20/solid';
import { productApi } from '../services/productApi';
import { categoryApi } from '../services/categoryApi';
import { useUserProfile } from '../hooks/useUserProfile';
import { Modal } from '../components/ui/Modal';
import { EmptyState } from '../components/ui/EmptyState';
import { LoadingSkeleton } from '../components/ui/LoadingSkeleton';
import { ProductCard } from '../components/ui/ProductCard';
import { FieldError } from '../components/ui/FieldError';
import { useToast } from '../components/ui/Toast';
import { productSchema, type ProductFormData } from '../schemas/product';
import type { ProductResponse, CategoryResponse } from '../types/api';

const emptyForm: ProductFormData = { name: '', description: '', price: 0, stockQuantity: 0, categoryId: 0, imageUrl: '' };

interface ProductListState {
  products: ProductResponse[];
  categories: CategoryResponse[];
  loading: boolean;
}

const initialProductListState: ProductListState = {
  products: [], categories: [], loading: true,
};

function productListReducer(state: ProductListState, action: Partial<ProductListState>): ProductListState {
  return { ...state, ...action };
}

export const SellerProductsPage = () => {
  const { profile } = useUserProfile();
  const { success, error: showError } = useToast();

  const [{ products, categories, loading }, dispatch] = useReducer(productListReducer, initialProductListState);
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ProductResponse | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    mode: 'onBlur',
    defaultValues: emptyForm,
  });

  const fetchProducts = useCallback(async () => {
    try {
      dispatch({ loading: true });
      const [allProducts, cats] = await Promise.all([
        productApi.getAll(),
        categoryApi.getAll(),
      ]);
      dispatch({
        products: allProducts.filter((p) => p.sellerId === profile?.localUserId),
        categories: cats,
        loading: false,
      });
    } catch {
      showError('Failed to load products');
      dispatch({ loading: false });
    }
  }, [profile?.localUserId, showError]);

  useEffect(() => {
    if (profile?.localUserId) fetchProducts();
  }, [profile?.localUserId, fetchProducts]);

  const openAdd = () => {
    setEditingProduct(null);
    reset(emptyForm);
    setShowModal(true);
  };

  const openEdit = (product: ProductResponse) => {
    setEditingProduct(product);
    reset({
      name: product.name,
      description: product.description || '',
      price: product.price,
      stockQuantity: product.stockQuantity,
      categoryId: product.categoryId,
      imageUrl: product.imageUrl || '',
    });
    setShowModal(true);
  };

  const onSubmit = async (data: ProductFormData) => {
    try {
      if (editingProduct) {
        await productApi.update(editingProduct.productId, data);
        success('Product updated');
      } else {
        await productApi.create(data);
        success('Product added');
      }
      setShowModal(false);
      reset(emptyForm);
      await fetchProducts();
    } catch (err) {
      const message = err instanceof Error && 'response' in err
        ? String((err as any).response?.data?.message || (err as any).response?.data?.title || (err as any).message || 'Failed to save product')
        : 'Failed to save product';
      showError(message);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this product?')) return;
    try {
      await productApi.delete(id);
      success('Product deleted');
      await fetchProducts();
    } catch {
      showError('Failed to delete product');
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <h1 className="page-title">My Products</h1>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(16rem, 1fr))', gap: '1.5rem' }}>
          {[...Array(4)].map((_, i) => <LoadingSkeleton key={i} variant="product-card" />)}
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <h1 className="page-title" style={{ marginBottom: 0 }}>My Products</h1>
        <button type="button" onClick={openAdd} className="btn btn-primary btn-sm">Add Product</button>
      </div>

      {products.length === 0 ? (
        <EmptyState type="seller-products" onAction={openAdd} />
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(16rem, 1fr))', gap: '1.5rem' }}>
          {products.map((product) => (
            <div key={product.productId} style={{ position: 'relative' }} className="group">
              <ProductCard product={product} showAddToCart={false} variant="seller" />
              <div className="overlay-actions">
                <button type="button" onClick={() => openEdit(product)} className="overlay-btn" aria-label="Edit product">
                  <PencilIcon style={{ width: '1rem', height: '1rem' }} />
                </button>
                <button type="button" onClick={() => handleDelete(product.productId)} className="overlay-btn overlay-btn-danger" aria-label="Delete product">
                  <TrashIcon style={{ width: '1rem', height: '1rem' }} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal isOpen={showModal} onClose={() => { setShowModal(false); reset(emptyForm); }} title={editingProduct ? 'Edit Product' : 'Add Product'} size="lg">
        <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label className="label" htmlFor="name">Product Name</label>
            <input id="name" type="text" className="input" {...register('name')} />
            <FieldError name="name" errors={errors} />
          </div>
          <div>
            <label className="label" htmlFor="description">Description</label>
            <textarea id="description" className="input" {...register('description')} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label className="label" htmlFor="price">Price ($)</label>
              <input id="price" type="number" step="0.01" className="input" {...register('price', { valueAsNumber: true })} />
              <FieldError name="price" errors={errors} />
            </div>
            <div>
              <label className="label" htmlFor="stockQuantity">Stock Quantity</label>
              <input id="stockQuantity" type="number" className="input" {...register('stockQuantity', { valueAsNumber: true })} />
              <FieldError name="stockQuantity" errors={errors} />
            </div>
          </div>
          <div>
            <label className="label" htmlFor="categoryId">Category</label>
            <select id="categoryId" className="input" {...register('categoryId', { valueAsNumber: true })}>
              <option value={0}>Select a category</option>
              {categories.map((cat) => (
                <option key={cat.categoryId} value={cat.categoryId}>{cat.name}</option>
              ))}
            </select>
            <FieldError name="categoryId" errors={errors} />
          </div>
          <div>
            <label className="label" htmlFor="imageUrl">Image URL</label>
            <input id="imageUrl" type="text" className="input" placeholder="https://..." {...register('imageUrl')} />
            <FieldError name="imageUrl" errors={errors} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', paddingTop: '0.5rem' }}>
            <button type="button" onClick={() => { setShowModal(false); reset(emptyForm); }} className="btn btn-secondary">Cancel</button>
            <button type="submit" disabled={isSubmitting} className="btn btn-primary">
              {isSubmitting ? 'Saving...' : editingProduct ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
