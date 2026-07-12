// ============================================================
// puntaje.js - Cálculo de puntaje
// ============================================================
// Funciones puras de cálculo. Sin acceso al DOM ni al estado global.
// Todos los parámetros se convierten a número para evitar NaN.
//
// DISEÑO INTENCIONAL: el puntaje muestra 0 DURANTE la partida y
// solo se calcula al FINALIZAR. Esto evita la confusión de ver
// un número alto que va bajando mientras el jugador juega.

// Multiplicadores por dificultad: cuanto más difícil, más puntos por letra.
// facil=1x, media=1.25x, dificil=1.6x
const MULTIPLICADORES = { facil: 1, media: 1.25, dificil: 1.6 };

// Calcula el puntaje final al terminar una partida GANADA.
// Retorna 0 si el jugador perdió o si algún dato es inválido.
//
// Fórmula:
//   base          = largo de la palabra × 100 × multiplicador de dificultad
//   bonusIntentos = intentos que le sobran × 60 puntos cada uno
//   bonusPistas   = pistas que le sobraron × 40 puntos cada una
//   penalizacion  = segundos que tardó (a más tiempo, menos puntos)
//   total         = base + bonusIntentos + bonusPistas - penalizacion (mínimo 0)
function calcularPuntajeFinal({ gano, palabraLength, dificultad, intentosRestantes, pistasRestantes, segundos }) {
  if (!gano) return 0; // Si perdió, puntaje siempre es 0

  // Sanitización: convierte todos los valores a número y aplica mínimo 0
  const largo    = Math.max(0, Number(palabraLength)    || 0);
  const mult     = MULTIPLICADORES[dificultad]           || 1;   // Default 1x si dificultad desconocida
  const intentos = Math.max(0, Number(intentosRestantes) || 0);
  const pistas   = Math.max(0, Number(pistasRestantes)   || 0);
  const tiempo   = Math.max(0, Number(segundos)          || 0);

  const base          = largo    * 100 * mult;  // Puntaje base según largo y dificultad
  const bonusIntentos = intentos * 60;           // Bonus por no cometer errores
  const bonusPistas   = pistas   * 40;           // Bonus por no usar pistas
  const penalizacion  = tiempo;                  // Penalización por cada segundo transcurrido

  // Math.round redondea al entero más cercano; Math.max evita puntajes negativos
  return Math.max(0, Math.round(base + bonusIntentos + bonusPistas - penalizacion));
}

// Durante la partida el puntaje siempre muestra 0.
// El valor real se calcula únicamente al finalizar con calcularPuntajeFinal().
// Existe esta función para que la UI pueda llamarla sin lógica condicional extra.
function calcularPuntajeEnVivo() {
  return 0;
}
