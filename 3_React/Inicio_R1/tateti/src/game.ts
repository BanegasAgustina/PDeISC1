// Estos tipos describen los datos que usa el juego sin mezclarlos con la interfaz.
export type Jugador = 'X' | 'O'
export type Casillas = (Jugador | null)[]

export type Resultado = { ganador: Jugador | null; lineaGanadora: number[] }

// Revisa las ocho líneas posibles y, además del ganador, devuelve qué casillas resaltaremos.
export function calcularResultado(casillas: Casillas): Resultado {
  const lineas = [[0, 1, 2], [3, 4, 5], [6, 7, 8], [0, 3, 6], [1, 4, 7], [2, 4, 6]]
  for (const linea of lineas) {
    const [a, b, c] = linea
    if (casillas[a] && casillas[a] === casillas[b] && casillas[a] === casillas[c]) return { ganador: casillas[a], lineaGanadora: linea }
  }
  return { ganador: null, lineaGanadora: [] }
}

// Compara dos tableros para obtener el detalle de una jugada del historial.
export function describirJugada(anterior: Casillas, actual: Casillas) {
  const indice = actual.findIndex((casilla, posicion) => casilla !== anterior[posicion])
  return indice === -1 ? null : { jugador: actual[indice], casilla: indice + 1 }
}
