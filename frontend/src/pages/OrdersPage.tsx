import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useOrders } from '../hooks/useOrders';
import { StatusBadge } from '../components/ui/StatusBadge';
import { EmptyState } from '../components/ui/EmptyState';
import { LoadingSkeleton } from '../components/ui/LoadingSkeleton';
import { Modal } from '../components/ui/Modal';
import type { OrderResponse } from '../types/api';

const TABS = ['All', 'Pending', 'Completed', 'Cancelled'] as const;
type Tab = typeof TABS[number];

export const OrdersPage = () => {
  const navigate = useNavigate();
  const { orders, loading, error, fetchOrders } = useOrders();
  const [activeTab, setActiveTab] = useState<Tab>('All');
  const [selectedOrder, setSelectedOrder] = useState<OrderResponse | null>(null);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const matchesTab = (status: string, tab: string): boolean => {
    const s = status.toLowerCase();
    switch (tab) {
      case 'All': return true;
      case 'Pending': return s.includes('pending');
      case 'Completed': return ['paid', 'shipped', 'delivered', 'refunded'].includes(s);
      case 'Cancelled': return s === 'cancelled';
      default: return false;
    }
  };

  const filteredOrders = activeTab === 'All'
    ? orders
    : orders.filter((o) => matchesTab(o.status, activeTab));

  const tabCounts = TABS.reduce((acc, tab) => {
    if (tab === 'All') acc[tab] = orders.length;
    else acc[tab] = orders.filter((o) => matchesTab(o.status, tab)).length;
    return acc;
  }, {} as Record<string, number>);

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <h1 className="page-title">My Orders</h1>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {[...Array(3)].map((_, i) => <LoadingSkeleton key={i} variant="table-row" />)}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ textAlign: 'center', padding: '3rem 0' }}>
        <p style={{ color: 'var(--error)', marginBottom: '1rem' }}>{error}</p>
        <button onClick={fetchOrders} className="btn btn-primary">Retry</button>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <h1 className="page-title">My Orders</h1>

      <div style={{ display: 'flex', gap: '0.5rem', borderBottom: '1px solid var(--border)' }}>
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              padding: '0.5rem 1rem', fontSize: '0.875rem', fontWeight: 500,
              background: 'none', border: 'none', cursor: 'pointer',
              borderBottom: `2px solid ${activeTab === tab ? 'var(--accent-gold)' : 'transparent'}`,
              color: activeTab === tab ? 'var(--accent-gold)' : 'var(--text-muted)',
              fontFamily: 'inherit',
              transition: 'all 0.2s',
              marginBottom: '-1px',
            }}
          >
            {tab} ({tabCounts[tab]})
          </button>
        ))}
      </div>

      {filteredOrders.length === 0 ? (
        <EmptyState type="orders" onAction={() => navigate('/products')} />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {filteredOrders.map((order) => (
            <button
              key={order.orderId}
              onClick={() => setSelectedOrder(order)}
              className="card card-hover"
              style={{ width: '100%', textAlign: 'left', cursor: 'pointer', border: 'none', fontFamily: 'inherit' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                  <p style={{ fontFamily: 'var(--font-heading)', color: 'var(--text-primary)', marginBottom: '0.125rem' }}>Order #{order.orderId}</p>
                  <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>{new Date(order.createdAt).toLocaleDateString()}</p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>{order.items.length} items</span>
                  <span style={{ fontFamily: 'var(--font-heading)', color: 'var(--accent-gold)', fontSize: '1rem' }}>${order.totalAmount.toFixed(2)}</span>
                  <StatusBadge status={order.status} />
                </div>
              </div>
              <div style={{ marginTop: '0.75rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                {order.items.slice(0, 3).map((item) => (
                  <span key={item.orderItemId} style={{ fontSize: '0.75rem', background: 'var(--bg-elevated)', padding: '0.125rem 0.5rem', borderRadius: 'var(--radius-sm)', color: 'var(--text-muted)' }}>
                    {item.productName} x{item.quantity}
                  </span>
                ))}
                {order.items.length > 3 && (
                  <span style={{ fontSize: '0.75rem', background: 'var(--bg-elevated)', padding: '0.125rem 0.5rem', borderRadius: 'var(--radius-sm)', color: 'var(--text-muted)' }}>
                    +{order.items.length - 3} more
                  </span>
                )}
              </div>
            </button>
          ))}
        </div>
      )}

      <Modal isOpen={!!selectedOrder} onClose={() => setSelectedOrder(null)} title={`Order #${selectedOrder?.orderId}`} size="lg">
        {selectedOrder && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', fontSize: '0.875rem' }}>
              <div>
                <span className="label">Status</span>
                <StatusBadge status={selectedOrder.status} />
              </div>
              <div>
                <span className="label">Date</span>
                <p style={{ color: 'var(--text-primary)' }}>{new Date(selectedOrder.createdAt).toLocaleDateString()}</p>
              </div>
              <div>
                <span className="label">Payment Method</span>
                <p style={{ color: 'var(--text-primary)' }}>{selectedOrder.paymentMethod}</p>
              </div>
              <div>
                <span className="label">Shipping Address</span>
                <p style={{ color: 'var(--text-primary)', fontSize: '0.8125rem' }}>{selectedOrder.shippingAddress}</p>
              </div>
            </div>

            <div>
              <span className="label" style={{ marginBottom: '0.5rem', display: 'block' }}>Items</span>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {selectedOrder.items.map((item) => (
                  <div key={item.orderItemId} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', padding: '0.5rem 0', borderBottom: '1px solid var(--border-light)' }}>
                    <span style={{ color: 'var(--text-primary)' }}>{item.productName} x{item.quantity}</span>
                    <span style={{ fontWeight: 500, color: 'var(--accent-gold)' }}>${(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </div>

            <hr className="divider" />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'var(--font-heading)', fontSize: '1.125rem', color: 'var(--accent-gold)' }}>
              <span>Total</span>
              <span>${selectedOrder.totalAmount.toFixed(2)}</span>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};