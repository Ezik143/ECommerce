import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckIcon, ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/20/solid';
import { useCart } from '../hooks/useCart';
import { useOrders } from '../hooks/useOrders';
import { useAddresses } from '../hooks/useAddresses';
import { Modal } from '../components/ui/Modal';
import { EmptyState } from '../components/ui/EmptyState';
import { LoadingSkeleton } from '../components/ui/LoadingSkeleton';
import type { CreateAddressRequest } from '../types/api';

const PAYMENT_METHODS = [
  { value: 'CreditCard', label: 'Credit Card', description: 'Pay with Visa, Mastercard, or Amex' },
  { value: 'EWallet', label: 'EWallet', description: 'Fast and secure online payments' },
  { value: 'BankTransfer', label: 'Bank Transfer', description: 'Direct bank transfer' },
  { value: 'CashOnDelivery', label: 'Cash on Delivery', description: 'Pay when you receive' },
] as const;

type PaymentMethod = typeof PAYMENT_METHODS[number]['value'];
type Step = 'shipping' | 'payment' | 'review';

export const CheckoutPage = () => {
  const navigate = useNavigate();
  const { cart, loading: cartLoading, fetchCart } = useCart();
  const { createOrder, loading: orderLoading } = useOrders();
  const { addresses, loading: addressLoading, fetchAddresses, createAddress } = useAddresses();

  const [currentStep, setCurrentStep] = useState<Step>('shipping');
  const [selectedAddressId, setSelectedAddressId] = useState<number | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('CreditCard');
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [newAddress, setNewAddress] = useState<CreateAddressRequest>({
    street: '', city: '', state: '', postalCode: '', country: '',
  });

  useEffect(() => {
    fetchCart();
    fetchAddresses();
  }, [fetchCart, fetchAddresses]);

  useEffect(() => {
    if (addresses.length > 0 && !selectedAddressId) {
      setSelectedAddressId(addresses.find((a) => a.isDefault)?.addressId || addresses[0].addressId);
    }
  }, [addresses, selectedAddressId]);

  useEffect(() => {
    if (!cartLoading && cart && cart.items.length === 0) {
      navigate('/cart');
    }
  }, [cart, cartLoading, navigate]);

  const handleAddAddress = async () => {
    try {
      setError(null);
      const addr = await createAddress(newAddress);
      setSelectedAddressId(addr.addressId);
      setShowAddressModal(false);
      setNewAddress({ street: '', city: '', state: '', postalCode: '', country: '' });
    } catch {
      setError('Failed to add address');
    }
  };

  const handlePlaceOrder = async () => {
    if (!selectedAddressId) {
      setError('Please select a shipping address');
      return;
    }
    try {
      setError(null);
      await createOrder({ paymentMethod, shippingAddressId: selectedAddressId });
      setOrderSuccess(true);
    } catch {
      setError('Failed to place order');
    }
  };

  const goToStep = (step: Step) => setCurrentStep(step);

  const selectedAddress = addresses.find((a) => a.addressId === selectedAddressId);

  if (orderSuccess) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem 1rem' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '5rem', height: '5rem', borderRadius: '50%', background: 'var(--success-bg)', color: 'var(--success)', marginBottom: '1.5rem' }}>
          <CheckIcon style={{ width: '2.5rem', height: '2.5rem' }} />
        </div>
        <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.5rem', color: 'var(--text-primary)', marginBottom: '0.5rem' }}>Order Placed Successfully!</h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', fontSize: '0.9375rem' }}>Thank you for your purchase. You'll receive a confirmation shortly.</p>
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
          <button onClick={() => navigate('/orders')} className="btn btn-primary">View Orders</button>
          <button onClick={() => navigate('/products')} className="btn btn-secondary">Continue Shopping</button>
        </div>
      </div>
    );
  }

  if (cartLoading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <h1 className="page-title">Checkout</h1>
        <LoadingSkeleton variant="card" />
      </div>
    );
  }

  const steps: { key: Step; label: string }[] = [
    { key: 'shipping', label: 'Shipping' },
    { key: 'payment', label: 'Payment' },
    { key: 'review', label: 'Review' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <h1 className="page-title">Checkout</h1>

      <div className="step-indicator" style={{ marginBottom: '1.5rem' }}>
        {steps.map((s, i) => (
          <div key={s.key} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <button
              onClick={() => goToStep(s.key)}
              className={`step ${currentStep === s.key ? 'step-active' : 'step-inactive'}`}
            >
              {s.label}
            </button>
            {i < steps.length - 1 && <ChevronRightIcon className="step-chevron" />}
          </div>
        ))}
      </div>

      {error && (
        <div style={{ padding: '0.75rem 1rem', background: 'var(--error-bg)', border: '1px solid rgba(197,90,90,0.3)', borderRadius: 'var(--radius-sm)', color: 'var(--error)', fontSize: '0.875rem' }}>{error}</div>
      )}

      {currentStep === 'shipping' && (
        <div className="card">
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.125rem', color: 'var(--text-primary)', marginBottom: '1rem' }}>Shipping Address</h2>
          {addressLoading ? (
            <LoadingSkeleton variant="card" />
          ) : addresses.length === 0 ? (
            <EmptyState type="addresses" onAction={() => setShowAddressModal(true)} />
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {addresses.map((addr) => (
                <label
                  key={addr.addressId}
                  className={`address-radio ${selectedAddressId === addr.addressId ? 'selected' : ''}`}
                >
                  <input
                    type="radio"
                    name="address"
                    value={addr.addressId}
                    checked={selectedAddressId === addr.addressId}
                    onChange={() => setSelectedAddressId(addr.addressId)}
                  />
                  <div>
                    <p style={{ color: 'var(--text-primary)', fontSize: '0.875rem' }}>{addr.street}</p>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.8125rem' }}>{addr.city}, {addr.state} {addr.postalCode}</p>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.8125rem' }}>{addr.country}</p>
                    {addr.isDefault && <span className="badge badge-default" style={{ marginTop: '0.375rem' }}>Default</span>}
                  </div>
                </label>
              ))}
              <button onClick={() => setShowAddressModal(true)} className="btn btn-secondary btn-sm" style={{ alignSelf: 'flex-start' }}>
                Add New Address
              </button>
            </div>
          )}
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
            <button onClick={() => goToStep('payment')} disabled={!selectedAddressId} className="btn btn-primary">
              Continue <ChevronRightIcon style={{ width: '1.25rem', height: '1.25rem' }} />
            </button>
          </div>
        </div>
      )}

      {currentStep === 'payment' && (
        <div className="card">
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.125rem', color: 'var(--text-primary)', marginBottom: '1rem' }}>Payment Method</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {PAYMENT_METHODS.map((pm) => (
              <label
                key={pm.value}
                className={`address-radio ${paymentMethod === pm.value ? 'selected' : ''}`}
              >
                <input
                  type="radio"
                  name="payment"
                  value={pm.value}
                  checked={paymentMethod === pm.value}
                  onChange={() => setPaymentMethod(pm.value)}
                />
                <div>
                  <p style={{ color: 'var(--text-primary)', fontSize: '0.875rem', fontWeight: 500 }}>{pm.label}</p>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.8125rem' }}>{pm.description}</p>
                </div>
              </label>
            ))}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1.5rem' }}>
            <button onClick={() => goToStep('shipping')} className="btn btn-secondary">
              <ChevronLeftIcon style={{ width: '1.25rem', height: '1.25rem' }} /> Back
            </button>
            <button onClick={() => goToStep('review')} className="btn btn-primary">
              Continue <ChevronRightIcon style={{ width: '1.25rem', height: '1.25rem' }} />
            </button>
          </div>
        </div>
      )}

      {currentStep === 'review' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.5rem' }} className="review-layout">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div className="card">
              <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1rem', color: 'var(--text-primary)', marginBottom: '0.5rem' }}>Shipping Address</h3>
              {selectedAddress && (
                <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                  {selectedAddress.street}, {selectedAddress.city}, {selectedAddress.state} {selectedAddress.postalCode}, {selectedAddress.country}
                </p>
              )}
              <button onClick={() => goToStep('shipping')} style={{ color: 'var(--accent-gold)', fontSize: '0.8125rem', background: 'none', border: 'none', cursor: 'pointer', marginTop: '0.5rem', fontFamily: 'inherit' }}>Change</button>
            </div>
            <div className="card">
              <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1rem', color: 'var(--text-primary)', marginBottom: '0.5rem' }}>Payment Method</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>{PAYMENT_METHODS.find((p) => p.value === paymentMethod)?.label}</p>
              <button onClick={() => goToStep('payment')} style={{ color: 'var(--accent-gold)', fontSize: '0.8125rem', background: 'none', border: 'none', cursor: 'pointer', marginTop: '0.5rem', fontFamily: 'inherit' }}>Change</button>
            </div>
            <div className="card">
              <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1rem', color: 'var(--text-primary)', marginBottom: '1rem' }}>Order Items</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {cart?.items.map((item) => (
                  <div key={item.cartItemId} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <img src={item.product?.imageUrl || 'https://via.placeholder.com/48x48?text=No+Image'} alt={item.product?.name || 'Product'} style={{ width: '3rem', height: '3rem', objectFit: 'cover', borderRadius: 'var(--radius-sm)' }} />
                      <div>
                        <p style={{ fontSize: '0.875rem', color: 'var(--text-primary)', fontWeight: 500 }}>{item.product?.name}</p>
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Qty: {item.quantity}</p>
                      </div>
                    </div>
                    <p style={{ fontSize: '0.875rem', color: 'var(--accent-gold)', fontWeight: 500 }}>${((item.product?.price ?? 0) * item.quantity).toFixed(2)}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="card" style={{ height: 'fit-content', position: 'sticky', top: '6rem' }}>
            <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1rem', color: 'var(--text-primary)', marginBottom: '1rem' }}>Order Summary</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.875rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
                <span>Subtotal ({cart?.items.length} items)</span>
                <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>${cart?.totalAmount.toFixed(2)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
                <span>Shipping</span>
                <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>$0.00</span>
              </div>
              <hr className="divider" />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'var(--font-heading)', fontSize: '1.125rem', color: 'var(--accent-gold)' }}>
                <span>Total</span>
                <span>${cart?.totalAmount.toFixed(2)}</span>
              </div>
            </div>
            <button onClick={handlePlaceOrder} disabled={orderLoading} className="btn btn-primary" style={{ width: '100%', marginTop: '1.5rem' }}>
              {orderLoading ? 'Placing Order...' : 'Place Order'}
            </button>
          </div>
        </div>
      )}

      <Modal isOpen={showAddressModal} onClose={() => setShowAddressModal(false)} title="Add New Address">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label className="label">Street</label>
            <input type="text" value={newAddress.street} onChange={(e) => setNewAddress({ ...newAddress, street: e.target.value })} className="input" placeholder="123 Main St" />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label className="label">City</label>
              <input type="text" value={newAddress.city} onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })} className="input" />
            </div>
            <div>
              <label className="label">State</label>
              <input type="text" value={newAddress.state} onChange={(e) => setNewAddress({ ...newAddress, state: e.target.value })} className="input" />
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label className="label">Postal Code</label>
              <input type="text" value={newAddress.postalCode} onChange={(e) => setNewAddress({ ...newAddress, postalCode: e.target.value })} className="input" />
            </div>
            <div>
              <label className="label">Country</label>
              <input type="text" value={newAddress.country} onChange={(e) => setNewAddress({ ...newAddress, country: e.target.value })} className="input" />
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', paddingTop: '0.5rem' }}>
            <button onClick={() => setShowAddressModal(false)} className="btn btn-secondary">Cancel</button>
            <button onClick={handleAddAddress} disabled={!newAddress.street || !newAddress.city || !newAddress.state || !newAddress.postalCode || !newAddress.country} className="btn btn-primary">
              Save Address
            </button>
          </div>
        </div>
      </Modal>

      <style>{`
        @media (min-width: 1024px) {
          .review-layout { grid-template-columns: 2fr 1fr !important; }
        }
      `}</style>
    </div>
  );
};