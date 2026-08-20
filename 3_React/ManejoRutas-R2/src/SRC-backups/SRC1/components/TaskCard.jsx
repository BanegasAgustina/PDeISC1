import { Link } from 'react-router-dom'
import { useTasks } from '../context/TaskContext'

const formatDate = (date) => new Intl.DateTimeFormat('es-AR', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(`${date}T12:00:00`))

export default function TaskCard({ tarea }) {
  const { cambiarEstadoTarea } = useTasks()
  return <article className={`task-card ${tarea.completada ? 'is-complete' : ''}`}>
    <button className="check-button" onClick={() => cambiarEstadoTarea(tarea.id)} aria-label={tarea.completada ? 'Marcar como pendiente' : 'Marcar como completada'}>{tarea.completada && '✓'}</button>
    <div className="task-content"><div className="task-top"><span className={`status ${tarea.completada ? 'done' : 'pending'}`}><i></i>{tarea.completada ? 'Completada' : 'Pendiente'}</span><time>Creada el {formatDate(tarea.fechaCreacion)}</time></div><h3>{tarea.titulo}</h3><p>{tarea.descripcion}</p><Link className="detail-link" to={`/tarea/${tarea.id}`}>Ver detalle <span>→</span></Link></div>
  </article>
}
