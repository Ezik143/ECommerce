import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { productApi } from '../services/productApi';
import { orderApi } from '../services/orderApi';
import { useUserProfile } from '../hooks/useUserProfile';
import { StatusBadge } from '../components/ui/StatusBadge';
import { LoadingSkeleton } from '../components/ui/LoadingSkeleton';
import type { ProductResponse, OrderResponse } from '../types/api';

export const SellerDashboard = () => {
  const navigate = useNavigate();
  const { profile } = useUserProfile();

  const [products, setProducts] = useState<ProductResponse[]>([]);
  const [orders, setOrders] = useState<OrderResponse[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [allProducts, allOrders] = await Promise.all([
        productApi.getAll(),
        orderApi.getAllOrders(),
      ]);
      setProducts(allProducts.filter((p) => p.sellerId === profile?.localUserId));
      setOrders(allOrders);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, [profile?.localUserId]);

  useEffect(() => {
    if (profile?.localUserId) fetchData();
  }, [profile?.localUserId, fetchData]);

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <h1 className="page-title">Seller Dashboard</h1>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(12rem, 1fr))', gap: '1rem' }}>
          {[...Array(4)].map((_, i) => <LoadingSkeleton key={i} variant="card" />)}
        </div>
      </div>
    );
  }

  const pendingOrders = orders.filter((o) => o.status.toLowerCase() === 'pending' || o.status.toLowerCase() === 'processing');
  const revenueThisMonth = orders
    .filter((o) => {
      const d = new Date(o.createdAt);
      const now = new Date();
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    })
    .reduce((sum, o) => sum + o.totalAmount, 0);

  const lowStockProducts = products.filter((p) => p.stockQuantity < 10);
  const recentOrders = orders.slice(0, 5);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <h1 className="page-title">Seller Dashboard</h1>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(12rem, 1fr))', gap: '1rem' }}>
        <div className="stat-card animate-fade-in-up stagger-1">
          <p className="stat-label">Total Products</p>
          <p className="stat-value">{products.length}</p>
        </div>
        <div className="stat-card animate-fade-in-up stagger-2">
          <p className="stat-label">Pending Orders</p>
          <p className="stat-value" style={{ color: 'var(--accent-amber)' }}>{pendingOrders.length}</p>
        </div>
        <div className="stat-card animate-fade-in-up stagger-3">
          <p className="stat-label">Revenue (This Month)</p>
          <p className="stat-value" style={{ color: 'var(--success)' }}>${revenueThisMonth.toFixed(2)}</p>
        </div>
        <div className="stat-card animate-fade-in-up stagger-4">
          <p className="stat-label">Low Stock Items</p>
          <p className="stat-value" style={{ color: lowStockProducts.length > 0 ? 'var(--error)' : 'var(--text-primary)' }}>
            {lowStockProducts.length}
          </p>
        </div>
      </div>

      <div className="card">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.125rem', color: 'var(--text-primary)' }}>Quick Actions</h2>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <button onClick={() => navigate('/seller/products')} className="btn btn-primary">
            Manage Products
          </button>
          <button onClick={() => navigate('/seller/orders')} className="btn btn-secondary">
            View All Orders
          </button>
        </div>
      </div>

      <div className="card">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.125rem', color: 'var(--text-primary)' }}>Recent Orders</h2>
          <button onClick={() => navigate('/seller/orders')} style={{ color: 'var(--accent-gold)', fontSize: '0.875rem', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>
            View All
          </button>
        </div>
        {recentOrders.length === 0 ? (
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>No orders yet</p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead className="table-header">
                <tr>
                  <th>Order ID</th>
                  <th>Date</th>
                  <th>Items</th>
                  <th>Total</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((order) => (
                  <tr key={order.orderId} className="table-row">
                    <td style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-primary)' }}>#{order.orderId}</td>
                    <td style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>{new Date(order.createdAt).toLocaleDateString()}</td>
                    <td style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>{order.items.length}</td>
                    <td style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--accent-gold)' }}>${order.totalAmount.toFixed(2)}</td>
                    <td><StatusBadge status={order.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};