import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { apiRequest } from '../data/api';

export interface User {
  id: number;
  name: string;
  email: string;
  phone: string;
  role: 'customer' | 'admin';
  avatar?: string;
  address?: string;
  city?: string;
}

interface AuthContextType {
  user: User | null;
  authReady: boolean;
  login: (email: string, password: string) => Promise<User>;
  register: (name: string, email: string, password: string, phone: string) => Promise<User>;
  resetPasswordWithGoogle: (credential: string, email: string, password: string) => Promise<User>;
  logout: () => void;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [authReady, setAuthReady] = useState(false);

  useEffect(() => {
    apiRequest<{ user: User | null }>('auth.php?action=me')
      .then(payload => setUser(payload.user))
      .catch(() => setUser(null))
      .finally(() => setAuthReady(true));
  }, []);

  const login = async (email: string, password: string): Promise<User> => {
    const payload = await apiRequest<{ user: User }>('auth.php', {
      method: 'POST',
      body: JSON.stringify({ action: 'login', email, password }),
    });
    setUser(payload.user);
    return payload.user;
  };

  const register = async (name: string, email: string, password: string, phone: string): Promise<User> => {
    const payload = await apiRequest<{ user: User }>('auth.php', {
      method: 'POST',
      body: JSON.stringify({ action: 'register', name, email, password, phone }),
    });
    setUser(payload.user);
    return payload.user;
  };

  const resetPasswordWithGoogle = async (credential: string, email: string, password: string): Promise<User> => {
    const payload = await apiRequest<{ user: User }>('auth.php', {
      method: 'POST',
      body: JSON.stringify({ action: 'reset-password-google', credential, email, password }),
    });
    setUser(payload.user);
    return payload.user;
  };

  const logout = () => {
    setUser(null);
    void apiRequest('auth.php', { method: 'POST', body: JSON.stringify({ action: 'logout' }) });
  };

  return (
    <AuthContext.Provider value={{ user, authReady, login, register, resetPasswordWithGoogle, logout, isAdmin: user?.role === 'admin' }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
