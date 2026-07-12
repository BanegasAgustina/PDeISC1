// ============================================================
// ui.js - Actualizaciones de la interfaz de usuario
// ============================================================
// Concentra TODOS los writes al DOM de la pantalla de juego.
// Ningún otro módulo debería manipular directamente estos elementos.

// ── Referencias al DOM ───────────────────────────────────────
// Se resuelven UNA SOLA VEZ al cargar el script (más eficiente que getElementById en cada update).
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

// Actualiza los contadores visibles durante la partida (intentos, pistas, letras incorrectas).
// IMPORTANTE: el puntaje siempre muestra 0 durante el juego; el valor real
// se muestra únicamente en el panel de resultados al terminar.
function actualizarContadores(estado) {
  elIntentosRest.textContent  = Number(estado.intentosRestantes) || 0; // Intentos que le quedan
  elPistasRest.textContent    = Number(estado.pistasRestantes)   || 0; // Pistas disponibles
  elPuntajeActual.textContent = '0'; // Siempre 0 mientras se juega (diseño intencional)

  // Habilita o deshabilita el botón de pista según disponibilidad
  const btnPista = document.getElementById('btn-pista');
  if (btnPista) {
    // Deshabilita si: no hay pistas, o la partida terminó
    btnPista.disabled = estado.pistasRestantes <= 0 || estado.terminado;
  }

  // Muestra las letras incorrectas separadas por coma, o un guión si no hay ninguna
  elLetrasIncorrectas.textContent = estado.letrasIncorrectas.length
    ? estado.letrasIncorrectas.map((l) => l.toUpperCase()).join(', ') // "A, E, S"
    : '-';
}

// Actualiza el cronómetro visual con los segundos actuales.
// Se llama cada segundo desde el callback del cronómetro.
function actualizarCronometro(segundos) {
  elCronometro.textContent = formatearTiempo(segundos); // Convierte segundos a "MM:SS"
}

// Muestra u oculta el mensaje de carga ("Cargando palabra...").
// texto=null o texto='' → oculta el mensaje.
// texto='...' → muestra el mensaje con ese texto.
function mostrarMensajeCarga(texto) {
  if (texto) {
    elMensajeCarga.textContent = texto;
    elMensajeCarga.classList.remove('hidden'); // Lo hace visible
  } else {
    elMensajeCarga.classList.add('hidden');    // Lo oculta
  }
}

// Muestra la descripción de la dificultad seleccionada en la pantalla de inicio.
// Se llama al cambiar el select de dificultad y al cargar la página.
function actualizarInfoDificultad(valorDificultad) {
  const d = DIFICULTADES_UI[valorDificultad]; // Lee la config de config.js
  if (!d || !elInfoDificultad) return;
  // Inyecta la descripción, los intentos y las pistas como HTML
  elInfoDificultad.innerHTML = `
    <span>${d.descripcion}</span>
    <strong>${d.intentos} intentos</strong>
    <strong>${d.pistas} pistas</strong>
  `;
}

// Actualiza las píldoras de categoría y dificultad activas en el header del tablero.
// etiqueta() convierte la clave interna ("tecnologia") a texto visible ("Tecnologia").
function actualizarMetaJuego(categoria, dificultad) {
  if (elCategoriaActiva)  elCategoriaActiva.textContent  = etiqueta(categoria);
  if (elDificultadActiva) elDificultadActiva.textContent = etiqueta(dificultad);
}

// Muestra el panel de resultados (victoria o derrota) al terminar la partida.
// Oculta el área de juego y muestra el panel con todos los datos finales.
function mostrarPanelFin(estado) {
  elAreaJuego.classList.add('hidden');    // Oculta el tablero de juego
  elPanelFin.classList.remove('hidden'); // Muestra el panel de resultados

  // Aplica clases CSS de color: verde para victoria, rojo para derrota
  elPanelFin.classList.toggle('result-panel--win',  Boolean(estado.gano));
  elPanelFin.classList.toggle('result-panel--loss', !estado.gano);

  // Ícono principal: festejo o calavera
  document.getElementById('resultado-icono').textContent  = estado.gano ? '🎉' : '💀';
  // Título del resultado
  document.getElementById('resultado-titulo').textContent = estado.gano ? '🎉 ¡Ganaste!' : '💀 Perdiste';
  // Mensaje descriptivo con la palabra
  document.getElementById('resultado-mensaje').textContent = estado.gano
    ? `Adivinaste "${estado.palabraCompleta.toUpperCase()}" en ${etiqueta(estado.dificultad)}.`
    : `La palabra era "${estado.palabraCompleta.toUpperCase()}"`;

  document.getElementById('puntaje-final').textContent = estado.puntaje;           // Puntaje calculado
  document.getElementById('tiempo-final').textContent  = formatearTiempo(estado.segundos); // Tiempo en MM:SS

  // Limpia el campo de nombre para que el jugador ingrese el suyo
  const inputNombre = document.getElementById('input-nombre');
  if (inputNombre) inputNombre.value = '';
  ocultarFeedback(); // Oculta cualquier mensaje de guardado previo
}

// Navega a la pantalla de inicio (antes de iniciar una partida).
function mostrarPantallaInicio() {
  elPantallaInicio.classList.remove('hidden'); // Muestra la pantalla de inicio
  elAreaJuego.classList.add('hidden');         // Oculta el tablero de juego
  elPanelFin.classList.add('hidden');          // Oculta el panel de resultados
  elPanelFin.classList.remove('result-panel--win', 'result-panel--loss'); // Limpia colores
}

// Navega al área de juego y resetea COMPLETAMENTE todos los elementos visuales.
// Se llama ANTES del fetch para que la pantalla quede limpia desde el primer instante,
// sin residuos de la partida anterior.
function mostrarAreaJuego() {
  elPantallaInicio.classList.add('hidden');  // Oculta la pantalla de inicio
  elPanelFin.classList.add('hidden');        // Oculta el panel de resultados
  elPanelFin.classList.remove('result-panel--win', 'result-panel--loss'); // Limpia clases de color
  elAreaJuego.classList.remove('hidden');    // Muestra el tablero de juego

  // Resetea todos los contadores a sus valores iniciales visuales
  elCronometro.textContent        = '00:00'; // Cronómetro en cero
  elPuntajeActual.textContent     = '0';     // Puntaje en cero
  elIntentosRest.textContent      = '6';     // 6 intentos disponibles
  elPistasRest.textContent        = '0';     // Sin pistas (se actualiza después del fetch)
  elLetrasIncorrectas.textContent = '-';     // Sin letras incorrectas

  // Limpia el display de la palabra (borra los guiones/letras de la partida anterior)
  const divPalabra = document.getElementById('palabra-oculta');
  if (divPalabra) divPalabra.innerHTML = '';

  // Limpia el teclado (borra los botones de la partida anterior)
  const divTeclado = document.getElementById('teclado');
  if (divTeclado) divTeclado.innerHTML = '';

  // Deshabilita el botón de pista hasta que cargue la nueva palabra
  const btnPista = document.getElementById('btn-pista');
  if (btnPista) btnPista.disabled = true;
}

// Muestra un mensaje de feedback al intentar guardar el puntaje.
// exito=true → texto en verde; exito=false → texto en rojo.
function mostrarFeedback(texto, exito) {
  elMensajeGuardado.textContent = texto;
  // Aplica la clase CSS correcta según el resultado
  elMensajeGuardado.className   = `feedback-msg ${exito ? 'feedback-msg--ok' : 'feedback-msg--error'}`;
  elMensajeGuardado.classList.remove('hidden'); // Lo hace visible
}

// Oculta el mensaje de feedback (limpia el área debajo del formulario).
function ocultarFeedback() {
  elMensajeGuardado.classList.add('hidden');
}
