import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import { authService } from '../services/authService';
import type { User } from '../types';

type Auth = {
  usuario: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<User>;
  logout: () => void;
  setUsuario: (u: User | null) => void;
};

const AuthContext = createContext<Auth | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [usuario, setUsuario] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const theme = localStorage.getItem('petcare_theme') || 'light';
    document.documentElement.dataset.theme = theme;

    const token = localStorage.getItem('petcare_token');
    if (!token) {
      setLoading(false);
      return;
    }

    authService
      .getMe()
      .then((data) => setUsuario(data))
      .catch(() => localStorage.removeItem('petcare_token'))
      .finally(() => setLoading(false));
  }, []);

  const login = async (email: string, password: string) => {
    const data = await authService.login(email, password);
    localStorage.setItem('petcare_token', data.token);
    setUsuario(data.usuario);
    return data.usuario;
  };

  const logout = () => {
    authService.logout().catch(() => {});
    localStorage.removeItem('petcare_token');
    setUsuario(null);
  };

  return (
    <AuthContext.Provider value={{ usuario, loading, login, logout, setUsuario }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth requiere AuthProvider');
  return ctx;
};
