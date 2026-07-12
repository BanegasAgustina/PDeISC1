// ============================================================
// ranking.js - Tabla de posiciones
// ============================================================
// Carga los scores del servidor, los filtra, ordena y pagina.
// No tiene lógica de juego: solo maneja la presentación del ranking.

let _scoresOriginales = []; // Todos los scores como vinieron del servidor (sin filtros)
let _scoresVisibles   = []; // Scores después de aplicar búsqueda y orden (pueden ser menos)
let _paginaActual     = 1;  // Página actualmente visible en la tabla (empieza en 1)

// Carga los scores del servidor y renderiza la tabla.
// Se llama al cargar la página y después de guardar un puntaje nuevo.
async function cargarRanking() {
  try {
    const scores = await apiObtenerScores(); // Fetch a /api/score
    // Mapea cada registro para asegurar que tenga todos los campos esperados
    _scoresOriginales = scores.map((s, i) => ({
      ...s,                                                              // Copia todos los campos del servidor
      categoria:    s.categoria  || 'General',                          // Valor por defecto si viene vacío
      dificultad:   s.dificultad || 'Media',
      resultado:    s.resultado  || (Number(s.puntos) > 0 ? 'Gano' : 'Perdio'), // Inferido si falta
      posicionBase: i + 1                                                // Posición original del servidor
    }));
    aplicarFiltros(); // Renderiza la tabla con los datos recién cargados
  } catch {
    // Si falla el fetch (MySQL caído, etc.), muestra un mensaje de error en la tabla
    const tb = document.getElementById('tabla-body');
    if (tb) tb.innerHTML = '<tr><td colspan="8" class="empty-row">Error al cargar posiciones. Verifica MySQL.</td></tr>';
  }
}

// Filtra por búsqueda de nombre y ordena según el criterio del select.
// resetearPagina=true → vuelve a la página 1 (se usa al buscar o cambiar el orden).
// resetearPagina=false (default) → mantiene la página actual.
function aplicarFiltros(resetearPagina = false) {
  if (resetearPagina) _paginaActual = 1; // Vuelve a la primera página si cambió el filtro

  // Lee el texto del buscador y lo normaliza (sin tildes, minúsculas)
  const busqueda = normalizarTexto(document.getElementById('buscador-ranking')?.value || '');
  // Lee el criterio de orden seleccionado (ej: "puntos_desc")
  const orden    = document.getElementById('orden-ranking')?.value || 'puntos_desc';

  // Filtra: mantiene solo los registros cuyo nombre normalizado contiene el texto buscado
  _scoresVisibles = _scoresOriginales.filter(
    (s) => normalizarTexto(s.nombre).includes(busqueda)
  );
  // Ordena según el criterio elegido
  _scoresVisibles.sort((a, b) => _compararScores(a, b, orden));

  // Ajusta la página actual para que no quede fuera de rango si hay menos resultados
  const total = Math.max(1, Math.ceil(_scoresVisibles.length / FILAS_POR_PAGINA));
  _paginaActual = Math.min(_paginaActual, total);
  _renderizarTabla(); // Dibuja la tabla con los datos filtrados y ordenados
}

// Renderiza solo las filas de la página actual en el <tbody> de la tabla.
function _renderizarTabla() {
  const tb      = document.getElementById('tabla-body');   // Cuerpo de la tabla
  const info    = document.getElementById('pagina-info');  // Texto "Página X de Y"
  const btnPrev = document.getElementById('pagina-prev');  // Botón ← anterior
  const btnNext = document.getElementById('pagina-next');  // Botón → siguiente
  if (!tb) return;

  const total  = Math.max(1, Math.ceil(_scoresVisibles.length / FILAS_POR_PAGINA));
  const inicio = (_paginaActual - 1) * FILAS_POR_PAGINA; // Índice del primer elemento de la página
  const pagina = _scoresVisibles.slice(inicio, inicio + FILAS_POR_PAGINA); // Recorta la página

  if (!pagina.length) {
    // Sin resultados: muestra mensaje vacío
    tb.innerHTML = '<tr><td colspan="8" class="empty-row">No hay resultados para la búsqueda.</td></tr>';
  } else {
    // Construye el HTML de las filas de la página actual
    tb.innerHTML = pagina.map((s, i) => {
      const pos = inicio + i + 1; // Posición global dentro de los resultados visibles
      // Los primeros 3 puestos muestran medallas emoji; los demás muestran el número
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

  if (info)    info.textContent = `Pagina ${_paginaActual} de ${total}`; // Actualiza texto de paginación
  if (btnPrev) btnPrev.disabled = _paginaActual <= 1;                   // Deshabilita ← en primera página
  if (btnNext) btnNext.disabled = _paginaActual >= total;               // Deshabilita → en última página
  refrescarIconos(); // Re-renderiza íconos Lucide si los hay
}

// Avanza o retrocede de página según el delta (+1 o -1).
// Aplica límites para no salirse del rango.
function cambiarPagina(delta) {
  const total = Math.max(1, Math.ceil(_scoresVisibles.length / FILAS_POR_PAGINA));
  _paginaActual = Math.max(1, Math.min(total, _paginaActual + delta)); // Clamp entre 1 y total
  _renderizarTabla();
}

// Función de comparación para Array.sort().
// Compara dos registros según el criterio elegido en el select de orden.
// Retorna número negativo, cero o positivo (contrato de comparador).
function _compararScores(a, b, orden) {
  const nA = normalizarTexto(a.nombre);       // Nombre normalizado para ordenar alfabéticamente
  const nB = normalizarTexto(b.nombre);
  const fA = new Date(a.fecha).getTime() || 0; // Fecha como timestamp (ms desde epoch)
  const fB = new Date(b.fecha).getTime() || 0;

  // Mapa de criterios → expresión de comparación
  const mapa = {
    puntos_desc: Number(b.puntos)  - Number(a.puntos),           // Mayor puntaje primero
    puntos_asc:  Number(a.puntos)  - Number(b.puntos),           // Menor puntaje primero
    nombre_asc:  nA.localeCompare(nB),                            // A→Z
    nombre_desc: nB.localeCompare(nA),                            // Z→A
    tiempo_asc:  tiempoASegundos(a.tiempo) - tiempoASegundos(b.tiempo), // Menor tiempo primero
    tiempo_desc: tiempoASegundos(b.tiempo) - tiempoASegundos(a.tiempo), // Mayor tiempo primero
    fecha_desc:  fB - fA,                                         // Más reciente primero
    fecha_asc:   fA - fB                                          // Más antiguo primero
  };
  // Si el criterio no existe en el mapa, usa puntos descendente como default
  return mapa[orden] ?? mapa.puntos_desc;
}

// Busca un score por su id en la lista visible actual.
// Se usa cuando el usuario hace clic en el botón PDF de una fila.
function buscarScorePorId(id) {
  return _scoresVisibles.find((s) => String(s.id) === String(id)) || null;
}

// Devuelve la posición del registro en el ranking global ordenado por puntos.
// Primero busca en la vista actual; si no está (por filtros), busca en el original.
function obtenerPosicionGlobal(registro) {
  const idx = _scoresVisibles.findIndex((s) => String(s.id) === String(registro.id));
  if (idx >= 0) return idx + 1; // Posición en la vista filtrada

  // Si el registro no aparece en la vista (filtrado), busca en el ranking completo
  const ordenados = [..._scoresOriginales].sort((a, b) => _compararScores(a, b, 'puntos_desc'));
  const idxG = ordenados.findIndex((s) => String(s.id) === String(registro.id));
  return idxG >= 0 ? idxG + 1 : '-'; // '-' si no se encontró
}

// Expone la lista de scores visible para que pdf.js pueda generar el PDF del ranking completo.
function obtenerScoresVisibles() { return _scoresVisibles; }
