import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useTasks } from '../context/TaskContext'
import TaskStats from '../components/TaskStats'
import TaskList from '../components/TaskList'
import EmptyState from '../components/EmptyState'

export default function Home() {
  const { tareas } = useTasks(); const [filter, setFilter] = useState('todas'); const [search, setSearch] = useState('')
  const visibles = useMemo(() => tareas.filter((t) => (filter === 'todas' || filter === 'completadas' ? filter === 'todas' || t.completada : !t.completada) && t.titulo.toLowerCase().includes(search.toLowerCase().trim())), [tareas, filter, search])
  const filters = [['todas', 'Todas'], ['pendientes', 'Pendientes'], ['completadas', 'Completadas']]
  return <main className="page"><section className="hero-copy"><p className="eyebrow">TU ESPACIO DE ENFOQUE</p><h1>Organizá tus tareas.<br/><em>Simplificá tu día.</em></h1><p className="intro">Todo lo que necesitás hacer, en un solo lugar. Priorizá, avanzá y celebrá cada logro.</p><Link className="button hero-button" to="/crear">Crear nueva tarea <span>→</span></Link></section>
    <TaskStats tareas={tareas}/>
    <section className="tasks-section"><div className="section-heading"><div><h2>Mis tareas</h2><p>{visibles.length} {visibles.length === 1 ? 'tarea visible' : 'tareas visibles'}</p></div><label className="search"><span>⌕</span><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar tarea..." aria-label="Buscar por título" /></label></div>
    <div className="filters" role="group" aria-label="Filtrar tareas">{filters.map(([id, label]) => <button key={id} className={filter === id ? 'active' : ''} onClick={() => setFilter(id)}>{label}</button>)}</div>
    {visibles.length ? <TaskList tareas={visibles}/> : <EmptyState search={search || filter !== 'todas'}/>}</section>
  </main>
}
