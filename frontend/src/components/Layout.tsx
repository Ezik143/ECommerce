import { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { Bars3Icon, XMarkIcon, ShoppingCartIcon, ChevronDownIcon } from '@heroicons/react/20/solid';
import { Menu, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { useAuth } from '../hooks/useAuth0';
import { useUserProfile } from '../hooks/useUserProfile';
import { useCart } from '../hooks/useCart';
import LoginButton from './LoginButton';

const Layout = () => {
  const { isAuthenticated } = useAuth();
  const { profile } = useUserProfile();
  const { itemCount } = useCart();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isPublicRoute = location.pathname === '/' || location.pathname === '/callback';

  const isCustomer = profile?.role === 'Customer';
  const isSeller = profile?.role === 'Seller';

  const customerLinks = [
    { to: '/products', label: 'Products' },
    { to: '/products', label: 'Categories' },
    { to: '/cart', label: `Cart (${itemCount})` },
    { to: '/orders', label: 'Orders' },
    { to: '/addresses', label: 'Addresses' },
  ];

  const sellerLinks = [
    { to: '/seller/dashboard', label: 'Dashboard' },
    { to: '/seller/products', label: 'My Products' },
    { to: '/seller/orders', label: 'My Orders' },
  ];

  const navLinks = isCustomer ? customerLinks : isSeller ? sellerLinks : [];

  const NavLink = ({ to, label }: { to: string; label: string }) => {
    const isActive = location.pathname === to;
    return (
      <Link
        to={to}
        className={`nav-link ${isActive ? 'active' : ''}`}
        onClick={() => setMobileMenuOpen(false)}
      >
        {label}
      </Link>
    );
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {!isPublicRoute && (
        <header style={{ position: 'sticky', top: 0, zIndex: 50, backgroundColor: 'var(--bg-secondary)', borderBottom: '1px solid var(--border-light)' }}>
          <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '4rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
              <Link to="/dashboard" style={{ fontFamily: 'var(--font-heading)', fontSize: '1.375rem', color: 'var(--accent-gold)', textDecoration: 'none', flexShrink: 0 }}>
                Kintsugi
              </Link>
              {isAuthenticated && (
                <nav style={{ display: 'none', alignItems: 'center', gap: '1.5rem' }} className="desktop-nav">
                  {navLinks.map((link) => (
                    <NavLink key={link.label} {...link} />
                  ))}
                </nav>
              )}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              {isAuthenticated && (
                <>
                  {isCustomer && (
                    <Link to="/cart" style={{ position: 'relative', color: 'var(--text-secondary)', transition: 'color 0.2s' }}
                      className="cart-icon-link">
                      <ShoppingCartIcon style={{ width: '1.5rem', height: '1.5rem' }} />
                      {itemCount > 0 && (
                        <span style={{
                          position: 'absolute', top: '-0.5rem', right: '-0.5rem',
                          backgroundColor: 'var(--accent-gold)', color: '#1C1817',
                          fontSize: '0.6875rem', fontWeight: 600,
                          width: '1.25rem', height: '1.25rem',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          borderRadius: '50%'
                        }}>
                          {itemCount > 99 ? '99+' : itemCount}
                        </span>
                      )}
                    </Link>
                  )}
                  <Menu as="div" style={{ position: 'relative', display: 'none' }} className="desktop-menu">
                    <Menu.Button style={{
                      display: 'flex', alignItems: 'center', gap: '0.375rem',
                      color: 'var(--text-secondary)', fontSize: '0.875rem',
                      fontFamily: 'var(--font-body)', fontWeight: 500,
                      background: 'none', border: 'none', cursor: 'pointer',
                      padding: '0.375rem 0.5rem', borderRadius: 'var(--radius-sm)',
                      transition: 'all 0.2s'
                    }}>
                      <span style={{ color: 'var(--accent-gold)', fontFamily: 'var(--font-body)' }}>{profile?.name || profile?.email}</span>
                      <ChevronDownIcon style={{ width: '1rem', height: '1rem' }} />
                    </Menu.Button>
                    <Transition
                      as={Fragment}
                      enter="transition ease-out duration-200"
                      enterFrom="transform opacity-0 scale-95"
                      enterTo="transform opacity-100 scale-100"
                      leave="transition ease-in duration-150"
                      leaveFrom="transform opacity-100 scale-100"
                      leaveTo="transform opacity-0 scale-95"
                    >
                      <Menu.Items style={{
                        position: 'absolute', right: 0, marginTop: '0.375rem',
                        width: '12rem', transformOrigin: 'top right',
                        background: 'var(--bg-card)', border: '1px solid var(--border)',
                        borderRadius: 'var(--radius)', boxShadow: 'var(--shadow-elevated)',
                        padding: '0.25rem 0', outline: 'none'
                      }}>
                        <div style={{ padding: '0.75rem 1rem', borderBottom: '1px solid var(--border-light)' }}>
                          <p style={{ fontSize: '0.8125rem', color: 'var(--text-primary)', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {profile?.name || profile?.email}
                          </p>
                          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{profile?.role}</p>
                        </div>
                        <Menu.Item>
                          {({ active }) => (
                            <Link to="/dashboard" style={{
                              display: 'block', padding: '0.5rem 1rem', fontSize: '0.875rem',
                              color: active ? 'var(--accent-gold)' : 'var(--text-secondary)',
                              background: active ? 'rgba(212,163,115,0.06)' : 'transparent',
                              textDecoration: 'none', transition: 'all 0.15s'
                            }}>
                              Dashboard
                            </Link>
                          )}
                        </Menu.Item>
                        <Menu.Item>
                          <LoginButton />
                        </Menu.Item>
                      </Menu.Items>
                    </Transition>
                  </Menu>
                  <button
                    style={{
                      display: 'block', background: 'none', border: 'none',
                      color: 'var(--text-secondary)', cursor: 'pointer'
                    }}
                    className="mobile-menu-btn"
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    aria-label="Toggle menu"
                  >
                    {mobileMenuOpen ? <XMarkIcon style={{ width: '1.5rem', height: '1.5rem' }} /> : <Bars3Icon style={{ width: '1.5rem', height: '1.5rem' }} />}
                  </button>
                </>
              )}
            </div>
          </div>

          {mobileMenuOpen && (
            <div style={{ borderTop: '1px solid var(--border-light)', background: 'var(--bg-card)' }}>
              <div style={{ padding: '1rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {navLinks.map((link) => (
                  <NavLink key={link.label} {...link} />
                ))}
                <Link to="/dashboard" className="nav-link" onClick={() => setMobileMenuOpen(false)}>
                  Dashboard
                </Link>
                <LoginButton />
              </div>
            </div>
          )}
        </header>
      )}
      <main className="container page-wrapper" style={{ flex: 1 }}>
        <Outlet />
      </main>
      <footer className="footer">
        Kintsugi — curated commerce
      </footer>

      <style>{`
        @media (min-width: 768px) {
          .desktop-nav { display: flex !important; }
          .desktop-menu { display: block !important; }
          .mobile-menu-btn { display: none !important; }
          .cart-icon-link:hover { color: var(--accent-gold) !important; }
        }
      `}</style>
    </div>
  );
};

export default Layout;