'use client';

import { useState, type FormEvent } from 'react';
import { Loader2 } from 'lucide-react';
import type { Ticket, CreateTicketDto, TicketStatus } from '@/types';
import { GAME_TYPES, STATUSES, GAME_EMOJI } from '@/lib/utils';

interface Props {
  initial?: Ticket;
  onSubmit: (dto: CreateTicketDto) => Promise<void>;
  onCancel: () => void;
}

const inputCls = `w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-900 bg-white
  placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all`;

export function TicketForm({ initial, onSubmit, onCancel }: Props) {
  const [form, setForm] = useState<CreateTicketDto>({
    title:      initial?.title ?? '',
    gameType:   initial?.gameType ?? 'Lotería',
    gameNumber: initial?.gameNumber ?? '',
    gameDate:   initial?.gameDate ? initial.gameDate.slice(0, 16) : '',
    amount:     initial?.amount ?? 0,
    place:      initial?.place ?? '',
    status:     initial?.status ?? 'Pendiente',
    notes:      initial?.notes ?? '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const set = (field: keyof CreateTicketDto, value: string | number) =>
    setForm((f) => ({ ...f, [field]: value }));

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await onSubmit({ ...form, gameDate: new Date(form.gameDate).toISOString(), amount: Number(form.amount) });
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setError(msg ?? 'Error al guardar');
    } finally { setLoading(false); }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <div className="bg-red-50 text-red-600 text-sm rounded-xl px-4 py-3 border border-red-100">{error}</div>}

      <div>
        <label className="block text-xs font-medium text-slate-600 mb-1.5">Título *</label>
        <input type="text" value={form.title} onChange={(e) => set('title', e.target.value)} required className={inputCls} placeholder="Lotería de Medellín" />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1.5">Tipo *</label>
          <select value={form.gameType} onChange={(e) => set('gameType', e.target.value)} className={inputCls}>
            {GAME_TYPES.map((t) => <option key={t} value={t}>{GAME_EMOJI[t]} {t}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1.5">Estado *</label>
          <select value={form.status} onChange={(e) => set('status', e.target.value as TicketStatus)} className={inputCls}>
            {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1.5">Número</label>
          <input type="text" value={form.gameNumber} onChange={(e) => set('gameNumber', e.target.value)} className={inputCls} placeholder="1234" />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1.5">Valor ($)</label>
          <input type="number" min="0" value={form.amount} onChange={(e) => set('amount', e.target.value)} className={inputCls} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1.5">Fecha del sorteo *</label>
          <input type="datetime-local" value={form.gameDate} onChange={(e) => set('gameDate', e.target.value)} required className={inputCls} />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1.5">Lugar</label>
          <input type="text" value={form.place} onChange={(e) => set('place', e.target.value)} className={inputCls} placeholder="Tienda La Esquina" />
        </div>
      </div>

      <div>
        <label className="block text-xs font-medium text-slate-600 mb-1.5">Notas</label>
        <textarea value={form.notes} onChange={(e) => set('notes', e.target.value)} rows={3} className={`${inputCls} resize-none`} placeholder="Notas adicionales..." />
      </div>

      <div className="flex gap-3 pt-2">
        <button type="button" onClick={onCancel}
          className="flex-1 border border-slate-200 text-slate-600 hover:border-slate-300 hover:text-slate-800 py-2.5 rounded-xl text-sm font-medium transition-colors">
          Cancelar
        </button>
        <button type="submit" disabled={loading}
          className="flex-1 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white py-2.5 rounded-xl text-sm font-semibold transition-colors flex items-center justify-center gap-2">
          {loading && <Loader2 size={14} className="animate-spin" />}
          {loading ? 'Guardando...' : initial ? 'Actualizar' : 'Crear boleta'}
        </button>
      </div>
    </form>
  );
}
