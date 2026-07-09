import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { AuthUser } from '../types';
import { authenticateUser } from '../authConfig';

interface AuthContextValue {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (userId: string, password: string) => Promise<boolean>;
  logout: () => void;
  error: string;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const stored = sessionStorage.getItem('par_auth_user');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (parsed && parsed.userId && parsed.role) {
          setUser(parsed);
        }
      } catch {}
    }
    setIsLoading(false);
  }, []);

  const login = useCallback(async (userId: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    setError('');
    try {
      const result = await authenticateUser(userId, password);
      if (result) {
        setUser(result);
        sessionStorage.setItem('par_auth_user', JSON.stringify(result));
        setIsLoading(false);
        return true;
      }
      setError('Invalid User ID or Password');
      setIsLoading(false);
      return false;
    } catch {
      setError('Authentication failed. Please try again.');
      setIsLoading(false);
      return false;
    }
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    sessionStorage.removeItem('par_auth_user');
  }, []);

  const clearError = useCallback(() => setError(''), []);

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, isLoading, login, logout, error, clearError }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
