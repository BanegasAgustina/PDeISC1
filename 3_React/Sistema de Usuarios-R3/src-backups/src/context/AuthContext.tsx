// Context evita pasar usuario y funciones de sesión manualmente por cada componente.
import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import api from "../services/api";
import type { User } from "../types";
// Define la forma de los datos compartidos por toda la aplicación.
type Auth = {
  usuario: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
};
const C = createContext<Auth | null>(null);
export function AuthProvider({ children }: { children: ReactNode }) {
  const [usuario, setUsuario] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    // Al abrir, restaura tema y valida un token existente con la API.
    document.documentElement.dataset.theme =
      localStorage.getItem("petcare_theme") || "light";
    const token = localStorage.getItem("petcare_token");
    if (!token) {
      setLoading(false);
      return;
    }
    api
      .get("/auth/me")
      .then((r) => setUsuario(r.data))
      .catch(() => localStorage.removeItem("petcare_token"))
      .finally(() => setLoading(false));
  }, []);
  const login = async (email: string, password: string) => {
    // Solicita JWT y guarda únicamente el token.
    const { data } = await api.post("/auth/login", { email, password });
    localStorage.setItem("petcare_token", data.token);
    setUsuario(data.usuario);
  };
  const logout = () => {
    // Borrar el token hace que el usuario deje de estar autenticado.
    localStorage.removeItem("petcare_token");
    setUsuario(null);
  };
  return (
    <C.Provider value={{ usuario, loading, login, logout }}>
      {children}
    </C.Provider>
  );
}
// Hook pequeño para consumir el Context y evitar repetir useContext en las páginas.
export const useAuth = () => {
  const c = useContext(C);
  if (!c) throw new Error("useAuth requiere AuthProvider");
  return c;
};
