import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { tareasIniciales } from '../data/tareas'

const TaskContext = createContext(null)
const TASKS_KEY = 'taskflow-tareas'
const THEME_KEY = 'taskflow-tema'

function loadTasks() {
  try {
    const saved = localStorage.getItem(TASKS_KEY)
    return saved ? JSON.parse(saved) : tareasIniciales
  } catch { return tareasIniciales }
}

export function TaskProvider({ children }) {
  const [tareas, setTareas] = useState(loadTasks)
  const [tema, setTema] = useState(() => localStorage.getItem(THEME_KEY) || 'light')

  useEffect(() => { localStorage.setItem(TASKS_KEY, JSON.stringify(tareas)) }, [tareas])
  useEffect(() => {
    document.documentElement.dataset.theme = tema
    localStorage.setItem(THEME_KEY, tema)
  }, [tema])

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
  const context = useContext(TaskContext)
  if (!context) throw new Error('useTasks debe usarse dentro de TaskProvider')
  return context
}
