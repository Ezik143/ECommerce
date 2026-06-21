import { useState, useEffect, useCallback } from 'react';
import { PencilIcon, TrashIcon } from '@heroicons/react/20/solid';
import { productApi } from '../services/productApi';
import { categoryApi } from '../services/categoryApi';
import { useUserProfile } from '../hooks/useUserProfile';
import { Modal } from '../components/ui/Modal';
import { EmptyState } from '../components/ui/EmptyState';
import { LoadingSkeleton } from '../components/ui/LoadingSkeleton';
import { ProductCard } from '../components/ui/ProductCard';
import { useToast } from '../components/ui/Toast';
import type { ProductResponse, CategoryResponse, CreateProductRequest, UpdateProductRequest } from '../types/api';

export const SellerProductsPage = () => {
  const { profile } = useUserProfile();
  const { success, error: showError } = useToast();

  const [products, setProducts] = useState<ProductResponse[]>([]);
  const [categories, setCategories] = useState<CategoryResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ProductResponse | null>(null);

  const emptyForm: CreateProductRequest = { name: '', description: '', price: 0, stockQuantity: 0, categoryId: 0, imageUrl: '' };
  const [form, setForm] = useState<CreateProductRequest>(emptyForm);

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      const [allProducts, cats] = await Promise.all([
        productApi.getAll(),
        categoryApi.getAll(),
      ]);
      setProducts(allProducts.filter((p) => p.sellerId === profile?.localUserId));
      setCategories(cats);
    } catch {
      showError('Failed to load products');
    } finally {
      setLoading(false);
    }
  }, [profile?.localUserId, showError]);

  useEffect(() => {
    if (profile?.localUserId) fetchProducts();
  }, [profile?.localUserId, fetchProducts]);

  const openAdd = () => {
    setEditingProduct(null);
    setForm(emptyForm);
    setShowModal(true);
  };

  const openEdit = (product: ProductResponse) => {
    setEditingProduct(product);
    setForm({
      name: product.name,
      description: product.description || '',
      price: product.price,
      stockQuantity: product.stockQuantity,
      categoryId: product.categoryId,
      imageUrl: product.imageUrl || '',
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.name || form.price <= 0 || form.stockQuantity < 0 || !form.categoryId) return;
    try {
      setSaving(true);
      if (editingProduct) {
        await productApi.update(editingProduct.productId, form as UpdateProductRequest);
        success('Product updated');
      } else {
        await productApi.create(form);
        success('Product added');
      }
      setShowModal(false);
      await fetchProducts();
    } catch (err) {
      const message = err instanceof Error && 'response' in err
        ? String((err as any).response?.data?.message || (err as any).response?.data?.title || (err as any).message || 'Failed to save product')
        : 'Failed to save product';
      showError(message);
    } finally {
      setSaving(false);
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

  const isFormValid = form.name && form.price > 0 && form.stockQuantity >= 0 && form.categoryId > 0;

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
        <button onClick={openAdd} className="btn btn-primary btn-sm">Add Product</button>
      </div>

      {products.length === 0 ? (
        <EmptyState type="seller-products" onAction={openAdd} />
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(16rem, 1fr))', gap: '1.5rem' }}>
          {products.map((product) => (
            <div key={product.productId} style={{ position: 'relative' }} className="group">
              <ProductCard product={product} showAddToCart={false} variant="seller" />
              <div className="overlay-actions">
                <button onClick={() => openEdit(product)} className="overlay-btn" aria-label="Edit product">
                  <PencilIcon style={{ width: '1rem', height: '1rem' }} />
                </button>
                <button onClick={() => handleDelete(product.productId)} className="overlay-btn overlay-btn-danger" aria-label="Delete product">
                  <TrashIcon style={{ width: '1rem', height: '1rem' }} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editingProduct ? 'Edit Product' : 'Add Product'} size="lg">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label className="label">Product Name</label>
            <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input" />
          </div>
          <div>
            <label className="label">Description</label>
            <textarea value={form.description || ''} onChange={(e) => setForm({ ...form, description: e.target.value })} className="input" />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label className="label">Price ($)</label>
              <input type="number" step="0.01" min="0" value={form.price} onChange={(e) => setForm({ ...form, price: parseFloat(e.target.value) || 0 })} className="input" />
            </div>
            <div>
              <label className="label">Stock Quantity</label>
              <input type="number" min="0" value={form.stockQuantity} onChange={(e) => setForm({ ...form, stockQuantity: parseInt(e.target.value) || 0 })} className="input" />
            </div>
          </div>
          <div>
            <label className="label">Category</label>
            <select value={form.categoryId} onChange={(e) => setForm({ ...form, categoryId: parseInt(e.target.value) || 0 })} className="input">
              <option value={0}>Select a category</option>
              {categories.map((cat) => (
                <option key={cat.categoryId} value={cat.categoryId}>{cat.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Image URL</label>
            <input type="text" value={form.imageUrl || ''} onChange={(e) => setForm({ ...form, imageUrl: e.target.value })} className="input" placeholder="https://..." />
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', paddingTop: '0.5rem' }}>
            <button onClick={() => setShowModal(false)} className="btn btn-secondary">Cancel</button>
            <button onClick={handleSave} disabled={saving || !isFormValid} className="btn btn-primary">
              {saving ? 'Saving...' : editingProduct ? 'Update' : 'Create'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};