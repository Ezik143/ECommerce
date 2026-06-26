import { useNavigate } from 'react-router-dom';
import { useUserProfile } from '../hooks/useUserProfile';
import ShoppingBagIcon from '@heroicons/react/24/outline/ShoppingBagIcon';
import ShoppingCartIcon from '@heroicons/react/24/outline/ShoppingCartIcon';
import TruckIcon from '@heroicons/react/24/outline/TruckIcon';
import MapPinIcon from '@heroicons/react/24/outline/MapPinIcon';
import ClipboardDocumentListIcon from '@heroicons/react/24/outline/ClipboardDocumentListIcon';
import ChartBarIcon from '@heroicons/react/24/outline/ChartBarIcon';

const roleBadgeClass = (role: string) => {
  switch (role) {
    case 'Admin': return 'badge badge-admin';
    case 'Seller': return 'badge badge-seller';
    case 'Customer': return 'badge badge-customer';
    default: return 'badge badge-default';
  }
};

const customerCards = [
  { icon: ShoppingBagIcon, title: 'Browse Products', desc: 'Search and shop from our catalog', to: '/products' },
  { icon: ShoppingCartIcon, title: 'Shopping Cart', desc: 'View and manage your cart', to: '/cart' },
  { icon: TruckIcon, title: 'My Orders', desc: 'Track your order history', to: '/orders' },
  { icon: MapPinIcon, title: 'Addresses', desc: 'Manage your shipping addresses', to: '/addresses' },
];

const sellerCards = [
  { icon: ClipboardDocumentListIcon, title: 'My Products', desc: 'Manage your product listings', to: '/seller/products' },
  { icon: TruckIcon, title: 'My Orders', desc: 'View and fulfill orders', to: '/seller/orders' },
  { icon: ChartBarIcon, title: 'Dashboard', desc: 'Seller analytics and stats', to: '/seller/dashboard' },
];

const Dashboard = () => {
  const navigate = useNavigate();
  const { profile, loading, error, refetch } = useUserProfile();

  if (loading || !profile) {
    if (error) {
      return (
        <div style={{ textAlign: 'center', padding: '3rem 0' }}>
          <p style={{ color: 'var(--error)', marginBottom: '1rem' }}>{error}</p>
          <button type="button" onClick={refetch} className="btn btn-primary">Retry</button>
        </div>
      );
    }
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '50vh' }}>
        <div className="spinner spinner-lg"></div>
      </div>
    );
  }

  const cards = profile.role === 'Customer' ? customerCards : profile.role === 'Seller' ? sellerCards : [];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div className="card">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--text-heading)', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
              Welcome, {profile.name || profile.email}!
            </h1>
            <p style={{ fontSize: 'var(--text-caption)', color: 'var(--text-muted)' }}>Here's an overview of your account</p>
          </div>
          <span className={roleBadgeClass(profile.role)}>{profile.role}</span>
        </div>
      </div>

      {cards.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(14rem, 1fr))', gap: '1rem' }}>
          {cards.map((card, i) => {
            const Icon = card.icon;
            const isPrimary = i === 0;
            return (
              <button type="button"
                key={card.to}
                onClick={() => navigate(card.to)}
                className={`card card-hover animate-fade-in-up stagger-${i + 1}`}
                style={{
                  textAlign: 'left', cursor: 'pointer', border: isPrimary ? '1px solid var(--accent-gold)' : 'none',
                  width: '100%', fontFamily: 'inherit',
                  background: isPrimary ? 'var(--color-brand-light)' : undefined,
                }}
              >
                <Icon style={{ width: '2rem', height: '2rem', color: 'var(--accent-gold)', marginBottom: '0.75rem' }} />
                <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--text-body)', fontWeight: isPrimary ? 600 : 500, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>{card.title}</h3>
                <p style={{ fontSize: 'var(--text-caption)', color: 'var(--text-muted)' }}>{card.desc}</p>
              </button>
            );
          })}
        </div>
      )}

      <div className="card" style={{ background: 'var(--bg-secondary)' }}>
        <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--text-heading)', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '1rem' }}>Account Details</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(12rem, 1fr))', gap: '1rem', fontSize: 'var(--text-caption)' }}>
          <div>
            <span className="label">Email</span>
            <p style={{ color: 'var(--text-primary)' }}>{profile.email}</p>
          </div>
          <div>
            <span className="label">Role</span>
            <span className={roleBadgeClass(profile.role)}>{profile.role}</span>
          </div>
          {profile.localUserId && (
            <div>
              <span className="label">User ID</span>
              <p style={{ color: 'var(--text-primary)' }}>{profile.localUserId}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;