import type { Jugador } from '../game'

type GameStatusProps = { ganador: Jugador | null; empate: boolean; xSiguiente: boolean }

// El estado visual convierte la información del juego en un mensaje fácil de reconocer.
function GameStatus({ ganador, empate, xSiguiente }: GameStatusProps) {
  const texto = ganador ? `Ganó ${ganador}` : empate ? 'Empate' : `Turno de ${xSiguiente ? 'X' : 'O'}`
  const tipo = ganador ? 'victoria' : empate ? 'empate' : 'turno'
  return <p className={`estado estado--${tipo}`} role="status"><span className="estado__punto" />{texto}</p>
}

export default GameStatus
