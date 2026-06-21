import { createContext, useContext, useState, useCallback, useEffect, useRef, type ReactNode } from 'react';
import { cartApi } from '../services/cartApi';
import { productApi } from '../services/productApi';
import { useToast } from '../components/ui/Toast';
import { useAuth } from '../hooks/useAuth0';
import type { CartResponse } from '../types/api';

interface CartContextValue {
  cart: CartResponse | null;
  loading: boolean;
  error: string | null;
  fetchCart: () => Promise<void>;
  addToCart: (productId: number, quantity?: number) => Promise<void>;
  updateQuantity: (cartItemId: number, quantity: number) => Promise<void>;
  removeItem: (cartItemId: number) => Promise<void>;
  clearCart: () => Promise<void>;
  itemCount: number;
  totalAmount: number;
}

const CartContext = createContext<CartContextValue | null>(null);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [cart, setCart] = useState<CartResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { success, error: showError } = useToast();
  const { isAuthenticated, getAccessToken } = useAuth();
  const getTokenRef = useRef(getAccessToken);
  getTokenRef.current = getAccessToken;

  const fetchCart = useCallback(async () => {
    if (!isAuthenticated) {
      setCart(null);
      return;
    }
    try {
      setLoading(true);
      setError(null);
      await getTokenRef.current();
      const data = await cartApi.getMyCart();
      setCart(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load cart';
      setError(message);
      setCart(null);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated) fetchCart();
  }, [isAuthenticated, fetchCart]);

  const addToCart = useCallback(async (productId: number, quantity = 1) => {
    if (!cart) {
      showError('Cart not loaded');
      return;
    }

    try {
      await getTokenRef.current();
      const product = await productApi.getById(productId);
      if (product.stockQuantity < quantity) {
        showError('Not enough stock available');
        return;
      }
    } catch {
      showError('Failed to verify product');
      return;
    }

    try {
      setLoading(true);
      await cartApi.addCartItem({ cartId: cart.cartId, productId, quantity });
      success('Added to cart');
      await fetchCart();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to add to cart';
      showError(message);
    } finally {
      setLoading(false);
    }
  }, [cart, fetchCart, success, showError]);

  const updateQuantity = useCallback(async (cartItemId: number, quantity: number) => {
    if (quantity < 1) {
      await removeItem(cartItemId);
      return;
    }

    try {
      await getTokenRef.current();
      setLoading(true);
      await cartApi.updateCartItem(cartItemId, { quantity });
      success('Cart updated');
      await fetchCart();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update quantity';
      showError(message);
    } finally {
      setLoading(false);
    }
  }, [fetchCart, success, showError]);

  const removeItem = useCallback(async (cartItemId: number) => {
    try {
      await getTokenRef.current();
      setLoading(true);
      await cartApi.deleteCartItem(cartItemId);
      success('Item removed');
      await fetchCart();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to remove item';
      showError(message);
    } finally {
      setLoading(false);
    }
  }, [fetchCart, success, showError]);

  const clearCart = useCallback(async () => {
    if (!cart) return;
    try {
      await getTokenRef.current();
      setLoading(true);
      await cartApi.deleteCart(cart.cartId);
      setCart(null);
      success('Cart cleared');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to clear cart';
      showError(message);
    } finally {
      setLoading(false);
    }
  }, [cart, success, showError]);

  const itemCount = cart?.items?.reduce((sum, item) => sum + item.quantity, 0) ?? 0;
  const totalAmount = cart?.totalAmount ?? 0;

  return (
    <CartContext.Provider value={{
      cart, loading, error, fetchCart, addToCart, updateQuantity, removeItem, clearCart,
      itemCount, totalAmount,
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = (): CartContextValue => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
};
