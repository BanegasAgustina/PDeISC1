import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  CalendarDays,
  HeartPulse,
  Home,
  LogOut,
  Menu,
  Moon,
  Stethoscope,
  Sun,
  UserCheck,
  Users,
  X,
} from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../hooks/useTheme';
import BackToTop from './BackToTop';
import Avatar from './Avatar';

type NavItem = { to: string; label: string; icon: React.ReactNode; roles: string[] };

const NAV: NavItem[] = [
  // CLIENTE
  { to: '/', label: 'Inicio', icon: <Home size={18} />, roles: ['Cliente'] },
  { to: '/mascotas', label: 'Mis mascotas', icon: <HeartPulse size={18} />, roles: ['Cliente'] },
  { to: '/turnos', label: 'Turnos', icon: <CalendarDays size={18} />, roles: ['Cliente'] },
  { to: '/perfil', label: 'Perfil', icon: <UserCheck size={18} />, roles: ['Cliente'] },

  // VETERINARIO
  { to: '/', label: 'Inicio', icon: <Home size={18} />, roles: ['Veterinario'] },
  { to: '/pacientes', label: 'Mis pacientes', icon: <HeartPulse size={18} />, roles: ['Veterinario'] },
  { to: '/turnos', label: 'Turnos', icon: <CalendarDays size={18} />, roles: ['Veterinario'] },
  { to: '/consultas', label: 'Consultas', icon: <Stethoscope size={18} />, roles: ['Veterinario'] },
  { to: '/perfil', label: 'Perfil', icon: <UserCheck size={18} />, roles: ['Veterinario'] },

  // ADMIN
  { to: '/admin', label: 'Inicio', icon: <Home size={18} />, roles: ['Administrador'] },
  { to: '/admin/usuarios', label: 'Usuarios', icon: <Users size={18} />, roles: ['Administrador'] },
  { to: '/admin/mascotas', label: 'Mascotas', icon: <HeartPulse size={18} />, roles: ['Administrador'] },
  { to: '/admin/turnos', label: 'Turnos', icon: <CalendarDays size={18} />, roles: ['Administrador'] },
  { to: '/perfil', label: 'Perfil', icon: <UserCheck size={18} />, roles: ['Administrador'] },
];

export default function Layout() {
  const { usuario, logout } = useAuth();
  const nav = useNavigate();
  const { dark, toggle } = useTheme();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const items = NAV.filter((item) => usuario && item.roles.includes(usuario.rol));

  const cerrarSesion = () => {
    logout();
    nav('/login', { replace: true });
  };

  const closeSidebar = () => setSidebarOpen(false);

  return (
    <div className={`app-shell${sidebarOpen ? ' sidebar-open' : ''}`}>
      <button
        type="button"
        className="sidebar-backdrop"
        aria-label="Cerrar menú"
        onClick={closeSidebar}
        tabIndex={sidebarOpen ? 0 : -1}
      />

      <aside className="sidebar" aria-label="Navegación principal">
        <div className="sidebar-top">
          <div className="brand">
            <HeartPulse aria-hidden="true" /> PetCare
          </div>
          <button
            type="button"
            className="sidebar-close"
            aria-label="Cerrar menú"
            onClick={closeSidebar}
          >
            <X size={20} />
          </button>
        </div>

        <nav>
          {items.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/' || item.to === '/admin'}
              onClick={closeSidebar}
            >
              {item.icon}
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="side-user">
          <div className="side-user-header">
            <Avatar
              src={usuario?.fotoUrl}
              name={`${usuario?.nombre || ''} ${usuario?.apellido || ''}`}
              size={42}
            />
            <div className="user-info">
              <b>{usuario?.nombre} {usuario?.apellido}</b>
              <small>{usuario?.rol}</small>
              <small className="user-email">{usuario?.email}</small>
            </div>
          </div>
          <button type="button" onClick={toggle} title={dark ? 'Modo claro' : 'Modo oscuro'}>
            {dark ? <Sun size={18} /> : <Moon size={18} />}
            {dark ? 'Modo claro' : 'Modo oscuro'}
          </button>
          <button type="button" onClick={cerrarSesion}>
            <LogOut size={18} /> Cerrar sesión
          </button>
        </div>
      </aside>

      <main className="main-content">
        <header className="mobile-header">
          <button
            type="button"
            className="menu-btn"
            aria-label="Abrir menú"
            aria-expanded={sidebarOpen}
            onClick={() => setSidebarOpen(true)}
          >
            <Menu size={22} />
          </button>
          <span className="brand">
            <HeartPulse aria-hidden="true" /> PetCare
          </span>
          <button type="button" aria-label="Cambiar tema" title={dark ? 'Modo claro' : 'Modo oscuro'} onClick={toggle}>
            {dark ? <Sun size={20} /> : <Moon size={20} />}
          </button>
        </header>
        <Outlet />
        <BackToTop />
      </main>
    </div>
  );
}
