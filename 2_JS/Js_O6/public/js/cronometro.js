// ============================================================
// cronometro.js - Gestión del cronómetro de partida
// ============================================================
// Encapsula el intervalo para evitar leaks de timers entre partidas.

const Cronometro = (() => {
  let _intervalo = null;
  let _segundos  = 0;

  // Inicia el cronómetro desde cero.
  // onTick(segundos): callback que se llama cada segundo con los segundos actuales.
  function iniciar(onTick) {
    detener(); // siempre limpiar antes de iniciar para evitar doble timer
    _segundos = 0;
    _intervalo = setInterval(() => {
      _segundos++;
      onTick(_segundos);
    }, 1000);
  }

  // Detiene el cronómetro sin resetear los segundos acumulados.
  function detener() {
    if (_intervalo) {
      clearInterval(_intervalo);
      _intervalo = null;
    }
  }

  // Devuelve los segundos acumulados hasta este momento.
  function obtenerSegundos() {
    return _segundos;
  }

  // Resetea los segundos a cero (llamar después de detener).
  function resetear() {
    detener();
    _segundos = 0;
  }

  return { iniciar, detener, obtenerSegundos, resetear };
})();
