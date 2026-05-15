'use client';

import { motion } from 'framer-motion';
import { Pencil, Trash2 } from 'lucide-react';
import { StatusBadge } from '@/components/ui/Badge';
import { formatCurrency, formatDate, GAME_EMOJI } from '@/lib/utils';
import type { Ticket } from '@/types';

interface Props {
  ticket: Ticket;
  index: number;
  onClick: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

export function TicketCard({ ticket, index, onClick, onEdit, onDelete }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, delay: index * 0.04, ease: [0.16, 1, 0.3, 1] }}
      onClick={onClick}
      className="group bg-white rounded-2xl border border-slate-100 p-5 cursor-pointer
                 hover:border-indigo-200 hover:shadow-md hover:shadow-indigo-500/5
                 transition-all duration-200"
    >
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-xl shrink-0">
            {GAME_EMOJI[ticket.gameType] ?? '🎟️'}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-slate-900 truncate">{ticket.title}</p>
            <p className="text-xs text-slate-400 mt-0.5">{ticket.gameType} · {ticket.gameNumber ? `#${ticket.gameNumber}` : 'Sin número'}</p>
          </div>
        </div>
        <StatusBadge status={ticket.status} />
      </div>

      <div className="flex items-end justify-between">
        <div>
          <p className="text-lg font-bold text-slate-900">{formatCurrency(ticket.amount)}</p>
          <p className="text-xs text-slate-400 mt-0.5">{formatDate(ticket.gameDate)}</p>
        </div>
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={(e) => { e.stopPropagation(); onEdit(); }}
            className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
          ><Pencil size={13} /></button>
          <button
            onClick={(e) => { e.stopPropagation(); onDelete(); }}
            className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors"
          ><Trash2 size={13} /></button>
        </div>
      </div>
    </motion.div>
  );
}
