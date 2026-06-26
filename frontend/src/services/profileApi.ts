import { api } from './api';
import type { ProfileResponse, SetRoleResponse, EnsureUserResponse, CompleteProfileRequest } from '../types/user';

export const profileApi = {
  getMe: async (): Promise<ProfileResponse> => {
    const response = await api.get<ProfileResponse>('/api/Profile/me');
    return response.data;
  },

  ensureUser: async (): Promise<EnsureUserResponse> => {
    const response = await api.post<EnsureUserResponse>('/api/Profile/Ensure');
    return response.data;
  },

  setRole: async (role: 'Customer' | 'Seller'): Promise<SetRoleResponse> => {
    const response = await api.put<SetRoleResponse>('/api/Profile/me/role', { role });
    return response.data;
  },

  completeProfile: async (data: CompleteProfileRequest): Promise<{ message: string; hasCompletedProfile: boolean }> => {
    const response = await api.put('/api/Profile/me/details', data);
    return response.data;
  },
};
