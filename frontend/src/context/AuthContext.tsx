import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from 'react';
import type { User, AuthResponse } from '../types';
import api from '../services/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Rehydrate auth state from localStorage on app load
  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    const res = await api.post<{ data: AuthResponse }>('/auth/login', {
      email,
      password,
    });
    const { accessToken, user } = res.data.data;
    localStorage.setItem('token', accessToken);
    localStorage.setItem('user', JSON.stringify(user));
    setToken(accessToken);
    setUser(user);
  };

  const register = async (name: string, email: string, password: string) => {
    const res = await api.post<{ data: AuthResponse }>('/auth/register', {
      name,
      email,
      password,
    });
    const { accessToken, user } = res.data.data;
    localStorage.setItem('token', accessToken);
    localStorage.setItem('user', JSON.stringify(user));
    setToken(accessToken);
    setUser(user);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{ user, token, login, register, logout, isLoading }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook — cleaner than calling useContext(AuthContext) every time
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
