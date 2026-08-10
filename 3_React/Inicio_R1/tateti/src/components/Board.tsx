import type { Casillas, Resultado } from '../game'
// Las props son datos que el componente padre entrega a un componente hijo.
type BoardProps = { xSiguiente: boolean; casillas: Casillas; resultado: Resultado; alJugar: (siguientes: Casillas) => void }
// Un componente es una función que devuelve la interfaz que React debe mostrar.
function Board({ xSiguiente, casillas, resultado, alJugar }: BoardProps) {
  function manejarClic(indice: number) {
    // Una casilla ocupada o una partida terminada no admite más movimientos.
    if (resultado.ganador || casillas[indice]) return
    // Copiamos el arreglo antes de cambiarlo: el estado de React es inmutable.
    const siguientes = casillas.slice()
    siguientes[indice] = xSiguiente ? 'X' : 'O'
    alJugar(siguientes)
  }
// La interfaz se actualiza automáticamente al cambiar el estado del componente padre.
  return <section className="tablero" aria-label="Tablero de Ta-Te-Ti"><div className="grilla">{casillas.map((casilla, indice) => {
    const ganadora = resultado.lineaGanadora.includes(indice)
    const deshabilitada = Boolean(casilla) || Boolean(resultado.ganador)
    return <button key={indice} className={`casilla ${casilla ? `casilla--${casilla.toLowerCase()}` : ''} ${ganadora ? 'casilla--ganadora' : ''}`} onClick={() => manejarClic(indice)} disabled={deshabilitada} aria-label={casilla ? `Casilla ${indice + 1}: ${casilla}` : `Jugar en casilla ${indice + 1}`}>{casilla}</button>
  })}</div></section>
}

export default Board
