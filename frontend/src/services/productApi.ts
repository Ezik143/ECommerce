import { api } from './api';
import type { ProductResponse, CreateProductRequest, UpdateProductRequest } from '../types/api';

export const productApi = {
  getAll: async (categoryId?: number): Promise<ProductResponse[]> => {
    const params = categoryId !== undefined ? { categoryId } : {};
    const response = await api.get<ProductResponse[]>('/api/Product', { params });
    return response.data;
  },

  getById: async (id: number): Promise<ProductResponse> => {
    const response = await api.get<ProductResponse>(`/api/Product/${id}`);
    return response.data;
  },

  create: async (data: CreateProductRequest): Promise<ProductResponse> => {
    const response = await api.post<ProductResponse>('/api/Product', data);
    return response.data;
  },

  update: async (id: number, data: UpdateProductRequest): Promise<ProductResponse> => {
    const response = await api.put<ProductResponse>(`/api/Product/${id}`, data);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/api/Product/${id}`);
  },
};
