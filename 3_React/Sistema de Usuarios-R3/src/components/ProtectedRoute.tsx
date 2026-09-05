import { Navigate } from 'react-router-dom';
import type { ReactElement } from 'react';
import { useAuth } from '../context/AuthContext';
import PageState from './PageState';

type Props = {
  children: ReactElement;
  role?: string | string[];
};

// Protege rutas en frontend; el backend mantiene la autorización real.
export default function ProtectedRoute({ children, role }: Props) {
  const { usuario, loading } = useAuth();

  if (loading) return <PageState type="loading" message="Cargando sesión…" />;
  if (!usuario) return <Navigate to="/login" replace />;

  if (role) {
    const allowed = Array.isArray(role) ? role : [role];
    if (!allowed.includes(usuario.rol)) return <Navigate to="/" replace />;
  }

  return children;
}
