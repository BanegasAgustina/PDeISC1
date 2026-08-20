import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { formatTaskDate } from '../utils/dates'
import { useTasks } from '../context/TaskContext'

export default function TaskCard({ tarea }) {
  const { cambiarEstadoTarea } = useTasks()
  return <article className={`task-card ${tarea.completada ? 'is-complete' : ''}`}>
    <button className="check-button" onClick={() => cambiarEstadoTarea(tarea.id)} aria-label={tarea.completada ? 'Marcar como pendiente' : 'Marcar como completada'}>{tarea.completada && '✓'}</button>
    <div className="task-content"><div className="task-title-row"><h3>{tarea.titulo}</h3><Link className="detail-link" to={`/tarea/${tarea.id}`} aria-label={`Ver detalle de ${tarea.titulo}`}><ArrowRight size={18}/></Link></div><p>{tarea.descripcion}</p><div className="task-top"><time>{formatTaskDate(tarea.fechaTarea)}</time><span className={`status ${tarea.completada ? 'done' : 'pending'}`}><i></i>{tarea.completada ? 'Completada' : 'Pendiente'}</span></div></div>
  </article>
}
