import { api } from './api';
import type { AddressResponse, CreateAddressRequest, UpdateAddressRequest } from '../types/api';

export const addressApi = {
  getAddresses: async (userId: number): Promise<AddressResponse[]> => {
    const response = await api.get<AddressResponse[]>('/api/Address', { params: { id: userId } });
    return response.data;
  },

  getAddressById: async (id: number): Promise<AddressResponse> => {
    const response = await api.get<AddressResponse>(`/api/Address/${id}`);
    return response.data;
  },

  createAddress: async (data: CreateAddressRequest): Promise<AddressResponse> => {
    const response = await api.post<AddressResponse>('/api/Address', data);
    return response.data;
  },

  updateAddress: async (id: number, data: UpdateAddressRequest): Promise<AddressResponse> => {
    const response = await api.put<AddressResponse>(`/api/Address/${id}`, data);
    return response.data;
  },

  deleteAddress: async (id: number): Promise<void> => {
    await api.delete(`/api/Address/${id}`);
  },
};