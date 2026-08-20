import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useTasks } from '../context/TaskContext'
import { ArrowLeft, Check, RotateCcw, Trash2 } from 'lucide-react'
import { formatLongDate } from '../utils/dates'
import ConfirmModal from '../components/ConfirmModal'
export default function TaskDetail() {
  // Lee el id de la URL y las acciones centralizadas del contexto.
  const { id } = useParams(); const { obtenerTareaPorId, cambiarEstadoTarea, eliminarTarea } = useTasks(); const navigate = useNavigate()
  // Controla la apertura del modal antes de una eliminación irreversible.
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const tarea = obtenerTareaPorId(id)

  // Muestra una vista clara si el enlace apunta a una tarea inexistente.
  if (!tarea) return <main className="page"><section className="not-found"><h1>Tarea no encontrada</h1><p>Es posible que haya sido eliminada o que el enlace no sea válido.</p><Link className="button" to="/">Volver a tareas</Link></section></main>

  // Elimina únicamente después de aceptar el modal y vuelve al listado.
  const confirmRemove = () => { eliminarTarea(id); navigate('/') }

  return <main className="page narrow-page"><Link className="back-link" to="/"><ArrowLeft size={16}/> Volver a mis tareas</Link><article className="detail-card"><p className="detail-label">TAREA</p><h1>{tarea.titulo}</h1><p className="detail-description">{tarea.descripcion}</p><div className="detail-info"><div><span>Fecha</span><strong>{formatLongDate(tarea.fechaTarea)}</strong></div><div><span>Creada</span><strong>{formatLongDate(tarea.fechaCreacion)}</strong></div><div><span>Estado</span><span className={`status ${tarea.completada ? 'done' : 'pending'}`}><i></i>{tarea.completada ? 'Completada' : 'Pendiente'}</span></div></div><div className="detail-actions"><button className="button" onClick={() => cambiarEstadoTarea(id)}>{tarea.completada ? <><RotateCcw size={16}/> Marcar como pendiente</> : <><Check size={16}/> Marcar como completada</>}</button><button className="delete-button" onClick={() => setShowDeleteModal(true)}><Trash2 size={16}/> Eliminar</button></div></article><ConfirmModal open={showDeleteModal} title="¿Eliminar tarea?" message={`“${tarea.titulo}” se eliminará definitivamente.`} confirmLabel="Eliminar tarea" onCancel={() => setShowDeleteModal(false)} onConfirm={confirmRemove}/></main>
}
