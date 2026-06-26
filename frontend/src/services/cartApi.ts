import { api } from './api';
import type { CartResponse, CartItemResponse, AddCartItemRequest, UpdateCartItemRequest } from '../types/api';

export const cartApi = {
  getMyCart: async (): Promise<CartResponse> => {
    const response = await api.get<CartResponse>('/api/Cart/mine');
    return response.data;
  },

  deleteCart: async (id: number): Promise<void> => {
    await api.delete(`/api/Cart/${id}`);
  },

  getCartItems: async (cartId: number): Promise<CartItemResponse[]> => {
    const response = await api.get<CartItemResponse[]>(`/api/CartItem/cart/${cartId}`);
    return response.data;
  },

  addCartItem: async (data: AddCartItemRequest): Promise<CartItemResponse> => {
    const response = await api.post<CartItemResponse>('/api/CartItem', data);
    return response.data;
  },

  updateCartItem: async (id: number, data: UpdateCartItemRequest): Promise<CartItemResponse> => {
    const response = await api.put<CartItemResponse>(`/api/CartItem/${id}`, data);
    return response.data;
  },

  deleteCartItem: async (id: number): Promise<void> => {
    await api.delete(`/api/CartItem/${id}`);
  },
};
