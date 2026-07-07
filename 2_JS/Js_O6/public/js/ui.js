// ============================================================
// ui.js - Actualizaciones de la interfaz de usuario
// ============================================================
// Concentra todos los writes al DOM de la pantalla de juego.

// Referencias a elementos del DOM — se resuelven una sola vez al cargar.
const elCronometro        = document.getElementById('cronometro');
const elPuntajeActual     = document.getElementById('puntaje-actual');
const elIntentosRest      = document.getElementById('intentos-restantes');
const elPistasRest        = document.getElementById('pistas-restantes');
const elLetrasIncorrectas = document.getElementById('letras-incorrectas');
const elCategoriaActiva   = document.getElementById('categoria-activa');
const elDificultadActiva  = document.getElementById('dificultad-activa');
const elMensajeCarga      = document.getElementById('mensaje-carga');
const elInfoDificultad    = document.getElementById('info-dificultad');
const elMensajeGuardado   = document.getElementById('mensaje-guardado');
const elPantallaInicio    = document.getElementById('pantalla-inicio');
const elAreaJuego         = document.getElementById('area-juego');
const elPanelFin          = document.getElementById('panel-fin');

// Actualiza los contadores numéricos durante la partida.
// El puntaje muestra 0 mientras se juega; el valor final se
// muestra solo en el panel de resultados.
function actualizarContadores(estado) {
  elIntentosRest.textContent        = Number(estado.intentosRestantes) || 0;
  elPistasRest.textContent          = Number(estado.pistasRestantes)   || 0;
  elPuntajeActual.textContent       = '0'; // siempre 0 durante la partida

  const btnPista = document.getElementById('btn-pista');
  if (btnPista) {
    btnPista.disabled = estado.pistasRestantes <= 0 || estado.terminado;
  }

  elLetrasIncorrectas.textContent = estado.letrasIncorrectas.length
    ? estado.letrasIncorrectas.map((l) => l.toUpperCase()).join(', ')
    : '-';
}

// Actualiza el cronómetro visual.
function actualizarCronometro(segundos) {
  elCronometro.textContent = formatearTiempo(segundos);
}

// Muestra u oculta el mensaje de carga.
function mostrarMensajeCarga(texto) {
  if (texto) {
    elMensajeCarga.textContent = texto;
    elMensajeCarga.classList.remove('hidden');
  } else {
    elMensajeCarga.classList.add('hidden');
  }
}

// Muestra la info de la dificultad en la pantalla de inicio.
function actualizarInfoDificultad(valorDificultad) {
  const d = DIFICULTADES_UI[valorDificultad];
  if (!d || !elInfoDificultad) return;
  elInfoDificultad.innerHTML = `
    <span>${d.descripcion}</span>
    <strong>${d.intentos} intentos</strong>
    <strong>${d.pistas} pistas</strong>
  `;
}

// Actualiza las píldoras de categoría y dificultad activas.
function actualizarMetaJuego(categoria, dificultad) {
  if (elCategoriaActiva)  elCategoriaActiva.textContent  = etiqueta(categoria);
  if (elDificultadActiva) elDificultadActiva.textContent = etiqueta(dificultad);
}

// Muestra el panel de resultados al terminar la partida.
function mostrarPanelFin(estado) {
  elAreaJuego.classList.add('hidden');
  elPanelFin.classList.remove('hidden');
  elPanelFin.classList.toggle('result-panel--win', Boolean(estado.gano));
  elPanelFin.classList.toggle('result-panel--loss', !estado.gano);

  document.getElementById('resultado-icono').textContent  = estado.gano ? '🎉' : '💀';
  document.getElementById('resultado-titulo').textContent = estado.gano ? '🎉 ¡Ganaste!' : '💀 Perdiste';
  document.getElementById('resultado-mensaje').textContent = estado.gano
    ? `Adivinaste "${estado.palabraCompleta.toUpperCase()}" en ${etiqueta(estado.dificultad)}.`
    : `La palabra era "${estado.palabraCompleta.toUpperCase()}".`;

  // El puntaje final es el calculado por calcularPuntajeFinal
  document.getElementById('puntaje-final').textContent = estado.puntaje;
  document.getElementById('tiempo-final').textContent  = formatearTiempo(estado.segundos);

  const inputNombre = document.getElementById('input-nombre');
  if (inputNombre) inputNombre.value = '';
  ocultarFeedback();
}

// Navega a la pantalla de inicio.
function mostrarPantallaInicio() {
  elPantallaInicio.classList.remove('hidden');
  elAreaJuego.classList.add('hidden');
  elPanelFin.classList.add('hidden');
  elPanelFin.classList.remove('result-panel--win', 'result-panel--loss');
}

// Navega al área de juego y resetea COMPLETAMENTE todos los elementos visuales.
// Se llama ANTES del fetch, garantizando pantalla limpia desde el primer instante.
function mostrarAreaJuego() {
  elPantallaInicio.classList.add('hidden');
  elPanelFin.classList.add('hidden');
  elPanelFin.classList.remove('result-panel--win', 'result-panel--loss');
  elAreaJuego.classList.remove('hidden');

  // Resetear todos los contadores a sus valores iniciales
  elCronometro.textContent        = '00:00';
  elPuntajeActual.textContent     = '0';
  elIntentosRest.textContent      = '6';
  elPistasRest.textContent        = '0';
  elLetrasIncorrectas.textContent = '-';

  // Limpiar la palabra y el teclado de la partida anterior
  const divPalabra = document.getElementById('palabra-oculta');
  if (divPalabra) divPalabra.innerHTML = '';

  const divTeclado = document.getElementById('teclado');
  if (divTeclado) divTeclado.innerHTML = '';

  // Deshabilitar el botón de pista hasta que cargue la nueva palabra
  const btnPista = document.getElementById('btn-pista');
  if (btnPista) btnPista.disabled = true;
}

// Muestra un mensaje de feedback al guardar puntaje.
function mostrarFeedback(texto, exito) {
  elMensajeGuardado.textContent = texto;
  elMensajeGuardado.className   = `feedback-msg ${exito ? 'feedback-msg--ok' : 'feedback-msg--error'}`;
  elMensajeGuardado.classList.remove('hidden');
}

// Oculta el mensaje de feedback.
function ocultarFeedback() {
  elMensajeGuardado.classList.add('hidden');
}
