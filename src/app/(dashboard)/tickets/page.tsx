'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Search, Ticket as TicketIcon } from 'lucide-react';
import { ticketsApi } from '@/lib/ticketsApi';
import type { Ticket, TicketFilters, GameType, TicketStatus, CreateTicketDto } from '@/types';
import { TicketCard } from '@/components/tickets/TicketCard';
import { TicketForm } from '@/components/tickets/TicketForm';
import { TicketDetail } from '@/components/tickets/TicketDetail';
import { Modal } from '@/components/ui/Modal';
import { TicketSkeleton } from '@/components/ui/Skeleton';
import { useDebounce } from '@/hooks/useDebounce';
import { GAME_TYPES, STATUSES } from '@/lib/utils';

const selectCls = `border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-600 bg-white
  focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all`;

export default function TicketsPage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<TicketFilters>({ page: 1, pageSize: 20, status: '', gameType: '', q: '' });
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search);

  const [selected, setSelected] = useState<Ticket | null>(null);
  const [editing, setEditing] = useState<Ticket | null>(null);
  const [creating, setCreating] = useState(false);
  const [deleting, setDeleting] = useState<Ticket | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchTickets = useCallback(async () => {
    setLoading(true);
    try {
      const res = await ticketsApi.list({ ...filters, q: debouncedSearch });
      setTickets(res.data);
      setTotal(res.total);
    } finally { setLoading(false); }
  }, [filters, debouncedSearch]);

  useEffect(() => { fetchTickets(); }, [fetchTickets]);
  useEffect(() => { setFilters((f) => ({ ...f, page: 1 })); }, [debouncedSearch]);

  const handleCreate = async (dto: CreateTicketDto) => { await ticketsApi.create(dto); setCreating(false); fetchTickets(); };
  const handleUpdate = async (dto: CreateTicketDto) => {
    if (!editing) return;
    await ticketsApi.update(editing.id, dto);
    setEditing(null); setSelected(null); fetchTickets();
  };
  const handleDelete = async () => {
    if (!deleting) return;
    setDeleteLoading(true);
    try { await ticketsApi.delete(deleting.id); setDeleting(null); fetchTickets(); }
    finally { setDeleteLoading(false); }
  };

  const totalPages = Math.ceil(total / filters.pageSize);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Mis Boletas</h1>
          <p className="text-sm text-slate-400 mt-0.5">{loading ? '—' : `${total} registro${total !== 1 ? 's' : ''}`}</p>
        </div>
        <motion.button whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }} onClick={() => setCreating(true)}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors shadow-sm">
          <Plus size={16} /> Nueva boleta
        </motion.button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-48">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por título o número..."
            className="w-full border border-slate-200 rounded-xl pl-10 pr-4 py-2 text-sm text-slate-700 bg-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all" />
        </div>
        <select value={filters.gameType} onChange={(e) => setFilters((f) => ({ ...f, page: 1, gameType: e.target.value as GameType | '' }))} className={selectCls}>
          <option value="">Todos los tipos</option>
          {GAME_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
        </select>
        <select value={filters.status} onChange={(e) => setFilters((f) => ({ ...f, page: 1, status: e.target.value as TicketStatus | '' }))} className={selectCls}>
          <option value="">Todos los estados</option>
          {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      {/* Grid */}
      <AnimatePresence mode="wait">
        {loading ? (
          <div key="skeleton" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => <TicketSkeleton key={i} />)}
          </div>
        ) : tickets.length === 0 ? (
          <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="flex flex-col items-center py-24 text-center">
            <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
              <TicketIcon size={24} className="text-slate-400" />
            </div>
            <p className="text-slate-600 font-medium">No hay boletas</p>
            <p className="text-sm text-slate-400 mt-1">Crea tu primera boleta con el botón de arriba</p>
          </motion.div>
        ) : (
          <div key="grid" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {tickets.map((t, i) => (
              <TicketCard key={t.id} ticket={t} index={i}
                onClick={() => setSelected(t)} onEdit={() => setEditing(t)} onDelete={() => setDeleting(t)} />
            ))}
          </div>
        )}
      </AnimatePresence>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3 pt-2">
          <button disabled={filters.page === 1} onClick={() => setFilters((f) => ({ ...f, page: f.page - 1 }))}
            className="px-4 py-2 text-sm border border-slate-200 rounded-xl text-slate-500 hover:text-slate-800 hover:border-slate-300 disabled:opacity-40 transition-colors bg-white">
            ← Anterior
          </button>
          <span className="text-sm text-slate-500 px-3 py-2 bg-white rounded-xl border border-slate-200">
            {filters.page} / {totalPages}
          </span>
          <button disabled={filters.page === totalPages} onClick={() => setFilters((f) => ({ ...f, page: f.page + 1 }))}
            className="px-4 py-2 text-sm border border-slate-200 rounded-xl text-slate-500 hover:text-slate-800 hover:border-slate-300 disabled:opacity-40 transition-colors bg-white">
            Siguiente →
          </button>
        </div>
      )}

      <Modal open={creating} onClose={() => setCreating(false)} title="Nueva boleta">
        <TicketForm onSubmit={handleCreate} onCancel={() => setCreating(false)} />
      </Modal>
      <Modal open={!!selected && !editing} onClose={() => setSelected(null)} title="Detalle de boleta">
        {selected && <TicketDetail id={selected.id} onClose={() => setSelected(null)} onEdit={() => setEditing(selected)} />}
      </Modal>
      <Modal open={!!editing} onClose={() => setEditing(null)} title="Editar boleta">
        {editing && <TicketForm initial={editing} onSubmit={handleUpdate} onCancel={() => setEditing(null)} />}
      </Modal>
      <Modal open={!!deleting} onClose={() => setDeleting(null)} title="Eliminar boleta" size="sm">
        <div className="space-y-4">
          <p className="text-sm text-slate-600">¿Seguro que quieres eliminar <strong className="text-slate-900">{deleting?.title}</strong>? No se puede deshacer.</p>
          <div className="flex gap-3">
            <button onClick={() => setDeleting(null)} className="flex-1 border border-slate-200 text-slate-600 hover:border-slate-300 py-2.5 rounded-xl text-sm font-medium transition-colors">Cancelar</button>
            <button onClick={handleDelete} disabled={deleteLoading}
              className="flex-1 bg-red-500 hover:bg-red-600 disabled:opacity-60 text-white py-2.5 rounded-xl text-sm font-semibold transition-colors flex items-center justify-center">
              {deleteLoading ? 'Eliminando...' : 'Eliminar'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
