// ============================================================
// ahorcado.js - Dibujo SVG del muñeco ahorcado
// ============================================================
// Solo maneja la VISUALIZACIÓN del SVG. No toca el estado del juego.
// La horca (base, poste, viga, soga) siempre está visible en el SVG;
// este módulo solo controla las partes del CUERPO.
//
// Orden de aparición con 6 errores y 6 partes:
//   Error 1 → cabeza
//   Error 2 → tronco
//   Error 3 → brazoi  (brazo izquierdo)
//   Error 4 → brazod  (brazo derecho)
//   Error 5 → piernai (pierna izquierda)
//   Error 6 → piernad (pierna derecha) → muñeco completo = derrota

// Muestra las partes del cuerpo según cuántos errores acumula el jugador.
// Cada parte tiene un id en el SVG (cabeza, tronco, brazoi, etc.).
// La clase CSS "visible" activa la animación de aparición definida en style.css.
function actualizarMuneco(errores) {
  // Asegura que errores sea un número entero no negativo
  const n = Math.max(0, Number(errores) || 0);

  PARTES_AHORCADO.forEach((id, index) => {
    const el = document.getElementById(id); // Busca el elemento SVG por su id
    if (!el) return;                         // Si el elemento no existe en el DOM, lo ignora

    // La parte se hace visible cuando su posición (0-based) es menor que la cantidad de errores.
    // Ejemplo: con 2 errores → index 0 (cabeza) y index 1 (tronco) son < 2 → visibles.
    el.classList.toggle('visible', index < n);
  });
}

// Oculta todas las partes del cuerpo — estado inicial o al comenzar una nueva partida.
// Remueve la clase "visible" de cada elemento para que el muñeco quede limpio.
function resetearMuneco() {
  PARTES_AHORCADO.forEach((id) => {
    document.getElementById(id)?.classList.remove('visible'); // ?. evita error si el elemento no existe
  });
}
