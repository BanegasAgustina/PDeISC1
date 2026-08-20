import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { TaskProvider } from './context/TaskContext'
import App from './App'
// Bootstrap aporta la grilla y las utilidades responsive; el estilo visual queda en index.css.
import 'bootstrap/dist/css/bootstrap.min.css'
import './index.css'
// Aplica el tema antes del primer render para evitar el destello del modo contrario.
const initialTheme = localStorage.getItem('taskflow-theme') || localStorage.getItem('taskflow-tema') || 'light'
document.documentElement.setAttribute('data-bs-theme', initialTheme)
document.documentElement.dataset.theme = initialTheme
// Inicia React y envuelve la aplicación con Router y el estado global de tareas.
createRoot(document.getElementById('root')).render(<StrictMode><BrowserRouter><TaskProvider><App/></TaskProvider></BrowserRouter></StrictMode>)
