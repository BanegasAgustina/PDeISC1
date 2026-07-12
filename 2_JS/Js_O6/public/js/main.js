// ============================================================
// main.js - Orquestador principal del juego
// ============================================================
// Une todos los módulos. Gestiona el flujo completo de una partida:
// iniciar → procesar letras → terminar → guardar puntaje → PDF.
// También registra todos los event listeners del HTML.

// Guard de nivel módulo: evita que dos llamadas a iniciarPartida()
// corran en paralelo (ej: doble click rápido en el botón iniciar).
let _iniciando = false;

// ── INICIAR PARTIDA ──────────────────────────────────────────

async function iniciarPartida() {
  // Doble guard: nivel módulo (_iniciando) + estado interno (cargando)
  // para cubrir el caso donde el flag aún no se actualizó entre ticks de JS.
  if (_iniciando || EstadoJuego.obtener().cargando) return;
  _iniciando = true;

  // Lee la categoría y dificultad elegidas por el usuario en los selectores
  const categoria  = document.getElementById('select-categoria')?.value  || 'general';
  const dificultad = document.getElementById('select-dificultad')?.value || 'media';

  // Deshabilita los botones de inicio/reinicio mientras carga para evitar doble click
  EstadoJuego.marcarCargando(true);
  const btnIniciar   = document.getElementById('btn-nueva-partida');
  const btnReiniciar = document.getElementById('btn-reiniciar');
  if (btnIniciar)   btnIniciar.disabled   = true;
  if (btnReiniciar) btnReiniciar.disabled = true;

  // 1. Detiene y resetea el cronómetro de la partida anterior
  Cronometro.resetear();

  // 2. Resetea el estado interno completamente (limpia letras, intentos, puntaje, etc.)
  EstadoJuego.reiniciar(categoria, dificultad);

  // 3. Limpia la UI (muñeco, palabra, teclado, contadores) ANTES del fetch
  //    así el jugador ve la pantalla limpia de inmediato, sin esperar a la respuesta
  resetearMuneco();
  mostrarAreaJuego();
  mostrarMensajeCarga('Cargando palabra...');

  try {
    // 4. Pide una palabra al servidor /api/palabra (lee los JSON de /data/)
    const datos = await apiObtenerPalabra(categoria, dificultad);

    // 5. Carga los datos de la respuesta en el estado centralizado
    EstadoJuego.iniciarDesdeApi(datos);

    const st = EstadoJuego.obtener(); // Obtiene una copia del estado actualizado

    // 6. Actualiza las píldoras de categoría y dificultad en el header del tablero
    actualizarMetaJuego(st.categoria, st.dificultad);
    mostrarMensajeCarga(null); // Oculta el mensaje de carga

    // 7. Dibuja la palabra con guiones vacíos y el teclado limpio
    dibujarPalabra(st.palabra, EstadoJuego.letrasAdivinadas());
    renderizarTeclado(
      EstadoJuego.letrasAdivinadas(), // Set vacío al inicio
      EstadoJuego.letrasEnPalabra(),  // Set con todas las letras de la palabra
      _procesarLetra                  // Callback que procesa cada letra presionada
    );

    // 8. Muestra los contadores correctos según la dificultad recibida del servidor
    actualizarContadores(st);

    // 9. Inicia el cronómetro. El callback se llama cada segundo:
    //    - Actualiza los segundos en el estado interno
    //    - Actualiza el display visual del cronómetro
    //    (El puntaje NO se actualiza en vivo, solo al finalizar la partida)
    Cronometro.iniciar((segundos) => {
      EstadoJuego.actualizarSegundos(segundos);
      actualizarCronometro(segundos);
    });

  } catch (_err) {
    // Si el fetch falla (servidor apagado, error de red, etc.)
    mostrarMensajeCarga('Error al cargar palabra. Verificá el servidor.');
    EstadoJuego.marcarCargando(false);
  } finally {
    // Siempre vuelve a habilitar los botones y libera el guard, haya éxito o error
    if (btnIniciar)   btnIniciar.disabled   = false;
    if (btnReiniciar) btnReiniciar.disabled = false;
    _iniciando = false;
  }
}

// ── LÓGICA DE LETRA ──────────────────────────────────────────

// Procesa una letra ingresada (desde el teclado virtual o el teclado físico).
// Esta función es el corazón de la lógica de juego.
function _procesarLetra(letra) {
  const estado = EstadoJuego.obtener();

  // Guards: ignora el input si la partida terminó, está cargando, no hay palabra, o se está iniciando
  if (estado.terminado || estado.cargando || !estado.palabra.length || _iniciando) return;

  const normalizada = normalizarTexto(letra); // Normaliza (sin tildes, minúsculas)
  if (!/^[a-zñ]$/.test(normalizada)) return; // Ignora si no es una letra válida del español

  // Intenta registrar la letra en el estado
  const resultado = EstadoJuego.intentarLetra(normalizada);

  if (resultado === 'repetida') {
    animarLetraUsada(normalizada); // Sacude visualmente la tecla ya usada
    return;
  }
  if (resultado === 'terminado') return; // Guard de seguridad (no debería ocurrir aquí)

  const st = EstadoJuego.obtener(); // Lee el estado actualizado

  // Redibuja la palabra con las nuevas letras descubiertas (si la acertó)
  dibujarPalabra(st.palabra, EstadoJuego.letrasAdivinadas());

  if (resultado === 'incorrecta') {
    // Calcula cuántos errores hay en total y actualiza el SVG del muñeco
    const errores = st.intentosMaximos - st.intentosRestantes;
    actualizarMuneco(errores); // Dibuja la siguiente parte del cuerpo
  }

  // Actualiza el teclado (colorea la tecla usada) y los contadores
  renderizarTeclado(
    EstadoJuego.letrasAdivinadas(),
    EstadoJuego.letrasEnPalabra(),
    _procesarLetra
  );
  actualizarContadores(st);

  // Verifica si la partida terminó después de este intento
  if (EstadoJuego.verificarVictoria()) {
    _terminarPartida(); // El jugador adivinó todas las letras
  } else if (EstadoJuego.verificarDerrota()) {
    actualizarMuneco(PARTES_AHORCADO.length); // Completa el muñeco (todas las partes) al perder
    _terminarPartida();
  }
}

// ── PISTA ─────────────────────────────────────────────────────

// Revela una letra aleatoria de la palabra como pista.
// Solo funciona si quedan pistas disponibles y la partida está activa.
function _usarPista() {
  const estado = EstadoJuego.obtener();
  if (estado.terminado || estado.cargando || !estado.palabra.length || _iniciando) return;

  const letra = EstadoJuego.usarPista(); // Pide una pista al estado
  if (!letra) return; // No hay pistas disponibles o no hay letras pendientes

  // Actualiza la UI como si el jugador hubiera acertado esa letra
  const st = EstadoJuego.obtener();
  dibujarPalabra(st.palabra, EstadoJuego.letrasAdivinadas());
  renderizarTeclado(
    EstadoJuego.letrasAdivinadas(),
    EstadoJuego.letrasEnPalabra(),
    _procesarLetra
  );
  actualizarContadores(st);

  // Verifica victoria después de usar la pista (podría ser la última letra)
  if (EstadoJuego.verificarVictoria()) _terminarPartida();
}

// ── FIN DE PARTIDA ────────────────────────────────────────────

// Detiene el cronómetro, calcula el puntaje final y muestra el panel de resultados.
function _terminarPartida() {
  Cronometro.detener(); // Para el timer; los segundos quedan guardados
  const st = EstadoJuego.obtener();

  // Calcula el puntaje final usando la fórmula de puntaje.js
  // Si perdió, calcularPuntajeFinal retorna 0 automáticamente
  const pts = calcularPuntajeFinal({
    gano:              st.gano,
    palabraLength:     st.palabra.length,
    dificultad:        st.dificultad,
    intentosRestantes: st.intentosRestantes,
    pistasRestantes:   st.pistasRestantes,
    segundos:          st.segundos
  });
  EstadoJuego.guardarPuntajeFinal(pts); // Guarda el puntaje en el estado

  // Muestra el panel de fin con todos los datos: resultado, puntaje, tiempo
  mostrarPanelFin(EstadoJuego.obtener());
}

// ── GUARDAR PUNTAJE ───────────────────────────────────────────

// Guarda el puntaje de la partida actual en MySQL via POST /api/score.
// Lee el nombre del input del jugador; si está vacío, muestra un error.
async function _guardarPuntaje() {
  const nombre = document.getElementById('input-nombre')?.value.trim();
  if (!nombre) {
    mostrarFeedback('Ingresá tu nombre para guardar el puntaje.', false);
    return;
  }

  const st  = EstadoJuego.obtener();
  const btn = document.getElementById('btn-guardar');

  // Arma el objeto con todos los datos del score
  const body = {
    nombre,
    puntos:     st.puntaje,
    tiempo:     formatearTiempoMySQL(st.segundos), // Convierte a HH:MM:SS para MySQL
    fecha:      fechaHoy(),                        // Fecha en YYYY-MM-DD para MySQL
    categoria:  etiqueta(st.categoria),            // "tecnologia" → "Tecnologia"
    dificultad: etiqueta(st.dificultad),
    resultado:  st.gano ? 'Gano' : 'Perdio'
  };

  try {
    if (btn) btn.disabled = true; // Deshabilita el botón para evitar doble guardado
    await apiGuardarScore(body);  // POST al servidor
    mostrarFeedback('Puntaje guardado correctamente.', true);
    await cargarRanking(); // Recarga el ranking para mostrar el nuevo score
  } catch (_err) {
    mostrarFeedback('Error al guardar. Verificá que MySQL de XAMPP esté activo.', false);
  } finally {
    if (btn) btn.disabled = false; // Re-habilita el botón siempre
  }
}

// ── PDF DESDE PANEL DE FIN ────────────────────────────────────

// Abre el modal de PDF con los datos del jugador actual (desde el panel de fin).
// Solo funciona si la palabra está disponible en el estado.
function _abrirPdfJugador() {
  const st = EstadoJuego.obtener();
  if (!st.palabraCompleta) return; // No hay partida terminada

  abrirModalPdf('jugador', {
    id:         'actual',
    nombre:     document.getElementById('input-nombre')?.value.trim() || 'Jugador',
    puntos:     st.puntaje,
    tiempo:     formatearTiempoMySQL(st.segundos),
    fecha:      fechaHoy(),
    categoria:  etiqueta(st.categoria),
    dificultad: etiqueta(st.dificultad),
    resultado:  st.gano ? 'Gano' : 'Perdio'
  });
}

// ── REGISTRO DE EVENTOS ───────────────────────────────────────

// Registra todos los event listeners del HTML. Se llama una sola vez al cargar el DOM.
function registrarEventos() {
  const $ = (id) => document.getElementById(id); // Alias corto para getElementById

  // ── Botones de partida ──
  $('btn-nueva-partida')?.addEventListener('click', iniciarPartida); // Iniciar desde pantalla de inicio
  $('btn-reiniciar')?.addEventListener('click',     iniciarPartida); // Jugar de nuevo desde panel de fin
  $('btn-guardar')?.addEventListener('click',       _guardarPuntaje); // Guardar puntaje en MySQL
  $('btn-pista')?.addEventListener('click',         _usarPista);      // Usar pista

  // ── Tema ──
  $('btn-tema')?.addEventListener('click', alternarTema); // Alterna claro/oscuro

  // ── Info de dificultad ──
  // Al cambiar el select, actualiza la descripción debajo con intentos y pistas
  $('select-dificultad')?.addEventListener('change', (e) =>
    actualizarInfoDificultad(e.target.value)
  );

  // ── Ranking (búsqueda, orden, paginación) ──
  $('buscador-ranking')?.addEventListener('input',  () => aplicarFiltros(true));  // Filtra al escribir
  $('orden-ranking')?.addEventListener('change',    () => aplicarFiltros(true));  // Reordena al cambiar
  $('pagina-prev')?.addEventListener('click',       () => cambiarPagina(-1));     // Página anterior
  $('pagina-next')?.addEventListener('click',       () => cambiarPagina(+1));     // Página siguiente

  // ── Botones de PDF ──
  $('btn-pdf')?.addEventListener('click', _abrirPdfJugador);                    // PDF del jugador actual
  $('btn-pdf-ranking')?.addEventListener('click', () => abrirModalPdf('ranking')); // PDF del ranking
  $('btn-cerrar-modal')?.addEventListener('click',  cerrarModalPdf);            // Cierra el modal
  $('btn-cancelar-pdf')?.addEventListener('click',  cerrarModalPdf);            // Cancela y cierra

  // Botón "Generar PDF" dentro del modal: lee el estado actual y genera el archivo
  $('btn-generar-pdf')?.addEventListener('click', () => {
    const st = EstadoJuego.obtener();
    generarPdf({
      id:         'actual',
      nombre:     $('input-nombre')?.value.trim() || 'Jugador',
      puntos:     st.puntaje,
      tiempo:     formatearTiempoMySQL(st.segundos),
      fecha:      fechaHoy(),
      categoria:  etiqueta(st.categoria),
      dificultad: etiqueta(st.dificultad),
      resultado:  st.gano ? 'Gano' : 'Perdio'
    });
  });

  // Cierra el modal al hacer click en el fondo oscuro (fuera del panel)
  $('modal-pdf')?.addEventListener('click', (e) => {
    if (e.target === $('modal-pdf')) cerrarModalPdf(); // Solo si el click fue en el overlay
  });

  // Delegación de eventos en la tabla del ranking:
  // en lugar de un listener por fila, hay uno en el tbody que detecta clicks en botones .row-pdf
  $('tabla-body')?.addEventListener('click', (e) => {
    const btn = e.target.closest('.row-pdf'); // Sube en el DOM hasta encontrar el botón PDF
    if (!btn) return;
    const score = buscarScorePorId(btn.dataset.scoreId); // Busca el score por id en la lista visible
    if (score) abrirModalPdf('jugador', score);           // Abre el modal con ese jugador
  });

  // ── Teclado físico ──
  document.addEventListener('keydown', (e) => {
    // Escape cierra el modal PDF si está abierto
    if (e.key === 'Escape') {
      const modal = $('modal-pdf');
      if (modal && !modal.classList.contains('hidden')) {
        cerrarModalPdf();
        return;
      }
    }
    // Cualquier letra del teclado físico se procesa como intento
    const letra = normalizarTexto(e.key);
    if (/^[a-zñ]$/.test(letra)) _procesarLetra(letra);
  });
}

// ── ARRANQUE ──────────────────────────────────────────────────

// Se ejecuta cuando el HTML ya fue parseado y los elementos del DOM están disponibles.
// Punto de entrada de la aplicación.
window.addEventListener('DOMContentLoaded', () => {
  cargarTema();                // Aplica el tema guardado en localStorage
  actualizarInfoDificultad(   // Muestra la info de la dificultad seleccionada por defecto
    document.getElementById('select-dificultad')?.value || 'media'
  );
  cargarRanking();             // Carga los scores desde MySQL y renderiza la tabla
  registrarEventos();          // Conecta todos los botones y controles con sus funciones
  refrescarIconos();           // Re-renderiza íconos Lucide si los hay en el HTML inicial
});
