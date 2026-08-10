import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

// App es el componente principal que se inserta en la página.
createRoot(document.getElementById('root')!).render(<StrictMode><App /></StrictMode>)
