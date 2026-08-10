import { useState } from 'react'
import './App.css'

function App() {
  // useState crea el estado contador y setContador es la función para actualizarlo.
  const [contador, setContador] = useState(0)
  const [temaOscuro, setTemaOscuro] = useState(false)
  return <main className="pagina" data-theme={temaOscuro ? 'dark' : 'light'}>
    <button
      className="tema"
      onClick={() => setTemaOscuro(!temaOscuro)}
      aria-label={temaOscuro ? 'Activar modo claro' : 'Activar modo oscuro'}
    >
      {temaOscuro ? '☀️' : '🌙'}
    </button>
    <section className="panel"><p className="eyebrow">useState en acción</p><h1>Contador</h1>
      <div className="contador"><button aria-label="Restar uno" onClick={() => setContador(contador - 1)}>−</button><output>{contador}</output><button aria-label="Sumar uno" onClick={() => setContador(contador + 1)}>+</button></div>
      {/* onClick ejecuta una función que actualiza el estado y React muestra el nuevo valor. */}
      <button className="reiniciar" onClick={() => setContador(0)}>Reiniciar</button>
    </section>
  </main>
}
export default App
