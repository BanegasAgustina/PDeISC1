// Componente reutilizable que protege rutas en la interfaz.
// Importante: el backend mantiene la protección real.
import { Navigate } from "react-router-dom";
import type { ReactElement } from "react";
import { useAuth } from "../context/AuthContext";
export default function ProtectedRoute({
  children,
  role,
}: {
  children: ReactElement;
  role?: string;
}) {
  const { usuario, loading } = useAuth();
  if (loading) return <p className="page-state">Cargando sesión…</p>;
  if (!usuario) return <Navigate to="/login" replace />;
  if (role && usuario.rol !== role) return <Navigate to="/" replace />;
  return children;
}
