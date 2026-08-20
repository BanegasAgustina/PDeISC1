import { NavLink, Link } from 'react-router-dom'
import { useTasks } from '../context/TaskContext'

export default function Header() {
  const { tema, alternarTema } = useTasks()
  return <header className="header"><div className="header-inner">
    <Link className="brand" to="/"><span className="brand-mark">✓</span><span>task<span>flow</span></span></Link>
    <nav aria-label="Navegación principal"><NavLink end to="/">Mis tareas</NavLink><NavLink to="/crear">Crear tarea</NavLink></nav>
    <div className="header-actions"><button className="theme-toggle" onClick={alternarTema} aria-label="Cambiar modo de color" title="Cambiar tema">{tema === 'light' ? '☾' : '☀'}</button><Link className="button button-small" to="/crear"><b>＋</b><span>Nueva tarea</span></Link></div>
  </div></header>
}
