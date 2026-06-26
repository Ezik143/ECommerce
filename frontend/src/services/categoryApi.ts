import { api } from './api';
import type { CategoryResponse, CreateCategoryRequest, UpdateCategoryRequest } from '../types/api';

export const categoryApi = {
  getAll: async (parentId?: number | null): Promise<CategoryResponse[]> => {
    const params = parentId !== undefined && parentId !== null ? { parentId } : {};
    const response = await api.get<CategoryResponse[]>('/api/Category', { params });
    return response.data;
  },

  getById: async (id: number): Promise<CategoryResponse> => {
    const response = await api.get<CategoryResponse>(`/api/Category/${id}`);
    return response.data;
  },

  getTree: async (): Promise<CategoryResponse[]> => {
    const response = await api.get<CategoryResponse[]>('/api/Category/tree');
    return response.data;
  },

  getChildren: async (id: number): Promise<CategoryResponse[]> => {
    const response = await api.get<CategoryResponse[]>(`/api/Category/${id}/children`);
    return response.data;
  },

  getAncestors: async (id: number): Promise<CategoryResponse[]> => {
    const response = await api.get<CategoryResponse[]>(`/api/Category/${id}/ancestors`);
    return response.data;
  },

  getCategoryProducts: async (id: number, includeSubcategories = false): Promise<any[]> => {
    const response = await api.get<any[]>(`/api/Category/${id}/products`, {
      params: { includeSubcategories }
    });
    return response.data;
  },

  create: async (data: CreateCategoryRequest): Promise<CategoryResponse> => {
    const response = await api.post<CategoryResponse>('/api/Category', data);
    return response.data;
  },

  update: async (id: number, data: UpdateCategoryRequest): Promise<CategoryResponse> => {
    const response = await api.put<CategoryResponse>(`/api/Category/${id}`, data);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/api/Category/${id}`);
  },
};
