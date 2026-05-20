'use client';

import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { User } from '@/types';

function decodeJwt(token: string): Partial<User> {
  try {
    return JSON.parse(atob(token.split('.')[1]));
  } catch {
    return {};
  }
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAdmin: boolean;
  isLoading: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    if (storedToken && storedUser) {
      const parsed: User = JSON.parse(storedUser);
      const jwt = decodeJwt(storedToken);
      setToken(storedToken);
      setUser({ ...parsed, role: jwt.role ?? parsed.role ?? 'user' });
    }
    setIsLoading(false);
  }, []);

  const login = (newToken: string, newUser: User) => {
    const jwt = decodeJwt(newToken);
    const userWithRole: User = { ...newUser, role: jwt.role ?? newUser.role ?? 'user' };
    localStorage.setItem('token', newToken);
    localStorage.setItem('user', JSON.stringify(userWithRole));
    setToken(newToken);
    setUser(userWithRole);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, isAdmin: user?.role === 'admin', isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be inside AuthProvider');
  return ctx;
}
