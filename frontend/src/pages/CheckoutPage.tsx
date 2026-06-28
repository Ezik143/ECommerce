import { useEffect, useReducer, FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { CheckIcon, ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/20/solid';
import { useCart } from '../hooks/useCart';
import { useOrders } from '../hooks/useOrders';
import { useAddresses } from '../hooks/useAddresses';
import { Modal } from '../components/ui/Modal';
import { EmptyState } from '../components/ui/EmptyState';
import { LoadingSkeleton } from '../components/ui/LoadingSkeleton';
import { FieldError } from '../components/ui/FieldError';
import { addressSchema, type AddressFormData } from '../schemas/address';

const PAYMENT_METHODS = [
  { value: 'CreditCard', label: 'Credit Card', description: 'Pay with Visa, Mastercard, or Amex' },
  { value: 'EWallet', label: 'EWallet', description: 'Fast and secure online payments' },
  { value: 'BankTransfer', label: 'Bank Transfer', description: 'Direct bank transfer' },
  { value: 'CashOnDelivery', label: 'Cash on Delivery', description: 'Pay when you receive' },
] as const;

type PaymentMethod = typeof PAYMENT_METHODS[number]['value'];
type Step = 'shipping' | 'payment' | 'review';

const emptyAddress: AddressFormData = { street: '', city: '', state: '', postalCode: '', country: '' };

const steps: { key: Step; label: string }[] = [
  { key: 'shipping', label: 'Shipping' },
  { key: 'payment', label: 'Payment' },
  { key: 'review', label: 'Review' },
];

interface CheckoutState {
  currentStep: Step;
  selectedAddressId: number | null;
  paymentMethod: PaymentMethod;
  showAddressModal: boolean;
  orderSuccess: boolean;
  error: string | null;
}

const initialCheckoutState: CheckoutState = {
  currentStep: 'shipping',
  selectedAddressId: null,
  paymentMethod: 'CreditCard',
  showAddressModal: false,
  orderSuccess: false,
  error: null,
};

function checkoutReducer(state: CheckoutState, action: Partial<CheckoutState>): CheckoutState {
  return { ...state, ...action };
}

export const CheckoutPage = () => {
  const navigate = useNavigate();
  const { cart, loading: cartLoading, fetchCart } = useCart();
  const { createOrder, loading: orderLoading } = useOrders();
  const { addresses, loading: addressLoading, fetchAddresses, createAddress } = useAddresses();

  const [{ currentStep, selectedAddressId, paymentMethod, showAddressModal, orderSuccess, error }, dispatch] = useReducer(checkoutReducer, initialCheckoutState);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<AddressFormData>({
    resolver: zodResolver(addressSchema),
    mode: 'onBlur',
    defaultValues: emptyAddress,
  });

  useEffect(() => {
    fetchCart();
    fetchAddresses();
  }, [fetchCart, fetchAddresses]);

  const defaultAddressId = addresses.find((a) => a.isDefault)?.addressId ?? addresses[0]?.addressId ?? null;
  const effectiveAddressId = selectedAddressId ?? defaultAddressId;

  useEffect(() => {
    if (!cartLoading && cart && cart.items.length === 0) {
      navigate('/cart');
    }
  }, [cart, cartLoading, navigate]);

  const onAddAddress = async (data: AddressFormData) => {
    try {
      dispatch({ error: null });
      const addr = await createAddress(data);
      dispatch({ selectedAddressId: addr.addressId, showAddressModal: false });
      reset(emptyAddress);
    } catch {
      dispatch({ error: 'Failed to add address' });
    }
  };

  const handlePlaceOrder = async () => {
    if (!effectiveAddressId) {
      dispatch({ error: 'Please select a shipping address' });
      return;
    }
    try {
      dispatch({ error: null });
      await createOrder({ paymentMethod, shippingAddressId: effectiveAddressId });
      dispatch({ orderSuccess: true });
    } catch {
      dispatch({ error: 'Failed to place order' });
    }
  };

  const goToStep = (step: Step) => dispatch({ currentStep: step });

  const selectedAddress = addresses.find((a) => a.addressId === effectiveAddressId);

  if (orderSuccess) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem 1rem' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '5rem', height: '5rem', borderRadius: '50%', background: 'var(--success-bg)', color: 'var(--success)', marginBottom: '1.5rem' }}>
          <CheckIcon style={{ width: '2.5rem', height: '2.5rem' }} />
        </div>
        <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--text-heading)', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>Order Placed Successfully!</h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', fontSize: 'var(--text-body)' }}>Thank you for your purchase. You'll receive a confirmation shortly.</p>
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
          <button type="button" onClick={() => navigate('/orders')} className="btn btn-primary">View Orders</button>
          <button type="button" onClick={() => navigate('/products')} className="btn btn-secondary">Continue Shopping</button>
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

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <h1 className="page-title">Checkout</h1>

      <div className="step-indicator" style={{ marginBottom: '1.5rem' }}>
        {steps.map((s, i) => (
          <div key={s.key} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <button type="button"
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
        <div style={{ padding: '0.75rem 1rem', background: 'var(--error-bg)', border: '1px solid rgba(197,90,90,0.3)', borderRadius: 'var(--radius-sm)', color: 'var(--error)', fontSize: 'var(--text-caption)' }}>{error}</div>
      )}

      {currentStep === 'shipping' && (
        <div className="card">
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--text-heading)', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '1rem' }}>Shipping Address</h2>
          {addressLoading ? (
            <LoadingSkeleton variant="card" />
          ) : addresses.length === 0 ? (
            <EmptyState type="addresses" onAction={() => dispatch({ showAddressModal: true })} />
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
                    onChange={() => dispatch({ selectedAddressId: addr.addressId })}
                  />
                  <div>
                    <p style={{ color: 'var(--text-primary)', fontSize: 'var(--text-caption)' }}>{addr.street}</p>
                    <p style={{ color: 'var(--text-muted)', fontSize: 'var(--text-xs)' }}>{addr.city}, {addr.state} {addr.postalCode}</p>
                    <p style={{ color: 'var(--text-muted)', fontSize: 'var(--text-xs)' }}>{addr.country}</p>
                    {addr.isDefault && <span className="badge badge-default" style={{ marginTop: '0.375rem' }}>Default</span>}
                  </div>
                </label>
              ))}
              <button type="button" onClick={() => dispatch({ showAddressModal: true })} className="btn btn-secondary btn-sm" style={{ alignSelf: 'flex-start' }}>
                Add New Address
              </button>
            </div>
          )}
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
            <button type="button" onClick={() => goToStep('payment')} disabled={!selectedAddressId} className="btn btn-primary">
              Continue <ChevronRightIcon style={{ width: '1.25rem', height: '1.25rem' }} />
            </button>
          </div>
        </div>
      )}

      {currentStep === 'payment' && (
        <div className="card">
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--text-heading)', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '1rem' }}>Payment Method</h2>
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
                  onChange={() => dispatch({ paymentMethod: pm.value })}
                />
                <div>
                    <p style={{ color: 'var(--text-primary)', fontSize: 'var(--text-caption)', fontWeight: 500 }}>{pm.label}</p>
                    <p style={{ color: 'var(--text-muted)', fontSize: 'var(--text-xs)' }}>{pm.description}</p>
                </div>
              </label>
            ))}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1.5rem' }}>
            <button type="button" onClick={() => goToStep('shipping')} className="btn btn-secondary">
              <ChevronLeftIcon style={{ width: '1.25rem', height: '1.25rem' }} /> Back
            </button>
            <button type="button" onClick={() => goToStep('review')} className="btn btn-primary">
              Continue <ChevronRightIcon style={{ width: '1.25rem', height: '1.25rem' }} />
            </button>
          </div>
        </div>
      )}

      {currentStep === 'review' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.5rem' }} className="review-layout">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div className="card">
              <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--text-body)', fontWeight: 500, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>Shipping Address</h3>
              {selectedAddress && (
                <p style={{ color: 'var(--text-muted)', fontSize: 'var(--text-caption)' }}>
                  {selectedAddress.street}, {selectedAddress.city}, {selectedAddress.state} {selectedAddress.postalCode}, {selectedAddress.country}
                </p>
              )}
              <button type="button" onClick={() => goToStep('shipping')} style={{ color: 'var(--accent-gold)', fontSize: 'var(--text-xs)', background: 'none', border: 'none', cursor: 'pointer', marginTop: '0.5rem', fontFamily: 'inherit' }}>Change</button>
            </div>
            <div className="card">
              <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--text-body)', fontWeight: 500, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>Payment Method</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: 'var(--text-caption)' }}>{PAYMENT_METHODS.find((p) => p.value === paymentMethod)?.label}</p>
              <button type="button" onClick={() => goToStep('payment')} style={{ color: 'var(--accent-gold)', fontSize: 'var(--text-xs)', background: 'none', border: 'none', cursor: 'pointer', marginTop: '0.5rem', fontFamily: 'inherit' }}>Change</button>
            </div>
            <div className="card">
              <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--text-body)', fontWeight: 500, color: 'var(--text-primary)', marginBottom: '1rem' }}>Order Items</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {cart?.items.map((item) => (
                  <div key={item.cartItemId} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <Link to={`/products/${item.productId}`} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', textDecoration: 'none' }}>
                        <img src={item.product?.imageUrl || 'https://via.placeholder.com/48x48?text=No+Image'} alt={item.product?.name || 'Product'} style={{ width: '3rem', height: '3rem', objectFit: 'cover', borderRadius: 'var(--radius-sm)' }} />
                        <div>
                          <p style={{ fontSize: 'var(--text-caption)', color: 'var(--text-primary)', fontWeight: 500 }}>{item.product?.name}</p>
                          <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>Qty: {item.quantity}</p>
                        </div>
                      </Link>
                    </div>
                    <p style={{ fontSize: 'var(--text-caption)', color: 'var(--accent-gold)', fontWeight: 500 }}>${((item.product?.price ?? 0) * item.quantity).toFixed(2)}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="card" style={{ height: 'fit-content', position: 'sticky', top: '6rem' }}>
            <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--text-body)', fontWeight: 500, color: 'var(--text-primary)', marginBottom: '1rem' }}>Order Summary</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: 'var(--text-caption)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
                <span>Subtotal ({cart?.items.length} items)</span>
                <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>${cart?.totalAmount.toFixed(2)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
                <span>Shipping</span>
                <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>$0.00</span>
              </div>
              <hr className="divider" />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'var(--font-heading)', fontSize: 'var(--text-heading)', fontWeight: 600, color: 'var(--accent-gold)' }}>
                <span>Total</span>
                <span>${cart?.totalAmount.toFixed(2)}</span>
              </div>
            </div>
            <button type="button" onClick={handlePlaceOrder} disabled={orderLoading} className="btn btn-primary" style={{ width: '100%', marginTop: '1.5rem' }}>
              {orderLoading ? 'Placing Order...' : 'Place Order'}
            </button>
          </div>
        </div>
      )}

      <Modal isOpen={showAddressModal} onClose={() => { dispatch({ showAddressModal: false }); reset(emptyAddress); }} title="Add New Address">
        <form 
          onSubmit={handleSubmit(onAddAddress)} 
          style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}
          aria-label="Add new shipping address"
          role="form"
        >
          <fieldset style={{ border: 'none', padding: 0, margin: 0 }}>
            <div>
              <label className="label" htmlFor="street">Street</label>
              <input 
                id="street" 
                type="text" 
                className="input" 
                placeholder="123 Main St" 
                {...register('street')} 
                required
                aria-required="true"
              />
              <FieldError name="street" errors={errors} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label className="label" htmlFor="city">City</label>
                <input 
                  id="city" 
                  type="text" 
                  className="input" 
                  {...register('city')} 
                  required
                  aria-required="true"
                />
                <FieldError name="city" errors={errors} />
              </div>
              <div>
                <label className="label" htmlFor="state">State</label>
                <input 
                  id="state" 
                  type="text" 
                  className="input" 
                  {...register('state')} 
                  required
                  aria-required="true"
                />
                <FieldError name="state" errors={errors} />
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label className="label" htmlFor="postalCode">Postal Code</label>
                <input 
                  id="postalCode" 
                  type="text" 
                  className="input" 
                  {...register('postalCode')} 
                  required
                  aria-required="true"
                  pattern="\d{5}(-\d{4})?"
                />
                <FieldError name="postalCode" errors={errors} />
              </div>
              <div>
                <label className="label" htmlFor="country">Country</label>
                <input 
                  id="country" 
                  type="text" 
                  className="input" 
                  {...register('country')} 
                  required
                  aria-required="true"
                />
                <FieldError name="country" errors={errors} />
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', paddingTop: '0.5rem' }}>
              <button 
                type="button" 
                onClick={() => { dispatch({ showAddressModal: false }); reset(emptyAddress); }} 
                className="btn btn-secondary"
                aria-label="Cancel adding new address"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                disabled={isSubmitting} 
                className="btn btn-primary"
                aria-label="Save new address"
              >
                {isSubmitting ? 'Saving...' : 'Save Address'}
              </button>
            </div>
          </fieldset>
        </form>
      </Modal>

      <style>{`
        @media (min-width: 1024px) {
          .review-layout { grid-template-columns: 2fr 1fr !important; }
        }
      `}</style>
    </div>
  );
};
