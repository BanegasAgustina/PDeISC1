import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

// React renderiza App dentro del elemento root del HTML.
createRoot(document.getElementById('root')!).render(<StrictMode><App /></StrictMode>)
