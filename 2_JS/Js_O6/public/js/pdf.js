// ============================================================
// pdf.js - Generación y modal de exportación PDF
// ============================================================
// Toda la lógica de jsPDF está aquí. No modifica el estado del juego.
// Puede generar PDFs de un jugador individual o del ranking completo.

// Contexto del modal: guarda para quién se va a generar el PDF.
// alcance: 'ranking' o 'jugador'
// jugador: objeto del score si es individual, null si es ranking completo
let _pdfContexto = { alcance: 'ranking', jugador: null };

// Abre el modal de configuración de PDF y prepara el contexto.
// Si jugador no es null, el select de alcance se fija y deshabilita.
function abrirModalPdf(alcance, jugador = null) {
  _pdfContexto = { alcance, jugador };
  const elAlcance = document.getElementById('pdf-alcance');
  if (elAlcance) {
    elAlcance.value    = alcance;          // Pre-selecciona el alcance correcto
    elAlcance.disabled = Boolean(jugador); // Deshabilita el select si hay jugador específico
  }
  document.getElementById('modal-pdf')?.classList.remove('hidden'); // Muestra el modal
  document.getElementById('btn-generar-pdf')?.focus();               // Pone el foco en el botón principal
}

// Cierra el modal de configuración y re-habilita el select de alcance.
function cerrarModalPdf() {
  document.getElementById('modal-pdf')?.classList.add('hidden'); // Oculta el modal
  const elAlcance = document.getElementById('pdf-alcance');
  if (elAlcance) elAlcance.disabled = false; // Vuelve a habilitar para la próxima apertura
}

// Lee todas las opciones seleccionadas en el modal.
// Retorna un objeto con los campos a incluir y las opciones de formato.
function _leerOpciones() {
  const campos = {};
  // Recorre todos los checkboxes con data-pdf-field y guarda true/false según estén marcados
  document.querySelectorAll('[data-pdf-field]').forEach((inp) => {
    campos[inp.dataset.pdfField] = inp.checked;
  });
  return {
    campos,                                                                    // Qué campos incluir
    formato:     document.getElementById('pdf-formato')?.value    || 'a4',   // A4 o Carta
    orientacion: document.getElementById('pdf-orientacion')?.value || 'portrait', // Vertical u Horizontal
    tema:        document.getElementById('pdf-tema')?.value        || 'light', // Claro u Oscuro
    alcance:     document.getElementById('pdf-alcance')?.value     || 'ranking' // Ranking o jugador
  };
}

// Carga la librería jsPDF dinámicamente si aún no está disponible.
// La carga se hace solo cuando se necesita para no bloquear el inicio de la página.
// Retorna true si la librería está lista, lanza error si falla la carga.
async function _asegurarJsPdf() {
  if (window.jspdf?.jsPDF) return true; // Ya está cargada, no hace nada

  // Espera a que el script cargue (o reutiliza uno ya en proceso de carga)
  await new Promise((resolve, reject) => {
    const existente = document.querySelector('script[data-jspdf-loader]');
    if (existente) {
      // Ya hay un script cargando: espera a que termine
      existente.addEventListener('load',  resolve, { once: true });
      existente.addEventListener('error', reject,  { once: true });
      return;
    }

    // Crea un nuevo <script> que carga el UMD de jsPDF desde la carpeta vendor/
    const script = document.createElement('script');
    script.src = 'vendor/jspdf.umd.min.js'; // Archivo local (no CDN) para funcionar offline
    script.async = true;
    script.dataset.jspdfLoader = 'true';     // Marca para detectarlo si se llama dos veces
    script.onload  = resolve;
    script.onerror = reject;
    document.head.appendChild(script);
  });

  return Boolean(window.jspdf?.jsPDF);
}

// Genera y descarga el PDF según el contexto del modal y las opciones seleccionadas.
// scoreDesdePartida: datos del jugador actual (solo se usa si se abre desde el panel de fin).
async function generarPdf(scoreDesdePartida) {
  const opciones  = _leerOpciones();
  const esJugador = Boolean(_pdfContexto.jugador); // ¿Es para un jugador específico?

  // Define qué registros incluir: un jugador individual o toda la lista visible del ranking
  const registros = esJugador
    ? [_pdfContexto.jugador || scoreDesdePartida]
    : obtenerScoresVisibles(); // Función de ranking.js

  if (!registros.length) { cerrarModalPdf(); return; } // Sin datos, cierra el modal

  // Intenta cargar jsPDF; si falla, avisa al usuario
  try {
    await _asegurarJsPdf();
  } catch {
    alert('No se pudo cargar el generador PDF. Verificá la conexión e intentá nuevamente.');
    return;
  }

  const { jsPDF } = window.jspdf;
  // Crea el documento PDF con las opciones de formato elegidas
  const doc = new jsPDF({ orientation: opciones.orientacion, unit: 'mm', format: opciones.formato });

  const oscuro = opciones.tema === 'dark';           // Modo oscuro activado
  const pageW  = doc.internal.pageSize.getWidth();   // Ancho de la página en mm
  const pageH  = doc.internal.pageSize.getHeight();  // Alto de la página en mm
  let y = 18; // Posición vertical actual (se va incrementando con cada elemento dibujado)

  _pintarFondo(doc, oscuro, pageW, pageH); // Pinta el fondo de la primera página
  y = _dibujarEncabezado(doc, opciones, oscuro, pageW, y); // Dibuja el encabezado

  // Itera sobre los registros e inserta cada uno como una "tarjeta"
  registros.forEach((reg, idx) => {
    const pos = esJugador
      ? obtenerPosicionGlobal(reg)             // Posición global del jugador en el ranking
      : obtenerScoresVisibles().indexOf(reg) + 1; // Posición en la vista actual

    // Si la tarjeta no entra en la página, agrega una nueva página
    if (y > pageH - 35) {
      doc.addPage();
      _pintarFondo(doc, oscuro, pageW, pageH);            // Pinta el fondo de la nueva página
      y = _dibujarEncabezado(doc, opciones, oscuro, pageW, 18); // Repite el encabezado
    }
    y = _dibujarRegistro(doc, reg, pos, opciones, oscuro, y, idx); // Dibuja la tarjeta del registro
  });

  // Firma al pie si el checkbox está marcado
  if (opciones.campos.firma) {
    doc.setFontSize(9);
    doc.setTextColor(oscuro ? 180 : 90); // Gris claro u oscuro según el tema
    doc.text('Generado por el sistema del Juego del Ahorcado', 14, pageH - 12);
  }

  // Genera el nombre del archivo según el tipo de exportación
  const nombre = esJugador
    ? `jugador_${normalizarTexto(registros[0].nombre || 'jugador').replace(/\s+/g, '_')}_${fechaHoy()}.pdf`
    : `ranking_ahorcado_${fechaHoy()}.pdf`;

  doc.save(nombre);    // Dispara la descarga del archivo en el navegador
  cerrarModalPdf();    // Cierra el modal al terminar
}

// Pinta el rectángulo de fondo de toda la página con el color del tema.
// Oscuro: azul muy oscuro; Claro: blanco hueso.
function _pintarFondo(doc, oscuro, w, h) {
  doc.setFillColor(oscuro ? 18 : 248, oscuro ? 24 : 250, oscuro ? 38 : 252);
  doc.rect(0, 0, w, h, 'F'); // 'F' = solo relleno (fill), sin borde
}

// Dibuja el encabezado del PDF: logo (cuadrado azul con "A"), título y metadatos.
// Retorna la nueva posición Y después del encabezado + separador.
function _dibujarEncabezado(doc, opciones, oscuro, pageW, y) {
  if (opciones.campos.logo) {
    // Logo: cuadrado azul redondeado con la letra "A"
    doc.setFillColor(37, 99, 235);             // Azul primario
    doc.roundedRect(14, y - 8, 12, 12, 3, 3, 'F');
    doc.setTextColor(255, 255, 255);            // Texto blanco sobre el cuadrado
    doc.setFontSize(11);
    doc.text('A', 20, y, { align: 'center' }); // Centrado dentro del cuadrado
  }

  // Título principal del documento
  doc.setTextColor(oscuro ? 245 : 20, oscuro ? 247 : 24, oscuro ? 250 : 34);
  doc.setFontSize(18);
  doc.text('Juego del Ahorcado', opciones.campos.logo ? 31 : 14, y); // Desplazado si hay logo

  // Metadatos opcionales: fecha, hora, tema del PDF
  const ahora = new Date();
  const meta = [];
  if (opciones.campos.fechaPdf) meta.push(`Fecha: ${ahora.toLocaleDateString('es-AR')}`);
  if (opciones.campos.horaPdf)  meta.push(`Hora: ${ahora.toLocaleTimeString('es-AR')}`);
  if (opciones.campos.tema)     meta.push(`Tema: ${opciones.tema === 'dark' ? 'Oscuro' : 'Claro'}`);

  doc.setFontSize(9);
  doc.setTextColor(oscuro ? 170 : 90); // Gris para los metadatos
  doc.text(meta.join('  |  '), 14, y + 10); // Metadatos separados por " | "

  // Línea decorativa separadora azul debajo del encabezado
  doc.setDrawColor(37, 99, 235);
  doc.line(14, y + 15, pageW - 14, y + 15);

  return y + 26; // Retorna la nueva posición Y (después del separador + margen)
}

// Dibuja la "tarjeta" de un registro individual en el PDF.
// reg: objeto del score; pos: posición en el ranking; idx: índice del loop.
// Retorna la nueva posición Y después de la tarjeta.
function _dibujarRegistro(doc, reg, pos, opciones, oscuro, y, idx) {
  const c     = opciones.campos;       // Alias corto para los campos a incluir
  const tp    = oscuro ? [245,247,250] : [20,24,34];   // Color de texto principal
  const ts    = oscuro ? [180,190,205] : [75,85,99];   // Color de texto secundario
  const bg    = oscuro ? [30,41,59]    : [255,255,255]; // Color de fondo de la tarjeta
  const pageW = doc.internal.pageSize.getWidth();

  // Fondo de la tarjeta (rectángulo redondeado)
  doc.setFillColor(...bg);
  doc.roundedRect(14, y - 6, pageW - 28, 36, 3, 3, 'F');

  // Nombre del jugador como título de la tarjeta
  doc.setTextColor(...tp);
  doc.setFontSize(12);
  doc.text(c.nombre ? `${idx + 1}. ${reg.nombre}` : `Registro ${idx + 1}`, 20, y + 1);

  // Arma la línea de detalles según los campos marcados en el modal
  const det = [];
  if (c.posicion)   det.push(`Posicion: ${pos}`);
  if (c.categoria)  det.push(`Categoria: ${reg.categoria}`);
  if (c.dificultad) det.push(`Dificultad: ${reg.dificultad}`);
  if (c.puntos)     det.push(`Puntaje: ${reg.puntos}`);
  if (c.tiempo)     det.push(`Tiempo: ${String(reg.tiempo).substring(0,8)}`);
  if (c.fecha)      det.push(`Fecha: ${formatearFecha(reg.fecha)}`);
  if (c.resultado)  det.push(`Resultado: ${reg.resultado}`);

  // splitTextToSize corta el texto si es muy largo para que no se salga del margen
  doc.setTextColor(...ts);
  doc.setFontSize(9);
  const lineas = doc.splitTextToSize(det.join('  |  '), pageW - 40);
  doc.text(lineas, 20, y + 11);

  return y + 42; // Retorna la siguiente posición Y (alto de la tarjeta + margen)
}
