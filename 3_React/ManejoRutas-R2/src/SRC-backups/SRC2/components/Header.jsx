import { NavLink, Link } from 'react-router-dom'
import { Moon, Plus, Sun } from 'lucide-react'
import { useTasks } from '../context/TaskContext'

export default function Header() {
  // Obtiene el tema actual y la acción global para alternarlo.
  const { tema, alternarTema } = useTasks()
  return <header className="header"><div className="header-inner">
    {/* Marca textual simple; evita el icono del logo anterior. */}
    <Link className="brand" to="/"><span>task<span>flow</span></span></Link>
    {/* Solo se mantiene la sección principal en la navegación. */}
    <nav aria-label="Navegación principal"><NavLink end to="/">Mis tareas</NavLink></nav>
    <div className="header-actions"><button className="theme-toggle" onClick={alternarTema} aria-label="Cambiar modo de color" title="Cambiar tema">{tema === 'light' ? <Moon size={17}/> : <Sun size={17}/>}</button><Link className="button button-small" to="/crear"><Plus size={16}/><span>Nueva tarea</span></Link></div>
  </div></header>
}
