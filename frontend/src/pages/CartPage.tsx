import { useState, useEffect } from 'react';
import { ArrowRightIcon, TrashIcon } from '@heroicons/react/20/solid';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../hooks/useCart';
import { EmptyState } from '../components/ui/EmptyState';
import { LoadingSkeleton } from '../components/ui/LoadingSkeleton';
import { QuantityStepper } from '../components/ui/QuantityStepper';

export const CartPage = () => {
  const navigate = useNavigate();
  const { cart, loading, error, fetchCart, updateQuantity, removeItem, clearCart, itemCount, totalAmount } = useCart();
  const [updatingItems, setUpdatingItems] = useState<Set<number>>(new Set());

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const handleUpdateQuantity = async (cartItemId: number, quantity: number) => {
    setUpdatingItems((prev) => new Set(prev).add(cartItemId));
    await updateQuantity(cartItemId, quantity);
    setUpdatingItems((prev) => {
      const next = new Set(prev);
      next.delete(cartItemId);
      return next;
    });
  };

  const handleRemoveItem = async (cartItemId: number) => {
    await removeItem(cartItemId);
  };

  if (error) {
    return (
      <div style={{ textAlign: 'center', padding: '3rem 0' }}>
        <p style={{ color: 'var(--error)', marginBottom: '1rem', fontSize: '0.9375rem' }}>{error}</p>
        <button onClick={fetchCart} className="btn btn-primary">Retry</button>
      </div>
    );
  }

  if (loading) {
    return (
      <div>
        <h1 className="page-title">Shopping Cart</h1>
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead className="table-header">
              <tr>
                <th>Product</th>
                <th>Price</th>
                <th>Quantity</th>
                <th>Total</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {[...Array(3)].map((_, i) => (
                <LoadingSkeleton key={i} variant="table-row" />
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  const cartItems = cart?.items;
  const isEmpty = !cart || !cartItems || cartItems.length === 0;

  if (isEmpty) {
    return (
      <div>
        <h1 className="page-title">Shopping Cart</h1>
        <EmptyState type="cart" onAction={() => navigate('/products')} />
      </div>
    );
  }

  return (
    <div>
      <h1 className="page-title">Cart ({itemCount} items)</h1>

      <div className="cart-layout">
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead className="table-header">
                <tr>
                  <th>Product</th>
                  <th>Price</th>
                  <th>Quantity</th>
                  <th>Total</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {cartItems.map((item) => (
                  <tr key={item.cartItemId} className="table-row">
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <img
                          src={item.product?.imageUrl || 'https://via.placeholder.com/80x60?text=No+Image'}
                          alt={item.product?.name || 'Product'}
                          style={{ width: '3.5rem', height: '3.5rem', objectFit: 'cover', borderRadius: 'var(--radius-sm)' }}
                        />
                        <div>
                          <p style={{ fontWeight: 500, color: 'var(--text-primary)', fontSize: '0.875rem' }}>{item.product?.name}</p>
                          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>ID: {item.productId}</p>
                        </div>
                      </div>
                    </td>
                    <td style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>${(item.product?.price ?? 0).toFixed(2)}</td>
                    <td>
                      <QuantityStepper
                        value={item.quantity}
                        onChange={(qty) => handleUpdateQuantity(item.cartItemId, qty)}
                        max={99}
                        disabled={updatingItems.has(item.cartItemId)}
                      />
                    </td>
                    <td style={{ fontWeight: 500, color: 'var(--accent-gold)', fontSize: '0.875rem' }}>${((item.product?.price ?? 0) * item.quantity).toFixed(2)}</td>
                    <td>
                      <button
                        onClick={() => handleRemoveItem(item.cartItemId)}
                        disabled={updatingItems.has(item.cartItemId)}
                        className="btn btn-ghost btn-sm"
                        style={{ color: 'var(--error)' }}
                      >
                        <TrashIcon style={{ width: '1rem', height: '1rem' }} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div style={{ padding: '1rem 1.5rem', display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid var(--border-light)' }}>
            <button onClick={clearCart} className="btn btn-secondary btn-sm" disabled={updatingItems.size > 0}>
              Clear Cart
            </button>
          </div>
        </div>

        <div className="card" style={{ height: 'fit-content', position: 'sticky', top: '6rem' }}>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.125rem', color: 'var(--text-primary)', marginBottom: '1rem' }}>Order Summary</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
              <span>Subtotal ({itemCount} items)</span>
              <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>${totalAmount.toFixed(2)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)', fontSize: '0.8125rem' }}>
              <span>Shipping</span>
              <span>Calculated at checkout</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)', fontSize: '0.8125rem' }}>
              <span>Tax</span>
              <span>Calculated at checkout</span>
            </div>
            <hr className="divider" />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'var(--font-heading)', fontSize: '1.125rem', color: 'var(--accent-gold)' }}>
              <span>Estimated Total</span>
              <span>${totalAmount.toFixed(2)}+</span>
            </div>
          </div>
          <button
            onClick={() => navigate('/checkout')}
            className="btn btn-primary"
            style={{ width: '100%', marginTop: '1.5rem' }}
            disabled={updatingItems.size > 0}
          >
            Proceed to Checkout
            <ArrowRightIcon style={{ width: '1.25rem', height: '1.25rem' }} />
          </button>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textAlign: 'center', marginTop: '0.75rem' }}>
            Shipping and tax calculated at checkout
          </p>
        </div>
      </div>
    </div>
  );
};