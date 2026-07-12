// ============================================================
// cronometro.js - Gestión del cronómetro de partida
// ============================================================
// Usa el patrón IIFE (función que se ejecuta sola) para encapsular
// las variables internas (_intervalo, _segundos) y evitar que sean
// accesibles desde fuera. Solo se exponen los métodos necesarios.

const Cronometro = (() => {
  let _intervalo = null; // Referencia al setInterval activo (null = no está corriendo)
  let _segundos  = 0;    // Contador de segundos acumulados desde que empezó

  // Inicia el cronómetro desde cero.
  // onTick(segundos): función que se llama cada 1000ms con los segundos actuales.
  // Se usa para actualizar el display del cronómetro y el estado interno.
  function iniciar(onTick) {
    detener(); // Siempre detiene cualquier cronómetro anterior antes de iniciar uno nuevo
    _segundos = 0; // Reinicia el contador a cero
    _intervalo = setInterval(() => {
      _segundos++;           // Incrementa 1 segundo cada tick
      onTick(_segundos);     // Notifica al código externo (main.js) con el valor actual
    }, 1000); // Se ejecuta cada 1000 milisegundos = 1 segundo
  }

  // Detiene el cronómetro pero NO resetea los segundos acumulados.
  // Se llama al terminar la partida (victoria o derrota) para guardar el tiempo.
  function detener() {
    if (_intervalo) {
      clearInterval(_intervalo); // Cancela el setInterval activo
      _intervalo = null;         // Limpia la referencia para evitar doble cancelación
    }
  }

  // Devuelve los segundos acumulados hasta este momento.
  // Útil para consultar el tiempo sin necesidad de esperar al próximo tick.
  function obtenerSegundos() {
    return _segundos;
  }

  // Resetea el cronómetro completamente: detiene el timer y pone los segundos en 0.
  // Se llama al iniciar una nueva partida (antes del fetch de la palabra).
  function resetear() {
    detener();
    _segundos = 0;
  }

  // Expone solo los métodos públicos; _intervalo y _segundos quedan privados
  return { iniciar, detener, obtenerSegundos, resetear };
})();
