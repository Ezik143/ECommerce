import { Routes, Route, Navigate } from 'react-router-dom';
import { UserProfileProvider } from './contexts/UserProfileContext';
import { CartProvider } from './contexts/CartContext';
import { ThemeProvider } from './contexts/ThemeContext';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import { ToastProvider } from './components/ui/Toast';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import { ProductsPage } from './pages/ProductsPage';
import { ProductDetailPage } from './pages/ProductDetailPage';
import { CartPage } from './pages/CartPage';
import { CategoriesPage } from './pages/CategoriesPage';
import { CategoryPage } from './pages/CategoryPage';
import { CheckoutPage } from './pages/CheckoutPage';
import { OrdersPage } from './pages/OrdersPage';
import { AddressesPage } from './pages/AddressesPage';
import { SellerProductsPage } from './pages/SellerProductsPage';
import { SellerOrdersPage } from './pages/SellerOrdersPage';
import { SellerDashboard } from './pages/SellerDashboard';

const App = () => {
  return (
    <ThemeProvider>
      <UserProfileProvider>
        <ToastProvider>
          <CartProvider>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route element={<Layout />}>
              <Route element={<ProtectedRoute />}>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/products" element={<ProductsPage />} />
                <Route path="/products/:id" element={<ProductDetailPage />} />
                <Route path="/categories" element={<CategoriesPage />} />
                <Route path="/categories/:slug" element={<CategoryPage />} />
                <Route path="/cart" element={<CartPage />} />
                <Route path="/checkout" element={<CheckoutPage />} />
                <Route path="/orders" element={<OrdersPage />} />
                <Route path="/addresses" element={<AddressesPage />} />
                <Route path="/seller/products" element={<SellerProductsPage />} />
                <Route path="/seller/orders" element={<SellerOrdersPage />} />
                <Route path="/seller/dashboard" element={<SellerDashboard />} />
              </Route>
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
          </CartProvider>
        </ToastProvider>
      </UserProfileProvider>
    </ThemeProvider>
  );
};

export default App;
