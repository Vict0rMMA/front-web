import { apiClient } from './apiClient';
import type { Ticket, TicketFilters, PaginatedResponse } from '@/types';

export interface AdminTicket extends Ticket {
  owner: { id: string; name: string; email: string };
}

export interface AdminFilters extends TicketFilters {
  userId?: string;
}

interface AdminResponse {
  data: AdminTicket[];
  meta: { total: number; page: number; pageSize: number; totalPages: number };
}

export const adminApi = {
  listAll: async (filters: AdminFilters): Promise<PaginatedResponse<AdminTicket>> => {
    const params = new URLSearchParams();
    params.set('page', String(filters.page));
    params.set('pageSize', String(filters.pageSize));
    if (filters.status) params.set('status', filters.status);
    if (filters.gameType) params.set('gameType', filters.gameType);
    if (filters.q) params.set('q', filters.q);
    if (filters.userId) params.set('userId', filters.userId);
    const res = await apiClient.get<AdminResponse>(`/admin/tickets?${params.toString()}`);
    return {
      data:       res.data.data,
      total:      res.data.meta.total,
      page:       res.data.meta.page,
      pageSize:   res.data.meta.pageSize,
      totalPages: res.data.meta.totalPages,
    };
  },
};
