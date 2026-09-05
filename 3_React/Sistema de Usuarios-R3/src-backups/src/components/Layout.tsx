import { NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  CalendarDays,
  HeartPulse,
  Home,
  LogOut,
  Moon,
  Sun,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
export default function Layout() {
  const { usuario, logout } = useAuth();
  const nav = useNavigate();
  const [dark, setDark] = [
    document.documentElement.dataset.theme === "dark",
    (v: boolean) => {
      document.documentElement.dataset.theme = v ? "dark" : "light";
      localStorage.setItem("petcare_theme", v ? "dark" : "light");
    },
  ];
  const go = () => {
    logout();
    nav("/login");
  };
  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <HeartPulse /> PetCare
        </div>
        <nav>
          <NavLink to="/">
            <Home /> Inicio
          </NavLink>
          <NavLink to="/mascotas">
            <HeartPulse /> Mis mascotas
          </NavLink>
          <NavLink to="/turnos">
            <CalendarDays /> Turnos
          </NavLink>
          {usuario?.rol === "Administrador" && (
            <NavLink to="/admin">
              <Home /> Administración
            </NavLink>
          )}
        </nav>
        <div className="side-user">
          <b>
            {usuario?.nombre} {usuario?.apellido}
          </b>
          <small>{usuario?.rol}</small>
          <button onClick={() => setDark(!dark)}>
            {dark ? <Sun /> : <Moon />} {dark ? "Claro" : "Oscuro"}
          </button>
          <button onClick={go}>
            <LogOut /> Cerrar sesión
          </button>
        </div>
      </aside>
      <main>
        <header className="mobile-header">
          <span className="brand">
            <HeartPulse /> PetCare
          </span>
          <button aria-label="Cambiar tema" onClick={() => setDark(!dark)}>
            {dark ? <Sun /> : <Moon />}
          </button>
        </header>
        <Outlet />
      </main>
    </div>
  );
}
