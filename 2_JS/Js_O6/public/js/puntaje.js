// ============================================================
// puntaje.js - Cálculo de puntaje
// ============================================================
// Funciones puras de cálculo. Sin acceso al DOM ni al estado global.
// Todos los parámetros se sanitizan a número para evitar NaN.
//
// DISEÑO: el puntaje muestra 0 durante la partida y solo se
// calcula al finalizar. Esto evita la confusión de ver un número
// alto que baja mientras el jugador juega.

// Multiplicadores por dificultad para el puntaje base.
const MULTIPLICADORES = { facil: 1, media: 1.25, dificil: 1.6 };

// Calcula el puntaje final al terminar una partida ganada.
// Retorna 0 si el jugador perdió o si faltan datos.
function calcularPuntajeFinal({ gano, palabraLength, dificultad, intentosRestantes, pistasRestantes, segundos }) {
  if (!gano) return 0;

  const largo    = Math.max(0, Number(palabraLength)    || 0);
  const mult     = MULTIPLICADORES[dificultad]           || 1;
  const intentos = Math.max(0, Number(intentosRestantes) || 0);
  const pistas   = Math.max(0, Number(pistasRestantes)   || 0);
  const tiempo   = Math.max(0, Number(segundos)          || 0);

  const base          = largo    * 100 * mult;
  const bonusIntentos = intentos * 60;
  const bonusPistas   = pistas   * 40;
  const penalizacion  = tiempo;

  return Math.max(0, Math.round(base + bonusIntentos + bonusPistas - penalizacion));
}

// Durante la partida el puntaje muestra siempre 0.
// El valor real se calcula únicamente al finalizar (calcularPuntajeFinal).
// Esto evita la confusión de ver un número alto que baja con el tiempo.
function calcularPuntajeEnVivo() {
  return 0;
}
