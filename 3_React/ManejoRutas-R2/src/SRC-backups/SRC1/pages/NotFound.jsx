import { Link } from 'react-router-dom'
export default function NotFound() { return <main className="page"><section className="not-found"><span>404</span><h1>Esta página no existe</h1><p>El camino que buscás no está disponible. Volvamos a organizar tu día.</p><Link className="button" to="/">Ir al inicio</Link></section></main> }
