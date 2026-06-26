import { useState, useEffect, useCallback, useReducer } from 'react';
import { orderApi } from '../services/orderApi';
import { StatusBadge } from '../components/ui/StatusBadge';
import { EmptyState } from '../components/ui/EmptyState';
import { LoadingSkeleton } from '../components/ui/LoadingSkeleton';
import { Modal } from '../components/ui/Modal';
import { useToast } from '../components/ui/Toast';
import type { OrderResponse } from '../types/api';

const STATUS_OPTIONS = ['PendingPayment', 'Paid', 'Shipped', 'Delivered', 'Cancelled'];

interface OrdersState {
  allOrders: OrderResponse[];
  loading: boolean;
}

const initialOrdersState: OrdersState = { allOrders: [], loading: true };

function ordersReducer(state: OrdersState, action: Partial<OrdersState>): OrdersState {
  return { ...state, ...action };
}

export const SellerOrdersPage = () => {
  const { success, error: showError } = useToast();

  const [{ allOrders, loading }, dispatch] = useReducer(ordersReducer, initialOrdersState);
  const [selectedOrder, setSelectedOrder] = useState<OrderResponse | null>(null);
  const [statusFilter, setStatusFilter] = useState('All');
  const [updating, setUpdating] = useState<number | null>(null);

  const fetchOrders = useCallback(async () => {
    try {
      dispatch({ loading: true });
      const data = await orderApi.getAllOrders();
      dispatch({ allOrders: data, loading: false });
    } catch {
      showError('Failed to load orders');
      dispatch({ loading: false });
    }
  }, [showError]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const sellerOrders = allOrders.filter((order) =>
    order.items.some((item) => item.productId > 0)
  );

  const filteredOrders = statusFilter === 'All'
    ? sellerOrders
    : sellerOrders.filter((o) => o.status.toLowerCase() === statusFilter.toLowerCase());

  const handleStatusUpdate = async (orderId: number, newStatus: string) => {
    try {
      setUpdating(orderId);
      await orderApi.updateOrder(orderId, { status: newStatus });
      success(`Order #${orderId} updated to ${newStatus}`);
      await fetchOrders();
      if (selectedOrder?.orderId === orderId) {
        setSelectedOrder({ ...selectedOrder, status: newStatus });
      }
    } catch {
      showError('Failed to update order');
    } finally {
      setUpdating(null);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <h1 className="page-title">Orders</h1>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {[...Array(5)].map((_, i) => <LoadingSkeleton key={i} variant="card" />)}
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <h1 className="page-title" style={{ marginBottom: 0 }}>Orders</h1>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="input" style={{ width: 'auto', minWidth: '10rem' }}>
          <option value="All">All Statuses</option>
          {STATUS_OPTIONS.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>

      {filteredOrders.length === 0 ? (
        <EmptyState type="seller-orders" />
      ) : (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead className="table-header">
                <tr>
                  <th>Order ID</th>
                  <th>Customer</th>
                  <th>Date</th>
                  <th>Items</th>
                  <th>Total</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((order) => (
                  <tr key={order.orderId} className="table-row">
                    <td>
                      <button type="button" onClick={() => setSelectedOrder(order)} style={{ fontSize: 'var(--text-caption)', color: 'var(--accent-gold)', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 500 }}>
                        #{order.orderId}
                      </button>
                    </td>
                    <td style={{ fontSize: 'var(--text-caption)', color: 'var(--text-primary)' }}>User #{order.userId}</td>
                    <td style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>{new Date(order.createdAt).toLocaleDateString()}</td>
                    <td style={{ fontSize: 'var(--text-caption)', color: 'var(--text-muted)' }}>{order.items.length}</td>
                    <td style={{ fontSize: 'var(--text-caption)', fontWeight: 500, color: 'var(--accent-gold)' }}>${order.totalAmount.toFixed(2)}</td>
                    <td><StatusBadge status={order.status} /></td>
                    <td>
                      <select
                        value={order.status}
                        onChange={(e) => handleStatusUpdate(order.orderId, e.target.value)}
                        disabled={updating === order.orderId}
                        className="input"
                        style={{ padding: '0.25rem 0.5rem', fontSize: 'var(--text-xs)', minWidth: '7rem' }}
                      >
                        {STATUS_OPTIONS.map((s) => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <Modal isOpen={!!selectedOrder} onClose={() => setSelectedOrder(null)} title={`Order #${selectedOrder?.orderId}`} size="lg">
        {selectedOrder && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', fontSize: 'var(--text-caption)' }}>
              <div>
                <span className="label">Status</span>
                <StatusBadge status={selectedOrder.status} />
              </div>
              <div>
                <span className="label">Date</span>
                <p style={{ color: 'var(--text-primary)' }}>{new Date(selectedOrder.createdAt).toLocaleDateString()}</p>
              </div>
              <div>
                <span className="label">Payment</span>
                <p style={{ color: 'var(--text-primary)' }}>{selectedOrder.paymentMethod}</p>
              </div>
              <div>
                <span className="label">Shipping</span>
                <p style={{ color: 'var(--text-primary)', fontSize: 'var(--text-caption)' }}>{selectedOrder.shippingAddress}</p>
              </div>
            </div>

            <div>
              <span className="label" style={{ marginBottom: '0.5rem', display: 'block' }}>Items in this order</span>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {selectedOrder.items.map((item) => (
                  <div key={item.orderItemId} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--text-caption)', padding: '0.5rem 0', borderBottom: '1px solid var(--border-light)' }}>
                    <span style={{ color: 'var(--text-primary)' }}>{item.productName} x{item.quantity}</span>
                    <span style={{ fontWeight: 500, color: 'var(--accent-gold)' }}>${(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </div>

            <hr className="divider" />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'var(--font-heading)', fontSize: 'var(--text-heading)', fontWeight: 600, color: 'var(--accent-gold)' }}>
              <span>Total</span>
              <span>${selectedOrder.totalAmount.toFixed(2)}</span>
            </div>

            <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1rem' }}>
              <span className="label" style={{ marginBottom: '0.5rem', display: 'block' }}>Update Status</span>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                {STATUS_OPTIONS.map((s) => (
                  <button type="button"
                    key={s}
                    onClick={() => handleStatusUpdate(selectedOrder.orderId, s)}
                    disabled={updating === selectedOrder.orderId || s === selectedOrder.status}
                    className={`btn btn-sm ${s === selectedOrder.status ? 'btn-secondary' : 'btn-ghost'}`}
                    style={s === selectedOrder.status ? { opacity: 0.5, cursor: 'not-allowed' } : {}}
                  >
                    {updating === selectedOrder.orderId ? '...' : s}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};