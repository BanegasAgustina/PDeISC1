// ============================================================
// pdf.js - Generación y modal de exportación PDF
// ============================================================
// Toda la lógica de jsPDF está aquí. No toca el estado del juego.

let _pdfContexto = { alcance: 'ranking', jugador: null };

// Abre el modal y configura el contexto (ranking o jugador individual).
function abrirModalPdf(alcance, jugador = null) {
  _pdfContexto = { alcance, jugador };
  const elAlcance = document.getElementById('pdf-alcance');
  if (elAlcance) {
    elAlcance.value    = alcance;
    elAlcance.disabled = Boolean(jugador);
  }
  document.getElementById('modal-pdf')?.classList.remove('hidden');
  document.getElementById('btn-generar-pdf')?.focus();
}

// Cierra el modal de configuración de PDF.
function cerrarModalPdf() {
  document.getElementById('modal-pdf')?.classList.add('hidden');
  const elAlcance = document.getElementById('pdf-alcance');
  if (elAlcance) elAlcance.disabled = false;
}

// Lee todas las opciones del modal.
function _leerOpciones() {
  const campos = {};
  document.querySelectorAll('[data-pdf-field]').forEach((inp) => {
    campos[inp.dataset.pdfField] = inp.checked;
  });
  return {
    campos,
    formato:     document.getElementById('pdf-formato')?.value    || 'a4',
    orientacion: document.getElementById('pdf-orientacion')?.value || 'portrait',
    tema:        document.getElementById('pdf-tema')?.value        || 'light',
    alcance:     document.getElementById('pdf-alcance')?.value     || 'ranking'
  };
}

async function _asegurarJsPdf() {
  if (window.jspdf?.jsPDF) return true;

  await new Promise((resolve, reject) => {
    const existente = document.querySelector('script[data-jspdf-loader]');
    if (existente) {
      existente.addEventListener('load', resolve, { once: true });
      existente.addEventListener('error', reject, { once: true });
      return;
    }

    const script = document.createElement('script');
    script.src = 'vendor/jspdf.umd.min.js';
    script.async = true;
    script.dataset.jspdfLoader = 'true';
    script.onload = resolve;
    script.onerror = reject;
    document.head.appendChild(script);
  });

  return Boolean(window.jspdf?.jsPDF);
}

// Genera el PDF según el contexto y las opciones del modal.
async function generarPdf(scoreDesdePartida) {
  const opciones  = _leerOpciones();
  const esJugador = Boolean(_pdfContexto.jugador);
  const registros = esJugador
    ? [_pdfContexto.jugador || scoreDesdePartida]
    : obtenerScoresVisibles();

  if (!registros.length) { cerrarModalPdf(); return; }

  try {
    await _asegurarJsPdf();
  } catch {
    alert('No se pudo cargar el generador PDF. Verificá la conexión e intentá nuevamente.');
    return;
  }

  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({ orientation: opciones.orientacion, unit: 'mm', format: opciones.formato });

  const oscuro    = opciones.tema === 'dark';
  const pageW     = doc.internal.pageSize.getWidth();
  const pageH     = doc.internal.pageSize.getHeight();
  let y = 18;

  _pintarFondo(doc, oscuro, pageW, pageH);
  y = _dibujarEncabezado(doc, opciones, oscuro, pageW, y);

  registros.forEach((reg, idx) => {
    const pos = esJugador ? obtenerPosicionGlobal(reg) : obtenerScoresVisibles().indexOf(reg) + 1;
    if (y > pageH - 35) {
      doc.addPage();
      _pintarFondo(doc, oscuro, pageW, pageH);
      y = _dibujarEncabezado(doc, opciones, oscuro, pageW, 18);
    }
    y = _dibujarRegistro(doc, reg, pos, opciones, oscuro, y, idx);
  });

  if (opciones.campos.firma) {
    doc.setFontSize(9);
    doc.setTextColor(oscuro ? 180 : 90);
    doc.text('Generado por el sistema del Juego del Ahorcado', 14, pageH - 12);
  }

  const nombre = esJugador
    ? `jugador_${normalizarTexto(registros[0].nombre || 'jugador').replace(/\s+/g, '_')}_${fechaHoy()}.pdf`
    : `ranking_ahorcado_${fechaHoy()}.pdf`;

  doc.save(nombre);
  cerrarModalPdf();
}

function _pintarFondo(doc, oscuro, w, h) {
  doc.setFillColor(oscuro ? 18 : 248, oscuro ? 24 : 250, oscuro ? 38 : 252);
  doc.rect(0, 0, w, h, 'F');
}

function _dibujarEncabezado(doc, opciones, oscuro, pageW, y) {
  if (opciones.campos.logo) {
    doc.setFillColor(37, 99, 235);
    doc.roundedRect(14, y - 8, 12, 12, 3, 3, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(11);
    doc.text('A', 20, y, { align: 'center' });
  }
  doc.setTextColor(oscuro ? 245 : 20, oscuro ? 247 : 24, oscuro ? 250 : 34);
  doc.setFontSize(18);
  doc.text('Juego del Ahorcado', opciones.campos.logo ? 31 : 14, y);

  const ahora = new Date();
  const meta = [];
  if (opciones.campos.fechaPdf) meta.push(`Fecha: ${ahora.toLocaleDateString('es-AR')}`);
  if (opciones.campos.horaPdf)  meta.push(`Hora: ${ahora.toLocaleTimeString('es-AR')}`);
  if (opciones.campos.tema)     meta.push(`Tema: ${opciones.tema === 'dark' ? 'Oscuro' : 'Claro'}`);

  doc.setFontSize(9);
  doc.setTextColor(oscuro ? 170 : 90);
  doc.text(meta.join('  |  '), 14, y + 10);
  doc.setDrawColor(37, 99, 235);
  doc.line(14, y + 15, pageW - 14, y + 15);
  return y + 26;
}

function _dibujarRegistro(doc, reg, pos, opciones, oscuro, y, idx) {
  const c    = opciones.campos;
  const tp   = oscuro ? [245,247,250] : [20,24,34];
  const ts   = oscuro ? [180,190,205] : [75,85,99];
  const bg   = oscuro ? [30,41,59]    : [255,255,255];
  const pageW = doc.internal.pageSize.getWidth();

  doc.setFillColor(...bg);
  doc.roundedRect(14, y - 6, pageW - 28, 36, 3, 3, 'F');
  doc.setTextColor(...tp);
  doc.setFontSize(12);
  doc.text(c.nombre ? `${idx + 1}. ${reg.nombre}` : `Registro ${idx + 1}`, 20, y + 1);

  const det = [];
  if (c.posicion)   det.push(`Posicion: ${pos}`);
  if (c.categoria)  det.push(`Categoria: ${reg.categoria}`);
  if (c.dificultad) det.push(`Dificultad: ${reg.dificultad}`);
  if (c.puntos)     det.push(`Puntaje: ${reg.puntos}`);
  if (c.tiempo)     det.push(`Tiempo: ${String(reg.tiempo).substring(0,8)}`);
  if (c.fecha)      det.push(`Fecha: ${formatearFecha(reg.fecha)}`);
  if (c.resultado)  det.push(`Resultado: ${reg.resultado}`);

  doc.setTextColor(...ts);
  doc.setFontSize(9);
  const lineas = doc.splitTextToSize(det.join('  |  '), pageW - 40);
  doc.text(lineas, 20, y + 11);
  return y + 42;
}
