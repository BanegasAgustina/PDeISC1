import { useEffect, useState } from 'react'
import Board from './components/Board'
import GameStatus from './components/GameStatus'
import { calcularResultado, describirJugada } from './game'
import type { Casillas } from './game'
import './App.css'

declare global { interface Window { lucide?: { createIcons: () => void } } }

function Icon({ nombre }: { nombre: string }) {
  return <i aria-hidden="true" data-lucide={nombre} />
}

function Game() {
  // El historial conserva cada tablero, por eso podemos volver a una jugada anterior.
  const [history, setHistory] = useState<Casillas[]>([Array(9).fill(null)])
  const [movimientoActual, setMovimientoActual] = useState(0)
  const [temaOscuro, setTemaOscuro] = useState(() => localStorage.getItem('tateti-theme') === 'dark')
  const [mostrarArriba, setMostrarArriba] = useState(false)
  const casillasActuales = history[movimientoActual]
  const resultado = calcularResultado(casillasActuales)
  const empate = !resultado.ganador && casillasActuales.every(Boolean)
  const xSiguiente = movimientoActual % 2 === 0

  useEffect(() => {
    localStorage.setItem('tateti-theme', temaOscuro ? 'dark' : 'light')
    window.lucide?.createIcons()
  }, [temaOscuro, history, movimientoActual, mostrarArriba])

  useEffect(() => {
    const revisarScroll = () => setMostrarArriba(window.scrollY > 260)
    window.addEventListener('scroll', revisarScroll, { passive: true })
    return () => window.removeEventListener('scroll', revisarScroll)
  }, [])

  function manejarJugada(siguientes: Casillas) {
    // Al jugar desde el pasado se eliminan los movimientos que ya no pertenecen a esa partida.
    const nuevoHistorial = [...history.slice(0, movimientoActual + 1), siguientes]
    setHistory(nuevoHistorial)
    setMovimientoActual(nuevoHistorial.length - 1)
  }

  function reiniciar() { setHistory([Array(9).fill(null)]); setMovimientoActual(0) }

  return <main className="pagina" data-theme={temaOscuro ? 'dark' : 'light'}>
    <header className="barra"><a className="marca" href="#juego">TA·TE·TI</a><button className="boton-icono" onClick={() => setTemaOscuro(!temaOscuro)} aria-label={temaOscuro ? 'Activar modo claro' : 'Activar modo oscuro'}><Icon nombre={temaOscuro ? 'sun' : 'moon'} /></button></header>
    <div className="layout" id="juego">
      <section className="presentacion"><p className="sobrelinea">REACT · USESTATE</p><h1>Ta-Te-Ti</h1><p className="descripcion">Una partida rápida, clara y lista para jugar desde cualquier pantalla.</p></section>
      <section className="zona-juego"><GameStatus ganador={resultado.ganador} empate={empate} xSiguiente={xSiguiente} /><Board xSiguiente={xSiguiente} casillas={casillasActuales} resultado={resultado} alJugar={manejarJugada} /></section>
      <aside className="historial" aria-label="Historial de jugadas"><div className="historial__cabecera"><div><p className="sobrelinea">PARTIDA ACTUAL</p><h2>Historial</h2></div><span>{history.length - 1}/9</span></div><ol>{history.length === 1 ? <li className="historial__vacio">Las jugadas aparecerán acá.</li> : history.slice(1).map((tablero, indice) => { const detalle = describirJugada(history[indice], tablero); const movimiento = indice + 1; return <li key={movimiento}><button className={movimiento === movimientoActual ? 'activo' : ''} onClick={() => setMovimientoActual(movimiento)}><b>Jugada {movimiento}</b><span>{detalle?.jugador} → casilla {detalle?.casilla}</span></button></li> })}</ol><button className="reiniciar" onClick={reiniciar}><Icon nombre="rotate-ccw" />Reiniciar partida</button></aside>
    </div>
    {mostrarArriba && <button className="volver-arriba" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} aria-label="Volver arriba"><Icon nombre="arrow-up" /></button>}
  </main>
}

export default Game
