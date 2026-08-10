import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

// Este punto de entrada monta el componente principal de React.
createRoot(document.getElementById('root')!).render(<StrictMode><App /></StrictMode>)
