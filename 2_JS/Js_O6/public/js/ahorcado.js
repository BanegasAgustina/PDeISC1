// ============================================================
// ahorcado.js - Dibujo SVG del muñeco ahorcado
// ============================================================
// Gestiona exclusivamente la visualización de las partes del cuerpo.
// La horca (base, poste, viga, soga) siempre está visible en el SVG.
// Cada error agrega UNA sola parte del cuerpo, en el orden:
//   1. cabeza   2. tronco   3. brazoi   4. brazod   5. piernai   6. piernad
//
// Con 6 intentos máximos y 6 partes, el muñeco se completa exactamente
// cuando el jugador pierde (intentos restantes = 0).

// Actualiza la visibilidad de las partes según la cantidad de errores.
// errores: número entero (letras incorrectas acumuladas).
function actualizarMuneco(errores) {
  const n = Math.max(0, Number(errores) || 0);
  PARTES_AHORCADO.forEach((id, index) => {
    const el = document.getElementById(id);
    if (!el) return;
    // La parte se hace visible cuando su posición (0-based) < cantidad de errores
    el.classList.toggle('visible', index < n);
  });
}

// Oculta todas las partes del cuerpo — estado inicial o nueva partida.
function resetearMuneco() {
  PARTES_AHORCADO.forEach((id) => {
    document.getElementById(id)?.classList.remove('visible');
  });
}
