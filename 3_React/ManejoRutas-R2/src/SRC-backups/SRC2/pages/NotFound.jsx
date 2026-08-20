import { Link } from 'react-router-dom'
export default function NotFound() { return <main className="page"><section className="not-found"><span>404</span><h1>No encontramos esta página.</h1><p>El enlace no existe o ya no está disponible.</p><Link className="button" to="/">Volver a mis tareas</Link></section></main> }
