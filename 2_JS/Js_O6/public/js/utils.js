// ============================================================
// utils.js - Funciones utilitarias puras (sin efectos DOM)
// ============================================================
// Todas las funciones aquí son "puras": reciben parámetros y devuelven
// un valor sin tocar el DOM, el estado global ni hacer fetch.

// Normaliza un texto para búsquedas y comparaciones:
// convierte a minúsculas, elimina tildes (á→a, é→e, etc.) y recorta espacios.
// La Ñ se PRESERVA para que no colisione con N en búsquedas.
function normalizarTexto(texto = '') {
  return String(texto)
    .toLowerCase()
    .replace(/ñ/g, '\x00\xf1\x00')       // 1. Protege temporalmente la ñ con marcadores especiales
    .normalize('NFD')                       // 2. Descompone los caracteres acentuados (á → a + ´)
    .replace(/[\u0300-\u036f]/g, '')        // 3. Elimina los diacríticos separados (tildes, diéresis, etc.)
    .replace(/\x00\xf1\x00/g, 'ñ')         // 4. Restaura la ñ original
    .trim();                                // 5. Elimina espacios al inicio y al final
}

// Convierte segundos a formato MM:SS para mostrar en el cronómetro de la pantalla.
// Ejemplo: 75 → "01:15"
function formatearTiempo(seg) {
  const s = Number(seg) || 0;                                  // Asegura número válido
  const min = String(Math.floor(s / 60)).padStart(2, '0');     // Minutos con cero a la izquierda
  const sec = String(s % 60).padStart(2, '0');                 // Segundos restantes con cero
  return `${min}:${sec}`;
}

// Convierte segundos al formato HH:MM:SS que espera el tipo TIME de MySQL.
// Ejemplo: 3661 → "01:01:01"
function formatearTiempoMySQL(seg) {
  const s  = Number(seg) || 0;
  const h  = String(Math.floor(s / 3600)).padStart(2, '0');        // Horas
  const m  = String(Math.floor((s % 3600) / 60)).padStart(2, '0'); // Minutos restantes
  const sc = String(s % 60).padStart(2, '0');                       // Segundos restantes
  return `${h}:${m}:${sc}`;
}

// Devuelve la fecha local de hoy en formato YYYY-MM-DD para guardar en MySQL DATE.
// Ejemplo: "2025-06-15"
function fechaHoy() {
  const hoy = new Date();
  return [
    hoy.getFullYear(),                                   // Año de 4 dígitos
    String(hoy.getMonth() + 1).padStart(2, '0'),         // Mes (getMonth va de 0 a 11, sumamos 1)
    String(hoy.getDate()).padStart(2, '0')                // Día con cero a la izquierda
  ].join('-');
}

// Escapa caracteres HTML especiales para insertar texto dinámico en el DOM de forma segura.
// Evita XSS: si alguien ingresa "<script>", el navegador lo mostrará como texto, no lo ejecutará.
function escaparHTML(texto) {
  const div = document.createElement('div'); // Elemento temporal fuera del DOM
  div.textContent = texto ?? '';             // textContent no interpreta HTML
  return div.innerHTML;                      // innerHTML devuelve el texto ya escapado
}

// Convierte un tiempo en formato HH:MM:SS o MM:SS a segundos enteros.
// Se usa para ordenar el ranking por tiempo de menor a mayor.
// Ejemplo: "01:02:03" → 3723
function tiempoASegundos(tiempo) {
  const partes = String(tiempo || '00:00:00').split(':').map(Number); // Divide por ":" y convierte a número
  if (partes.length === 2) return partes[0] * 60 + partes[1];        // Formato MM:SS
  return partes[0] * 3600 + partes[1] * 60 + partes[2];             // Formato HH:MM:SS
}

// Formatea fechas que vienen de MySQL (YYYY-MM-DD o ISO) a formato legible para el usuario.
// Ejemplo: "2025-06-15" → "15/6/2025" (formato es-AR)
function formatearFecha(fecha) {
  if (!fecha) return '-';
  const str = String(fecha);
  // Las fechas ISO (con T) se parsean directamente; las de MySQL se les agrega T00:00:00
  // para evitar que el constructor de Date las interprete como UTC y reste un día.
  const d = str.includes('T') ? new Date(str) : new Date(`${str}T00:00:00`);
  return Number.isNaN(d.getTime()) ? str : d.toLocaleDateString('es-AR');
}

// Convierte claves internas (en minúscula, sin tildes) a etiquetas visibles para el usuario.
// Ejemplo: "tecnologia" → "Tecnologia", "facil" → "Facil"
function etiqueta(valor) {
  const mapa = {
    tecnologia:'Tecnologia', animales:'Animales', deportes:'Deportes',
    comida:'Comida',         paises:'Paises',     profesiones:'Profesiones',
    objetos:'Objetos',       naturaleza:'Naturaleza', musica:'Musica',
    peliculas:'Peliculas',   programacion:'Programacion', general:'General',
    facil:'Facil', media:'Media', dificil:'Dificil'
  };
  // Normaliza la clave antes de buscarla para tolerar mayúsculas o tildes
  return mapa[normalizarTexto(String(valor || ''))] || String(valor || '');
}

// Fuerza la re-renderización de todos los íconos Lucide que hayan sido insertados dinámicamente.
// Lucide usa atributos data- en elementos <span> o <i> que luego convierte a SVG.
function refrescarIconos() {
  if (window.lucide) window.lucide.createIcons(); // Solo llama si la librería está cargada
}
