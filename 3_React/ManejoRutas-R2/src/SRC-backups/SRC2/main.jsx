import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { TaskProvider } from './context/TaskContext'
import App from './App'
import './index.css'
// Inicia React y envuelve la aplicación con Router y el estado global de tareas.
createRoot(document.getElementById('root')).render(<StrictMode><BrowserRouter><TaskProvider><App/></TaskProvider></BrowserRouter></StrictMode>)
