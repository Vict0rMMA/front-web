import { apiClient } from './apiClient';
import type { User } from '@/types';

export const authApi = {
  register: async (name: string, email: string, password: string) => {
    const res = await apiClient.post('/auth/register', { name, email, password });
    return res.data.data as { user: User; token: string };
  },

  login: async (email: string, password: string) => {
    const res = await apiClient.post('/auth/login', { email, password });
    return res.data.data as { token: string; user?: User };
  },
};
