// ============================================================
// main.js - Orquestador principal del juego
// ============================================================
// Une todos los módulos. Gestiona el flujo de partida y los eventos.

// Guard de nivel módulo: evita que dos llamadas a iniciarPartida()
// corran en paralelo aunque el estado interno todavía no se haya
// actualizado entre ticks de JS.
let _iniciando = false;

// ── INICIAR PARTIDA ──────────────────────────────────────────

async function iniciarPartida() {
  // Guard doble: nivel módulo + estado interno
  if (_iniciando || EstadoJuego.obtener().cargando) return;
  _iniciando = true;

  const categoria  = document.getElementById('select-categoria')?.value  || 'general';
  const dificultad = document.getElementById('select-dificultad')?.value || 'media';

  // Deshabilitar botones para evitar doble clic
  EstadoJuego.marcarCargando(true);
  const btnIniciar   = document.getElementById('btn-nueva-partida');
  const btnReiniciar = document.getElementById('btn-reiniciar');
  if (btnIniciar)   btnIniciar.disabled   = true;
  if (btnReiniciar) btnReiniciar.disabled = true;

  // 1. Detener cronómetro anterior
  Cronometro.resetear();

  // 2. Limpiar estado interno completamente
  EstadoJuego.reiniciar(categoria, dificultad);

  // 3. Limpiar UI (muñeco, palabra, teclado, contadores) ANTES del fetch
  resetearMuneco();
  mostrarAreaJuego();
  mostrarMensajeCarga('Cargando palabra...');

  try {
    // 4. Pedir palabra al servidor (solo usa /data/*.json)
    const datos = await apiObtenerPalabra(categoria, dificultad);

    // 5. Cargar datos en el estado centralizado
    EstadoJuego.iniciarDesdeApi(datos);

    const st = EstadoJuego.obtener();

    // 6. Actualizar UI con los datos recibidos
    actualizarMetaJuego(st.categoria, st.dificultad);
    mostrarMensajeCarga(null);

    // 7. Dibujar palabra y teclado limpios (sin residuos)
    dibujarPalabra(st.palabra, EstadoJuego.letrasAdivinadas());
    renderizarTeclado(
      EstadoJuego.letrasAdivinadas(),
      EstadoJuego.letrasEnPalabra(),
      _procesarLetra
    );

    // 8. Mostrar contadores correctos (intentos y pistas de la dificultad)
    actualizarContadores(st);

    // 9. Arrancar cronómetro — el puntaje NO se actualiza en vivo,
    //    solo el cronómetro y los segundos internos
    Cronometro.iniciar((segundos) => {
      EstadoJuego.actualizarSegundos(segundos);
      actualizarCronometro(segundos);
    });

  } catch (_err) {
    mostrarMensajeCarga('Error al cargar palabra. Verificá el servidor.');
    EstadoJuego.marcarCargando(false);
  } finally {
    if (btnIniciar)   btnIniciar.disabled   = false;
    if (btnReiniciar) btnReiniciar.disabled = false;
    _iniciando = false;
  }
}

// ── LÓGICA DE LETRA ──────────────────────────────────────────

function _procesarLetra(letra) {
  const estado = EstadoJuego.obtener();

  // Guards: juego terminado, cargando, sin palabra, o iniciando nueva partida
  if (estado.terminado || estado.cargando || !estado.palabra.length || _iniciando) return;

  const normalizada = normalizarTexto(letra);
  if (!/^[a-zñ]$/.test(normalizada)) return;

  const resultado = EstadoJuego.intentarLetra(normalizada);
  if (resultado === 'repetida') {
    animarLetraUsada(normalizada);
    return;
  }
  if (resultado === 'terminado') return;

  const st = EstadoJuego.obtener();

  // Redibujar la palabra con las nuevas letras descubiertas
  dibujarPalabra(st.palabra, EstadoJuego.letrasAdivinadas());

  // Si fue error: dibujar la siguiente parte del muñeco
  if (resultado === 'incorrecta') {
    const errores = st.intentosMaximos - st.intentosRestantes;
    actualizarMuneco(errores);
  }

  // Actualizar teclado y contadores
  renderizarTeclado(
    EstadoJuego.letrasAdivinadas(),
    EstadoJuego.letrasEnPalabra(),
    _procesarLetra
  );
  actualizarContadores(st);

  // Verificar fin de partida
  if (EstadoJuego.verificarVictoria()) {
    _terminarPartida();
  } else if (EstadoJuego.verificarDerrota()) {
    actualizarMuneco(PARTES_AHORCADO.length); // muñeco completo al perder
    _terminarPartida();
  }
}

// ── PISTA ─────────────────────────────────────────────────────

function _usarPista() {
  const estado = EstadoJuego.obtener();
  if (estado.terminado || estado.cargando || !estado.palabra.length || _iniciando) return;

  const letra = EstadoJuego.usarPista();
  if (!letra) return;

  const st = EstadoJuego.obtener();
  dibujarPalabra(st.palabra, EstadoJuego.letrasAdivinadas());
  renderizarTeclado(
    EstadoJuego.letrasAdivinadas(),
    EstadoJuego.letrasEnPalabra(),
    _procesarLetra
  );
  actualizarContadores(st);

  if (EstadoJuego.verificarVictoria()) _terminarPartida();
}

// ── FIN DE PARTIDA ────────────────────────────────────────────

function _terminarPartida() {
  Cronometro.detener();
  const st = EstadoJuego.obtener();

  // Calcular puntaje final (0 si perdió)
  const pts = calcularPuntajeFinal({
    gano:              st.gano,
    palabraLength:     st.palabra.length,
    dificultad:        st.dificultad,
    intentosRestantes: st.intentosRestantes,
    pistasRestantes:   st.pistasRestantes,
    segundos:          st.segundos
  });
  EstadoJuego.guardarPuntajeFinal(pts);

  // Mostrar panel de fin con el puntaje final calculado
  mostrarPanelFin(EstadoJuego.obtener());
}

// ── GUARDAR PUNTAJE ───────────────────────────────────────────

async function _guardarPuntaje() {
  const nombre = document.getElementById('input-nombre')?.value.trim();
  if (!nombre) {
    mostrarFeedback('Ingresá tu nombre para guardar el puntaje.', false);
    return;
  }

  const st  = EstadoJuego.obtener();
  const btn = document.getElementById('btn-guardar');

  const body = {
    nombre,
    puntos:     st.puntaje,
    tiempo:     formatearTiempoMySQL(st.segundos),
    fecha:      fechaHoy(),
    categoria:  etiqueta(st.categoria),
    dificultad: etiqueta(st.dificultad),
    resultado:  st.gano ? 'Gano' : 'Perdio'
  };

  try {
    if (btn) btn.disabled = true;
    await apiGuardarScore(body);
    mostrarFeedback('Puntaje guardado correctamente.', true);
    await cargarRanking();
  } catch (_err) {
    mostrarFeedback('Error al guardar. Verificá que MySQL de XAMPP esté activo.', false);
  } finally {
    if (btn) btn.disabled = false;
  }
}

// ── PDF DESDE PANEL DE FIN ────────────────────────────────────

function _abrirPdfJugador() {
  const st = EstadoJuego.obtener();
  if (!st.palabraCompleta) return;

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

function registrarEventos() {
  const $ = (id) => document.getElementById(id);

  // Partida
  $('btn-nueva-partida')?.addEventListener('click', iniciarPartida);
  $('btn-reiniciar')?.addEventListener('click', iniciarPartida);
  $('btn-guardar')?.addEventListener('click', _guardarPuntaje);
  $('btn-pista')?.addEventListener('click', _usarPista);

  // Tema
  $('btn-tema')?.addEventListener('click', alternarTema);

  // Info de dificultad
  $('select-dificultad')?.addEventListener('change', (e) =>
    actualizarInfoDificultad(e.target.value)
  );

  // Ranking
  $('buscador-ranking')?.addEventListener('input',  () => aplicarFiltros(true));
  $('orden-ranking')?.addEventListener('change',    () => aplicarFiltros(true));
  $('pagina-prev')?.addEventListener('click',       () => cambiarPagina(-1));
  $('pagina-next')?.addEventListener('click',       () => cambiarPagina(+1));

  // PDF
  $('btn-pdf')?.addEventListener('click', _abrirPdfJugador);
  $('btn-pdf-ranking')?.addEventListener('click', () => abrirModalPdf('ranking'));
  $('btn-cerrar-modal')?.addEventListener('click', cerrarModalPdf);
  $('btn-cancelar-pdf')?.addEventListener('click', cerrarModalPdf);
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

  $('modal-pdf')?.addEventListener('click', (e) => {
    if (e.target === $('modal-pdf')) cerrarModalPdf();
  });

  $('tabla-body')?.addEventListener('click', (e) => {
    const btn = e.target.closest('.row-pdf');
    if (!btn) return;
    const score = buscarScorePorId(btn.dataset.scoreId);
    if (score) abrirModalPdf('jugador', score);
  });

  // Teclado físico
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      const modal = $('modal-pdf');
      if (modal && !modal.classList.contains('hidden')) {
        cerrarModalPdf();
        return;
      }
    }
    const letra = normalizarTexto(e.key);
    if (/^[a-zñ]$/.test(letra)) _procesarLetra(letra);
  });
}

// ── ARRANQUE ──────────────────────────────────────────────────

window.addEventListener('DOMContentLoaded', () => {
  cargarTema();
  actualizarInfoDificultad(
    document.getElementById('select-dificultad')?.value || 'media'
  );
  cargarRanking();
  registrarEventos();
  refrescarIconos();
});
