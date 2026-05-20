'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  Search, ShieldCheck, ChevronLeft, ChevronRight,
  ChevronsLeft, ChevronsRight, Trophy, Clock, XCircle, Ticket,
} from 'lucide-react';
import { adminApi, type AdminTicket } from '@/lib/adminApi';
import type { TicketStatus, GameType } from '@/types';
import { StatusBadge } from '@/components/ui/Badge';
import { TableRowSkeleton } from '@/components/ui/Skeleton';
import { useDebounce } from '@/hooks/useDebounce';
import { useAuth } from '@/context/AuthContext';
import { formatCurrency, formatDate, GAME_TYPES, STATUSES, GAME_EMOJI } from '@/lib/utils';

const selectCls = `border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-600 bg-white
  focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all`;

interface Stats { total: number; ganados: number; pendientes: number; perdidos: number }

async function fetchStats(): Promise<Stats> {
  const [all, ganados, pendientes, perdidos] = await Promise.all([
    adminApi.listAll({ page: 1, pageSize: 1, status: '', gameType: '', q: '' }),
    adminApi.listAll({ page: 1, pageSize: 1, status: 'Ganado', gameType: '', q: '' }),
    adminApi.listAll({ page: 1, pageSize: 1, status: 'Pendiente', gameType: '', q: '' }),
    adminApi.listAll({ page: 1, pageSize: 1, status: 'Perdido', gameType: '', q: '' }),
  ]);
  return { total: all.total, ganados: ganados.total, pendientes: pendientes.total, perdidos: perdidos.total };
}

export default function AdminPage() {
  const { isAdmin, isLoading } = useAuth();
  const router = useRouter();

  const [tickets, setTickets] = useState<AdminTicket[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [stats, setStats] = useState<Stats | null>(null);

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [status, setStatus] = useState<TicketStatus | ''>('');
  const [gameType, setGameType] = useState<GameType | ''>('');
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search);

  useEffect(() => { if (!isLoading && !isAdmin) router.push('/tickets'); }, [isAdmin, isLoading, router]);

  useEffect(() => {
    if (!isAdmin) return;
    fetchStats().then(setStats).catch(() => {});
  }, [isAdmin]);

  const fetchAll = useCallback(async () => {
    if (!isAdmin) return;
    setLoading(true); setError('');
    try {
      const res = await adminApi.listAll({ page, pageSize, status, gameType, q: debouncedSearch });
      setTickets(res.data); setTotal(res.total); setTotalPages(res.totalPages);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setError(msg ?? 'Error al cargar');
    } finally { setLoading(false); }
  }, [page, pageSize, status, gameType, debouncedSearch, isAdmin]);

  useEffect(() => { fetchAll(); }, [fetchAll]);
  useEffect(() => { setPage(1); }, [debouncedSearch, status, gameType, pageSize]);

  const paginationRange = (): (number | '...')[] => {
    const delta = 2;
    const range: (number | '...')[] = [];
    for (let i = Math.max(1, page - delta); i <= Math.min(totalPages, page + delta); i++) range.push(i);
    if ((range[0] as number) > 1) { if ((range[0] as number) > 2) range.unshift('...'); range.unshift(1); }
    const last = range[range.length - 1] as number;
    if (last < totalPages) { if (last < totalPages - 1) range.push('...'); range.push(totalPages); }
    return range;
  };

  if (isLoading || !isAdmin) return null;

  const statCards = [
    {
      label: 'Total boletas',
      value: stats?.total ?? total,
      icon: <Ticket size={18} className="text-indigo-500" />,
      bg: 'bg-indigo-50',
      text: 'text-indigo-700',
    },
    {
      label: 'Ganadas',
      value: stats?.ganados ?? '—',
      icon: <Trophy size={18} className="text-emerald-500" />,
      bg: 'bg-emerald-50',
      text: 'text-emerald-700',
    },
    {
      label: 'Pendientes',
      value: stats?.pendientes ?? '—',
      icon: <Clock size={18} className="text-amber-500" />,
      bg: 'bg-amber-50',
      text: 'text-amber-700',
    },
    {
      label: 'Perdidas',
      value: stats?.perdidos ?? '—',
      icon: <XCircle size={18} className="text-red-400" />,
      bg: 'bg-red-50',
      text: 'text-red-600',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <ShieldCheck size={20} className="text-indigo-600" />
            <h1 className="text-2xl font-bold text-slate-900">Panel Admin</h1>
          </div>
          <p className="text-sm text-slate-400">Vista global de todos los usuarios del sistema</p>
        </div>
        <span className="bg-indigo-50 text-indigo-700 text-xs font-semibold px-3 py-1.5 rounded-full border border-indigo-100">
          Administrador
        </span>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {statCards.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
            className="bg-white rounded-2xl border border-slate-100 px-4 py-4 flex items-center gap-3 shadow-sm"
          >
            <div className={`w-9 h-9 rounded-xl ${s.bg} flex items-center justify-center shrink-0`}>
              {s.icon}
            </div>
            <div>
              <p className="text-xs text-slate-400 leading-none mb-1">{s.label}</p>
              <p className={`text-xl font-bold leading-none ${s.text}`}>
                {typeof s.value === 'number' ? s.value.toLocaleString('es-CO') : s.value}
              </p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 p-4 bg-white rounded-2xl border border-slate-100">
        <div className="relative flex-1 min-w-52">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por título, número, usuario..."
            className="w-full border border-slate-200 rounded-xl pl-10 pr-4 py-2 text-sm text-slate-700 bg-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all" />
        </div>
        <select value={gameType} onChange={(e) => setGameType(e.target.value as GameType | '')} className={selectCls}>
          <option value="">Todos los tipos</option>
          {GAME_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
        </select>
        <select value={status} onChange={(e) => setStatus(e.target.value as TicketStatus | '')} className={selectCls}>
          <option value="">Todos los estados</option>
          {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        <select value={pageSize} onChange={(e) => setPageSize(Number(e.target.value))} className={selectCls}>
          {[20, 50, 100].map((n) => <option key={n} value={n}>{n} / pág</option>)}
        </select>
      </div>

      {error && <div className="bg-red-50 text-red-600 text-sm rounded-xl px-4 py-3 border border-red-100">{error}</div>}

      {/* Table */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm">

        <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            {loading ? 'Cargando...' : `${total.toLocaleString('es-CO')} resultado${total !== 1 ? 's' : ''}`}
          </p>
          {(search || status || gameType) && (
            <button onClick={() => { setSearch(''); setStatus(''); setGameType(''); }}
              className="text-xs text-indigo-600 hover:text-indigo-700 font-medium">
              Limpiar filtros
            </button>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider bg-slate-50">
                <th className="px-4 py-3">Boleta</th>
                <th className="px-4 py-3">Número</th>
                <th className="px-4 py-3">Propietario</th>
                <th className="px-4 py-3">Fecha</th>
                <th className="px-4 py-3 text-right">Valor</th>
                <th className="px-4 py-3">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                Array.from({ length: 10 }).map((_, i) => <TableRowSkeleton key={i} cols={6} />)
              ) : tickets.length === 0 ? (
                <tr><td colSpan={6} className="px-4 py-16 text-center text-slate-400">No se encontraron tickets</td></tr>
              ) : (
                tickets.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-2.5">
                        <span className="text-lg">{GAME_EMOJI[t.gameType]}</span>
                        <div>
                          <p className="font-medium text-slate-800 max-w-[180px] truncate text-xs">{t.title}</p>
                          <p className="text-xs text-slate-400">{t.gameType}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 font-mono text-xs text-slate-500">#{t.gameNumber}</td>
                    <td className="px-4 py-3.5">
                      <p className="text-xs font-medium text-slate-700">{t.owner?.name ?? '—'}</p>
                      <p className="text-xs text-slate-400 truncate max-w-[140px]">{t.owner?.email ?? ''}</p>
                    </td>
                    <td className="px-4 py-3.5 text-xs text-slate-500 whitespace-nowrap">{formatDate(t.gameDate)}</td>
                    <td className="px-4 py-3.5 text-right font-semibold text-xs text-slate-800">{formatCurrency(t.amount)}</td>
                    <td className="px-4 py-3.5"><StatusBadge status={t.status} /></td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100 bg-slate-50">
            <p className="text-xs text-slate-400">
              Pág. <strong className="text-slate-600">{page}</strong> de <strong className="text-slate-600">{totalPages}</strong> · {total.toLocaleString('es-CO')} resultados
            </p>
            <div className="flex items-center gap-1">
              {[
                { icon: <ChevronsLeft size={13} />, action: () => setPage(1), disabled: page === 1 },
                { icon: <ChevronLeft size={13} />, action: () => setPage((p) => p - 1), disabled: page === 1 },
              ].map((btn, i) => (
                <button key={i} onClick={btn.action} disabled={btn.disabled}
                  className="p-1.5 rounded-lg border border-slate-200 text-slate-400 hover:text-slate-700 hover:border-slate-300 disabled:opacity-30 transition-colors bg-white">
                  {btn.icon}
                </button>
              ))}

              {paginationRange().map((item, i) =>
                item === '...' ? (
                  <span key={`d${i}`} className="px-1 text-slate-400 text-xs">…</span>
                ) : (
                  <button key={item} onClick={() => setPage(item as number)}
                    className={`min-w-[28px] h-7 text-xs rounded-lg border transition-colors ${
                      page === item ? 'bg-indigo-600 text-white border-indigo-600' : 'border-slate-200 text-slate-500 hover:text-slate-700 hover:border-slate-300 bg-white'
                    }`}>
                    {item}
                  </button>
                )
              )}

              {[
                { icon: <ChevronRight size={13} />, action: () => setPage((p) => p + 1), disabled: page === totalPages },
                { icon: <ChevronsRight size={13} />, action: () => setPage(totalPages), disabled: page === totalPages },
              ].map((btn, i) => (
                <button key={i} onClick={btn.action} disabled={btn.disabled}
                  className="p-1.5 rounded-lg border border-slate-200 text-slate-400 hover:text-slate-700 hover:border-slate-300 disabled:opacity-30 transition-colors bg-white">
                  {btn.icon}
                </button>
              ))}
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}
