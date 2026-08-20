import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { formatTaskDate } from '../utils/dates'
import { useTasks } from '../context/TaskContext'

// Presenta una tarea y permite alternar su estado sin abandonar la lista.
export default function TaskCard({ tarea }) {
  // Acción centralizada que persiste el nuevo estado de la tarea.
  const { cambiarEstadoTarea } = useTasks()
  // Reduce la descripción de la tarjeta para mantener el listado compacto.
  const words = tarea.descripcion.trim().split(/\s+/)
  const shortDescription = words.length > 10 ? `${words.slice(0, 10).join(' ')}...` : tarea.descripcion
  return <article className={`task-card ${tarea.completada ? 'is-complete' : ''}`}>
    <button className="check-button" onClick={() => cambiarEstadoTarea(tarea.id)} aria-label={tarea.completada ? 'Marcar como pendiente' : 'Marcar como completada'}>{tarea.completada && '✓'}</button>
    <div className="task-content"><div className="task-title-row"><h3>{tarea.titulo}</h3><Link className="detail-link" to={`/tarea/${tarea.id}`} aria-label={`Ver detalle de ${tarea.titulo}`}><ArrowRight size={18}/></Link></div><p>{shortDescription}</p><div className="task-top"><time>{formatTaskDate(tarea.fechaTarea)}</time><span className={`status ${tarea.completada ? 'done' : 'pending'}`}><i></i>{tarea.completada ? 'Completada' : 'Pendiente'}</span></div></div>
  </article>
}
