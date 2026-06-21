import { api } from './api';
import type { OrderResponse, CreateOrderRequest, UpdateOrderRequest } from '../types/api';

export const orderApi = {
  getAllOrders: async (): Promise<OrderResponse[]> => {
    const response = await api.get<OrderResponse[]>('/api/Order');
    return response.data;
  },

  getOrderById: async (id: number): Promise<OrderResponse> => {
    const response = await api.get<OrderResponse>(`/api/Order/${id}`);
    return response.data;
  },

  createOrder: async (data: CreateOrderRequest): Promise<OrderResponse> => {
    const response = await api.post<OrderResponse>('/api/Order', data);
    return response.data;
  },

  updateOrder: async (id: number, data: UpdateOrderRequest): Promise<OrderResponse> => {
    const response = await api.put<OrderResponse>(`/api/Order/${id}`, data);
    return response.data;
  },

  deleteOrder: async (id: number): Promise<void> => {
    await api.delete(`/api/Order/${id}`);
  },
};