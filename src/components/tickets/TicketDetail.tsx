'use client';

import { useEffect, useState } from 'react';
import { Pencil } from 'lucide-react';
import { ticketsApi } from '@/lib/ticketsApi';
import { StatusBadge } from '@/components/ui/Badge';
import { formatCurrency, formatDateTime, GAME_EMOJI } from '@/lib/utils';
import type { Ticket } from '@/types';

interface Props { id: string; onClose: () => void; onEdit: () => void; }

export function TicketDetail({ id, onClose, onEdit }: Props) {
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { ticketsApi.get(id).then(setTicket).finally(() => setLoading(false)); }, [id]);

  if (loading) return (
    <div className="space-y-3">
      {Array.from({ length: 4 }).map((_, i) => <div key={i} className="skeleton h-12 rounded-xl" />)}
    </div>
  );
  if (!ticket) return <p className="text-center text-slate-400 py-8">No se encontró esta boleta</p>;

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-2xl">
            {GAME_EMOJI[ticket.gameType]}
          </div>
          <div>
            <p className="font-semibold text-slate-900">{ticket.title}</p>
            <p className="text-xs text-slate-400 mt-0.5">{ticket.gameType}</p>
          </div>
        </div>
        <StatusBadge status={ticket.status} />
      </div>

      <div className="grid grid-cols-2 gap-2">
        {[
          ['Número', `#${ticket.gameNumber}`],
          ['Valor', formatCurrency(ticket.amount)],
          ['Fecha del sorteo', formatDateTime(ticket.gameDate)],
          ['Lugar', ticket.place || '—'],
        ].map(([label, value]) => (
          <div key={label} className="bg-slate-50 rounded-xl p-3">
            <p className="text-xs text-slate-400 mb-1">{label}</p>
            <p className="text-sm font-medium text-slate-800">{value}</p>
          </div>
        ))}
      </div>

      {ticket.notes && (
        <div className="bg-slate-50 rounded-xl p-4">
          <p className="text-xs text-slate-400 mb-1">Notas</p>
          <p className="text-sm text-slate-700">{ticket.notes}</p>
        </div>
      )}

      <div className="flex gap-3 pt-1">
        <button onClick={onClose} className="flex-1 border border-slate-200 text-slate-600 hover:border-slate-300 py-2.5 rounded-xl text-sm font-medium transition-colors">
          Volver
        </button>
        <button onClick={onEdit} className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white py-2.5 rounded-xl text-sm font-semibold transition-colors flex items-center justify-center gap-2">
          <Pencil size={14} /> Editar
        </button>
      </div>
    </div>
  );
}
