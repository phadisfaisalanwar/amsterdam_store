import { createContext, useContext, useState, ReactNode } from 'react';
import faizPhoto from '../../WhatsApp Image 2026-09-24 faiz.jpeg';

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
  login: (email: string, password: string) => Promise<boolean>;
  register: (name: string, email: string, password: string, phone: string) => Promise<boolean>;
  logout: () => void;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

const mockUsers: User[] = [
  {
    id: 1,
    name: 'Admin Amsterdam',
    email: 'admin@amsterdam.store',
    phone: '081234567890',
    role: 'admin',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop&auto=format',
  },
  {
    id: 2,
    name: 'Faiz Zulfikar',
    email: 'sari@email.com',
    phone: '082345678901',
    role: 'customer',
    avatar: faizPhoto,
    address: 'Jl. Sudirman No. 45',
    city: 'Jakarta',
  },
];

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  const login = async (email: string, _password: string): Promise<boolean> => {
    await new Promise(r => setTimeout(r, 800));
    const found = mockUsers.find(u => u.email === email);
    if (found) {
      setUser(found);
      return true;
    }
    return false;
  };

  const register = async (name: string, email: string, _password: string, phone: string): Promise<boolean> => {
    await new Promise(r => setTimeout(r, 800));
    const newUser: User = {
      id: Date.now(),
      name,
      email,
      phone,
      role: 'customer',
    };
    setUser(newUser);
    return true;
  };

  const logout = () => setUser(null);

  return (
    <AuthContext.Provider value={{ user, login, register, logout, isAdmin: user?.role === 'admin' }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
