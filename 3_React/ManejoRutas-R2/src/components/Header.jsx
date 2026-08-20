import { NavLink } from 'react-router-dom'
import { Moon, Sun } from 'lucide-react'
import { useTasks } from '../context/TaskContext'

export default function Header() {
  // Obtiene el tema actual y la acción global para alternarlo.
  const { tema, alternarTema } = useTasks()
  return <header className="header"><div className="header-inner">
    {/* Navegación mínima: la creación se realiza exclusivamente desde la Home. */}
    <nav aria-label="Navegación principal"><NavLink end to="/">Mis tareas</NavLink></nav>
    <div className="header-actions"><button className="theme-toggle" onClick={alternarTema} aria-label="Cambiar modo de color" title="Cambiar tema">{tema === 'light' ? <Moon size={17}/> : <Sun size={17}/>}</button></div>
  </div></header>
}
