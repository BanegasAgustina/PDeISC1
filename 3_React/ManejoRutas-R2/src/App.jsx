import { Routes, Route } from 'react-router-dom'
import Header from './components/Header'
import Home from './pages/Home'
import CreateTask from './pages/CreateTask'
import TaskDetail from './pages/TaskDetail'
import NotFound from './pages/NotFound'
import ScrollToTop from './components/ScrollToTop'
// Contiene el encabezado compartido y define todas las rutas SPA de TaskFlow.
export default function App() { return <><Header/><Routes><Route path="/" element={<Home/>}/><Route path="/crear" element={<CreateTask/>}/><Route path="/tarea/:id" element={<TaskDetail/>}/><Route path="*" element={<NotFound/>}/></Routes><ScrollToTop/></> }
