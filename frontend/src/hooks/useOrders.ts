import { useState, useCallback } from 'react';
import { orderApi } from '../services/orderApi';
import { addressApi } from '../services/addressApi';
import { useUserProfile } from './useUserProfile';
import type { OrderResponse, CreateOrderRequest, UpdateOrderRequest } from '../types/api';
import { useToast } from '../components/ui/Toast';

export const useOrders = () => {
  const [orders, setOrders] = useState<OrderResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { success, error: showError } = useToast();
  const { profile } = useUserProfile();

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await orderApi.getAllOrders();
      setOrders(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load orders';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  const createOrder = useCallback(async (data: CreateOrderRequest) => {
    try {
      setLoading(true);
      const order = await orderApi.createOrder(data);
      success('Order placed successfully');
      await fetchOrders();
      return order;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to place order';
      showError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchOrders, success, showError]);

  const updateOrder = useCallback(async (id: number, data: UpdateOrderRequest) => {
    try {
      setLoading(true);
      const order = await orderApi.updateOrder(id, data);
      success('Order updated');
      await fetchOrders();
      return order;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update order';
      showError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchOrders, success, showError]);

  const getOrderById = useCallback(async (id: number) => {
    try {
      const order = await orderApi.getOrderById(id);
      return order;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load order';
      showError(message);
      throw err;
    }
  }, [showError]);

  const getAddresses = useCallback(async () => {
    const userId = profile?.localUserId;
    if (userId == null) return [];
    try {
      return await addressApi.getAddresses(userId);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load addresses';
      showError(message);
      return [];
    }
  }, [profile?.localUserId, showError]);

  return {
    orders,
    loading,
    error,
    fetchOrders,
    createOrder,
    updateOrder,
    getOrderById,
    getAddresses,
  };
};