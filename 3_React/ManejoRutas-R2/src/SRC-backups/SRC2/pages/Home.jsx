import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus } from 'lucide-react'
import { useTasks } from '../context/TaskContext'
import TaskStats from '../components/TaskStats'
import TaskList from '../components/TaskList'
import EmptyState from '../components/EmptyState'
import TaskSearch from '../components/TaskSearch'
import TaskFilters from '../components/TaskFilters'
import TaskSort from '../components/TaskSort'

export default function Home() {
  // Estados locales de herramientas; nunca modifican la lista original del contexto.
  const { tareas } = useTasks(); const [filter, setFilter] = useState('todas'); const [search, setSearch] = useState(''); const [sort, setSort] = useState('date-asc')
  // Combina texto, filtro y ordenamiento sobre una copia de las tareas.
  const visibles = useMemo(() => {
    const term = search.toLocaleLowerCase().trim()
    const filtered = tareas.filter((t) => (filter === 'todas' || filter === 'completadas' ? filter === 'todas' || t.completada : !t.completada) && (!term || `${t.titulo} ${t.descripcion}`.toLocaleLowerCase().includes(term)))
    const [field, direction] = sort.split('-'); const multiplier = direction === 'asc' ? 1 : -1
    return [...filtered].sort((a, b) => { const first = field === 'title' ? a.titulo.localeCompare(b.titulo, 'es') : field === 'created' ? a.fechaCreacion.localeCompare(b.fechaCreacion) : a.fechaTarea.localeCompare(b.fechaTarea); return first * multiplier })
  }, [tareas, filter, search, sort])
  return <main className="page"><section className="home-heading"><h1>Mis tareas</h1><p>Organizá tus pendientes y mantené todo en un solo lugar.</p><Link className="button" to="/crear"><Plus size={16}/> Nueva tarea</Link><TaskStats tareas={tareas}/></section>
    <section className="tasks-section"><div className="task-tools"><TaskSearch value={search} onChange={setSearch}/><TaskSort value={sort} onChange={setSort}/></div>
    <TaskFilters filter={filter} onChange={setFilter}/>
    {visibles.length ? <TaskList tareas={visibles} grouped={sort.startsWith('date')}/> : <EmptyState search={search || filter !== 'todas'}/>}</section>
  </main>
}
