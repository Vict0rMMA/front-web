'use client';

import { useState, type FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Loader2, Mail, Lock, Ticket } from 'lucide-react';
import { authApi } from '@/lib/authApi';
import { useAuth } from '@/context/AuthContext';
import type { User } from '@/types';

const inputCls = `w-full border border-slate-200 rounded-xl pl-10 pr-4 py-3 text-sm text-slate-900 bg-white
  placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all`;

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    const trimmed = email.trim();
    if (!trimmed.includes('@')) { setError('Ingresa un correo válido'); return; }
    setLoading(true);
    try {
      const data = await authApi.login(trimmed, password);
      const user: User = data.user ?? { id: '', name: trimmed.split('@')[0], email: trimmed, role: 'user' };
      login(data.token, user);
      let role = user.role ?? 'user';
      try { role = JSON.parse(atob(data.token.split('.')[1])).role ?? role; } catch { /* ignore */ }
      router.push(role === 'admin' ? '/admin' : '/tickets');
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setError(msg ?? 'Credenciales incorrectas');
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex bg-slate-50">
      {/* Left branding panel */}
      <div className="hidden lg:flex flex-col justify-between w-[44%] bg-indigo-600 p-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 to-indigo-800" />
        <div className="absolute top-0 right-0 w-80 h-80 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/4" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/4" />

        <div className="relative flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
            <Ticket size={16} className="text-white" />
          </div>
          <span className="font-bold text-white text-lg">Mi Boleta</span>
        </div>

        <div className="relative">
          <p className="text-indigo-200 text-sm font-medium mb-3 uppercase tracking-wider">Para todos tus juegos</p>
          <h1 className="text-4xl font-bold text-white leading-tight mb-4">
            Nunca más olvides<br />si ganaste
          </h1>
          <p className="text-indigo-200 leading-relaxed">
            Registra tus boletas, rifas y sorteos.<br />Consulta cuándo jugaste y cuánto apostaste.
          </p>
          <div className="flex flex-wrap gap-2 mt-6">
            {['Lotería', 'Rifas', 'Sorteos', 'Boletas'].map((tag) => (
              <span key={tag} className="text-xs px-3 py-1.5 rounded-full bg-white/15 text-white/80">{tag}</span>
            ))}
          </div>
        </div>

        <p className="relative text-indigo-300 text-xs">© 2026 Mi Boleta</p>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-sm"
        >
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center">
              <Ticket size={15} className="text-white" />
            </div>
            <span className="font-bold text-slate-900 text-lg">Mi Boleta</span>
          </div>

          <h2 className="text-2xl font-bold text-slate-900 mb-1">Bienvenido de nuevo</h2>
          <p className="text-sm text-slate-500 mb-8">Ingresa tus credenciales para continuar</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
                className="bg-red-50 text-red-600 text-sm rounded-xl px-4 py-3 border border-red-100">
                {error}
              </motion.div>
            )}

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Correo electrónico</label>
              <div className="relative">
                <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input type="text" inputMode="email" value={email} onChange={(e) => setEmail(e.target.value)}
                  required autoComplete="email" className={inputCls} placeholder="tu@email.com" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Contraseña</label>
              <div className="relative">
                <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                  required autoComplete="current-password" className={inputCls} placeholder="••••••••" />
              </div>
            </div>

            <button type="submit" disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white font-semibold py-3 rounded-xl transition-colors mt-2">
              {loading && <Loader2 size={16} className="animate-spin" />}
              {loading ? 'Ingresando...' : 'Iniciar sesión'}
            </button>
          </form>

          <p className="text-center text-sm text-slate-500 mt-6">
            ¿No tienes cuenta?{' '}
            <Link href="/register" className="text-indigo-600 font-semibold hover:text-indigo-700">Regístrate</Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
