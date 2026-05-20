import type { GameType, TicketStatus } from '@/types';

export function formatCurrency(amount: number): string {
  return '$ ' + new Intl.NumberFormat('es-CO', { maximumFractionDigits: 0 }).format(amount);
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' });
}

export function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString('es-CO', { dateStyle: 'long', timeStyle: 'short' });
}

export const GAME_EMOJI: Record<GameType, string> = {
  'Lotería':         '🎰',
  'Rifa':            '🎟️',
  'Sorteo':          '🏆',
  'Boleta':          '🎫',
  'Juego ocasional': '🎲',
};

export const STATUS_CONFIG: Record<TicketStatus, { classes: string; dot: string }> = {
  Pendiente: { classes: 'bg-amber-50 text-amber-700 border border-amber-200',  dot: 'bg-amber-400' },
  Ganado:    { classes: 'bg-emerald-50 text-emerald-700 border border-emerald-200', dot: 'bg-emerald-500' },
  Perdido:   { classes: 'bg-red-50 text-red-600 border border-red-200',        dot: 'bg-red-400' },
};

export const GAME_TYPES: GameType[] = ['Lotería', 'Rifa', 'Sorteo', 'Boleta', 'Juego ocasional'];
export const STATUSES: TicketStatus[] = ['Pendiente', 'Ganado', 'Perdido'];
