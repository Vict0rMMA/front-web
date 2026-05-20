export interface User {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
}

export type GameType = 'Lotería' | 'Rifa' | 'Sorteo' | 'Boleta' | 'Juego ocasional';
export type TicketStatus = 'Pendiente' | 'Ganado' | 'Perdido';

export interface Ticket {
  id: string;
  title: string;
  gameType: GameType;
  gameNumber: string;
  gameDate: string;
  amount: number;
  place: string;
  status: TicketStatus;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface TicketFilters {
  page: number;
  pageSize: number;
  status?: TicketStatus | '';
  gameType?: GameType | '';
  q?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface CreateTicketDto {
  title: string;
  gameType: GameType;
  gameNumber: string;
  gameDate: string;
  amount: number;
  place: string;
  status: TicketStatus;
  notes?: string;
}

export type UpdateTicketDto = Partial<CreateTicketDto>;
