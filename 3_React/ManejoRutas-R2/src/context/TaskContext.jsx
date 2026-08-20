import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { tareasIniciales } from '../data/tareas'

// Contexto único para compartir tareas y tema entre todas las rutas.
const TaskContext = createContext(null)
const TASKS_KEY = 'taskflow-tareas'
// Clave indicada para que la preferencia sobreviva entre recargas.
const THEME_KEY = 'taskflow-theme'

// Recupera tareas guardadas y completa fechaTarea en datos de versiones anteriores.
function loadTasks() {
  try {
    const saved = localStorage.getItem(TASKS_KEY)
    return saved ? JSON.parse(saved).map((tarea) => ({ ...tarea, fechaTarea: tarea.fechaTarea || tarea.fechaCreacion })) : tareasIniciales
  } catch { return tareasIniciales }
}

export function TaskProvider({ children }) {
  // Estados persistentes de tareas y tema elegido por la persona usuaria.
  const [tareas, setTareas] = useState(loadTasks)
  // También lee la clave anterior para no perder la preferencia de versiones previas.
  const [tema, setTema] = useState(() => localStorage.getItem(THEME_KEY) || localStorage.getItem('taskflow-tema') || 'light')

  // Guarda cada cambio de tareas en el navegador.
  useEffect(() => { localStorage.setItem(TASKS_KEY, JSON.stringify(tareas)) }, [tareas])
  useEffect(() => {
    // Bootstrap 5.3 y el CSS propio usan el mismo atributo de tema.
    document.documentElement.setAttribute('data-bs-theme', tema)
    document.documentElement.dataset.theme = tema
    localStorage.setItem(THEME_KEY, tema)
  }, [tema])

  // Memoiza las acciones para evitar renderizados extra de los consumidores.
  const value = useMemo(() => ({
    tareas, tema,
    agregarTarea: (tarea) => setTareas((actuales) => [tarea, ...actuales]),
    eliminarTarea: (id) => setTareas((actuales) => actuales.filter((tarea) => tarea.id !== id)),
    cambiarEstadoTarea: (id) => setTareas((actuales) => actuales.map((tarea) => tarea.id === id ? { ...tarea, completada: !tarea.completada } : tarea)),
    obtenerTareaPorId: (id) => tareas.find((tarea) => tarea.id === id),
    alternarTema: () => setTema((actual) => actual === 'light' ? 'dark' : 'light'),
  }), [tareas, tema])
  return <TaskContext.Provider value={value}>{children}</TaskContext.Provider>
}

export function useTasks() {
  // Hook seguro que expone el contexto a cualquier componente hijo.
  const context = useContext(TaskContext)
  if (!context) throw new Error('useTasks debe usarse dentro de TaskProvider')
  return context
}
