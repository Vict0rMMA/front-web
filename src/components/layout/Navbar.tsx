'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Ticket, LayoutGrid, ChevronDown, LogOut, ShieldCheck } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export function Navbar() {
  const { user, isAdmin, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const handleLogout = () => { logout(); router.push('/login'); };

  return (
    <nav className="sticky top-0 z-40 bg-white border-b border-slate-200">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 flex items-center justify-between h-14">

        <Link href="/tickets" className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center">
            <Ticket size={14} className="text-white" />
          </div>
          <span className="font-bold text-slate-900 text-sm">Mi Boleta</span>
        </Link>

        <div className="flex items-center gap-1">
          <Link href="/tickets"
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              pathname.startsWith('/tickets') ? 'bg-indigo-50 text-indigo-700' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
            }`}>
            <LayoutGrid size={14} /> Mis boletas
          </Link>

          {isAdmin && (
            <Link href="/admin"
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                pathname.startsWith('/admin') ? 'bg-rose-50 text-rose-700' : 'text-slate-500 hover:text-rose-600 hover:bg-rose-50'
              }`}>
              <ShieldCheck size={14} />
              <span className="bg-rose-100 text-rose-600 text-xs font-semibold px-1.5 py-0.5 rounded">Admin</span>
            </Link>
          )}
        </div>

        <div className="relative">
          <button onClick={() => setOpen(!open)}
            className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-colors">
            <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold ${isAdmin ? 'bg-rose-100 text-rose-600' : 'bg-indigo-100 text-indigo-600'}`}>
              {user?.name?.[0]?.toUpperCase() ?? '?'}
            </div>
            <span className="hidden sm:block text-sm text-slate-700 max-w-[100px] truncate font-medium">{user?.name}</span>
            <ChevronDown size={14} className={`text-slate-400 transition-transform ${open ? 'rotate-180' : ''}`} />
          </button>

          <AnimatePresence>
            {open && (
              <>
                <div className="fixed inset-0" onClick={() => setOpen(false)} />
                <motion.div
                  initial={{ opacity: 0, y: -6, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -6, scale: 0.97 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 mt-2 w-52 rounded-xl border border-slate-200 bg-white shadow-lg overflow-hidden z-50"
                >
                  <div className="px-4 py-3 border-b border-slate-100">
                    <p className="text-xs text-slate-400 mb-0.5">Tu cuenta</p>
                    <p className="text-sm font-medium text-slate-800 truncate">{user?.email}</p>
                    {isAdmin && <span className="mt-1 inline-block text-xs font-semibold text-rose-600 bg-rose-50 px-2 py-0.5 rounded">Administrador</span>}
                  </div>
                  <button onClick={handleLogout}
                    className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors">
                    <LogOut size={14} /> Cerrar sesión
                  </button>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
      </div>
    </nav>
  );
}
