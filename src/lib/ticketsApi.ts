import { apiClient } from './apiClient';
import type { Ticket, TicketFilters, PaginatedResponse, CreateTicketDto, UpdateTicketDto } from '@/types';

interface TicketsResponse {
  data: Ticket[];
  meta: { total: number; page: number; pageSize: number; totalPages: number };
}

export const ticketsApi = {
  list: async (filters: TicketFilters): Promise<PaginatedResponse<Ticket>> => {
    const params = new URLSearchParams();
    params.set('page', String(filters.page));
    params.set('pageSize', String(filters.pageSize));
    if (filters.status) params.set('status', filters.status);
    if (filters.gameType) params.set('gameType', filters.gameType);
    if (filters.q) params.set('q', filters.q);
    const res = await apiClient.get<TicketsResponse>(`/tickets?${params.toString()}`);
    return {
      data:       res.data.data,
      total:      res.data.meta.total,
      page:       res.data.meta.page,
      pageSize:   res.data.meta.pageSize,
      totalPages: res.data.meta.totalPages,
    };
  },

  get: async (id: string): Promise<Ticket> => {
    const res = await apiClient.get<{ data: Ticket }>(`/tickets/${id}`);
    return res.data.data;
  },

  create: async (dto: CreateTicketDto): Promise<Ticket> => {
    const res = await apiClient.post<{ data: Ticket }>('/tickets', dto);
    return res.data.data;
  },

  update: async (id: string, dto: UpdateTicketDto): Promise<Ticket> => {
    const res = await apiClient.put<{ data: Ticket }>(`/tickets/${id}`, dto);
    return res.data.data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/tickets/${id}`);
  },
};
