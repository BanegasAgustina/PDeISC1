// ============================================================
// utils.js - Funciones utilitarias puras (sin efectos DOM)
// ============================================================

// Normaliza un texto para búsquedas y comparaciones:
// convierte a minúsculas, elimina tildes y recorta espacios.
// La Ñ se preserva para que no colisione con N.
function normalizarTexto(texto = '') {
  return String(texto)
    .toLowerCase()
    .replace(/ñ/g, '\x00\xf1\x00')       // protege la ñ
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')      // elimina diacríticos
    .replace(/\x00\xf1\x00/g, 'ñ')       // restaura la ñ
    .trim();
}

// Convierte segundos a formato MM:SS para mostrar en pantalla.
function formatearTiempo(seg) {
  const s = Number(seg) || 0;
  const min = String(Math.floor(s / 60)).padStart(2, '0');
  const sec = String(s % 60).padStart(2, '0');
  return `${min}:${sec}`;
}

// Convierte segundos al formato HH:MM:SS que espera MySQL TIME.
function formatearTiempoMySQL(seg) {
  const s = Number(seg) || 0;
  const h = String(Math.floor(s / 3600)).padStart(2, '0');
  const m = String(Math.floor((s % 3600) / 60)).padStart(2, '0');
  const sc = String(s % 60).padStart(2, '0');
  return `${h}:${m}:${sc}`;
}

// Devuelve la fecha local de hoy en formato YYYY-MM-DD para MySQL.
function fechaHoy() {
  const hoy = new Date();
  return [
    hoy.getFullYear(),
    String(hoy.getMonth() + 1).padStart(2, '0'),
    String(hoy.getDate()).padStart(2, '0')
  ].join('-');
}

// Escapa HTML para insertar texto en el DOM de forma segura.
function escaparHTML(texto) {
  const div = document.createElement('div');
  div.textContent = texto ?? '';
  return div.innerHTML;
}

// Convierte HH:MM:SS o MM:SS a segundos para ordenar por tiempo.
function tiempoASegundos(tiempo) {
  const partes = String(tiempo || '00:00:00').split(':').map(Number);
  if (partes.length === 2) return partes[0] * 60 + partes[1];
  return partes[0] * 3600 + partes[1] * 60 + partes[2];
}

// Formatea fechas de MySQL o ISO para mostrar al usuario.
function formatearFecha(fecha) {
  if (!fecha) return '-';
  const str = String(fecha);
  const d = str.includes('T') ? new Date(str) : new Date(`${str}T00:00:00`);
  return Number.isNaN(d.getTime()) ? str : d.toLocaleDateString('es-AR');
}

// Mapea valores internos (claves) a etiquetas visibles para el usuario.
function etiqueta(valor) {
  const mapa = {
    tecnologia:'Tecnologia', animales:'Animales', deportes:'Deportes',
    comida:'Comida',         paises:'Paises',     profesiones:'Profesiones',
    objetos:'Objetos',       naturaleza:'Naturaleza', musica:'Musica',
    peliculas:'Peliculas',   programacion:'Programacion', general:'General',
    facil:'Facil', media:'Media', dificil:'Dificil'
  };
  return mapa[normalizarTexto(String(valor || ''))] || String(valor || '');
}

// Fuerza la re-renderización de todos los íconos Lucide del DOM.
function refrescarIconos() {
  if (window.lucide) window.lucide.createIcons();
}
