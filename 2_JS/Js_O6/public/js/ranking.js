// ============================================================
// ranking.js - Tabla de posiciones
// ============================================================
// Carga, filtra, ordena y renderiza el ranking. Sin lógica de juego.

let _scoresOriginales = [];
let _scoresVisibles   = [];
let _paginaActual     = 1;

// Carga los scores del servidor y renderiza la tabla.
async function cargarRanking() {
  try {
    const scores = await apiObtenerScores();
    _scoresOriginales = scores.map((s, i) => ({
      ...s,
      categoria:  s.categoria  || 'General',
      dificultad: s.dificultad || 'Media',
      resultado:  s.resultado  || (Number(s.puntos) > 0 ? 'Gano' : 'Perdio'),
      posicionBase: i + 1
    }));
    aplicarFiltros();
  } catch {
    const tb = document.getElementById('tabla-body');
    if (tb) tb.innerHTML = '<tr><td colspan="8" class="empty-row">Error al cargar posiciones. Verifica MySQL.</td></tr>';
  }
}

// Filtra y ordena según los controles de la barra de herramientas.
// resetearPagina: si es true, vuelve a la página 1 (usar al buscar/ordenar).
function aplicarFiltros(resetearPagina = false) {
  if (resetearPagina) _paginaActual = 1;

  const busqueda = normalizarTexto(document.getElementById('buscador-ranking')?.value || '');
  const orden    = document.getElementById('orden-ranking')?.value || 'puntos_desc';

  _scoresVisibles = _scoresOriginales.filter(
    (s) => normalizarTexto(s.nombre).includes(busqueda)
  );
  _scoresVisibles.sort((a, b) => _compararScores(a, b, orden));

  const total = Math.max(1, Math.ceil(_scoresVisibles.length / FILAS_POR_PAGINA));
  _paginaActual = Math.min(_paginaActual, total);
  _renderizarTabla();
}

// Renderiza solo las filas de la página actual.
function _renderizarTabla() {
  const tb     = document.getElementById('tabla-body');
  const info   = document.getElementById('pagina-info');
  const btnPrev = document.getElementById('pagina-prev');
  const btnNext = document.getElementById('pagina-next');
  if (!tb) return;

  const total  = Math.max(1, Math.ceil(_scoresVisibles.length / FILAS_POR_PAGINA));
  const inicio = (_paginaActual - 1) * FILAS_POR_PAGINA;
  const pagina = _scoresVisibles.slice(inicio, inicio + FILAS_POR_PAGINA);

  if (!pagina.length) {
    tb.innerHTML = '<tr><td colspan="8" class="empty-row">No hay resultados para la búsqueda.</td></tr>';
  } else {
    tb.innerHTML = pagina.map((s, i) => {
      const pos = inicio + i + 1;
      const rankLabel = pos === 1 ? '🥇' : pos === 2 ? '🥈' : pos === 3 ? '🥉' : pos;
      return `
        <tr>
          <td><span class="rank rank--${pos <= 3 ? pos : 'other'}">${rankLabel}</span></td>
          <td>${escaparHTML(s.nombre)}</td>
          <td>${escaparHTML(s.categoria)}</td>
          <td><span class="pill">${escaparHTML(s.dificultad)}</span></td>
          <td><strong>${Number(s.puntos)}</strong></td>
          <td>${String(s.tiempo).substring(0, 8)}</td>
          <td>${formatearFecha(s.fecha)}</td>
          <td>
            <button class="row-pdf icon-btn" type="button" data-score-id="${s.id}" aria-label="Exportar jugador">
              <span class="emoji" aria-hidden="true">📄</span>
            </button>
          </td>
        </tr>`;
    }).join('');
  }

  if (info)    info.textContent   = `Pagina ${_paginaActual} de ${total}`;
  if (btnPrev) btnPrev.disabled   = _paginaActual <= 1;
  if (btnNext) btnNext.disabled   = _paginaActual >= total;
  refrescarIconos();
}

// Avanza o retrocede de página.
function cambiarPagina(delta) {
  const total = Math.max(1, Math.ceil(_scoresVisibles.length / FILAS_POR_PAGINA));
  _paginaActual = Math.max(1, Math.min(total, _paginaActual + delta));
  _renderizarTabla();
}

// Compara dos registros según el criterio seleccionado.
function _compararScores(a, b, orden) {
  const nA = normalizarTexto(a.nombre);
  const nB = normalizarTexto(b.nombre);
  const fA = new Date(a.fecha).getTime() || 0;
  const fB = new Date(b.fecha).getTime() || 0;

  const mapa = {
    puntos_desc: Number(b.puntos)  - Number(a.puntos),
    puntos_asc:  Number(a.puntos)  - Number(b.puntos),
    nombre_asc:  nA.localeCompare(nB),
    nombre_desc: nB.localeCompare(nA),
    tiempo_asc:  tiempoASegundos(a.tiempo) - tiempoASegundos(b.tiempo),
    tiempo_desc: tiempoASegundos(b.tiempo) - tiempoASegundos(a.tiempo),
    fecha_desc:  fB - fA,
    fecha_asc:   fA - fB
  };
  return mapa[orden] ?? mapa.puntos_desc;
}

// Busca un score por id en la lista visible (para el PDF por fila).
function buscarScorePorId(id) {
  return _scoresVisibles.find((s) => String(s.id) === String(id)) || null;
}

// Devuelve la posición global del registro en el ranking completo ordenado por puntos.
function obtenerPosicionGlobal(registro) {
  const idx = _scoresVisibles.findIndex((s) => String(s.id) === String(registro.id));
  if (idx >= 0) return idx + 1;
  const ordenados = [..._scoresOriginales].sort((a, b) => _compararScores(a, b, 'puntos_desc'));
  const idxG = ordenados.findIndex((s) => String(s.id) === String(registro.id));
  return idxG >= 0 ? idxG + 1 : '-';
}

// Expone la lista visible para el PDF del ranking completo.
function obtenerScoresVisibles() { return _scoresVisibles; }
